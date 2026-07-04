import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCached, setCache } from '@/lib/api-cache';

const CACHE_KEY = 'bestiary:realms:all';

export async function GET() {
  try {
    const cached = getCached<{ realms: any[] }>(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    const realms = await db.realm.findMany({
      include: {
        _count: {
          select: { creatures: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = { realms };
    setCache(CACHE_KEY, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] /api/bestiary/realms error:', error);
    return NextResponse.json({ error: 'Failed to fetch realms' }, { status: 500 });
  }
}