// ═══════════════════════════════════════════════════════════════
//  Ascension Bot — Enhanced Edition
//  The most magnificent Discord bot · Wiki-synced · AI-powered
// ═══════════════════════════════════════════════════════════════

import {
  Client, GatewayIntentBits, Partials, REST, Routes,
  SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, ModalBuilder,
  type ChatInputCommandInteraction, type ButtonInteraction,
  type StringSelectMenuInteraction,
} from "discord.js";
import { db } from "../lib/db";
import {
  SOCIAL_RANKS, KINGDOM_TIERS, RANK_LABELS, ITEM_RARITIES,
  RACES, EMBLEM, BOT_COLORS, aiChat, SALARY_COOLDOWN,
} from "./constants";
import { handleRpMessage, setupNpc, toggleRpChannel } from "./systems/npcWatcher";
import { claimSalary, listOnMarket, buyFromMarket, getKingdomStats } from "./systems/economy";

// ═══════════════════════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════════════════════

const fmt = (n: number) => n.toLocaleString("fr-FR");

function bar(cur: number, max: number, len = 12): string {
  const pct = Math.min(cur / max, 1);
  const f = Math.round(pct * len);
  return "█".repeat(f) + "░".repeat(len - f) + ` ${Math.round(pct * 100)}%`;
}

function sep(): { name: string; value: string; inline: boolean } {
  return { name: "\u200B", value: "━━━━━━━━━━━━━━━━━━━━━━━━", inline: false };
}

function section(title: string): { name: string; value: string; inline: boolean } {
  return { name: "\u200B", value: `╍╍╍╍ ${title} ╍╍╍╍`, inline: false };
}

function field(name: string, value: string, inline = true) {
  return { name, value, inline };
}

function salaryCountdown(lastAt: Date): string {
  const elapsed = Date.now() - lastAt.getTime();
  if (elapsed >= SALARY_COOLDOWN) return "✅ **Prêt à réclamer!**";
  const rem = SALARY_COOLDOWN - elapsed;
  const d = Math.floor(rem / 86400000);
  const h = Math.floor((rem % 86400000) / 3600000);
  return `⏳ dans **${d}j ${h}h**`;
}

function rankOf(level: number) {
  return SOCIAL_RANKS[Math.min(level, 7) - 1] || SOCIAL_RANKS[0];
}

function tierOf(tier: number) {
  return KINGDOM_TIERS[Math.min(tier, 5) - 1] || KINGDOM_TIERS[0];
}

const LINK_BTN = (label: string, url: string) =>
  new ButtonBuilder().setLabel(label).setURL(url).setStyle(ButtonStyle.Link);

const PRIMARY_BTN = (id: string, label: string) =>
  new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Primary);

const SUCCESS_BTN = (id: string, label: string) =>
  new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Success);

const DANGER_BTN = (id: string, label: string) =>
  new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Danger);

const SECONDARY_BTN = (id: string, label: string) =>
  new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Secondary);

function makeEmbed(color = BOT_COLORS.primary) {
  return new EmbedBuilder().setColor(color).setTimestamp()
    .setFooter({ text: "✦ Ascension ノミステリ RP ✦", iconURL: EMBLEM });
}

// ═══════════════════════════════════════════════════════════════
//  BOT INIT
// ═══════════════════════════════════════════════════════════════

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) { console.error("[BOT] DISCORD_TOKEN not set!"); process.exit(1); }

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel, Partials.Message],
});

// ═══════════════════════════════════════════════════════════════
//  SLASH COMMAND DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const RACE_CHOICES = RACES.map(r => ({ name: r, value: r }));

