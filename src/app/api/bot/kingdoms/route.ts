import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const kingdoms = await db.kingdom.findMany({
      include: {
        continent: { select: { name: true } },
        _count: { select: { citizens: true } },
      },
      orderBy: { treasury: 'desc' },
    });

    const data = kingdoms.map((k, idx) => ({
      id: k.id,
      name: k.name,
      description: k.description,
      rank: k.rank,
      treasury: k.treasury,
      taxRate: k.taxRate,
      population: k.population,
      citizenCount: k._count.citizens,
      priceModifier: k.priceModifier,
      buybackRate: k.buybackRate,
      continent: k.continent?.name ?? 'Inconnu',
      rankingPosition: idx + 1,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Bot Kingdoms API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}