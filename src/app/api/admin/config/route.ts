import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

// GET — Public (no auth needed, config is used for frontend rendering)
export async function GET() {
  try {
    const configs = await db.siteConfig.findMany({
      orderBy: { group: "asc" },
    });

    // Group by `group`
    const grouped: Record<string, typeof configs> = {
      general: [],
      banner: [],
      aesthetic: [],
    };

    for (const config of configs) {
      const group = config.group || "general";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(config);
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Admin config GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT — Admin only: upsert a single SiteConfig entry
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
    const { key, value } = body as { key: string; value: string };

    if (!key || typeof value !== "string") {
      return NextResponse.json(
        { error: "Champs `key` et `value` requis" },
        { status: 400 }
      );
    }

    const config = await db.siteConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Admin config PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}