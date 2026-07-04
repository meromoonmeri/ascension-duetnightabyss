import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/ether — get user's ether balance + recent transactions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { ether: true },
    });

    const transactions = await db.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      balance: profile?.ether || 0,
      transactions,
    });
  } catch (error) {
    console.error("Ether GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}