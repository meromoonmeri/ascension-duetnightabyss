import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

// GET — Public: return menu items from SiteConfig (key: "cms_menu_items")
// Returns a JSON array of menu items sorted by sortOrder
export async function GET() {
  try {
    const config = await db.siteConfig.findUnique({
      where: { key: "cms_menu_items" },
    });

    if (!config || !config.value) {
      return NextResponse.json([]);
    }

    const items = JSON.parse(config.value);
    return NextResponse.json(
      Array.isArray(items) ? items.sort((a: { sortOrder?: number }, b: { sortOrder?: number }) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []
    );
  } catch (error) {
    console.error("CMS menus GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT — Admin only: save the entire menu array (replaces all items)
// Body: { items: [{ id, label, icon, pageId, url, sortOrder, active, children? }] }
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { items } = body as { items: unknown[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Champ `items` requis (tableau)" },
        { status: 400 }
      );
    }

    await db.siteConfig.upsert({
      where: { key: "cms_menu_items" },
      create: {
        key: "cms_menu_items",
        value: JSON.stringify(items),
        label: "Éléments de menu",
        group: "menus",
        type: "json",
      },
      update: {
        value: JSON.stringify(items),
      },
    });

    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error("CMS menus PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}