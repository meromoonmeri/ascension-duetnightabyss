// ═══════════════════════════════════════════════════════════════
//  NPC Watcher — Auto-RP response via Cloudflare AI
//  Reads messages in designated RP channels and responds as NPCs
// ═══════════════════════════════════════════════════════════════

import { type Client, type Message, type TextChannel, ChannelType } from "discord.js";
import { db } from "../../lib/db";
import { aiChat } from "../constants";

const RP_SYSTEM_PROMPT = `Tu es un narrateur et personnage NPC dans le monde de rôle-play "Ascension ノミステリ RP".

RÈGLES ABSOLUES :
- Réponds avec une narration immersive de 2000 à 4000 caractères minimum
- Utilise des dialogues avec des tirets longs : — Bonjour, voyageur.
- Décris l'atmosphère, les sensations, les émotions des personnages
- Ne JAMAIS rompre le quatrième mur ni mentionner être un bot ou une IA
- Respecte les actions des joueurs et fais progresser l'histoire
- Introduis des éléments narratifs, des rebondissements, des descriptions sensorielles
- Les dialogues NPC utilisent des tirets longs (—) et sont en français
- Les noms japonais de techniques sont en romaji avec leur traduction
- Style : fantasy épique, poétique, immersif — comme un roman light`;

export async function handleRpMessage(client: Client, message: Message) {
  // Ignore bots
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.channel.isTextBased()) return;

  const channelId = message.channel.id;

  // Check if this channel has an NPC watcher
  const rpChannel = await db.rpChannel.findUnique({
    where: { channelId },
    include: { npc: true },
  });

  if (!rpChannel?.active) return;

  // Gather recent messages for context (last 20 messages)
  const messages = await message.channel.messages.fetch({ limit: 20, before: message.id });
  const context = [...messages.values()].reverse().map(m => {
    const name = m.author.username;
    const content = m.content;
    if (m.author.id === client.user?.id) return `[Narrateur/NPC]: ${content}`;
    return `[${name}]: ${content}`;
  }).join("\n");

  const npcName = rpChannel.npc?.name || "Narrateur";
  const personality = rpChannel.npc?.personality || "Un narrateur mystérieux qui guide les aventuriers.";
  const sceneContext = rpChannel.context || rpChannel.npc?.backstory || "";

  const systemPrompt = `${RP_SYSTEM_PROMPT}

PERSONNAGE NPC ACTUEL : ${npcName}
Personnalité : ${personality}
${sceneContext ? `Contexte de la scène : ${sceneContext}` : ""}

HISTORIQUE RÉCENT DES MESSAGES :
${context}

RÉPONDS maintenant à ce dernier message de manière immersive.`;

  try {
    // Show typing indicator
    await (message.channel as TextChannel).sendTyping();

    const response = await aiChat(systemPrompt, message.content, {
      temperature: 0.95,
      maxTokens: 4096,
    });

    // Split long responses into multiple messages (Discord limit: 2000 chars)
    const chunks = splitMessage(response, 1900);

    for (const chunk of chunks) {
      await (message.channel as TextChannel).send({
        content: chunk,
        allowedMentions: { users: [message.author.id] },
      });
    }
  } catch (err) {
    console.error("[NPC Watcher] Error:", err);
  }
}

function splitMessage(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find a good split point (paragraph break or sentence end)
    let splitAt = remaining.lastIndexOf("\n\n", maxLen);
    if (splitAt < maxLen * 0.5) splitAt = remaining.lastIndexOf("\n", maxLen);
    if (splitAt < maxLen * 0.5) splitAt = remaining.lastIndexOf(". ", maxLen);
    if (splitAt < maxLen * 0.5) splitAt = remaining.lastIndexOf(" ", maxLen);
    if (splitAt < maxLen * 0.3) splitAt = maxLen;

    chunks.push(remaining.slice(0, splitAt + 1).trim());
    remaining = remaining.slice(splitAt + 1).trim();
  }

  return chunks;
}

// ─── Admin command to set up NPC in a channel ─────────────────

export async function setupNpc(
  channelId: string,
  guildId: string,
  npcName: string,
  personality: string,
  backstory?: string,
) {
  // Upsert NPC
  const npc = await db.nPC.upsert({
    where: { channelId },
    create: {
      name: npcName,
      personality,
      appearance: backstory,
      backstory,
      channelId,
      guildId,
    },
    update: {
      name: npcName,
      personality,
      appearance: backstory,
      backstory,
    },
  });

  // Upsert RP channel
  await db.rpChannel.upsert({
    where: { channelId },
    create: { channelId, guildId, npcId: npc.id, active: true },
    update: { npcId: npc.id, active: true },
  });

  return npc;
}

export async function toggleRpChannel(channelId: string, active: boolean) {
  return db.rpChannel.update({
    where: { channelId },
    data: { active },
  });
}