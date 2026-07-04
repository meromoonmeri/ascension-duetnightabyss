import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const category = searchParams.get('category');
    const parentSlug = searchParams.get('parentSlug');
    const search = searchParams.get('search');
    const rank = searchParams.get('rank');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10) || 30));

    const where: Prisma.RubriqueItemWhereInput = {};

    if (section) {
      where.section = { slug: section };
    }

    if (category) {
      where.category = category;
    }

    if (parentSlug) {
      where.parentSlug = parentSlug;
    }

    if (rank) {
      where.rank = rank;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameJp: { contains: search } },
        { subtitle: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      db.rubriqueItem.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.rubriqueItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[RUBRIQUE ITEMS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sectionId,
      category,
      parentSlug,
      name,
      nameJp,
      subtitle,
      rank,
      description,
      vueEnsemble,
      imageUrl,
      backgroundImage,
      gifUrl,
      metadata,
      order,
    } = body;

    if (!sectionId || !category || !name) {
      return NextResponse.json(
        { error: 'sectionId, category, and name are required' },
        { status: 400 }
      );
    }

    const item = await db.rubriqueItem.create({
      data: {
        sectionId,
        category,
        parentSlug: parentSlug || null,
        name,
        nameJp: nameJp || null,
        subtitle: subtitle || null,
        rank: rank || null,
        description: description || null,
        vueEnsemble: vueEnsemble || null,
        imageUrl: imageUrl || null,
        backgroundImage: backgroundImage || null,
        gifUrl: gifUrl || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        order: typeof order === 'number' ? order : 0,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('[RUBRIQUE ITEMS POST ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}