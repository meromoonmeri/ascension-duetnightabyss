import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCached, setCache } from '@/lib/api-cache';

function safeJsonParse(str: string): any[] {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const cacheKey = `bestiary:creatures:${searchParams.toString()}`;

    const cached = getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const realm = searchParams.get('realm');
    const rank = searchParams.get('rank');
    const danger = searchParams.get('danger');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));

    const where: any = {};

    if (realm) {
      where.realm = { slug: realm };
    }

    if (rank) {
      where.rank = rank;
    }

    if (danger) {
      const dangerNum = parseInt(danger, 10);
      if (dangerNum >= 1 && dangerNum <= 5) {
        where.dangerLevel = dangerNum;
      }
    }

    if (search) {
      where.name = { contains: search };
    }

    const [creatures, total] = await Promise.all([
      db.creature.findMany({
        where,
        include: {
          realm: true,
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.creature.count({ where }),
    ]);

    const parsed = creatures.map((c) => ({
      ...c,
      localisation: safeJsonParse(c.localisation),
      pouvoirs: safeJsonParse(c.pouvoirs),
      tags: safeJsonParse(c.tags),
    }));

    const data = { creatures: parsed, total, page, limit };
    setCache(cacheKey, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] /api/bestiary/creatures error:', error);
    return NextResponse.json({ error: 'Failed to fetch creatures' }, { status: 500 });
  }
}