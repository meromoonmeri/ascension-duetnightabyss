import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/shop/buy — purchase a shop item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: "ItemId requis" }, { status: 400 });
    }

    // Get or create profile with ether balance
    const profile = await db.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        characterName: session.user.name || "Inconnu",
      },
      update: {},
    });

    // Get shop item
    const item = await db.shopItem.findUnique({ where: { id: itemId } });
    if (!item || !item.active) {
      return NextResponse.json({ error: "Article non disponible" }, { status: 404 });
    }

    // Check stock
    if (item.maxStock !== null && item.totalSold >= item.maxStock) {
      return NextResponse.json({ error: "Article en rupture de stock" }, { status: 400 });
    }

    // Check if already owned
    const existing = await db.inventoryItem.findUnique({
      where: { userId_itemId: { userId: session.user.id, itemId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Article déjà possédé" }, { status: 400 });
    }

    // Check ether balance
    if (profile.ether < item.price) {
      return NextResponse.json(
        { error: `Éther insuffisant (${profile.ether}/${item.price})` },
        { status: 400 }
      );
    }

    // Execute purchase in transaction
    await db.$transaction([
      // Deduct ether
      db.profile.update({
        where: { userId: session.user.id },
        data: { ether: { decrement: item.price } },
      }),
      // Create inventory item
      db.inventoryItem.create({
        data: {
          userId: session.user.id,
          itemId,
          equipped: false,
        },
      }),
      // Record transaction
      db.transaction.create({
        data: {
          userId: session.user.id,
          type: "purchase",
          amount: -item.price,
          itemId,
          reason: `Achat: ${item.name}`,
        },
      }),
      // Increment sold count
      db.shopItem.update({
        where: { id: itemId },
        data: { totalSold: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `${item.name} acheté pour ${item.price} ᛝ`,
      newBalance: profile.ether - item.price,
    });
  } catch (error) {
    console.error("Shop buy error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}