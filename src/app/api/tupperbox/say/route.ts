import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

async function isAdmin(request: Request): Promise<boolean> {
  const botSecret = process.env['BOT_SECRET'];
  const botAuth = request.headers.get("X-Bot-Auth");
  if (botSecret && botAuth === botSecret) return true;

  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as Record<string, unknown>).discordId === ADMIN_DISCORD_ID) {
    return true;
  }

  return false;
}

async function findOrCreateWebhook(
  token: string,
  channelId: string,
  webhookName: string,
  avatarUrl: string | null
): Promise<{ id: string; token: string } | null> {
  // 1. Get existing webhooks for the channel
  const webhooksRes = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/webhooks`,
    {
      headers: { Authorization: `Bot ${token}` },
    }
  );

  if (webhooksRes.ok) {
    const webhooks = (await webhooksRes.json()) as { id: string; name: string; token: string }[];
    const existing = webhooks.find((w) => w.name === webhookName);
    if (existing) {
      return { id: existing.id, token: existing.token };
    }
  }

  // 2. Create a new webhook
  const createRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/webhooks`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: webhookName,
      avatar: avatarUrl || undefined,
    }),
  });

  if (createRes.ok) {
    const webhook = (await createRes.json()) as { id: string; token: string };
    return { id: webhook.id, token: webhook.token };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = (await request.json()) as {
      characterId?: string;
      channelId?: string;
      content?: string;
      threadId?: string;
    };

    const { characterId, channelId, content, threadId } = body;

    if (!characterId || !channelId || !content) {
      return NextResponse.json(
        { error: "characterId, channelId et content sont requis" },
        { status: 400 }
      );
    }

    // Get character from DB
    const character = await db.discordCharacter.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 });
    }

    const botToken = process.env['DISCORD_TOKEN'];
    if (!botToken) {
      return NextResponse.json({ error: "DISCORD_TOKEN non configuré" }, { status: 500 });
    }

    const webhookName = character.webhookName || character.name;

    // Find or create webhook
    const webhook = await findOrCreateWebhook(botToken, channelId, webhookName, character.avatarUrl);

    if (!webhook) {
      return NextResponse.json({ error: "Impossible de créer le webhook" }, { status: 500 });
    }

    // Execute webhook
    const targetUrl = threadId
      ? `https://discord.com/api/v10/webhooks/${webhook.id}/${webhook.token}?thread_id=${threadId}`
      : `https://discord.com/api/v10/webhooks/${webhook.id}/${webhook.token}`;

    const msgRes = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        username: character.webhookName || character.name,
        avatar_url: character.avatarUrl || undefined,
      }),
    });

    if (!msgRes.ok) {
      const errText = await msgRes.text();
      console.error("Webhook execution failed:", errText);
      return NextResponse.json({ error: "Échec de l'envoi du message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tupperbox say POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}