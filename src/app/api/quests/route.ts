import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const DEFAULT_QUESTS = [
  {
    title: "Inviter quelqu'un sur le serveur",
    description: "Invite un nouveau membre sur le serveur Discord d'Ascension",
    type: "social",
    emoji: "📨",
    etherReward: 200,
    sortOrder: 1,
    cooldownHours: 24,
  },
  {
    title: "Bump via Disboard",
    description: "Utilise la commande /bump sur Disboard pour faire connaître le serveur",
    type: "social",
    emoji: "📢",
    etherReward: 150,
    sortOrder: 2,
    cooldownHours: 24,
  },
  {
    title: "Participer à un événement RP",
    description: "Prends part à un événement de roleplay organisé sur le serveur",
    type: "event",
    emoji: "🎭",
    etherReward: 300,
    sortOrder: 3,
    cooldownHours: 168,
  },
  {
    title: "Gagner un combat",
    description: "Remporte un combat RP sur le serveur",
    type: "daily",
    emoji: "⚔️",
    etherReward: 250,
    sortOrder: 4,
    cooldownHours: 24,
  },
  {
    title: "Lire les nouvelles",
    description: "Consulte la boîte aux lettres et lis au moins une nouvelle",
    type: "daily",
    emoji: "📰",
    etherReward: 50,
    sortOrder: 5,
    cooldownHours: 24,
  },
] as const;

export async function GET() {
  try {
    // Seed default quests if none exist
    const count = await db.questTask.count();
    if (count === 0) {
      await db.questTask.createMany({
        data: DEFAULT_QUESTS.map((q) => ({
          title: q.title,
          description: q.description,
          type: q.type,
          emoji: q.emoji,
          etherReward: q.etherReward,
          sortOrder: q.sortOrder,
          cooldownHours: q.cooldownHours,
        })),
      });
    }

    // Fetch all active quests
    const quests = await db.questTask.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    // Check if user is authenticated for completion data
    const session = await getServerSession(authOptions);
    let completions: { taskId: string; completedAt: string }[] = [];

    if (session?.user?.id) {
      const userId = session.user.id as string;
      const comp = await db.questCompletion.findMany({
        where: { userId },
        select: { taskId: true, completedAt: true },
      });
      completions = comp.map((c) => ({
        taskId: c.taskId,
        completedAt: c.completedAt.toISOString(),
      }));
    }

    return NextResponse.json({ quests, completions });
  } catch (error) {
    console.error("Quests fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}