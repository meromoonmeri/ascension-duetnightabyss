import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = (await request.json()) as {
      pseudo?: string;
      avatarUrl?: string;
      age?: string;
      race?: string;
      metier?: string;
      histoire?: string;
      description?: string;
      stats?: string;
      liens?: string;
      captures?: string;
    };

    const { pseudo, avatarUrl, age, race, metier, histoire, description, stats, liens, captures } = body;

    if (!pseudo || typeof pseudo !== "string" || !pseudo.trim()) {
      return NextResponse.json({ error: "Le pseudo est requis" }, { status: 400 });
    }

    // Upsert character sheet (each user has at most one)
    const sheet = await db.characterSheet.upsert({
      where: { userId },
      create: {
        userId,
        pseudo: pseudo.trim(),
        avatarUrl: avatarUrl || null,
        age: age || null,
        race: race || null,
        metier: metier || null,
        histoire: histoire || null,
        description: description || null,
        stats: stats || null,
        liens: liens || null,
        captures: captures || null,
        status: "pending",
        submittedAt: new Date(),
      },
      update: {
        pseudo: pseudo.trim(),
        avatarUrl: avatarUrl || null,
        age: age || null,
        race: race || null,
        metier: metier || null,
        histoire: histoire || null,
        description: description || null,
        stats: stats || null,
        liens: liens || null,
        captures: captures || null,
        status: "pending",
        submittedAt: new Date(),
        rejectReason: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      include: { user: { select: { id: true, discordId: true, username: true, name: true } } },
    });

    // Send Discord embed to log channel
    const token = process.env['DISCORD_TOKEN'];
    const logChannelId = process.env['LOG_CHANNEL_ID'] || "1512862089302245376";

    if (token) {
      try {
        // Build embed fields
        const fields: { name: string; value: string; inline?: boolean }[] = [];

        if (age) fields.push({ name: "Âge", value: age, inline: true });
        if (race) fields.push({ name: "Race", value: race, inline: true });
        if (metier) fields.push({ name: "Métier", value: metier, inline: true });

        if (stats) {
          try {
            const parsed = JSON.parse(stats) as Record<string, unknown>;
            const statsStr = Object.entries(parsed)
              .map(([k, v]) => `**${k}**: ${v}`)
              .join("\n");
            if (statsStr) fields.push({ name: "Statistiques", value: statsStr, inline: false });
          } catch {
            fields.push({ name: "Statistiques", value: stats, inline: false });
          }
        }

        if (description) {
          const truncated = description.length > 1024 ? description.slice(0, 1021) + "..." : description;
          fields.push({ name: "Description", value: truncated, inline: false });
        }

        if (histoire) {
          const truncated = histoire.length > 1024 ? histoire.slice(0, 1021) + "..." : histoire;
          fields.push({ name: "Histoire", value: truncated, inline: false });
        }

        if (liens) {
          try {
            const parsed = JSON.parse(liens) as { label: string; url: string }[];
            const liensStr = parsed.map((l) => `[${l.label}](${l.url})`).join("\n");
            if (liensStr) fields.push({ name: "Liens", value: liensStr, inline: false });
          } catch {
            fields.push({ name: "Liens", value: liens, inline: false });
          }
        }

        const embed: Record<string, unknown> = {
          title: `📝 Fiche de ${pseudo}`,
          description: `Soumise par **${sheet.user.username || sheet.user.name || "Inconnu"}** (${sheet.user.discordId || "?"})`,
          color: 0xc9a84c,
          fields: fields.length > 0 ? fields : undefined,
          timestamp: new Date().toISOString(),
          footer: { text: `Sheet ID: ${sheet.id}` },
        };

        if (avatarUrl) {
          embed.thumbnail = { url: avatarUrl };
        }

        if (captures) {
          try {
            const parsed = JSON.parse(captures) as string[];
            if (parsed.length > 0) {
              embed.image = { url: parsed[0] };
            }
          } catch {
            // ignore
          }
        }

        const msgRes = await fetch(`https://discord.com/api/v10/channels/${logChannelId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embeds: [embed],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 3, // SUCCESS (green)
                    label: "✅ Accepter",
                    custom_id: `sheet:accept:${sheet.id}`,
                  },
                  {
                    type: 2,
                    style: 1, // PRIMARY (blurple)
                    label: "🔄 Révision",
                    custom_id: `sheet:revision:${sheet.id}`,
                  },
                  {
                    type: 2,
                    style: 4, // DANGER (red)
                    label: "❌ Refuser",
                    custom_id: `sheet:reject:${sheet.id}`,
                  },
                ],
              },
            ],
          }),
        });

        if (msgRes.ok) {
          const msgData = (await msgRes.json()) as { id: string };
          await db.characterSheet.update({
            where: { id: sheet.id },
            data: { logMessageId: msgData.id },
          });
        }
      } catch (err) {
        console.error("Failed to send Discord log embed:", err);
        // Don't fail the request if Discord logging fails
      }
    }

    return NextResponse.json({ success: true, sheet });
  } catch (error) {
    console.error("Sheet submit POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}