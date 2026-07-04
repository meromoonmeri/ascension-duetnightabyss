import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/shop/equip — equip or unequip an inventory item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { inventoryItemId, slot, unequip } = await req.json();

    if (unequip) {
      // Unequip item
      const invItem = await db.inventoryItem.findFirst({
        where: { id: inventoryItemId, userId: session.user.id },
      });
      if (!invItem) {
        return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
      }
      await db.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { equipped: false, slot: null },
      });
      return NextResponse.json({ success: true, message: "Article déséquipé" });
    }

    // Equip: first unequip any item in the same slot
    if (slot) {
      await db.inventoryItem.updateMany({
        where: { userId: session.user.id, slot, equipped: true },
        data: { equipped: false, slot: null },
      });
    }

    // Then equip the new item
    const invItem = await db.inventoryItem.findFirst({
      where: { id: inventoryItemId, userId: session.user.id },
      include: { item: true },
    });
    if (!invItem) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    await db.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { equipped: true, slot: slot || invItem.item.type },
    });

    return NextResponse.json({ success: true, message: `${invItem.item.name} équipé` });
  } catch (error) {
    console.error("Equip error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/shop/inventory — list user's inventory
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const inventory = await db.inventoryItem.findMany({
      where: { userId: session.user.id },
      include: { item: true },
      orderBy: { purchasedAt: "desc" },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}