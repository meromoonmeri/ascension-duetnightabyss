import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/profile/inventory — get current user's inventory with item details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;

    const inventory = await db.inventoryItem.findMany({
      where: { userId },
      include: {
        item: {
          select: {
            name: true,
            rarity: true,
            type: true,
            imageUrl: true,
            description: true,
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    });

    const items = inventory.map((inv) => ({
      id: inv.id,
      itemName: inv.item.name,
      quantity: 1,
      equipped: inv.equipped,
      slot: inv.slot,
      purchasedAt: inv.purchasedAt,
      item: inv.item,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}