import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

// GET — Return all PinterestKeywords, optionally filtered by ?category=style
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const keywords = await db.pinterestKeyword.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(keywords);
  } catch (error) {
    console.error("CMS keywords GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — Admin only: create a new PinterestKeyword
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
    const { keyword, category, tags, weight, isActive } = body as {
      keyword: string;
      category?: string;
      tags?: string;
      weight?: number;
      isActive?: boolean;
    };

    if (!keyword) {
      return NextResponse.json(
        { error: "Champ `keyword` requis" },
        { status: 400 }
      );
    }

    const kw = await db.pinterestKeyword.create({
      data: {
        keyword,
        category: category ?? "general",
        tags: tags ?? "[]",
        weight: weight ?? 1,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(kw, { status: 201 });
  } catch (error: unknown) {
    console.error("CMS keywords POST error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ce mot-clé existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT — Admin only: update a PinterestKeyword by id
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
    const { id, keyword, category, tags, weight, isActive } = body as {
      id: string;
      keyword?: string;
      category?: string;
      tags?: string;
      weight?: number;
      isActive?: boolean;
    };

    if (!id) {
      return NextResponse.json(
        { error: "Champ `id` requis" },
        { status: 400 }
      );
    }

    const kw = await db.pinterestKeyword.update({
      where: { id },
      data: {
        ...(keyword !== undefined && { keyword }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(weight !== undefined && { weight }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(kw);
  } catch (error: unknown) {
    console.error("CMS keywords PUT error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Mot-clé introuvable" },
        { status: 404 }
      );
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ce mot-clé existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — Admin only: delete a PinterestKeyword by id
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

    await db.pinterestKeyword.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("CMS keywords DELETE error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Mot-clé introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}