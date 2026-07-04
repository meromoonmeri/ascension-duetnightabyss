import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

// GET — Public (no auth needed, config is used for frontend rendering)
// Returns ALL config entries as a flat array (CMSPage expects flat)
// Optional ?group=ranks to filter by group
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupFilter = searchParams.get("group");

    const configs = await db.siteConfig.findMany({
      where: groupFilter ? { group: groupFilter } : undefined,
      orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("CMS config GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT — Admin only: supports both single and batch upsert
// Single: { key, value, label?, group?, type?, ... }
// Batch:  { group: "ranks", entries: [{ key, value }, ...] }
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

    // ── Batch mode: { group, entries: [{key, value}] } ─────────
    if (body.entries && Array.isArray(body.entries)) {
      const { entries, group: defaultGroup } = body as {
        entries: { key: string; value: string; label?: string; group?: string }[];
        group?: string;
      };

      if (entries.length === 0) {
        return NextResponse.json({ error: "Aucune entrée" }, { status: 400 });
      }

      // Use Prisma transaction for batch
      const results = await db.$transaction(
        entries.map((entry) =>
          db.siteConfig.upsert({
            where: { key: entry.key },
            create: {
              key: entry.key,
              value: entry.value,
              group: entry.group || defaultGroup || "general",
              label: entry.label || "",
            },
            update: {
              value: entry.value,
              ...(entry.label !== undefined && { label: entry.label }),
              ...(entry.group !== undefined && { group: entry.group }),
            },
          })
        )
      );

      return NextResponse.json({ success: true, count: results.length });
    }

    // ── Single mode: { key, value, label?, group?, ... } ────────
    const {
      key,
      value,
      label,
      group,
      type,
      options,
      hint,
      sortOrder,
    } = body as {
      key: string;
      value: string;
      label?: string;
      group?: string;
      type?: string;
      options?: string;
      hint?: string;
      sortOrder?: number;
    };

    if (!key || typeof value !== "string") {
      return NextResponse.json(
        { error: "Champs `key` et `value` requis" },
        { status: 400 }
      );
    }

    const config = await db.siteConfig.upsert({
      where: { key },
      create: {
        key,
        value,
        ...(label !== undefined && { label }),
        ...(group !== undefined && { group }),
        ...(type !== undefined && { type }),
        ...(options !== undefined && { options }),
        ...(hint !== undefined && { hint }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      update: {
        value,
        ...(label !== undefined && { label }),
        ...(group !== undefined && { group }),
        ...(type !== undefined && { type }),
        ...(options !== undefined && { options }),
        ...(hint !== undefined && { hint }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("CMS config PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — Admin only: delete a SiteConfig by key
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { key } = body as { key: string };

    if (!key) {
      return NextResponse.json(
        { error: "Champ `key` requis" },
        { status: 400 }
      );
    }

    await db.siteConfig.delete({
      where: { key },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("CMS config DELETE error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Configuration introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}