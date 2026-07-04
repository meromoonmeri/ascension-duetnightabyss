import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalPlayers, totalKingdoms, totalContinents, kingdoms] = await Promise.all([
      db.botPlayer.count(),
      db.kingdom.count(),
      db.continent.count(),
      db.kingdom.findMany({ select: { treasury: true, rank: true } }),
    ]);

    const totalTreasury = kingdoms.reduce((sum, k) => sum + k.treasury, 0);
    const avgKingdomRank =
      totalKingdoms > 0
        ? Math.round((kingdoms.reduce((sum, k) => sum + k.rank, 0) / totalKingdoms) * 10) / 10
        : 0;

    return NextResponse.json({
      totalPlayers,
      totalKingdoms,
      totalContinents,
      totalTreasury,
      avgKingdomRank,
    });
  } catch (error) {
    console.error('[Bot Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}