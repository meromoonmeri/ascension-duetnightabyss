import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

// GET — Return all PromptTemplates, optionally filtered by ?category=technique
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const prompts = await db.promptTemplate.findMany({
      where: category ? { category } : undefined,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("CMS prompts GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — Admin only: create a new PromptTemplate
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
    const {
      name,
      label,
      description,
      category,
      template,
      variables,
      isActive,
      sortOrder,
    } = body as {
      name: string;
      label: string;
      description?: string;
      category?: string;
      template: string;
      variables?: string;
      isActive?: boolean;
      sortOrder?: number;
    };

    if (!name || !label || !template) {
      return NextResponse.json(
        { error: "Champs `name`, `label` et `template` requis" },
        { status: 400 }
      );
    }

    const prompt = await db.promptTemplate.create({
      data: {
        name,
        label,
        description: description ?? null,
        category: category ?? "general",
        template,
        variables: variables ?? "[]",
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error: unknown) {
    console.error("CMS prompts POST error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Un prompt avec ce nom existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT — Admin only: update a PromptTemplate by id
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
    const {
      id,
      name,
      label,
      description,
      category,
      template,
      variables,
      isActive,
      sortOrder,
    } = body as {
      id: string;
      name?: string;
      label?: string;
      description?: string | null;
      category?: string;
      template?: string;
      variables?: string;
      isActive?: boolean;
      sortOrder?: number;
    };

    if (!id) {
      return NextResponse.json(
        { error: "Champ `id` requis" },
        { status: 400 }
      );
    }

    const prompt = await db.promptTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(label !== undefined && { label }),
        ...(description !== undefined && { description: description ?? null }),
        ...(category !== undefined && { category }),
        ...(template !== undefined && { template }),
        ...(variables !== undefined && { variables }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(prompt);
  } catch (error: unknown) {
    console.error("CMS prompts PUT error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Prompt introuvable" },
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
        { error: "Un prompt avec ce nom existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — Admin only: delete a PromptTemplate by id
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

    await db.promptTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("CMS prompts DELETE error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Prompt introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}