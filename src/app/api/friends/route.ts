import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendDM, NOTIFICATION_TYPES } from "@/lib/discordNotify";

// GET /api/friends — list accepted friends + pending received requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;

    const [acceptedAsUser, acceptedAsFriend, pendingReceived] = await Promise.all([
      // Friendships I initiated that were accepted
      db.friendship.findMany({
        where: { userId, status: "accepted" },
      }),
      // Friendships where I was the target and accepted
      db.friendship.findMany({
        where: { friendId: userId, status: "accepted" },
      }),
      // Pending requests I received
      db.friendship.findMany({
        where: { friendId: userId, status: "pending" },
      }),
    ]);

    // Collect all unique friend user IDs to batch-fetch
    const friendUserIds = [
      ...acceptedAsUser.map((f) => f.friendId),
      ...acceptedAsFriend.map((f) => f.userId),
      ...pendingReceived.map((f) => f.userId),
    ];
    const uniqueUserIds = [...new Set(friendUserIds)];

    // Batch-fetch all friend users with profiles
    const users = await db.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        discordId: true,
        profile: { select: { characterName: true, race: true, rank: true, avatarUrl: true } },
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Build friends list (accepted in both directions)
    const friends = [
      ...acceptedAsUser.map((f) => ({
        id: f.id,
        status: f.status,
        createdAt: f.createdAt,
        user: userMap.get(f.friendId) || null,
      })),
      ...acceptedAsFriend.map((f) => ({
        id: f.id,
        status: f.status,
        createdAt: f.createdAt,
        user: userMap.get(f.userId) || null,
      })),
    ];

    // Build pending received list
    const pendingReceivedFormatted = pendingReceived.map((f) => ({
      id: f.id,
      status: f.status,
      createdAt: f.createdAt,
      user: userMap.get(f.userId) || null,
    }));

    return NextResponse.json({ friends, pendingReceived: pendingReceivedFormatted });
  } catch (error) {
    console.error("Friends GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/friends — send a friend request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { friendId } = body as { friendId?: string };

    if (!friendId || typeof friendId !== "string") {
      return NextResponse.json({ error: "friendId requis" }, { status: 400 });
    }

    const myId = session.user.id;

    if (friendId === myId) {
      return NextResponse.json({ error: "Impossible de s'ajouter soi-même" }, { status: 400 });
    }

    // Check for existing friendship in either direction
    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: myId, friendId },
          { userId: friendId, friendId: myId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Demande d'ami déjà existante" }, { status: 409 });
    }

    const friendship = await db.friendship.create({
      data: {
        userId: myId,
        friendId,
        status: "pending",
      },
    });

    // Send DM notification to the target user
    try {
      const [sender, target] = await Promise.all([
        db.user.findUnique({ where: { id: myId }, select: { name: true, discordId: true, image: true } }),
        db.user.findUnique({ where: { id: friendId }, select: { discordId: true, name: true } }),
      ]);
      const notifType = NOTIFICATION_TYPES.friend_request;
      if (target?.discordId && !target.discordId.startsWith("local_")) {
        sendDM(target.discordId, {
          content: "",
          embeds: [{
            title: `${notifType.emoji} ${notifType.label}`,
            description: `**${sender?.name || "Quelqu'un"}** t'a envoyé une demande d'ami !\n\nTu peux l'accepter depuis ton profil sur le site.`,
            color: notifType.color,
            thumbnail: sender?.image ? { url: sender.image } : undefined,
            footer: { text: "Ascension RP — Notifications" },
            timestamp: new Date().toISOString(),
          }],
        });
      }
    } catch {
      // Notification failure should not block the friend request
    }

    return NextResponse.json(friendship, { status: 201 });
  } catch (error) {
    console.error("Friends POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}