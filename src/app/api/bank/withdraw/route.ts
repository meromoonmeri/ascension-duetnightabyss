import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncBotPlayerFromProfile } from "@/lib/etherSync";

// POST /api/bank/withdraw — withdraw ether from bank
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    const userId = session.user.id as string;

    // Ensure profile exists
    await db.profile.upsert({
      where: { userId },
      create: {
        userId,
        characterName: session.user.name || "Inconnu",
      },
      update: {},
      select: { id: true },
    });

    // Get or create bank account
    let account = await db.bankAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      account = await db.bankAccount.create({
        data: { userId },
      });
    }

    if (amount > account.balance) {
      return NextResponse.json(
        { error: `Solde bancaire insuffisant. Tu as ${account.balance} ether en banque.` },
        { status: 400 }
      );
    }

    // Perform withdrawal in a transaction
    const result = await db.$transaction([
      db.profile.update({
        where: { userId },
        data: { ether: { increment: amount } },
        select: { ether: true },
      }),
      db.bankAccount.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      }),
      db.transaction.create({
        data: {
          userId,
          type: "bank_withdraw",
          amount,
          reason: "Retrait de la banque",
        },
      }),
    ]);

    const updatedProfile = result[0];
    const updatedAccount = result[1];

    // Sync BotPlayer.ether to match Profile.ether
    await syncBotPlayerFromProfile(userId, updatedProfile.ether);

    return NextResponse.json({
      balance: updatedAccount.balance,
      wallet: updatedProfile.ether,
      totalDeposited: updatedAccount.totalDeposited,
      totalWithdrawn: updatedAccount.totalWithdrawn,
      withdrawn: amount,
    });
  } catch (error) {
    console.error("Bank withdraw error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}