const commands = [
  new SlashCommandBuilder().setName("help").setDescription("Liste de toutes les commandes du bot"),
  new SlashCommandBuilder().setName("register")
    .setDescription("Créer ton personnage dans le monde d'Ascension")
    .addStringOption(o => o.setName("nom").setDescription("Nom de ton personnage").setRequired(true))
    .addStringOption(o => o.setName("race").setDescription("Ta race").setRequired(true).addChoices(...RACE_CHOICES)),
  new SlashCommandBuilder().setName("profile")
    .setDescription("Afficher ta fiche de personnage")
    .addUserOption(o => o.setName("joueur").setDescription("Voir le profil d'un autre joueur")),
  new SlashCommandBuilder().setName("inventory").setDescription("Voir ton inventaire"),
  new SlashCommandBuilder().setName("salary").setDescription("Toucher ta paie hebdomadaire selon ton rang social"),
  new SlashCommandBuilder().setName("rank").setDescription("Voir les rangs sociaux et leur salaire"),
  new SlashCommandBuilder().setName("kingdom")
    .setDescription("Système de royaumes")
    .addSubcommand(s => s.setName("info").setDescription("Infos sur ton royaume"))
    .addSubcommand(s => s.setName("join").setDescription("Rejoindre un royaume").addStringOption(o => o.setName("nom").setDescription("Nom du royaume").setRequired(true)))
    .addSubcommand(s => s.setName("leave").setDescription("Quitter ton royaume"))
    .addSubcommand(s => s.setName("list").setDescription("Lister tous les royaumes"))
    .addSubcommand(s => s.setName("create").setDescription("Créer un royaume (Admin)").addStringOption(o => o.setName("nom").setDescription("Nom").setRequired(true)).addStringOption(o => o.setName("description").setDescription("Description").setRequired(true)).addIntegerOption(o => o.setName("tier").setDescription("Niveau (1-5)").setMinValue(1).setMaxValue(5)))
    .addSubcommand(s => s.setName("tax").setDescription("Modifier la taxe (Souverain)").addNumberOption(o => o.setName("taux").setDescription("Taux (0.01-0.30)").setMinValue(0.01).setMaxValue(0.30).setRequired(true))),
  new SlashCommandBuilder().setName("market")
    .setDescription("Marché du joueur")
    .addSubcommand(s => s.setName("list").setDescription("Voir les offres"))
    .addSubcommand(s => s.setName("sell").setDescription("Mettre en vente").addStringOption(o => o.setName("nom").setDescription("Nom").setRequired(true)).addStringOption(o => o.setName("description").setDescription("Description").setRequired(true)).addStringOption(o => o.setName("type").setDescription("Type").setRequired(true).addChoices({ name: "Arme", value: "weapon" }, { name: "Armure", value: "armor" }, { name: "Potion", value: "potion" }, { name: "Matériau", value: "material" }, { name: "Parchemin", value: "technique_scroll" }, { name: "Autre", value: "misc" })).addIntegerOption(o => o.setName("prix").setDescription("Prix").setMinValue(1).setRequired(true)).addIntegerOption(o => o.setName("quantité").setDescription("Quantité").setMinValue(1).setMaxValue(999)))
    .addSubcommand(s => s.setName("buy").setDescription("Acheter").addStringOption(o => o.setName("id").setDescription("ID offre").setRequired(true)).addIntegerOption(o => o.setName("quantité").setDescription("Quantité").setMinValue(1).setMaxValue(999))),
  new SlashCommandBuilder().setName("stand")
    .setDescription("Gérer ton stand de marchand")
    .addSubcommand(s => s.setName("create").setDescription("Créer un stand").addStringOption(o => o.setName("nom").setDescription("Nom du stand").setRequired(true)).addStringOption(o => o.setName("description").setDescription("Description")))
    .addSubcommand(s => s.setName("add").setDescription("Ajouter un article").addStringOption(o => o.setName("nom").setDescription("Nom").setRequired(true)).addStringOption(o => o.setName("description").setDescription("Description").setRequired(true)).addStringOption(o => o.setName("type").setDescription("Type").setRequired(true).addChoices({ name: "Arme", value: "weapon" }, { name: "Armure", value: "armor" }, { name: "Potion", value: "potion" }, { name: "Matériau", value: "material" }, { name: "Autre", value: "misc" })).addIntegerOption(o => o.setName("prix").setDescription("Prix").setMinValue(1).setRequired(true)).addIntegerOption(o => o.setName("stock").setDescription("Stock (-1 = illimité)").setMinValue(-1)))
    .addSubcommand(s => s.setName("list").setDescription("Voir les stands de ton royaume"))
    .addSubcommand(s => s.setName("close").setDescription("Fermer ton stand")),
  new SlashCommandBuilder().setName("guild")
    .setDescription("Système de guildes")
    .addSubcommand(s => s.setName("create").setDescription("Créer une guilde").addStringOption(o => o.setName("nom").setDescription("Nom").setRequired(true)).addStringOption(o => o.setName("description").setDescription("Description").setRequired(true)))
    .addSubcommand(s => s.setName("info").setDescription("Infos sur ta guilde"))
    .addSubcommand(s => s.setName("invite").setDescription("Inviter un joueur").addUserOption(o => o.setName("joueur").setDescription("Joueur à inviter").setRequired(true)))
    .addSubcommand(s => s.setName("leave").setDescription("Quitter ta guilde"))
    .addSubcommand(s => s.setName("list").setDescription("Lister toutes les guildes")),
  new SlashCommandBuilder().setName("quest")
    .setDescription("Système de quêtes")
    .addSubcommand(s => s.setName("new").setDescription("Générer une quête IA"))
    .addSubcommand(s => s.setName("list").setDescription("Voir tes quêtes actives"))
    .addSubcommand(s => s.setName("complete").setDescription("Compléter").addStringOption(o => o.setName("id").setDescription("ID quête").setRequired(true)))
    .addSubcommand(s => s.setName("abandon").setDescription("Abandonner").addStringOption(o => o.setName("id").setDescription("ID quête").setRequired(true))),
  new SlashCommandBuilder().setName("npc")
    .setDescription("Gérer les NPCs (Admin)")
    .addSubcommand(s => s.setName("setup").setDescription("Installer un NPC").addStringOption(o => o.setName("nom").setDescription("Nom").setRequired(true)).addStringOption(o => o.setName("personnalité").setDescription("Personnalité").setRequired(true)).addStringOption(o => o.setName("contexte").setDescription("Contexte")))
    .addSubcommand(s => s.setName("toggle").setDescription("Activer/désactiver")),
  new SlashCommandBuilder().setName("wiki").setDescription("Lien vers le wiki Ascension"),
];

// ═══════════════════════════════════════════════════════════════
//  ENSURE PLAYER HELPER
// ═══════════════════════════════════════════════════════════════

async function ensurePlayer(discordId: string, username: string, avatarUrl?: string) {
  return db.botPlayer.upsert({
    where: { discordId },
    create: { discordId, userId: discordId, characterName: username },
    update: {},
  });
}

async function getPlayer(discordId: string) {
  return db.botPlayer.findUnique({
    where: { discordId },
    include: { kingdom: true, guild: true, user: { select: { image: true } } },
  });
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /help
// ═══════════════════════════════════════════════════════════════

const HELP_CATEGORIES: Record<string, { label: string; color: number; commands: string[][] }> = {
  personnage: { label: "👤 PERSONNAGE", color: 0x6B21A8, commands: [["/register", "Créer ton personnage dans le monde d'Ascension"], ["/profile", "Afficher ta fiche de personnage avec toutes tes stats"], ["/inventory", "Voir ton inventaire d'objets équipés et achetés"], ["/rank", "Voir les 7 rangs sociaux et leurs salaires"]] },
  royaume: { label: "🏰 ROYAUME & GUILDE", color: 0x1E40AF, commands: [["/kingdom join", "Rejoindre un royaume existant"], ["/kingdom leave", "Quitter ton royaume actuel"], ["/kingdom list", "Lister tous les royaumes du monde"], ["/kingdom info", "Voir les détails de ton royaume"], ["/guild create", "Fonder ta propre guilde"], ["/guild invite", "Inviter un joueur dans ta guilde"], ["/guild info", "Voir les infos de ta guilde"], ["/guild list", "Lister toutes les guildes"]] },
  economie: { label: "💰 ÉCONOMIE", color: 0x059669, commands: [["/salary", "Toucher ta paie hebdomadaire (cooldown 7j)"], ["/market list", "Parcourir les offres du marché"], ["/market sell", "Mettre un objet en vente"], ["/market buy", "Acheter un objet du marché"], ["/stand create", "Ouvrir ton stand de marchand"], ["/stand add", "Ajouter un article à ton stand"], ["/stand list", "Voir les stands de ton royaume"]] },
  quetes: { label: "📜 QUÊTES & RP", color: 0xD97706, commands: [["/quest new", "Générer une quête unique via l'IA"], ["/quest list", "Voir tes quêtes actives (max 5)"], ["/quest complete", "Compléter une quête et recevoir tes récompenses"], ["/quest abandon", "Abandonner une quête en cours"], ["/npc setup", "Installer un NPC dans un salon RP (Admin)"], ["/npc toggle", "Activer/désactiver un NPC"]] },
};

async function cmdHelp(interaction: ChatInputCommandInteraction) {
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("help:category")
      .setPlaceholder("Choisis une catégorie...")
      .addOptions(Object.entries(HELP_CATEGORIES).map(([key, cat]) => ({
        label: cat.label.replace(/[^\w\s]/g, "").trim(),
        value: key,
        emoji: cat.label.split(" ")[0],
        description: `${cat.commands.length} commandes`,
      }))),
  );

  const defaultEmbed = makeEmbed(BOT_COLORS.primary)
    .setAuthor({ name: "✦ Commandes Ascension", iconURL: EMBLEM })
    .setTitle("╔═══════════════════════════════════╗")
    .setDescription("**Bienvenue, aventurier.**\n\nSélectionne une catégorie ci-dessous pour découvrir toutes les commandes disponibles.\n\n> Chaque commande est conçue pour une immersion totale dans le monde d'Ascension.")
    .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 128 }))
    .addFields(
      field("🎮 Total", `${commands.length} commandes`, true),
      field("🌐 Wiki", "[ascension-wiki.fly.dev](https://ascension-wiki.fly.dev/)", true),
      field("💬 Discord", "[Rejoindre le serveur](https://discord.gg/svAvDbBx36)", true),
    )
    .setFooter({ text: "✦ Ascension ノミステリ RP ✦ — Utilise le menu ci-dessous", iconURL: EMBLEM });

  await interaction.reply({ embeds: [defaultEmbed], components: [row] });
}

