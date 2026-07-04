import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/bank — get bank account info, apply daily interest, auto-create
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;

    // Ensure profile exists (needed for wallet/ether display)
    let profile = await db.profile.findUnique({
      where: { userId },
      select: { ether: true },
    });

    if (!profile) {
      profile = await db.profile.create({
        data: {
          userId,
          characterName: session.user.name || "Inconnu",
        },
        select: { ether: true },
      });
    }

    // Get BotPlayer ether as the authoritative wallet source
    let botEther: number | null = null;
    if (session.user.discordId) {
      const botPlayer = await db.botPlayer.findUnique({
        where: { discordId: session.user.discordId },
        select: { ether: true },
      });
      if (botPlayer) botEther = botPlayer.ether;
    }

    // Use BotPlayer.ether (authoritative) or fall back to Profile.ether
    const wallet = botEther ?? profile.ether;

    // Get or create bank account
    let account = await db.bankAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      account = await db.bankAccount.create({
        data: { userId },
      });
    }

    // Apply daily interest if 24h have passed
    const now = new Date();
    const lastInterest = new Date(account.lastInterestAt);
    const hoursSince = (now.getTime() - lastInterest.getTime()) / (1000 * 60 * 60);

    let interestEarned = 0;

    if (hoursSince >= 24 && account.balance > 0) {
      interestEarned = Math.floor(account.balance * (account.interestRate / 100));

      if (interestEarned > 0) {
        account = await db.bankAccount.update({
          where: { userId },
          data: {
            balance: account.balance + interestEarned,
            lastInterestAt: now,
          },
        });

        // Log interest as a transaction
        await db.transaction.create({
          data: {
            userId,
            type: "bank_interest",
            amount: interestEarned,
            reason: `Intérêts quotidiens (${account.interestRate}%)`,
          },
        });
      }
    }

    // Get recent bank transactions (last 10)
    const transactions = await db.transaction.findMany({
      where: {
        userId,
        OR: [
          { type: { contains: "bank" } },
          { reason: { contains: "bank" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const dailyInterest = Math.floor(account.balance * (account.interestRate / 100));

    return NextResponse.json({
      balance: account.balance,
      wallet,
      totalDeposited: account.totalDeposited,
      totalWithdrawn: account.totalWithdrawn,
      interestRate: account.interestRate,
      dailyInterest,
      interestEarned,
      lastInterestAt: account.lastInterestAt,
      transactions,
    });
  } catch (error) {
    console.error("Bank GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}