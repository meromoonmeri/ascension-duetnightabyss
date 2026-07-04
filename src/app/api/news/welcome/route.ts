import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Check if welcome letter already exists
    const existing = await db.newsLetter.findFirst({
      where: { userId, type: "welcome" },
    });

    if (existing) {
      return NextResponse.json({ success: false, reason: "already_claimed" });
    }

    // Create welcome letter
    await db.newsLetter.create({
      data: {
        userId,
        type: "welcome",
        title: "✦ Bienvenue dans Ascension ✦",
        content: `Bienvenue, aventurier !

Tu viens de rejoindre l'univers d'Ascension. En guise de cadeau de bienvenue, tu reçois **1000 Éther** — la monnaie qui fait tourner le monde.

Utilise-le avec sagesse dans la boutique ou économise-le pour des acquisitions plus ambitieuses.

Que ta destinée soit glorieuse.

— L'Équipe Ascension`,
      },
    });

    // Add 1000 ether to profile
    try {
      await db.profile.update({
        where: { userId },
        data: { ether: { increment: 1000 } },
      });
    } catch {
      // Profile might not exist yet — that's ok
    }

    // Add 1000 ether to BotPlayer if exists
    try {
      await db.botPlayer.update({
        where: { userId },
        data: { ether: { increment: 1000 } },
      });
    } catch {
      // BotPlayer might not exist — that's ok
    }

    return NextResponse.json({ success: true, etherAdded: 1000 });
  } catch (error) {
    console.error("Welcome claim error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}