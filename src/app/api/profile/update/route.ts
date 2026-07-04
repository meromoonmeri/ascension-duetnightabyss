import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT /api/profile/update — update profile custom fields (bannerUrl, avatarUrl, etc.)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const {
      characterName,
      characterTitle,
      description,
      backstory,
      bannerUrl,
      avatarUrl,
      bannerColor,
    } = body as {
      characterName?: string;
      characterTitle?: string;
      description?: string;
      backstory?: string;
      bannerUrl?: string;
      avatarUrl?: string;
      bannerColor?: string;
    };

    const updateData: Record<string, string> = {};
    if (characterName !== undefined) updateData.characterName = characterName;
    if (characterTitle !== undefined) updateData.characterTitle = characterTitle;
    if (description !== undefined) updateData.description = description;
    if (backstory !== undefined) updateData.backstory = backstory;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bannerColor !== undefined) updateData.bannerColor = bannerColor;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
    }

    const profile = await db.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        characterName: characterName || session.user.name || "Inconnu",
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}