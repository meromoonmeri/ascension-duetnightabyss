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

// GET — List all characters
export async function GET() {
  try {
    const characters = await db.discordCharacter.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Tupperbox characters GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — Create a new DiscordCharacter (admin only)
export async function POST(request: Request) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = (await request.json()) as {
      name?: string;
      webhookName?: string;
      avatarUrl?: string;
      bannerUrl?: string;
      embedColor?: string;
      title?: string;
      description?: string;
      personality?: string;
      systemPrompt?: string;
      aiModel?: string;
      temperature?: number;
      maxResponseLength?: number;
      allowedChannels?: string;
      adminOnly?: boolean;
      isNpc?: boolean;
      npcContext?: string;
    };

    const {
      name,
      webhookName,
      avatarUrl,
      bannerUrl,
      embedColor,
      title,
      description,
      personality,
      systemPrompt,
      aiModel,
      temperature,
      maxResponseLength,
      allowedChannels,
      adminOnly,
      isNpc,
      npcContext,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Le nom du personnage est requis" }, { status: 400 });
    }

    const character = await db.discordCharacter.create({
      data: {
        name: name.trim(),
        webhookName: webhookName || name.trim(),
        avatarUrl: avatarUrl || null,
        bannerUrl: bannerUrl || null,
        embedColor: embedColor || "#C9A84C",
        title: title || null,
        description: description || null,
        personality: personality || null,
        systemPrompt: systemPrompt || null,
        aiModel: aiModel || null,
        temperature: temperature ?? 0.8,
        maxResponseLength: maxResponseLength ?? 500,
        allowedChannels: allowedChannels || "[]",
        adminOnly: adminOnly ?? true,
        isNpc: isNpc ?? false,
        npcContext: npcContext || null,
        createdBy: ADMIN_DISCORD_ID,
      },
    });

    return NextResponse.json({ success: true, character });
  } catch (error) {
    console.error("Tupperbox characters POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}