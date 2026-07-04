import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = await db.rubriqueSection.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
      ...(body.backgroundImage !== undefined ? { backgroundImage: body.backgroundImage || null } : {}),
      ...(body.gifUrl !== undefined ? { gifUrl: body.gifUrl || null } : {}),
    },
  });
  return NextResponse.json({ section: updated });
}