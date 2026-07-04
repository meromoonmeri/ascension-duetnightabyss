import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendDM, NOTIFICATION_TYPES } from "@/lib/discordNotify";

// PUT /api/friends/[id]/accept — accept a friend request
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const friendship = await db.friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    }

    if (friendship.friendId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (friendship.status !== "pending") {
      return NextResponse.json({ error: "Cette demande n'est plus en attente" }, { status: 400 });
    }

    const updated = await db.friendship.update({
      where: { id },
      data: { status: "accepted" },
    });

    // Notify the requester that their friend request was accepted
    try {
      const [accepter, requester] = await Promise.all([
        db.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
        db.user.findUnique({ where: { id: friendship.userId }, select: { discordId: true, name: true } }),
      ]);
      const notifType = NOTIFICATION_TYPES.friend_accepted;
      if (requester?.discordId && !requester.discordId.startsWith("local_")) {
        sendDM(requester.discordId, {
          embeds: [{
            title: `${notifType.emoji} ${notifType.label}`,
            description: `**${accepter?.name || "Quelqu'un"}** a accepté ta demande d'ami !`,
            color: notifType.color,
            footer: { text: "Ascension RP — Notifications" },
            timestamp: new Date().toISOString(),
          }],
        });
      }
    } catch {
      // Notification failure should not block
    }

    return NextResponse.json({ success: true, friendship: updated });
  } catch (error) {
    console.error("Friend accept error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}