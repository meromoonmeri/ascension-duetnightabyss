import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_DISCORD_ID = "722146261381415043";

type SeedEntry = {
  key: string;
  value: string;
  label?: string;
  group: string;
  type?: string;
  options?: string;
  hint?: string;
  sortOrder: number;
};

// ═══════════════════════════════════════════════════════════════
//  Seed data — organized by group
// ═══════════════════════════════════════════════════════════════

function buildSeedData(): SeedEntry[] {
  const entries: SeedEntry[] = [];
  let order = 0;

  // ── Group: ranks ────────────────────────────────────────────
  const ranks: { suffix: string; color: string; label: string }[] = [
    { suffix: "F", color: "#78716C", label: "Novice" },
    { suffix: "E", color: "#9CA3AF", label: "Apprenti" },
    { suffix: "D", color: "#3B82F6", label: "Initié" },
    { suffix: "C", color: "#22C55E", label: "Adepte" },
    { suffix: "B", color: "#A855F7", label: "Expert" },
    { suffix: "A", color: "#EF4444", label: "Maître" },
    { suffix: "S", color: "#F59E0B", label: "Élite" },
    { suffix: "S+", color: "#D4AF37", label: "Légende" },
    { suffix: "EX", color: "#E879A8", label: "Transcendant" },
  ];

  for (const r of ranks) {
    entries.push({
      key: `rank_${r.suffix}_color`,
      value: r.color,
      label: `Rang ${r.suffix}`,
      group: "ranks",
      type: "color",
      sortOrder: order++,
    });
    entries.push({
      key: `rank_${r.suffix}_label`,
      value: r.label,
      group: "ranks",
      type: "text",
      sortOrder: order++,
    });
  }

  // ── Group: rarities ────────────────────────────────────────
  const rarities: { suffix: string; color: string; emoji: string; label: string }[] = [
    { suffix: "common", color: "#9CA3AF", emoji: "⚪", label: "Commun" },
    { suffix: "rare", color: "#3B82F6", emoji: "🔵", label: "Rare" },
    { suffix: "epic", color: "#A855F7", emoji: "🟣", label: "Épique" },
    { suffix: "legendary", color: "#F59E0B", emoji: "🟡", label: "Légendaire" },
    { suffix: "mythic", color: "#EF4444", emoji: "🔴", label: "Mythique" },
  ];

  for (const r of rarities) {
    entries.push({
      key: `rarity_${r.suffix}_color`,
      value: r.color,
      label: r.label,
      group: "rarities",
      type: "color",
      sortOrder: order++,
    });
    entries.push({
      key: `rarity_${r.suffix}_emoji`,
      value: r.emoji,
      group: "rarities",
      type: "text",
      sortOrder: order++,
    });
  }

  // ── Group: elements ────────────────────────────────────────
  const elements: { name: string; color: string; emoji: string }[] = [
    { name: "Feu", color: "#EF4444", emoji: "🔥" },
    { name: "Glace", color: "#38BDF8", emoji: "❄️" },
    { name: "Foudre", color: "#FBBF24", emoji: "⚡" },
    { name: "Ténèbres", color: "#7C3AED", emoji: "🌑" },
    { name: "Lumière", color: "#FDE68A", emoji: "✨" },
    { name: "Vent", color: "#6EE7B7", emoji: "🌪️" },
    { name: "Terre", color: "#A16207", emoji: "🪨" },
    { name: "Eau", color: "#0EA5E9", emoji: "💧" },
    { name: "Arcane", color: "#C084FC", emoji: "🔮" },
    { name: "Sang", color: "#DC2626", emoji: "🩸" },
    { name: "Néant", color: "#1F2937", emoji: "🕳️" },
  ];

  for (const el of elements) {
    entries.push({
      key: `element_${el.name}_color`,
      value: el.color,
      label: el.name,
      group: "elements",
      type: "color",
      sortOrder: order++,
    });
    entries.push({
      key: `element_${el.name}_emoji`,
      value: el.emoji,
      group: "elements",
      type: "text",
      sortOrder: order++,
    });
  }

  // ── Group: aesthetic ───────────────────────────────────────
  const aesthetics: { key: string; value: string; label: string; type: string }[] = [
    { key: "site_primary_color", value: "#C9A84C", label: "Couleur primaire (or)", type: "color" },
    { key: "site_accent_color", value: "#E879A8", label: "Couleur d'accent (rose)", type: "color" },
    { key: "site_bg_color", value: "#0a0a0f", label: "Fond du site", type: "color" },
    { key: "site_card_bg", value: "rgba(255,255,255,0.05)", label: "Fond des cartes", type: "text" },
    { key: "site_text_primary", value: "#E5E5E5", label: "Texte principal", type: "color" },
    { key: "site_text_secondary", value: "#A3A3A3", label: "Texte secondaire", type: "color" },
    { key: "site_text_tertiary", value: "#737373", label: "Texte tertiaire", type: "color" },
  ];

  for (const a of aesthetics) {
    entries.push({
      key: a.key,
      value: a.value,
      label: a.label,
      group: "aesthetic",
      type: a.type,
      sortOrder: order++,
    });
  }

  // ── Group: badges ──────────────────────────────────────────
  const badges: { suffix: string; color: string; label: string; emoji: string }[] = [
    { suffix: "pending", color: "#F59E0B", label: "En attente", emoji: "⏳" },
    { suffix: "accepted", color: "#22C55E", label: "Validé", emoji: "✅" },
    { suffix: "rejected", color: "#EF4444", label: "Refusé", emoji: "❌" },
    { suffix: "revision", color: "#F97316", label: "Révision", emoji: "🔄" },
    { suffix: "admin", color: "#C9A84C", label: "Admin", emoji: "👑" },
  ];

  for (const b of badges) {
    entries.push({
      key: `badge_${b.suffix}_color`,
      value: b.color,
      group: "badges",
      type: "color",
      sortOrder: order++,
    });
    entries.push({
      key: `badge_${b.suffix}_label`,
      value: b.label,
      group: "badges",
      type: "text",
      sortOrder: order++,
    });
    entries.push({
      key: `badge_${b.suffix}_emoji`,
      value: b.emoji,
      group: "badges",
      type: "text",
      sortOrder: order++,
    });
  }

  // ── Group: notifications ───────────────────────────────────
  const notifications: { key: string; value: string; label: string; type: string; hint?: string }[] = [
    {
      key: "notif_sha_avatar",
      value: "",
      label: "Avatar de Sha Pipolino (webhook)",
      type: "image_url",
      hint: "URL de l'avatar du lapin pour les notifications",
    },
    {
      key: "notif_sha_name",
      value: "Sha Pipolino",
      label: "Nom du webhook notifications",
      type: "text",
    },
    {
      key: "notif_sha_banner",
      value: "",
      label: "Bannière Sha Pipolino",
      type: "image_url",
    },
    {
      key: "notif_log_channel",
      value: "1512862089302245376",
      label: "Salon de logs",
      type: "text",
      hint: "ID du salon Discord pour les logs de fiches",
    },
  ];

  for (const n of notifications) {
    entries.push({
      key: n.key,
      value: n.value,
      label: n.label,
      group: "notifications",
      type: n.type,
      ...(n.hint && { hint: n.hint }),
      sortOrder: order++,
    });
  }

  // ── Group: ai ──────────────────────────────────────────────
  const aiConfigs: { key: string; value: string; label: string; type: string; hint?: string; options?: string }[] = [
    {
      key: "ai_technique_model",
      value: "@cf/meta/llama-3.1-70b-instruct",
      label: "Modèle IA Techniques",
      type: "text",
    },
    {
      key: "ai_technique_temperature",
      value: "1.0",
      label: "Température Techniques",
      type: "number",
    },
    {
      key: "ai_bestiaire_model",
      value: "@cf/meta/llama-3.1-70b-instruct",
      label: "Modèle IA Bestiaire",
      type: "text",
    },
    {
      key: "ai_bestiaire_temperature",
      value: "1.0",
      label: "Température Bestiaire",
      type: "number",
    },
    {
      key: "ai_illustration_enabled",
      value: "false",
      label: "Génération d'illustrations",
      type: "boolean",
      hint: "Activer la génération auto d'images pour les techniques",
    },
    {
      key: "ai_illustration_size",
      value: "1024x1024",
      label: "Taille des illustrations",
      type: "select",
      options: JSON.stringify([
        { label: "Carré (1024x1024)", value: "1024x1024" },
        { label: "Portrait (768x1344)", value: "768x1344" },
        { label: "Paysage (1344x768)", value: "1344x768" },
      ]),
    },
  ];

  for (const ai of aiConfigs) {
    entries.push({
      key: ai.key,
      value: ai.value,
      label: ai.label,
      group: "ai",
      type: ai.type,
      ...(ai.hint && { hint: ai.hint }),
      ...(ai.options && { options: ai.options }),
      sortOrder: order++,
    });
  }

  // ── Group: roles ───────────────────────────────────────────
  const roles: { suffix: string; label: string; color: string }[] = [
    { suffix: "admin", label: "Administrateur", color: "#C9A84C" },
    { suffix: "moderator", label: "Modérateur", color: "#3B82F6" },
    { suffix: "animator", label: "Animateur", color: "#22C55E" },
    { suffix: "player", label: "Joueur", color: "#9CA3AF" },
  ];

  for (const r of roles) {
    entries.push({
      key: `role_${r.suffix}_label`,
      value: r.label,
      label: r.label,
      group: "roles",
      type: "text",
      sortOrder: order++,
    });
    entries.push({
      key: `role_${r.suffix}_color`,
      value: r.color,
      group: "roles",
      type: "color",
      sortOrder: order++,
    });
  }

  // ── Group: embeds ──────────────────────────────────────────
  const embeds: { key: string; value: string; label: string; type: string }[] = [
    { key: "embed_default_color", value: "#C9A84C", label: "Couleur par défaut des embeds", type: "color" },
    { key: "embed_footer_text", value: "Ascension RP", label: "Texte de footer", type: "text" },
    { key: "embed_sha_thumbnail", value: "", label: "Thumbnail Sha Pipolino", type: "image_url" },
  ];

  for (const e of embeds) {
    entries.push({
      key: e.key,
      value: e.value,
      label: e.label,
      group: "embeds",
      type: e.type,
      sortOrder: order++,
    });
  }

  return entries;
}

// POST — Admin only: seed default CMS configuration values
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const seedData = buildSeedData();

    // Get all existing keys to skip duplicates
    const existingKeys = new Set(
      (await db.siteConfig.findMany({ select: { key: true } })).map(
        (c) => c.key
      )
    );

    const toCreate = seedData.filter((entry) => !existingKeys.has(entry.key));

    if (toCreate.length > 0) {
      await db.siteConfig.createMany({
        data: toCreate.map((entry) => ({
          key: entry.key,
          value: entry.value,
          label: entry.label ?? "",
          group: entry.group,
          type: entry.type ?? "text",
          options: entry.options ?? "[]",
          hint: entry.hint ?? "",
          sortOrder: entry.sortOrder,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      created: toCreate.length,
      skipped: seedData.length - toCreate.length,
      total: seedData.length,
    });
  } catch (error) {
    console.error("CMS seed POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}