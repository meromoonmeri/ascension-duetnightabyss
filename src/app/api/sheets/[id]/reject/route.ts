import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

async function isAdmin(request: Request): Promise<boolean> {
  const botSecret = process.env['BOT_SECRET'];
  const botAuth = request.headers.get("X-Bot-Auth");
  if (botSecret && botAuth === botSecret) return true;

  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as Record<string, unknown>).discordId === ADMIN_DISCORD_ID) {
    return true;
  }

  return false;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const body = (await request.json()) as { reason?: string };
    const { reason } = body;

    const sheet = await db.characterSheet.findUnique({
      where: { id },
      include: { user: { select: { id: true, discordId: true, username: true, name: true } } },
    });

    if (!sheet) {
      return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
    }

    // Update sheet
    const updated = await db.characterSheet.update({
      where: { id },
      data: {
        status: "rejected",
        rejectReason: reason || null,
        reviewedAt: new Date(),
        reviewedBy: ADMIN_DISCORD_ID,
      },
      include: { user: { select: { id: true, discordId: true, username: true, name: true } } },
    });

    // Send DM to user
    const token = process.env['DISCORD_TOKEN'];
    const userDiscordId = sheet.user.discordId;

    if (token && userDiscordId && !userDiscordId.startsWith("local_")) {
      try {
        const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
          method: "POST",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipient_id: userDiscordId }),
        });

        if (dmRes.ok) {
          const dmChannel = (await dmRes.json()) as { id: string };

          await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bot ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              embeds: [
                {
                  title: "❌ Fiche de personnage refusée",
                  description: `Ta fiche de personnage **${sheet.pseudo}** a été refusée.`,
                  color: 0xef4444,
                  fields: reason
                    ? [{ name: "Raison", value: reason, inline: false }]
                    : undefined,
                  timestamp: new Date().toISOString(),
                  footer: { text: "Tu peux soumettre une nouvelle fiche via le wiki." },
                },
              ],
            }),
          });
        }
      } catch (err) {
        console.error("Failed to send rejection DM:", err);
      }
    }

    // Edit the original log message to remove buttons
    if (token && sheet.logMessageId) {
      const logChannelId = process.env['LOG_CHANNEL_ID'] || "1512862089302245376";
      try {
        await fetch(
          `https://discord.com/api/v10/channels/${logChannelId}/messages/${sheet.logMessageId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bot ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              components: [],
            }),
          }
        );
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ success: true, sheet: updated });
  } catch (error) {
    console.error("Sheet reject PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}