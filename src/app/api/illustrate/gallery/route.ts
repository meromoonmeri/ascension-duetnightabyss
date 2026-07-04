import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_DISCORD_ID = "722146261381415043";

// GET — List generated images with optional filtering & pagination
// Query params: ?category=technique&limit=20&offset=0
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100
    );
    const offset = Math.max(
      parseInt(searchParams.get("offset") || "0", 10),
      0
    );

    const where = category ? { category } : undefined;

    const [images, total] = await Promise.all([
      db.generatedImage.findMany({
        where,
        orderBy: { generatedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.generatedImage.count({ where }),
    ]);

    // Map to the format expected by CMSPage
    const mapped = images.map((img) => ({
      id: img.id,
      name: img.relatedId || "Sans nom",
      prompt: img.prompt,
      category: img.category,
      url: img.imageUrl,
      createdAt: img.generatedAt.toISOString(),
      width: img.width,
      height: img.height,
      keywords: img.keywords,
    }));

    return NextResponse.json({
      images: mapped,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Illustrate gallery GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — Admin only: delete a generated image by id
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

    await db.generatedImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Illustrate gallery DELETE error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Image introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}