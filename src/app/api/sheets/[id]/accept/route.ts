import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

const VALIDATION_ROLES = [
  "1489344642796355720",
  "1489344642741698597",
  "1510011114375614464",
  "1510011122336661634",
  "1510011125725532360",
  "1510011130754371755",
  "1489344642188050597",
  "1511063848386564207",
  "1511066199935680683",
  "1511065606810501222",
  "1489344642129592577",
];

async function isAdmin(request: Request): Promise<boolean> {
  // Check bot header first
  const botSecret = process.env['BOT_SECRET'];
  const botAuth = request.headers.get("X-Bot-Auth");
  if (botSecret && botAuth === botSecret) return true;

  // Check session
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
        status: "accepted",
        reviewedAt: new Date(),
        reviewedBy: ADMIN_DISCORD_ID,
        rejectReason: null,
      },
      include: { user: { select: { id: true, discordId: true, username: true, name: true } } },
    });

    const token = process.env['DISCORD_TOKEN'];
    const guildId = process.env['BOT_GUILD_ID'];
    const userDiscordId = sheet.user.discordId;

    // Assign Discord roles
    if (token && guildId && userDiscordId && !userDiscordId.startsWith("local_")) {
      for (const roleId of VALIDATION_ROLES) {
        try {
          await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${userDiscordId}/roles/${roleId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (err) {
          console.error(`Failed to assign role ${roleId}:`, err);
        }
      }
    }

    // Send DM to user
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
                  title: "✅ Fiche de personnage acceptée !",
                  description: `Félicitations **${sheet.pseudo}** ! Ta fiche de personnage a été acceptée.\n\nTes rôles de validation ont été attribués. Tu peux désormais accéder au serveur RP.\n\nBon jeu sur Ascension ! 🎉`,
                  color: 0x22c55e,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });
        }
      } catch (err) {
        console.error("Failed to send acceptance DM:", err);
      }
    }

    // Edit the original log message to show accepted status
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
    console.error("Sheet accept PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}