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

    const [users, unreadLetters, botPlayers] = await Promise.all([
      db.user.count(),
      db.newsLetter.count({ where: { read: false } }),
      db.botPlayer.count(),
    ]);

    return NextResponse.json({ users, unreadLetters, botPlayers });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}