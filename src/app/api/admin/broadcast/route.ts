import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body as { title: string; content: string };

    if (!title || !content) {
      return NextResponse.json(
        { error: "Champs `title` et `content` requis" },
        { status: 400 }
      );
    }

    // Get all users
    const users = await db.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (users.length === 0) {
      return NextResponse.json({ success: true, sentTo: 0, dmSent: 0 });
    }

    // Create a NewsLetter entry for every user
    await db.newsLetter.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: "admin" as const,
        title,
        content,
        senderId: ADMIN_DISCORD_ID,
        read: false,
      })),
    });

    // Attempt to DM each user via Discord REST API
    const token = process.env['DISCORD_TOKEN'];
    let dmSent = 0;

    if (token) {
      const truncatedContent =
        content.length > 200 ? content.slice(0, 200) + "..." : content;

      for (const user of users) {
        // Only DM users who have a real Discord ID (not local_ prefixed)
        if (!user.discordId || user.discordId.startsWith("local_")) continue;

        try {
          // 1. Create DM channel
          const dmRes = await fetch(
            "https://discord.com/api/v10/users/@me/channels",
            {
              method: "POST",
              headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ recipient_id: user.discordId }),
            }
          );

          if (!dmRes.ok) continue;

          const dmChannel = (await dmRes.json()) as { id: string };
          const dmChannelId = dmChannel.id;

          // 2. Send message to DM channel
          const msgRes = await fetch(
            `https://discord.com/api/v10/channels/${dmChannelId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content:
                  "\uD83D\uDC8C **Tu devrais check ton courrier !**\n\nUn nouveau message t'attend sur la Bo\u00EEte aux Lettres d'Ascension.\n\n\u{1F517} https://ascension-wiki.fly.dev",
                embeds: [
                  {
                    title,
                    description: truncatedContent,
                    color: 0xc9a84c,
                    image: {
                      url: "https://ascension-wiki.fly.dev/news-rabbit.webp",
                    },
                  },
                ],
              }),
            }
          );

          if (msgRes.ok) dmSent++;
        } catch {
          // Per-user error — don't fail the whole broadcast
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentTo: users.length,
      dmSent,
    });
  } catch (error) {
    console.error("Admin broadcast POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}