// ═══════════════════════════════════════════════════════════════
//  Premium UI System for Ascension Bot
//  Beautiful embeds, consistent theming, interactive components
// ═══════════════════════════════════════════════════════════════

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type EmbedField,
  type InteractionReplyOptions,
} from "discord.js";
import { BOT_COLORS, EMBLEM } from "../constants";

// ─── Embed Builder ────────────────────────────────────────────

export class AscEmbed extends EmbedBuilder {
  constructor() {
    super();
    this.setColor(BOT_COLORS.primary);
    this.setTimestamp();
    this.setFooter({ text: "✦ Ascension ノミステリ RP ✦", iconURL: EMBLEM });
  }

  static profile() {
    return new AscEmbed()
      .setColor(BOT_COLORS.secondary)
      .setAuthor({ name: "⚜️ Fiche de Personnage", iconURL: EMBLEM });
  }

  static kingdom() {
    return new AscEmbed()
      .setColor(0x1E40AF)
      .setAuthor({ name: "🏰 Royaume", iconURL: EMBLEM });
  }

  static economy() {
    return new AscEmbed()
      .setColor(BOT_COLORS.success)
      .setAuthor({ name: "💰 Économie", iconURL: EMBLEM });
  }

  static quest() {
    return new AscEmbed()
      .setColor(0xD97706)
      .setAuthor({ name: "📜 Quête", iconURL: EMBLEM });
  }

  static error(title: string, desc: string) {
    return new AscEmbed()
      .setColor(BOT_COLORS.danger)
      .setAuthor({ name: "⚠️ Erreur", iconURL: EMBLEM })
      .setTitle(title)
      .setDescription(desc);
  }

  static success(title: string, desc: string) {
    return new AscEmbed()
      .setColor(BOT_COLORS.success)
      .setAuthor({ name: "✅ Succès", iconURL: EMBLEM })
      .setTitle(title)
      .setDescription(desc);
  }

  static info(title: string, desc: string) {
    return new AscEmbed()
      .setColor(BOT_COLORS.info)
      .setAuthor({ name: "ℹ️ Info", iconURL: EMBLEM })
      .setTitle(title)
      .setDescription(desc);
  }

  static welcome() {
    return new AscEmbed()
      .setColor(BOT_COLORS.primary)
      .setAuthor({ name: "✦ Ascension ノミステリ RP ✦", iconURL: EMBLEM })
      .setTitle("Bienvenue dans le monde d'Ascension")
      .setDescription(
        "Un univers de rôle-play narratif où 8 races côtoient 8 Arts de l'Énergie Potentielle. " +
        "Rejoins un royaume, gagne de l'or, complète des quêtes et forge ta légende.\n\n" +
        "▸ `/register` — Créer ton personnage\n" +
        "▸ `/profile` — Voir ta fiche\n" +
        "▸ `/kingdom` — Gérer ton royaume\n" +
        "▸ `/quest` — Obtenir une quête\n" +
        "▸ `/market` — Marché du joueur\n" +
        "▸ `/salary` — Toucher ta paie hebdomadaire"
      )
      .setThumbnail(EMBLEM)
      .setImage("https://i.imgur.com/ascension_banner.png");
  }
}

// ─── Stat field helper ────────────────────────────────────────

export function statField(name: string, value: string | number, inline = true): EmbedField {
  return { name, value: String(value), inline };
}

// ─── Separator field ──────────────────────────────────────────

export function separator(): EmbedField {
  return { name: "‎", value: "───────────────────────────", inline: false };
}

// ─── Action Row Builders ───────────────────────────────────────

export function primaryButton(customId: string, label: string, disabled = false) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(disabled);
}

export function successButton(customId: string, label: string, disabled = false) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle.Success)
    .setDisabled(disabled);
}

export function dangerButton(customId: string, label: string, disabled = false) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setDisabled(disabled);
}

export function linkButton(label: string, url: string) {
  return new ButtonBuilder()
    .setLabel(label)
    .setURL(url)
    .setStyle(ButtonStyle.Link);
}

export function paginationRow(baseId: string, current: number, total: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}:prev`)
      .setLabel("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(current <= 1),
    new ButtonBuilder()
      .setCustomId(`${baseId}:page`)
      .setLabel(`${current} / ${total}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`${baseId}:next`)
      .setLabel("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(current >= total),
  );
}

// ─── Select Menu Builder ──────────────────────────────────────

export function selectMenu(customId: string, placeholder: string, options: Array<{
  label: string;
  value: string;
  description?: string;
  emoji?: string;
}>) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder);

  for (const opt of options.slice(0, 25)) {
    menu.addOptions({
      label: opt.label,
      value: opt.value,
      description: opt.description,
      emoji: opt.emoji ? { name: opt.emoji } : undefined,
    });
  }

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

// ─── Modal Builder ─────────────────────────────────────────────

export function textModal(
  customId: string,
  title: string,
  fields: Array<{ id: string; label: string; style?: TextInputStyle; placeholder?: string; required?: boolean; value?: string }>,
) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);
  const rows = fields.map(
    (f) =>
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(f.id)
          .setLabel(f.label)
          .setStyle(f.style ?? TextInputStyle.Short)
          .setPlaceholder(f.placeholder ?? "")
          .setRequired(f.required ?? false)
          .setValue(f.value ?? ""),
      ),
  );
  // @ts-expect-error - Discord.js types issue with addComponents overload
  modal.addComponents(...rows);
  return modal;
}

// ─── Reply helper ─────────────────────────────────────────────

export function reply(ephemeral = false): InteractionReplyOptions {
  return { ephemeral, fetchReply: false };
}

// ─── Number formatting ────────────────────────────────────────

export function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function progressBar(current: number, max: number, length = 15): string {
  const pct = Math.min(current / max, 1);
  const filled = Math.round(pct * length);
  const empty = length - filled;
  return `█`.repeat(filled) + `░`.repeat(empty) + ` ${Math.round(pct * 100)}%`;
}