import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

// GET — Return all PageBlocks for a given page (public: pages may be rendered on frontend)
// Query: ?pageId=home
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { error: "Paramètre `pageId` requis" },
        { status: 400 }
      );
    }

    const blocks = await db.pageBlock.findMany({
      where: { pageId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("CMS pages GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — Admin only: create a new PageBlock
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { pageId, blockType, content, config, sortOrder, active } = body as {
      pageId: string;
      blockType: string;
      content?: string;
      config?: string;
      sortOrder?: number;
      active?: boolean;
    };

    if (!pageId || !blockType) {
      return NextResponse.json(
        { error: "Champs `pageId` et `blockType` requis" },
        { status: 400 }
      );
    }

    // Get max sortOrder for this page to append at end
    const maxSort = await db.pageBlock.aggregate({
      where: { pageId },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    const block = await db.pageBlock.create({
      data: {
        pageId,
        blockType,
        content: content ?? "{}",
        config: config ?? "{}",
        sortOrder: sortOrder ?? nextSort,
        active: active ?? true,
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error("CMS pages POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT — Admin only: update a PageBlock (supports single + batch reorder)
// Single: { id, content?, config?, active?, sortOrder? }
// Batch reorder: { pageId, order: [{id, sortOrder}, ...] }
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

    // ── Batch reorder mode ──────────────────────────────────
    if (body.order && Array.isArray(body.order)) {
      const { pageId, order } = body as {
        pageId: string;
        order: { id: string; sortOrder: number }[];
      };

      await db.$transaction(
        order.map((item) =>
          db.pageBlock.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return NextResponse.json({ success: true, count: order.length });
    }

    // ── Single update mode ──────────────────────────────────
    const { id, blockType, content, config, sortOrder, active, pageId } =
      body as {
        id: string;
        blockType?: string;
        content?: string;
        config?: string;
        sortOrder?: number;
        active?: boolean;
        pageId?: string;
      };

    if (!id) {
      return NextResponse.json(
        { error: "Champ `id` requis" },
        { status: 400 }
      );
    }

    const block = await db.pageBlock.update({
      where: { id },
      data: {
        ...(blockType !== undefined && { blockType }),
        ...(content !== undefined && { content }),
        ...(config !== undefined && { config }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(active !== undefined && { active }),
        ...(pageId !== undefined && { pageId }),
      },
    });

    return NextResponse.json(block);
  } catch (error: unknown) {
    console.error("CMS pages PUT error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Bloc introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — Admin only: delete a PageBlock
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
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json(
        { error: "Champ `id` requis" },
        { status: 400 }
      );
    }

    await db.pageBlock.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("CMS pages DELETE error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Bloc introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}