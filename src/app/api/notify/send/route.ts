import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const NOTIFICATION_COLORS: Record<string, number> = {
  friend_request: 0xc9a84c,
  friend_accepted: 0x22c55e,
  friend_removed: 0xef4444,
  trade_request: 0xa855f7,
  trade_accepted: 0x22c55e,
  trade_declined: 0xef4444,
  private_message: 0x3b82f6,
  invite: 0xf59e0b,
  announcement: 0xc9a84c,
  mention: 0xf59e0b,
  validation_accepted: 0x22c55e,
  validation_rejected: 0xef4444,
  validation_revision: 0xf59e0b,
};

export async function POST(request: Request) {
  try {
    // Auth: session or internal bot header
    const botSecret = process.env['BOT_SECRET'];
    const botAuth = request.headers.get("X-Bot-Auth");
    const isInternal = botSecret && botAuth === botSecret;

    const session = await getServerSession(authOptions);
    if (!isInternal && !session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = (await request.json()) as {
      discordId?: string;
      type?: string;
      title?: string;
      description?: string;
      image?: string;
    };

    const { discordId, type, title, description, image } = body;

    if (!discordId || !type || !title || !description) {
      return NextResponse.json(
        { error: "discordId, type, title et description sont requis" },
        { status: 400 }
      );
    }

    const validTypes = Object.keys(NOTIFICATION_COLORS);
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type invalide. Types valides: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const color = NOTIFICATION_COLORS[type] || 0xc9a84c;

    // Find the user in DB to get their userId for NewsLetter
    const user = await db.user.findUnique({
      where: { discordId },
      select: { id: true },
    });

    // Create NewsLetter entry
    if (user) {
      await db.newsLetter.create({
        data: {
          userId: user.id,
          type,
          title,
          content: description,
          read: false,
        },
      });
    }

    // Send Discord DM
    const token = process.env['DISCORD_TOKEN'];

    if (token && !discordId.startsWith("local_")) {
      try {
        // 1. Create DM channel
        const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
          method: "POST",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipient_id: discordId }),
        });

        if (dmRes.ok) {
          const dmChannel = (await dmRes.json()) as { id: string };

          // 2. Build and send embed
          const embed: Record<string, unknown> = {
            title,
            description,
            color,
            timestamp: new Date().toISOString(),
            footer: { text: "Ascension Wiki" },
          };

          if (image) {
            embed.image = { url: image };
          }

          await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bot ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ embeds: [embed] }),
          });
        }
      } catch (err) {
        console.error(`Failed to send DM notification to ${discordId}:`, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify send POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}