function buildHelpEmbed(category: string) {
  const cat = HELP_CATEGORIES[category];
  if (!cat) return null;
  const embed = makeEmbed(cat.color)
    .setAuthor({ name: cat.label, iconURL: EMBLEM })
    .addFields(...cat.commands.map(([cmd, desc]) => field(`**${cmd}**`, `*${desc}*`, false)));
  return embed;
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /register — MULTI-EMBED WELCOME
// ═══════════════════════════════════════════════════════════════

async function cmdRegister(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString("nom")!;
  const race = interaction.options.getString("race")!;
  const discordId = interaction.user.id;

  const existing = await db.botPlayer.findUnique({ where: { discordId } });
  if (existing) {
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("⚠️ Déjà enregistré").setDescription(`Tu as déjà un personnage : **${existing.characterName}**.\nUtilise \`/profile\` pour voir ta fiche.`)], ephemeral: true });
  }

  const player = await db.botPlayer.create({
    data: { discordId, userId: discordId, characterName: name, race, socialRank: 2 },
  });

  // Sync with web User + Profile
  await db.user.upsert({
    where: { discordId },
    create: {
      discordId, username: interaction.user.username,
      name: interaction.user.globalName || interaction.user.username,
      image: interaction.user.displayAvatarURL({ size: 256 }),
      botPlayer: { create: { discordId, characterName: name, race, socialRank: 2 } },
      profile: { create: { characterName: name, race, ether: 1000 } },
    },
    update: {
      username: interaction.user.username,
      name: interaction.user.globalName || interaction.user.username,
      image: interaction.user.displayAvatarURL({ size: 256 }),
    },
  });

  const ri = rankOf(2);

  // Embed 1: Character created
  const embed1 = makeEmbed(BOT_COLORS.secondary)
    .setAuthor({ name: "⚜️ Personnage Créé", iconURL: EMBLEM })
    .setTitle(`✦ ${name}`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
    .setDescription("*Un nouveau destin s'écrit dans les annales d'Ascension...*")
    .addFields(
      section("IDENTITÉ"),
      field("🧬 Race", race),
      field("🏅 Rang Social", `${ri.icon} ${ri.name}`),
      sep(),
      section("RESSOURCES INITIALES"),
      field("💰 Or", fmt(player.gold)),
      field("⚡ Ether", fmt(player.ether)),
    );

  // Embed 2: Next steps
  const embed2 = makeEmbed(BOT_COLORS.info)
    .setAuthor({ name: "📍 Prochaines Étapes", iconURL: EMBLEM })
    .setTitle("Ton aventure commence ici")
    .setDescription("Voici les commandes essentielles pour débuter :")
    .addFields(
      field("**/kingdom join**", "*Rejoins un royaume pour accéder au marché et bénéficier de la protection.*", false),
      field("**/salary**", "*Réclame ta paie hebdomadaire de Roturier (100 💰).*", false),
      field("**/quest new**", "*Génère une quête unique via l'IA pour gagner de l'XP et de l'or.*", false),
      field("**/profile**", "*Consulte ta fiche de personnage à tout moment.*", false),
      sep(),
      field("💡 Conseil", "*Rejoins un royaume rapidement — tes salaires y seront taxés mais tu auras accès au marché et aux stands marchands.*", false),
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    LINK_BTN("🌐 Voir sur le Wiki", "https://ascension-wiki.fly.dev/"),
    LINK_BTN("💬 Serveur Discord", "https://discord.gg/svAvDbBx36"),
  );

  await interaction.reply({ embeds: [embed1, embed2], components: [row] });
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /profile — STUNNING EMBED
// ═══════════════════════════════════════════════════════════════

async function cmdProfile(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("joueur") || interaction.user;
  const p = await getPlayer(target.id);

  if (!p) {
    const isSelf = target.id === interaction.user.id;
    return interaction.reply({
      embeds: [makeEmbed(BOT_COLORS.info).setTitle(isSelf ? "Non enregistré" : "Introuvable")
        .setDescription(isSelf ? "Utilise `/register` pour créer ton personnage." : "Ce joueur n'a pas de personnage.")],
      ephemeral: true,
    });
  }

  const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
  const displayName = member?.displayName || target.username;
  const ri = rankOf(p.socialRank);
  const salaryCd = salaryCountdown(p.lastSalaryAt);
  const kingdomName = p.kingdom?.name || "Aucun";
  const guildName = p.guild?.name || "Aucune";

  const embed = makeEmbed(BOT_COLORS.secondary)
    .setAuthor({ name: "⚜️ FICHE DE PERSONNAGE", iconURL: EMBLEM })
    .setTitle(`╔════════════════════════════╗`)
    .setThumbnail(target.displayAvatarURL({ size: 128 }))
    .setDescription(`**${displayName}**${member?.nickname ? ` aka *${member.nickname}*` : ""}`)
    .addFields(
      section("IDENTITÉ"),
      field("🧬 Race", p.race),
      field("🏅 Rang Social", `${ri.icon} ${ri.name}`),
      sep(),
      section("ÉCONOMIE"),
      field("💰 Or", fmt(p.gold)),
      field("⚡ Ether", fmt(p.ether)),
      sep(),
      section("APPARTENANCE"),
      field("🏰 Royaume", kingdomName),
      field("⚔️ Guilde", guildName),
      sep(),
      section("SALAIRE"),
      field("💸 Montant", `${fmt(ri.salary)} 💰 / semaine`),
      field("⏳ Prochain", salaryCd),
    )
    .setFooter({ text: "✦ Ascension ノミステリ RP ✦ — Synchronisé avec le Wiki", iconURL: EMBLEM });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    LINK_BTN("🌐 Wiki Profile", "https://ascension-wiki.fly.dev/"),
    SECONDARY_BTN(`profile:refresh:${target.id}`, "🔄 Refresh"),
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /inventory
// ═══════════════════════════════════════════════════════════════

async function cmdInventory(interaction: ChatInputCommandInteraction) {
  const user = await db.user.findUnique({
    where: { discordId: interaction.user.id },
  });

  if (!user) {
    return interaction.reply({
      embeds: [makeEmbed(BOT_COLORS.info).setTitle("🎒 Inventaire Vide")
        .setDescription("Tu ne possèdes aucun objet pour le moment.\nVisite la **boutique** sur le [Wiki](https://ascension-wiki.fly.dev/) pour acquérir des équipements!")],
      ephemeral: true,
    });
  }

  // Inventory is on User, not Profile
  const inventoryItems = await db.inventoryItem.findMany({
    where: { userId: user.id },
    include: { item: true },
    orderBy: { purchasedAt: "desc" },
  });

  if (inventoryItems.length === 0) {
    return interaction.reply({
      embeds: [makeEmbed(BOT_COLORS.info).setTitle("🎒 Inventaire Vide")
        .setDescription("Tu ne possèdes aucun objet pour le moment.\nVisite la **boutique** sur le [Wiki](https://ascension-wiki.fly.dev/) pour acquérir des équipements!")],
      ephemeral: true,
    });
  }

  const items = inventoryItems;
  const embed = makeEmbed(BOT_COLORS.primary)
    .setAuthor({ name: "🎒 Inventaire", iconURL: EMBLEM })
    .setTitle(`${interaction.user.username} — ${items.length} objet${items.length > 1 ? "s" : ""}`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))
    .addFields(
      ...items.map((inv, i) => {
        const rarity = ITEM_RARITIES[inv.item.rarity as keyof typeof ITEM_RARITIES];
        const equipped = inv.equipped ? " ✅" : "";
        return field(
          `${i + 1}. ${inv.item.name}${equipped}`,
          `${rarity?.emoji || "⚪"} ${rarity?.label || inv.item.rarity} — ${inv.item.type}${inv.slot ? ` [${inv.slot}]` : ""}`,
          false,
        );
      }),
    );

  await interaction.reply({ embeds: [embed] });
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /salary
// ═══════════════════════════════════════════════════════════════

async function cmdSalary(interaction: ChatInputCommandInteraction) {
  const result = await claimSalary(interaction.user.id);
  if (!result.ok) {
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("💸 Salaire Indisponible").setDescription(result.error!)], ephemeral: true });
  }
  const ri = rankOf((await getPlayer(interaction.user.id))?.socialRank || 1);
  const embed = makeEmbed(BOT_COLORS.success)
    .setAuthor({ name: "💸 Paie Hebdomadaire", iconURL: EMBLEM })
    .setTitle(`✦ ${ri.icon} ${result.rankName}`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))
    .setDescription("Ta paie a été versée sur ton compte.")
    .addFields(
      sep(),
      field("💰 +Or", fmt(result.salary)),
      field("⚡ +Ether", fmt(result.ether)),
      sep(),
      field("⏳ Prochain salaire", "dans 7 jours"),
    );
  await interaction.reply({ embeds: [embed] });
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /rank
// ═══════════════════════════════════════════════════════════════

