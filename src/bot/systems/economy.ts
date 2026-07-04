// ═══════════════════════════════════════════════════════════════
//  Economy System — Taxes, salary, dynamic pricing, market
// ═══════════════════════════════════════════════════════════════

import { db } from "../../lib/db";
import { SOCIAL_RANKS, KINGDOM_TIERS, SALARY_COOLDOWN } from "../constants";

// ─── Salary System ────────────────────────────────────────────

export async function claimSalary(discordId: string) {
  const player = await db.botPlayer.findUnique({ where: { discordId } });
  if (!player) return { ok: false, error: "Tu n'as pas de personnage. Utilise `/register`." };

  const now = Date.now();
  const elapsed = now - player.lastSalaryAt.getTime();

  if (elapsed < SALARY_COOLDOWN) {
    const remaining = SALARY_COOLDOWN - elapsed;
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return { ok: false, error: `Reviens dans **${days}j ${hours}h**. (Cooldown: 7 jours)` };
  }

  const rankInfo = SOCIAL_RANKS[player.socialRank - 1] || SOCIAL_RANKS[0];
  const salary = rankInfo.salary;

  if (salary <= 0) {
    return { ok: false, error: `Les **${rankInfo.name}** ne perçoivent pas de salaire.` };
  }

  // Kingdom tax on salary (10%)
  let afterTax = salary;
  if (player.kingdomId) {
    const kingdom = await db.kingdom.findUnique({ where: { id: player.kingdomId } });
    if (kingdom) {
      const tax = Math.floor(salary * kingdom.taxRate);
      afterTax = salary - tax;
      await db.kingdom.update({
        where: { id: kingdom.id },
        data: { treasury: { increment: tax } },
      });
    }
  }

  await db.botPlayer.update({
    where: { discordId },
    data: {
      gold: { increment: afterTax },
      ether: { increment: Math.floor(afterTax * 0.5) },
      lastSalaryAt: new Date(now),
    },
  });

  return {
    ok: true,
    salary: afterTax,
    rankName: rankInfo.name,
    rankIcon: rankInfo.icon,
    ether: Math.floor(afterTax * 0.5),
  };
}

// ─── Dynamic Pricing ──────────────────────────────────────────

export function getAdjustedPrice(basePrice: number, kingdomModifier: number, supply: number, demand: number): number {
  const supplyDemand = demand > 0 ? Math.max(0.5, 2 - (supply / demand)) : 1;
  const adjusted = Math.floor(basePrice * kingdomModifier * supplyDemand);
  return Math.max(1, adjusted);
}

// ─── Market Operations ────────────────────────────────────────

export async function listOnMarket(
  discordId: string,
  itemName: string,
  description: string,
  itemType: string,
  price: number,
  quantity: number,
  kingdomId: string,
) {
  const player = await db.botPlayer.findUnique({ where: { discordId } });
  if (!player) return { ok: false, error: "Personnage non trouvé." };
  if (price < 1) return { ok: false, error: "Le prix doit être positif." };

  const listing = await db.marketListing.create({
    data: {
      sellerId: player.id,
      kingdomId,
      itemName,
      description,
      itemType,
      price,
      quantity,
    },
  });

  return { ok: true, listingId: listing.id };
}

export async function buyFromMarket(discordId: string, listingId: string, quantity: number) {
  const player = await db.botPlayer.findUnique({ where: { discordId } });
  if (!player) return { ok: false, error: "Personnage non trouvé." };

  const listing = await db.marketListing.findUnique({
    where: { id: listingId },
    include: { seller: true, kingdom: true },
  });

  if (!listing || !listing.active) return { ok: false, error: "Cette offre n'existe plus." };
  if (listing.sellerId === player.id) return { ok: false, error: "Tu ne peux pas acheter tes propres objets." };
  const qty = Math.min(quantity, listing.quantity);
  const totalCost = listing.price * qty;
  if (player.gold < totalCost) return { ok: false, error: `Il te faut **${totalCost}💰** or. Tu as **${player.gold}💰**.` };

  // Tax (goes to kingdom treasury)
  const kingdom = listing.kingdom;
  const tax = Math.floor(totalCost * (kingdom?.taxRate ?? 0.05));

  await db.$transaction([
    // Deduct buyer
    db.botPlayer.update({
      where: { discordId },
      data: { gold: { decrement: totalCost } },
    }),
    // Credit seller (minus tax)
    db.botPlayer.update({
      where: { id: listing.sellerId },
      data: { gold: { increment: totalCost - tax } },
    }),
    // Add tax to kingdom
    ...(kingdom ? [db.kingdom.update({
      where: { id: kingdom.id },
      data: { treasury: { increment: tax } },
    })] : []),
    // Update or remove listing
    listing.quantity <= qty
      ? db.marketListing.update({
          where: { id: listingId },
          data: { active: false },
        })
      : db.marketListing.update({
          where: { id: listingId },
          data: { quantity: { decrement: qty } },
        }),
  ]);

  return { ok: true, itemName: listing.itemName, qty, totalCost, tax };
}

// ─── Kingdom Economics ────────────────────────────────────────

export async function getKingdomStats(kingdomId: string) {
  const kingdom = await db.kingdom.findUnique({
    where: { id: kingdomId },
    include: {
      citizens: true,
      _count: { select: { marketListings: true, merchantStands: true } },
    },
  });

  if (!kingdom) return null;

  const tier = KINGDOM_TIERS[kingdom.tier - 1] || KINGDOM_TIERS[0];
  const totalSalaryPaid = kingdom.citizens.reduce((sum, c) => {
    const r = SOCIAL_RANKS[c.socialRank - 1];
    return sum + (r?.salary ?? 0);
  }, 0);

  return {
    ...kingdom,
    tierName: tier.name,
    maxPop: tier.maxPop,
    citizenCount: kingdom.citizens.length,
    totalSalaryBurden: totalSalaryPaid,
    listingsCount: kingdom._count.marketListings,
    standsCount: kingdom._count.merchantStands,
  };
}