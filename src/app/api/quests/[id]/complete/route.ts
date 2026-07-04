import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { id } = await params;

    // Find the quest task
    const task = await db.questTask.findUnique({
      where: { id },
    });

    if (!task || !task.active) {
      return NextResponse.json({ error: "Quête introuvable ou inactive" }, { status: 404 });
    }

    // Check for existing completion
    const existingCompletion = await db.questCompletion.findUnique({
      where: { userId_taskId: { userId, taskId: id } },
    });

    if (existingCompletion) {
      // Check cooldown
      const now = new Date();
      const cooldownMs = task.cooldownHours * 60 * 60 * 1000;
      const nextEligible = new Date(existingCompletion.completedAt.getTime() + cooldownMs);

      if (now < nextEligible) {
        const remainingHours = Math.ceil(
          (nextEligible.getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        return NextResponse.json(
          {
            error: `Quête déjà complétée. Réessaie dans ${remainingHours}h.`,
            nextEligible: nextEligible.toISOString(),
          },
          { status: 429 }
        );
      }

      // Cooldown expired — update completion time
      await db.questCompletion.update({
        where: { id: existingCompletion.id },
        data: { completedAt: new Date() },
      });
    } else {
      // Create new completion
      await db.questCompletion.create({
        data: { userId, taskId: id },
      });
    }

    // Add ether reward to user's profile
    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (profile) {
      await db.profile.update({
        where: { userId },
        data: { ether: profile.ether + task.etherReward },
      });
    }

    // Also add to bot player if exists
    const botPlayer = await db.botPlayer.findUnique({
      where: { userId },
    });

    if (botPlayer) {
      await db.botPlayer.update({
        where: { userId },
        data: { ether: botPlayer.ether + task.etherReward },
      });
    }

    return NextResponse.json({
      success: true,
      etherReward: task.etherReward,
      message: `+${task.etherReward} Éther !`,
    });
  } catch (error) {
    console.error("Quest complete error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}