async function cmdRank(interaction: ChatInputCommandInteraction) {
  const embed = makeEmbed(BOT_COLORS.primary)
    .setAuthor({ name: "🏅 Rangs Sociaux", iconURL: EMBLEM })
    .setTitle("╔════════════════════════════════╗")
    .setDescription("*Chaque rang offre un salaire hebdomadaire différent.*\n*Cooldown : 7 jours entre chaque réclamation.*")
    .addFields(
      ...SOCIAL_RANKS.map(r => field(`${r.icon} ${r.name} (Rang ${r.level})`, r.salary > 0 ? `${fmt(r.salary)} 💰 /semaine` : "Sans revenus")),
      sep(),
      field("💡 Conseil", "*Accomplis des quêtes pour monter en rang social!*", false),
    );
  await interaction.reply({ embeds: [embed] });
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /kingdom
// ═══════════════════════════════════════════════════════════════

async function cmdKingdom(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "list") {
    const kingdoms = await db.kingdom.findMany({ include: { _count: { select: { citizens: true, marketListings: true } }, continent: { select: { name: true } } }, orderBy: { tier: "desc" } });
    if (!kingdoms.length) return interaction.reply({ embeds: [makeEmbed().setTitle("📜 Aucun Royaume").setDescription("Aucun royaume n'a été fondé pour le moment.")] });

    const embed = makeEmbed(0x1E40AF)
      .setAuthor({ name: "🏰 Royaumes du Monde", iconURL: EMBLEM })
      .setTitle("╔══════════════════════════════════╗")
      .addFields(
        ...kingdoms.map(k => {
          const t = tierOf(k.tier);
          const popPct = Math.min((k._count.citizens / t.maxPop) * 100, 100);
          return field(
            `${k.name} [T${k.tier}]`,
            `${t.name} — 👥 ${k._count.citizens}/${t.maxPop}\n${bar(k._count.citizens, t.maxPop, 8)} — 💰 ${fmt(k.treasury)} — 🏪 ${k._count.marketListings} offres`,
            false,
          );
        }),
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "info") {
    const p = await getPlayer(interaction.user.id);
    if (!p?.kingdomId) return interaction.reply({ embeds: [makeEmbed().setTitle("Sans Royaume").setDescription("Tu n'appartiens à aucun royaume.\nUtilise `/kingdom list` puis `/kingdom join`.")], ephemeral: true });
    const stats = await getKingdomStats(p.kingdomId);
    if (!stats) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Royaume introuvable.")], ephemeral: true });
    const t = tierOf(stats.tier);

    const embed = makeEmbed(0x1E40AF)
      .setAuthor({ name: "🏰 Détails du Royaume", iconURL: EMBLEM })
      .setTitle(`✦ ${stats.name}`)
      .setDescription(stats.description)
      .addFields(
        section("GÉNÉRAL"),
        field("🏰 Tier", `${t.name} (Niv. ${stats.tier})`),
        field("👥 Population", `${stats.citizenCount} / ${stats.maxPop}`),
        field("📈 Taxe", `${(stats.taxRate * 100).toFixed(1)}%`),
        sep(),
        section("ÉCONOMIE"),
        field("💰 Trésor", fmt(stats.treasury)),
        field("🏪 Offres marché", String(stats.listingsCount)),
        field("🎪 Stands marchands", String(stats.standsCount)),
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "join") {
    const name = interaction.options.getString("nom")!;
    const kingdom = await db.kingdom.findFirst({ where: { name: { contains: name } } });
    if (!kingdom) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Introuvable").setDescription(`Aucun royaume correspondant à "**${name}**".\nUtilise \`/kingdom list\` pour voir les royaumes disponibles.`)], ephemeral: true });

    await ensurePlayer(interaction.user.id, interaction.user.username);
    await db.botPlayer.update({ where: { discordId: interaction.user.id }, data: { kingdomId: kingdom.id } });
    await db.kingdom.update({ where: { id: kingdom.id }, data: { population: { increment: 1 } } });

    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle(`🏰 Bienvenue à ${kingdom.name}!`)
      .setDescription(`Tu es maintenant citoyen de **${kingdom.name}**.\n\nTa paie sera taxée à **${(kingdom.taxRate * 100).toFixed(1)}%** par le royaume.`)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))] });
  }

  if (sub === "leave") {
    const p = await getPlayer(interaction.user.id);
    if (!p?.kingdomId) return interaction.reply({ embeds: [makeEmbed().setTitle("Sans Royaume").setDescription("Tu n'es dans aucun royaume.")], ephemeral: true });
    const kName = p.kingdom?.name || "Ton royaume";
    await db.botPlayer.update({ where: { discordId: interaction.user.id }, data: { kingdomId: null } });
    await db.kingdom.update({ where: { id: p.kingdomId }, data: { population: { decrement: 1 } } });
    return interaction.reply({ embeds: [makeEmbed().setTitle("Départ").setDescription(`Tu as quitté **${kName}**.`)] });
  }

  if (sub === "create") {
    const name = interaction.options.getString("nom")!;
    const desc = interaction.options.getString("description")!;
    const tier = interaction.options.getInteger("tier") || 1;
    let continent = await db.continent.findFirst();
    if (!continent) continent = await db.continent.create({ data: { name: "Aethoria", description: "Le continent principal" } });
    const kingdom = await db.kingdom.create({
      data: { continentId: continent.id, name, description: desc, tier, taxRate: tierOf(tier).taxRange[0] },
    });
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("🏰 Royaume Fondé!")
      .setDescription(`**${kingdom.name}** [Tier ${tier}] a été créé.\n\nTaxe par défaut : **${(kingdom.taxRate * 100).toFixed(1)}%**`)] });
  }

  if (sub === "tax") {
    const rate = interaction.options.getNumber("taux")!;
    const p = await getPlayer(interaction.user.id);
    if (!p?.kingdomId) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Tu n'as pas de royaume.")], ephemeral: true });
    await db.kingdom.update({ where: { id: p.kingdomId }, data: { taxRate: rate } });
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("📊 Taxe Modifiée").setDescription(`La taxe de **${p.kingdom.name}** est maintenant à **${(rate * 100).toFixed(1)}%**.`)] });
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /market
// ═══════════════════════════════════════════════════════════════

