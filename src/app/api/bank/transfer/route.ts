import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/bank/transfer — send ether to another user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const recipientName = String(body.recipientName || "").trim();
    const amount = Number(body.amount);

    if (!recipientName) {
      return NextResponse.json({ error: "Nom du destinataire requis" }, { status: 400 });
    }
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    const senderId = session.user.id;

    // Get or create sender bank account
    let senderAccount = await db.bankAccount.findUnique({ where: { userId: senderId } });
    if (!senderAccount) {
      senderAccount = await db.bankAccount.create({ data: { userId: senderId } });
    }

    if (amount > senderAccount.balance) {
      return NextResponse.json(
        { error: `Solde insuffisant. Tu as ${senderAccount.balance} ether en banque.` },
        { status: 400 }
      );
    }

    // Find recipient by characterName (case-insensitive)
    const recipient = await db.profile.findFirst({
      where: { characterName: { equals: recipientName, mode: "insensitive" } },
    });

    if (!recipient) {
      return NextResponse.json({ error: `Joueur "${recipientName}" introuvable.` }, { status: 404 });
    }

    if (recipient.userId === senderId) {
      return NextResponse.json({ error: "Tu ne peux pas t'envoyer de l'ether à toi-même." }, { status: 400 });
    }

    // Get or create recipient bank account
    let recipientAccount = await db.bankAccount.findUnique({ where: { userId: recipient.userId } });
    if (!recipientAccount) {
      recipientAccount = await db.bankAccount.create({ data: { userId: recipient.userId } });
    }

    // Perform transfer in a transaction
    const result = await db.$transaction([
      db.bankAccount.update({
        where: { userId: senderId },
        data: { balance: { decrement: amount } },
      }),
      db.bankAccount.update({
        where: { userId: recipient.userId },
        data: { balance: { increment: amount } },
      }),
      db.transaction.create({
        data: {
          userId: senderId,
          type: "bank_transfer_out",
          amount,
          reason: `Transfert à ${recipient.characterName}`,
        },
      }),
      db.transaction.create({
        data: {
          userId: recipient.userId,
          type: "bank_transfer_in",
          amount,
          reason: `Transfert de ${session.user.name || "Inconnu"}`,
        },
      }),
    ]);

    const updatedSender = result[0];
    const updatedRecipient = result[1];

    return NextResponse.json({
      balance: updatedSender.balance,
      recipientName: recipient.characterName,
      transferred: amount,
    });
  } catch (error) {
    console.error("Bank transfer error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}