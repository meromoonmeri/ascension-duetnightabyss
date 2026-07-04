import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const isAdminUser =
      (session.user as Record<string, unknown>).discordId === ADMIN_DISCORD_ID;

    if (isAdminUser) {
      // Admin: return all sheets with user info
      const sheets = await db.characterSheet.findMany({
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              discordId: true,
              username: true,
              name: true,
              image: true,
            },
          },
        },
      });
      return NextResponse.json({ sheets });
    }

    // Regular user: return only their own sheet
    const sheet = await db.characterSheet.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            discordId: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      sheets: sheet ? [sheet] : [],
    });
  } catch (error) {
    console.error("Sheets GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}