async function cmdMarket(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "list") {
    const listings = await db.marketListing.findMany({ where: { active: true }, include: { seller: true, kingdom: true }, take: 10, orderBy: { createdAt: "desc" } });
    if (!listings.length) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("🏪 Marché").setDescription("Aucune offre en cours. Sois le premier à vendre avec `/market sell`!")] });
    const embed = makeEmbed(BOT_COLORS.success)
      .setAuthor({ name: "🏪 Marché — Dernières Offres", iconURL: EMBLEM })
      .addFields(
        ...listings.map((l, i) => {
          const rarity = ITEM_RARITIES[l.itemType as keyof typeof ITEM_RARITIES];
          return field(
            `${i + 1}. ${l.itemName}`,
            `par ${l.seller.characterName || "Anonyme"} — **${fmt(l.price)} 💰** ×${l.quantity} — *${l.itemType}*${l.kingdom ? ` — 🏰 ${l.kingdom.name}` : ""}`,
            false,
          );
        }),
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "sell") {
    const itemName = interaction.options.getString("nom")!;
    const desc = interaction.options.getString("description")!;
    const itemType = interaction.options.getString("type")!;
    const price = interaction.options.getInteger("prix")!;
    const qty = interaction.options.getInteger("quantité") || 1;
    const p = await ensurePlayer(interaction.user.id, interaction.user.username);
    if (!p.kingdomId) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Tu dois rejoindre un royaume pour vendre.\nUtilise `/kingdom join` d'abord.")], ephemeral: true });
    const result = await listOnMarket(interaction.user.id, itemName, desc, itemType, price, qty, p.kingdomId);
    if (!result.ok) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription(result.error!)], ephemeral: true });
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("📦 Objet mis en vente!")
      .setDescription(`**${itemName}** — ${fmt(price)} 💰 ×${qty}\n\`ID: ${result.listingId.slice(0, 8)}\``)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))] });
  }

  if (sub === "buy") {
    const listingId = interaction.options.getString("id")!;
    const qty = interaction.options.getInteger("quantité") || 1;
    const result = await buyFromMarket(interaction.user.id, listingId, qty);
    if (!result.ok) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Achat Échoué").setDescription(result.error!)], ephemeral: true });
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("✅ Achat Réussi!")
      .setDescription(`**${result.itemName}** ×${result.qty} pour **${fmt(result.totalCost)} 💰**\n*(Taxe royaume : ${fmt(result.tax)} 💰)*`)] });
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /stand
// ═══════════════════════════════════════════════════════════════

