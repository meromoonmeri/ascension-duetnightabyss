import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/bot/profile/[discordId] — fetch profile + bot player by discord ID
// Used by the Discord bot to get synced website data
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ discordId: string }> },
) {
  try {
    const { discordId } = await params;

    // Find user by discordId
    const user = await db.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Get site profile (no inventory — that's on User)
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    // Get equipped inventory from User
    const inventoryItems = await db.inventoryItem.findMany({
      where: { userId: user.id, equipped: true },
      include: { item: true },
    });

    // Get bot player data with cosmetics
    const botPlayer = await db.botPlayer.findUnique({
      where: { discordId },
      include: {
        kingdom: { include: { continent: true } },
        ownedCosmetics: {
          select: { cosmeticId: true },
        },
      },
    });

    // Get bank account
    const bankAccount = await db.bankAccount.findUnique({
      where: { userId: user.id },
      select: { balance: true, totalDeposited: true, totalWithdrawn: true },
    });

    return NextResponse.json({
      profile: profile ? { ...profile, inventory: inventoryItems } : null,
      botPlayer: botPlayer || null,
      bankAccount: bankAccount || null,
      ownedCosmetics: botPlayer?.ownedCosmetics || [],
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        discordId: user.discordId,
      },
    });
  } catch (error) {
    console.error("Bot profile API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}