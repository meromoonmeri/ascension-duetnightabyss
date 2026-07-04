import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const players = await db.botPlayer.findMany({
      take: 20,
      orderBy: [{ ether: 'desc' }],
      include: {
        kingdom: { select: { name: true } },
      },
    });

    const SOCIAL_RANKS: Record<number, string> = {
      1: 'Citoyen',
      2: 'Artisan',
      3: 'Soldat',
      4: 'Sergent',
      5: 'Noble',
      6: 'Gouverneur',
      7: 'Souverain',
    };

    const data = players.map((p, idx) => ({
      rankingPosition: idx + 1,
      id: p.id,
      characterName: p.characterName || 'Inconnu',
      race: p.race,
      socialRank: p.socialRank,
      socialRankName: SOCIAL_RANKS[p.socialRank] || 'Citoyen',
      ether: p.ether,
      gold: p.gold,
      kingdom: p.kingdom?.name || 'Aucun',
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Bot Leaderboard API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}