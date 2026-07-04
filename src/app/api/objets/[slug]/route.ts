import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function safeJsonParse(str: string): any[] {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const objet = await db.objet.findUnique({
      where: { slug },
    });

    if (!objet) {
      return NextResponse.json({ error: 'Objet not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...objet,
      effets: safeJsonParse(objet.effets),
      tags: safeJsonParse(objet.tags),
    });
  } catch (error) {
    console.error('[API] /api/objets/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch objet' }, { status: 500 });
  }
}