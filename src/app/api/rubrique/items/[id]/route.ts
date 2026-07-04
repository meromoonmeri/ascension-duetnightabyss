import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const item = await db.rubriqueItem.findUnique({
    where: { id },
    include: { section: true },
  });

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = await db.rubriqueItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const allowedFields = [
    'category', 'parentSlug', 'name', 'nameJp', 'subtitle', 'rank',
    'description', 'vueEnsemble', 'imageUrl', 'backgroundImage', 'gifUrl',
    'metadata', 'order', 'sectionId',
  ] as const;

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (field === 'metadata') {
        data[field] = typeof body[field] === 'string'
          ? body[field]
          : JSON.stringify(body[field]);
      } else if (['imageUrl', 'backgroundImage', 'gifUrl', 'parentSlug', 'nameJp', 'subtitle', 'rank', 'description', 'vueEnsemble', 'sectionId'].includes(field)) {
        data[field] = body[field] || null;
      } else {
        data[field] = body[field];
      }
    }
  }

  const updated = await db.rubriqueItem.update({
    where: { id },
    data,
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await db.rubriqueItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  await db.rubriqueItem.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}