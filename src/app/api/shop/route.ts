import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/shop — list all active shop items, optionally filtered
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const rarity = searchParams.get("rarity");

    const where: Record<string, unknown> = { active: true };
    if (type) where.type = type;
    if (rarity) where.rarity = rarity;

    const items = await db.shopItem.findMany({
      where,
      orderBy: [{ rarity: "asc" }, { price: "asc" }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Shop GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}