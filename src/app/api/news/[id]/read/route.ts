import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id as string;

    const letter = await db.newsLetter.findUnique({ where: { id } });
    if (!letter || letter.userId !== userId) {
      return NextResponse.json({ error: "Lettre introuvable" }, { status: 404 });
    }

    await db.newsLetter.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("News read error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}