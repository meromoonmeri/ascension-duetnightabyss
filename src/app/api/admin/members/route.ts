import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const users = await db.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });

    const members = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      discordId: u.discordId,
      image: u.image,
      profile: u.profile
        ? {
            characterName: u.profile.characterName,
            race: u.profile.race,
            rank: u.profile.rank,
            ether: u.profile.ether,
          }
        : null,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Admin members GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}