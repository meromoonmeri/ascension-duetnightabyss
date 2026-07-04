// ═══════════════════════════════════════════════════════════════
//  Ether Sync Utility
//
//  Keeps Profile.ether (site wallet) and BotPlayer.ether (bot)
//  in sync in real-time. Both share the same Turso database.
//
//  Call syncEtherAfterChange() after ANY ether modification
//  to ensure both tables are always identical.
// ═══════════════════════════════════════════════════════════════

import { db } from "@/lib/db";

/**
 * After a Profile.ether change, sync BotPlayer.ether to match.
 * Call this from site bank routes.
 *
 * @param userId - The User.id (not discordId)
 * @param newEtherAmount - The new absolute ether value
 */
export async function syncBotPlayerFromProfile(
  userId: string,
  newEtherAmount: number,
): Promise<void> {
  try {
    // Find the BotPlayer linked to this User
    const botPlayer = await db.botPlayer.findUnique({
      where: { userId },
      select: { id: true, ether: true },
    });

    if (!botPlayer) return; // No bot player — nothing to sync

    if (botPlayer.ether === newEtherAmount) return; // Already in sync

    await db.botPlayer.update({
      where: { id: botPlayer.id },
      data: { ether: newEtherAmount },
    });

    console.log(`[EtherSync] Profile→Bot: userId=${userId} ether=${newEtherAmount}`);
  } catch (err) {
    console.error("[EtherSync] Failed to sync Profile→BotPlayer:", err);
  }
}

/**
 * After a BotPlayer.ether change, sync Profile.ether to match.
 * Call this from bot economy (pay, shop, salary, etc.).
 *
 * @param discordId - The player's Discord ID
 * @param newEtherAmount - The new absolute ether value
 */
export async function syncProfileFromBotPlayer(
  discordId: string,
  newEtherAmount: number,
): Promise<void> {
  try {
    // Find the User by discordId, then the Profile
    const user = await db.user.findUnique({
      where: { discordId },
      select: { id: true },
    });

    if (!user) return;

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, ether: true },
    });

    if (!profile) return; // No site profile — nothing to sync

    if (profile.ether === newEtherAmount) return; // Already in sync

    await db.profile.update({
      where: { id: profile.id },
      data: { ether: newEtherAmount },
    });

    console.log(`[EtherSync] Bot→Profile: discordId=${discordId} ether=${newEtherAmount}`);
  } catch (err) {
    console.error("[EtherSync] Failed to sync BotPlayer→Profile:", err);
  }
}