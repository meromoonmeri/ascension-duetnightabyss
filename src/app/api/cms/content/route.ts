import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_DISCORD_ID = "722146261381415043";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
  ) {
    return null;
  }
  return session;
}

/* ------------------------------------------------------------------ */
/*  GET — Fetch all CMS content for a page (public read)              */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page");
    if (!page) {
      return NextResponse.json({ error: "page param required" }, { status: 400 });
    }

    const entries = await db.cmsContent.findMany({
      where: { page },
      orderBy: { elementKey: "asc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[CMS] GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PUT — Upsert one or more content entries (admin only)             */
/* ------------------------------------------------------------------ */

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const entries: {
      page: string;
      elementKey: string;
      type: string;
      value: string;
      metadata?: string;
    }[] = body.entries;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "entries array required" }, { status: 400 });
    }

    const results = [];

    for (const entry of entries) {
      const upserted = await db.cmsContent.upsert({
        where: {
          page_elementKey: { page: entry.page, elementKey: entry.elementKey },
        },
        create: {
          page: entry.page,
          elementKey: entry.elementKey,
          type: entry.type || "text",
          value: entry.value,
          metadata: entry.metadata || null,
        },
        update: {
          type: entry.type || "text",
          value: entry.value,
          metadata: entry.metadata || null,
        },
      });
      results.push(upserted);
    }

    return NextResponse.json({ saved: results.length, entries: results });
  } catch (error) {
    console.error("[CMS] PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE — Remove a content entry (reset to default)                */
/* ------------------------------------------------------------------ */

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { page, elementKey } = await req.json();
    if (!page || !elementKey) {
      return NextResponse.json({ error: "page and elementKey required" }, { status: 400 });
    }

    await db.cmsContent.deleteMany({
      where: { page, elementKey },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[CMS] DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}