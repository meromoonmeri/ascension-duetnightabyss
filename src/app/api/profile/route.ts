import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/profile — fetch merged profile + bot player data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch site profile (no inventory — that's on User)
    let profile = await db.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, username: true, image: true, discordId: true } },
      },
    });

    // Fetch equipped inventory from User (not Profile)
    const inventoryItems = await db.inventoryItem.findMany({
      where: { userId, equipped: true },
      include: { item: true },
    });

    // Auto-create profile if missing
    if (!profile) {
      profile = await db.profile.create({
        data: {
          userId,
          characterName: session.user.name || "Inconnu",
        },
        include: {
          user: { select: { name: true, username: true, image: true, discordId: true } },
        },
      });
    }

    // Fetch bot player data (if discord-linked)
    let botPlayer = null;
    if (session.user.discordId) {
      try {
        botPlayer = await db.botPlayer.findUnique({
          where: { discordId: session.user.discordId },
          include: {
            kingdom: { include: { continent: true } },
            guild: true,
          },
        });
      } catch (botErr) {
        // BotPlayer table might not exist or be missing columns — log but don't crash
        console.error("[API /profile] BotPlayer fetch failed (non-critical):", botErr);
      }
    }

    return NextResponse.json({
      profile: { ...profile, inventory: inventoryItems },
      botPlayer,
    });
  } catch (error) {
    console.error("[API /profile] GET error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/profile — update profile fields
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { characterName, characterTitle, race, rank, description, backstory, bannerColor } = body;

    // Validate rank
    const validRanks = ["F", "E", "D", "C", "B", "A", "S", "S+", "EX"];
    if (rank && !validRanks.includes(rank)) {
      return NextResponse.json({ error: "Rang invalide" }, { status: 400 });
    }

    // Fetch equipped inventory from User
    const inventoryItems = await db.inventoryItem.findMany({
      where: { userId: session.user.id, equipped: true },
      include: { item: true },
    });

    const profile = await db.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        characterName: characterName || session.user.name || "Inconnu",
        characterTitle,
        race,
        rank: rank || "F",
        description,
        backstory,
        bannerColor,
      },
      update: {
        ...(characterName !== undefined && { characterName }),
        ...(characterTitle !== undefined && { characterTitle }),
        ...(race !== undefined && { race }),
        ...(rank !== undefined && { rank }),
        ...(description !== undefined && { description }),
        ...(backstory !== undefined && { backstory }),
        ...(bannerColor !== undefined && { bannerColor }),
      },
      include: {
        user: { select: { name: true, username: true, image: true, discordId: true } },
      },
    });

    return NextResponse.json({ profile: { ...profile, inventory: inventoryItems } });
  } catch (error) {
    console.error("[API /profile] PUT error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}