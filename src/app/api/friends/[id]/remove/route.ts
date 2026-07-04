import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE /api/friends/[id]/remove — remove a friendship
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const friendship = await db.friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Amitié introuvable" }, { status: 404 });
    }

    if (friendship.userId !== session.user.id && friendship.friendId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await db.friendship.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Friend remove error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}