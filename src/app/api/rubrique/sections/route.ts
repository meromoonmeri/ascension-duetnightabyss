import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const sections = await db.rubriqueSection.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ sections });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const updated = await db.rubriqueSection.update({ where: { id }, data });
  return NextResponse.json({ section: updated });
}