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

// ─── PUT: Edit creature ──────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existing = await db.creature.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Creature not found' }, { status: 404 });
    }

    const body = await request.json();

    // If slug change, check uniqueness
    if (body.slug && body.slug !== slug) {
      const taken = await db.creature.findUnique({ where: { slug: body.slug } });
      if (taken) {
        return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
      }
    }

    const toJson = (val: unknown): string => {
      if (val === null || val === undefined || val === "") return "[]";
      if (typeof val === "string") { try { JSON.parse(val); return val; } catch { return JSON.stringify([val]); } }
      return JSON.stringify(val);
    };

    const updated = await db.creature.update({
      where: { slug },
      data: {
        ...(body.slug && body.slug !== slug ? { slug: body.slug } : {}),
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.nameJp !== undefined ? { nameJp: body.nameJp } : {}),
        ...(body.citation !== undefined ? { citation: body.citation } : {}),
        ...(body.classe !== undefined ? { classe: body.classe } : {}),
        ...(body.rank !== undefined ? { rank: body.rank } : {}),
        ...(body.dangerLevel !== undefined ? { dangerLevel: Math.min(5, Math.max(1, Number(body.dangerLevel))) } : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
        ...(body.imageKeyword !== undefined ? { imageKeyword: body.imageKeyword } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.comportement !== undefined ? { comportement: body.comportement } : {}),
        ...(body.signatureShinso !== undefined ? { signatureShinso: toJson(body.signatureShinso) } : {}),
        ...(body.localisation !== undefined ? { localisation: toJson(body.localisation) } : {}),
        ...(body.pouvoirs !== undefined ? { pouvoirs: toJson(body.pouvoirs) } : {}),
        ...(body.variantes !== undefined ? { variantes: toJson(body.variantes) } : {}),
        ...(body.caracteristiques !== undefined ? { caracteristiques: toJson(body.caracteristiques) } : {}),
        ...(body.tags !== undefined ? { tags: toJson(body.tags) } : {}),
        ...(body.source !== undefined ? { source: body.source } : {}),
        ...(body.realmId !== undefined ? { realmId: body.realmId || null } : {}),
      },
    });

    return NextResponse.json({ success: true, creature: updated });
  } catch (error) {
    console.error('[API] PUT /api/bestiary/creatures/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to update creature' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const creature = await db.creature.findUnique({
      where: { slug },
      include: { realm: true },
    });

    if (!creature) {
      return NextResponse.json({ error: 'Creature not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...creature,
      localisation: safeJsonParse(creature.localisation),
      pouvoirs: safeJsonParse(creature.pouvoirs),
      tags: safeJsonParse(creature.tags),
    });
  } catch (error) {
    console.error('[API] /api/bestiary/creatures/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch creature' }, { status: 500 });
  }
}