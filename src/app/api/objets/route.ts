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
    const cacheKey = `objets:list:${searchParams.toString()}`;

    const cached = getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const type = searchParams.get('type');
    const rank = searchParams.get('rank');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (rank) {
      where.rank = rank;
    }

    if (search) {
      where.name = { contains: search };
    }

    const [objets, total] = await Promise.all([
      db.objet.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.objet.count({ where }),
    ]);

    const parsed = objets.map((o) => ({
      ...o,
      effets: safeJsonParse(o.effets),
      tags: safeJsonParse(o.tags),
    }));

    const data = { objets: parsed, total, page, limit };
    setCache(cacheKey, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] /api/objets error:', error);
    return NextResponse.json({ error: 'Failed to fetch objets' }, { status: 500 });
  }
}