async function cmdStand(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const discordId = interaction.user.id;

  if (sub === "create") {
    const name = interaction.options.getString("nom")!;
    const desc = interaction.options.getString("description") || "";
    const p = await getPlayer(discordId);
    if (!p?.kingdomId) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Tu dois être dans un royaume pour ouvrir un stand.")] , ephemeral: true });

    const existing = await db.merchantStand.findFirst({ where: { ownerId: p.id, active: true } });
    if (existing) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Stand Existant").setDescription(`Tu as déjà un stand actif : **${existing.name}**.\nFerme-le d'abord avec \`/stand close\`.`)], ephemeral: true });

    await db.merchantStand.create({ data: { ownerId: p.id, kingdomId: p.kingdomId, name, description: desc } });
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("🎪 Stand Ouvert!")
      .setDescription(`**${name}** est maintenant ouvert dans ton royaume!\nUtilise \`/stand add\` pour y ajouter des articles.`)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))] });
  }

  if (sub === "add") {
    const itemName = interaction.options.getString("nom")!;
    const desc = interaction.options.getString("description")!;
    const itemType = interaction.options.getString("type")!;
    const price = interaction.options.getInteger("prix")!;
    const stock = interaction.options.getInteger("stock") ?? -1;

    const stand = await db.merchantStand.findFirst({ where: { ownerId: { equals: (await getPlayer(discordId))?.id }, active: true } });
    if (!stand) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Pas de Stand").setDescription("Tu n'as pas de stand actif. Utilise `/stand create` d'abord.")], ephemeral: true });

    await db.standItem.create({ data: { standId: stand.id, itemName, description: desc, itemType, price, stock } });
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("📦 Article Ajouté!")
      .setDescription(`**${itemName}** — ${fmt(price)} 💰${stock >= 0 ? ` — Stock: ${stock}` : " — Stock: illimité"}`)] });
  }

  if (sub === "list") {
    const p = await getPlayer(discordId);
    if (!p?.kingdomId) return interaction.reply({ embeds: [makeEmbed().setTitle("Sans Royaume").setDescription("Tu dois être dans un royaume.")], ephemeral: true });

    const stands = await db.merchantStand.findMany({
      where: { kingdomId: p.kingdomId, active: true },
      include: { owner: true, items: true },
      orderBy: { createdAt: "desc" },
    });

    if (!stands.length) return interaction.reply({ embeds: [makeEmbed().setTitle("🎪 Aucun Stand").setDescription("Aucun stand de marchand dans ce royaume.")] });

    const embed = makeEmbed(BOT_COLORS.success)
      .setAuthor({ name: "🎪 Stands Marchands", iconURL: EMBLEM })
      .addFields(
        ...stands.map(s => {
          const itemList = s.items.map(it => `• **${it.itemName}** — ${fmt(it.price)} 💰${it.stock >= 0 ? ` (${it.stock} restants)` : ""}`).join("\n") || "*Aucun article*";
          return field(`🏪 ${s.name} — par ${s.owner.characterName || "Anonyme"}`, itemList, false);
        }),
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "close") {
    const p = await getPlayer(discordId);
    if (!p) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Personnage introuvable.")], ephemeral: true });
    const stand = await db.merchantStand.findFirst({ where: { ownerId: p.id, active: true } });
    if (!stand) return interaction.reply({ embeds: [makeEmbed().setTitle("Pas de Stand").setDescription("Tu n'as pas de stand actif.")], ephemeral: true });
    await db.merchantStand.update({ where: { id: stand.id }, data: { active: false } });
    return interaction.reply({ embeds: [makeEmbed().setTitle("Stand Fermé").setDescription(`**${stand.name}** a été fermé.`)] });
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /guild
// ═══════════════════════════════════════════════════════════════

async function cmdGuild(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const discordId = interaction.user.id;

  if (sub === "create") {
    const name = interaction.options.getString("nom")!;
    const desc = interaction.options.getString("description")!;
    const p = await getPlayer(discordId);
    if (!p) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Personnage introuvable.")] , ephemeral: true });
    if (p.guildId) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Déjà en Guilde").setDescription("Tu es déjà dans une guilde. Quitte-la d'abord avec `/guild leave`.")], ephemeral: true });

    let continent = await db.continent.findFirst();
    if (!continent) continent = await db.continent.create({ data: { name: "Aethoria", description: "Le continent principal" } });

    const guild = await db.guild.create({
      data: { continentId: continent.id, name, description, leaderId: p.id },
    });

    await db.botPlayer.update({ where: { id: p.id }, data: { guildId: guild.id } });

    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.secondary).setTitle("⚔️ Guilde Fondée!")
      .setDescription(`**${name}** a été créée!\nTu en es le **leader**.\nInvite des membres avec \`/guild invite\`.`)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))] });
  }

  if (sub === "info") {
    const p = await getPlayer(discordId);
    if (!p?.guildId) return interaction.reply({ embeds: [makeEmbed().setTitle("Sans Guilde").setDescription("Tu n'es dans aucune guilde.")] , ephemeral: true });
    const guild = await db.guild.findUnique({ where: { id: p.guildId }, include: { members: true, continent: { select: { name: true } } } });
    if (!guild) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Guilde introuvable.")] , ephemeral: true });

    const isLeader = guild.leaderId === p.id;
    const embed = makeEmbed(BOT_COLORS.secondary)
      .setAuthor({ name: "⚔️ Infos Guilde", iconURL: EMBLEM })
      .setTitle(`✦ ${guild.name}`)
      .setDescription(guild.description)
      .addFields(
        field("👑 Leader", isLeader ? "**Toi**" : "Un autre membre"),
        field("👥 Membres", `${guild.members.length} / ${guild.maxMembers}`),
        field("🗺️ Continent", guild.continent.name),
        sep(),
        ...guild.members.slice(0, 10).map((m, i) => field(`${m.guildId === p.id ? "👑" : `${i + 1}.`} ${m.characterName || "Inconnu"}`, `${m.race}`)),
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "invite") {
    const target = interaction.options.getUser("joueur")!;
    const p = await getPlayer(discordId);
    if (!p?.guildId) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Tu n'es dans aucune guilde.")] , ephemeral: true });

    const targetPlayer = await getPlayer(target.id);
    if (!targetPlayer) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Ce joueur n'a pas de personnage.")] , ephemeral: true });
    if (targetPlayer.guildId) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Déjà en Guilde").setDescription(`${target.username} est déjà dans une guilde.`)] , ephemeral: true });

    await db.botPlayer.update({ where: { discordId: target.id }, data: { guildId: p.guildId } });
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("✅ Invitation Envoyée!")
      .setDescription(`**${target.username}** a rejoint ta guilde!`)] });
  }

  if (sub === "leave") {
    const p = await getPlayer(discordId);
    if (!p?.guildId) return interaction.reply({ embeds: [makeEmbed().setTitle("Sans Guilde").setDescription("Tu n'es dans aucune guilde.")] , ephemeral: true });
    const guild = await db.guild.findUnique({ where: { id: p.guildId } });
    await db.botPlayer.update({ where: { discordId }, data: { guildId: null } });
    return interaction.reply({ embeds: [makeEmbed().setTitle("Départ").setDescription(`Tu as quitté **${guild?.name || "la guilde"}**.`)] });
  }

  if (sub === "list") {
    const guilds = await db.guild.findMany({ include: { _count: { select: { members: true } }, continent: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
    if (!guilds.length) return interaction.reply({ embeds: [makeEmbed().setTitle("⚔️ Aucune Guilde").setDescription("Aucune guilde n'a été fondée.")] });

    const embed = makeEmbed(BOT_COLORS.secondary)
      .setAuthor({ name: "⚔️ Guildes", iconURL: EMBLEM })
      .addFields(
        ...guilds.map(g => field(`🏛️ ${g.name}`, `${g._count.members} membre${g._count.members > 1 ? "s" : ""} — ${g.continent.name}\n*${g.description.slice(0, 80)}${g.description.length > 80 ? "..." : ""}*`, false)),
      );
    return interaction.reply({ embeds: [embed] });
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /quest
// ═══════════════════════════════════════════════════════════════

async function cmdQuest(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "new") {
    await ensurePlayer(interaction.user.id, interaction.user.username);
    const player = await getPlayer(interaction.user.id);
    if (!player) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Personnage introuvable.")] , ephemeral: true });

    const activeCount = await db.playerQuest.count({ where: { playerId: player.id, status: "active" } });
    if (activeCount >= 5) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Limite Atteinte").setDescription("Tu as déjà **5 quêtes actives**.\nComplètes-en une avec `/quest complete` d'abord!")] , ephemeral: true });

    await interaction.deferReply();

    const QUEST_PROMPT = `Tu es un maître de quête dans "Ascension", un monde fantasy avec 8 races et 8 Arts de l'Énergie Potentielle.
Génère une quête unique et immersive pour un joueur de niveau ${player.level}, race ${player.race}.

Réponds UNIQUEMENT en JSON valide :
{"title":"Titre","description":"Description narrative (3-4 phrases)","objectives":["Obj 1","Obj 2","Obj 3"],"rewards":{"gold":500,"ether":200,"exp":300},"difficulty":"C","category":"exploration"}
Difficultés: E,D,C,B,A,S. Catégories: exploration,combat,social,crafting,mystery.`;

    try {
      const raw = await aiChat(QUEST_PROMPT, `Quête pour ${player.characterName}, ${player.race} niv.${player.level}.`, { temperature: 1.0, maxTokens: 1024, json: true });
      const data = JSON.parse(raw) as { title: string; description: string; objectives: string[]; rewards: { gold: number; ether: number; exp: number }; difficulty: string; category: string };

      const quest = await db.quest.create({
        data: { title: data.title, description: data.description, objectives: JSON.stringify(data.objectives), rewards: JSON.stringify(data.rewards), difficulty: data.difficulty || "C", category: data.category || "exploration", minLevel: 1 },
      });
      await db.playerQuest.create({ data: { playerId: player.id, questId: quest.id, status: "active" } });

      const diffColor: Record<string, number> = { E: 0x9CA3AF, D: 0x60A5FA, C: 0x34D399, B: 0xFBBF24, A: 0xF97316, S: 0xEF4444 };
      const embed = makeEmbed(diffColor[data.difficulty] || BOT_COLORS.primary)
        .setAuthor({ name: "📜 Nouvelle Quête", iconURL: EMBLEM })
        .setTitle(`✦ ${data.title}`)
        .setDescription(data.description)
        .addFields(
          field("🏆 Difficulté", data.difficulty),
          field("📂 Catégorie", data.category),
          field("🆔 ID", `\`${quest.id.slice(0, 8)}\``),
          sep(),
          section("OBJECTIFS"),
          ...data.objectives.map((o, i) => field(`${i + 1}.`, o, false)),
          sep(),
          section("RÉCOMPENSES"),
          field("💰 Or", fmt(data.rewards.gold)),
          field("⚡ Ether", fmt(data.rewards.ether)),
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("[Quest] Error:", err);
      await interaction.editReply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur IA").setDescription("Impossible de générer une quête. Réessaie.")] , components: [] });
    }
    return;
  }

  if (sub === "list") {
    const player = await getPlayer(interaction.user.id);
    if (!player) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Personnage introuvable.")] , ephemeral: true });
    const pqs = await db.playerQuest.findMany({ where: { playerId: player.id, status: "active" }, include: { quest: true }, orderBy: { startedAt: "desc" } });
    if (!pqs.length) return interaction.reply({ embeds: [makeEmbed(0xD97706).setTitle("📜 Quêtes Actives (0/5)").setDescription("Aucune quête en cours.\nUtilise `/quest new` pour en générer une!")] , ephemeral: true });

    const embed = makeEmbed(0xD97706)
      .setAuthor({ name: "📜 Quêtes Actives", iconURL: EMBLEM })
      .setTitle(`${pqs.length}/5 Quêtes`)
      .addFields(
        ...pqs.map(pq => field(`${pq.quest.difficulty} — ${pq.quest.title}`, `${pq.quest.description.slice(0, 100)}...\n\`ID: ${pq.questId.slice(0, 8)}\``, false)),
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (sub === "complete") {
    const qId = interaction.options.getString("id")!;
    const player = await getPlayer(interaction.user.id);
    if (!player) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Personnage introuvable.")] , ephemeral: true });
    const pq = await db.playerQuest.findFirst({ where: { playerId: player.id, questId: { contains: qId }, status: "active" }, include: { quest: true } });
    if (!pq) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Introuvable").setDescription("Quête non trouvée ou déjà complétée.")] , ephemeral: true });
    const rewards = JSON.parse(pq.quest.rewards) as { gold: number; ether: number; exp: number };
    await db.$transaction([
      db.playerQuest.update({ where: { id: pq.id }, data: { status: "completed", completedAt: new Date() } }),
      db.botPlayer.update({ where: { id: player.id }, data: { gold: { increment: rewards.gold || 0 }, ether: { increment: rewards.ether || 0 }, experience: { increment: rewards.exp || 0 } } }),
    ]);
    const embed = makeEmbed(BOT_COLORS.success).setTitle("✅ Quête Complétée!")
      .setDescription(`**${pq.quest.title}**`)
      .addFields(field("💰 +Or", fmt(rewards.gold || 0)), field("⚡ +Ether", fmt(rewards.ether || 0)));
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (sub === "abandon") {
    const qId = interaction.options.getString("id")!;
    const player = await getPlayer(interaction.user.id);
    if (!player) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Personnage introuvable.")] , ephemeral: true });
    const pq = await db.playerQuest.findFirst({ where: { playerId: player.id, questId: { contains: qId }, status: "active" } });
    if (!pq) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Introuvable").setDescription("Quête non trouvée.")] , ephemeral: true });
    await db.playerQuest.update({ where: { id: pq.id }, data: { status: "abandoned" } });
    await interaction.reply({ embeds: [makeEmbed().setTitle("Quête Abandonnée").setDescription("La quête a été abandonnée.")] , ephemeral: true });
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /npc
// ═══════════════════════════════════════════════════════════════

async function cmdNpc(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Permissions").setDescription("Cette commande nécessite les permissions d'administrateur.")] , ephemeral: true });
  }
  const sub = interaction.options.getSubcommand();
  if (sub === "setup") {
    const name = interaction.options.getString("nom")!;
    const personality = interaction.options.getString("personnalité")!;
    const context = interaction.options.getString("contexte") || "";
    await setupNpc(interaction.channelId, interaction.guildId!, name, personality, context);
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("NPC Installé").setDescription(`**${name}** veille ce salon et répondra aux messages des joueurs.`)] });
  }
  if (sub === "toggle") {
    const rp = await db.rpChannel.findUnique({ where: { channelId: interaction.channelId } });
    if (!rp) return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription("Aucun NPC dans ce salon.")] , ephemeral: true });
    await toggleRpChannel(interaction.channelId, !rp.active);
    return interaction.reply({ embeds: [makeEmbed(BOT_COLORS.success).setTitle("NPC " + (rp.active ? "Désactivé" : "Activé")).setDescription(`Le NPC est maintenant **${!rp.active ? "actif" : "inactif"}**.`)] });
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND: /wiki
// ═══════════════════════════════════════════════════════════════

async function cmdWiki(interaction: ChatInputCommandInteraction) {
  const embed = makeEmbed(BOT_COLORS.info)
    .setAuthor({ name: "🌐 Ascension Wiki", iconURL: EMBLEM })
    .setTitle("L'encyclopédie complète du monde d'Ascension")
    .setDescription("Cosmologie, races, arts, techniques, bestiaire, factions — tout l'univers documenté.")
    .addFields(
      field("🔗 Lien", "[ascension-wiki.fly.dev](https://ascension-wiki.fly.dev/)"),
      field("📋 Bot Dashboard", "[Voir les stats](https://ascension-wiki.fly.dev/)"),
    );
  await interaction.reply({
    embeds: [embed],
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
      LINK_BTN("🌐 Ouvrir le Wiki", "https://ascension-wiki.fly.dev/"),
      LINK_BTN("🤖 Bot Dashboard", "https://ascension-wiki.fly.dev/"),
    )],
  });
}

// ═══════════════════════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════════════════════

client.once("ready", async () => {
  console.log(`[BOT] Logged in as ${client.user?.tag}`);
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    console.log(`[BOT] Registering ${commands.length} slash commands...`);
    await rest.put(Routes.applicationCommands(client.user!.id), { body: commands.map(c => c.toJSON()) });
    console.log("[BOT] ✅ Slash commands registered!");
  } catch (err) {
    console.error("[BOT] ❌ Failed to register commands:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  // ─── Chat Input Commands ──────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    try {
      switch (commandName) {
        case "help": await cmdHelp(interaction); break;
        case "register": await cmdRegister(interaction); break;
        case "profile": await cmdProfile(interaction); break;
        case "inventory": await cmdInventory(interaction); break;
        case "salary": await cmdSalary(interaction); break;
        case "rank": await cmdRank(interaction); break;
        case "kingdom": await cmdKingdom(interaction); break;
        case "market": await cmdMarket(interaction); break;
        case "stand": await cmdStand(interaction); break;
        case "guild": await cmdGuild(interaction); break;
        case "quest": await cmdQuest(interaction); break;
        case "npc": await cmdNpc(interaction); break;
        case "wiki": await cmdWiki(interaction); break;
      }
    } catch (err) {
      console.error(`[BOT] Command ${commandName} error:`, err);
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription(msg)], ephemeral: true }).catch(() => {});
      } else {
        await interaction.followUp({ embeds: [makeEmbed(BOT_COLORS.danger).setTitle("Erreur").setDescription(msg)], ephemeral: true }).catch(() => {});
      }
    }
    return;
  }

  // ─── Select Menu (Help categories) ────────────────────────
  if (interaction.isStringSelectMenu() && interaction.customId === "help:category") {
    const cat = interaction.values[0];
    const embed = buildHelpEmbed(cat);
    if (!embed) return interaction.reply({ content: "Catégorie inconnue.", ephemeral: true });
    await interaction.update({ embeds: [embed] });
    return;
  }

  // ─── Button Interactions ──────────────────────────────────
  if (interaction.isButton()) {
    const { customId } = interaction;
    try {
      // Profile refresh
      if (customId.startsWith("profile:refresh:")) {
        const targetId = customId.replace("profile:refresh:", "");
        const target = await interaction.client.users.fetch(targetId).catch(() => null);
        if (!target) return interaction.reply({ content: "Utilisateur introuvable.", ephemeral: true });

        const p = await getPlayer(targetId);
        if (!p) return interaction.reply({ content: "Personnage introuvable.", ephemeral: true });

        const ri = rankOf(p.socialRank);
        const salaryCd = salaryCountdown(p.lastSalaryAt);

        const embed = makeEmbed(BOT_COLORS.secondary)
          .setAuthor({ name: "⚜️ FICHE DE PERSONNAGE", iconURL: EMBLEM })
          .setTitle(`╔══════════════════════════════╗`)
          .setThumbnail(target.displayAvatarURL({ size: 128 }))
          .setDescription(`**${p.characterName || target.username}**`)
          .addFields(
            section("IDENTITÉ"),
            field("🧬 Race", p.race),
            field("🏅 Rang Social", `${ri.icon} ${ri.name}`),
            sep(),
            section("ÉCONOMIE"),
            field("💰 Or", fmt(p.gold)),
            field("⚡ Ether", fmt(p.ether)),
            sep(),
            section("APPARTENANCE"),
            field("🏰 Royaume", p.kingdom?.name || "Aucun"),
            field("⚔️ Guilde", p.guild?.name || "Aucune"),
            sep(),
            section("SALAIRE"),
            field("💸 Montant", `${fmt(ri.salary)} 💰 / semaine`),
            field("⏳ Prochain", salaryCd),
          )
          .setFooter({ text: "✦ Ascension ノミステリ RP ✦ — Mis à jour", iconURL: EMBLEM });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          LINK_BTN("🌐 Wiki", "https://ascension-wiki.fly.dev/"),
          SECONDARY_BTN(`profile:refresh:${targetId}`, "🔄 Refresh"),
        );

        await interaction.update({ embeds: [embed], components: [row] });
      }
    } catch (err) {
      console.error("[BOT] Button error:", err);
    }
  }
});

// ─── NPC Watcher ────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  await handleRpMessage(client, message);
});

// ═══════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════

console.log("[BOT] Starting Ascension Bot (Enhanced Edition)...");
client.login(TOKEN).catch(err => { console.error("[BOT] Login failed:", err); process.exit(1); });