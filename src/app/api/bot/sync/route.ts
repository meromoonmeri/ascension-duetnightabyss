import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYNC_SECRET = process.env.BOT_SYNC_SECRET || '';

// POST /api/bot/sync — Sync bot player data to website
// Called by the Discord bot to keep website Profile in sync
export async function POST(req: NextRequest) {
  try {
    // Auth check — bot must provide the shared secret
    if (SYNC_SECRET) {
      const auth = req.headers.get('x-bot-secret');
      if (auth !== SYNC_SECRET) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { discordId, customBannerUrl, customAvatarUrl, ether } = body;

    if (!discordId) {
      return NextResponse.json({ error: "discordId requis" }, { status: 400 });
    }

    // Find user by discordId
    const user = await db.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const updates: Record<string, string | number> = {};
    const profileUpdates: Record<string, string | number | null> = {};

    if (customBannerUrl !== undefined) {
      updates.customBannerUrl = customBannerUrl;
      profileUpdates.bannerUrl = customBannerUrl || null;
    }

    if (customAvatarUrl !== undefined) {
      updates.customAvatarUrl = customAvatarUrl;
      profileUpdates.avatarUrl = customAvatarUrl || null;
    }

    if (ether !== undefined && typeof ether === "number") {
      updates.ether = ether;
      profileUpdates.ether = ether;
    }

    // Update BotPlayer
    if (Object.keys(updates).length > 0) {
      await db.botPlayer.update({
        where: { discordId },
        data: updates,
      });
    }

    // Update Profile (website side)
    if (Object.keys(profileUpdates).length > 0) {
      const profile = await db.profile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        await db.profile.update({
          where: { id: profile.id },
          data: profileUpdates,
        });
      }
    }

    return NextResponse.json({ success: true, synced: Object.keys(updates) });
  } catch (error) {
    console.error("Bot sync API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}