import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const SOCIAL_RANKS = [
  { level: 1, name: "Sans-Foyer", salary: 0, icon: "🏚️" },
  { level: 2, name: "Roturier", salary: 100, icon: "👤" },
  { level: 3, name: "Marchand", salary: 250, icon: "💰" },
  { level: 4, name: "Artisan", salary: 400, icon: "⚒️" },
  { level: 5, name: "Noble", salary: 600, icon: "👑" },
  { level: 6, name: "Commandant", salary: 850, icon: "⚔️" },
  { level: 7, name: "Souverain", salary: 1200, icon: "🔸" },
];

const SALARY_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function getSalaryRemaining(lastSalaryAt: Date): { ready: boolean; remaining: string } {
  const now = Date.now();
  const last = new Date(lastSalaryAt).getTime();
  const elapsed = now - last;

  if (elapsed >= SALARY_COOLDOWN) {
    return { ready: true, remaining: "Prêt!" };
  }

  const remaining = SALARY_COOLDOWN - elapsed;
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return { ready: false, remaining: `${days}j ${hours}h` };
  }

  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) {
    return { ready: false, remaining: `${hours}h ${minutes}m` };
  }

  return { ready: false, remaining: `${minutes}m` };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ discordId: string }> }
) {
  try {
    const { discordId } = await params;

    const player = await db.botPlayer.findUnique({
      where: { discordId },
      include: {
        kingdom: {
          select: { id: true, name: true, tier: true },
        },
        guild: {
          select: { id: true, name: true },
        },
        user: {
          select: { image: true },
        },
        _count: {
          select: {
            playerQuests: { where: { status: "active" } },
            marketListings: { where: { active: true } },
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    const rank = SOCIAL_RANKS.find((r) => r.level === player.socialRank) ?? SOCIAL_RANKS[0];
    const { ready: salaryReady, remaining: salaryRemaining } = getSalaryRemaining(player.lastSalaryAt);

    return NextResponse.json({
      found: true,
      player: {
        id: player.id,
        discordId: player.discordId,
        characterName: player.characterName,
        race: player.race,
        gold: player.gold,
        ether: player.ether,
        socialRank: player.socialRank,
        socialRankName: rank.name,
        socialRankIcon: rank.icon,
        salaryAmount: rank.salary,
        salaryReady,
        salaryRemaining,
        kingdom: player.kingdom ?? null,
        guild: player.guild ?? null,
        avatarUrl: player.user.image ?? null,
        activeQuests: player._count.playerQuests,
        marketListings: player._count.marketListings,
        registeredAt: player.registeredAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[GET /api/bot/player/[discordId]] Error:", error);
    return NextResponse.json(
      { found: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}