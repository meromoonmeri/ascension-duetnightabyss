import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const continents = await db.continent.findMany({
      include: {
        kingdoms: {
          select: {
            id: true,
            name: true,
            rank: true,
            treasury: true,
            population: true,
            _count: { select: { citizens: true } },
          },
          orderBy: { treasury: 'desc' },
        },
        _count: { select: { kingdoms: true } },
      },
      orderBy: { treasury: 'desc' },
    });

    const CONTINENT_RANKS: Record<number, string> = {
      1: 'Ruiné',
      2: 'Faible',
      3: 'Stable',
      4: 'Développé',
      5: 'Superpuissance',
    };

    const data = continents.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      climate: c.climate,
      rank: c.rank,
      rankName: CONTINENT_RANKS[c.rank] || 'Inconnu',
      treasury: c.treasury,
      kingdomCount: c._count.kingdoms,
      totalCitizens: c.kingdoms.reduce((sum, k) => sum + k._count.citizens, 0),
      kingdoms: c.kingdoms.map((k) => ({
        id: k.id,
        name: k.name,
        rank: k.rank,
        treasury: k.treasury,
        population: k.population,
        citizenCount: k._count.citizens,
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Bot Continents API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}