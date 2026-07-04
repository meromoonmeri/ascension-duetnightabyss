import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ART_DATA } from '@/data/arts';
import { RACE_DATA } from '@/data/races';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'category is required' }, { status: 400 });
    }

    switch (category) {
      case 'technique-art': {
        const parents = ART_DATA.map((art) => art.id);
        return NextResponse.json({ parents });
      }

      case 'technique-racial': {
        const parents = RACE_DATA.map((race) => race.id);
        return NextResponse.json({ parents });
      }

      case 'creature': {
        const results = await db.rubriqueItem.findMany({
          where: { category: 'creature', parentSlug: { not: null } },
          select: { parentSlug: true },
          distinct: ['parentSlug'],
        });
        const slugs = results.map((r) => r.parentSlug).filter((p): p is string => p !== null);
        const realms = await db.realm.findMany({
          where: { slug: { in: slugs } },
          select: { slug: true, name: true },
        });
        return NextResponse.json({ parents: realms.map(r => ({ slug: r.slug, label: r.name })) });
      }

      case 'artefact':
      case 'dimension': {
        return NextResponse.json({ parents: null });
      }

      default:
        return NextResponse.json({ error: 'Unknown category' }, { status: 400 });
    }
  } catch (error) {
    console.error('[RUBRIQUE PARENTS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}