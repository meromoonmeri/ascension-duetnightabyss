// ═══════════════════════════════════════════════════════════════
//  AI Provider — Cloudflare Workers AI (Llama 3.1 70B)
// ═══════════════════════════════════════════════════════════════

const CF_TOKEN = process.env.CF_API_TOKEN || "";
const CF_ACCOUNT = process.env.CF_ACCOUNT_ID || "";
const CF_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/v1/chat/completions`;
const CF_MODEL = "@cf/meta/llama-3.1-70b-instruct";

export async function aiChat(
  systemPrompt: string,
  userMessage: string,
  opts?: { temperature?: number; maxTokens?: number; json?: boolean }
): Promise<string> {
  const res = await fetch(CF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CF_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: opts?.temperature ?? 0.95,
      max_tokens: opts?.maxTokens ?? 4096,
      ...(opts?.json ? { response_format: { type: "json_object" as const } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`CF API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("CF: empty response");
  return content;
}

// ═══════════════════════════════════════════════════════════════
//  Game Constants
// ═══════════════════════════════════════════════════════════════

export const SOCIAL_RANKS = [
  { level: 1, name: "Sans-Foyer",       salary: 0,    icon: "🏚️" },
  { level: 2, name: "Roturier",          salary: 100,  icon: "👤" },
  { level: 3, name: "Marchand",          salary: 250,  icon: "💰" },
  { level: 4, name: "Artisan",           salary: 400,  icon: "⚒️" },
  { level: 5, name: "Noble",             salary: 600,  icon: "👑" },
  { level: 6, name: "Commandant",        salary: 850,  icon: "⚔️" },
  { level: 7, name: "Souverain",         salary: 1200, icon: " deity" },
] as const;

export const KINGDOM_TIERS = [
  { tier: 1, name: "Hameau",     maxPop: 50,    taxRange: [0.02, 0.05] },
  { tier: 2, name: "Village",    maxPop: 200,   taxRange: [0.04, 0.08] },
  { tier: 3, name: "Ville",      maxPop: 1000,  taxRange: [0.06, 0.12] },
  { tier: 4, name: "Cité-État",  maxPop: 5000,  taxRange: [0.08, 0.15] },
  { tier: 5, name: "Empire",     maxPop: 99999, taxRange: [0.10, 0.20] },
] as const;

export const RANK_LABELS: Record<string, { label: string; color: string }> = {
  E:  { label: "E  — Novice",         color: "#9CA3AF" },
  D:  { label: "D  — Apprenti",       color: "#60A5FA" },
  C:  { label: "C  — Initiate",       color: "#34D399" },
  B:  { label: "B  — Adept",          color: "#FBBF24" },
  A:  { label: "A  — Expert",         color: "#F97316" },
  S:  { label: "S  — Maître",         color: "#EF4444" },
  SS: { label: "SS — Grand Maître",   color: "#A855F7" },
  SSS:{ label: "SSS — Légende Vivante", color: "#F472B6" },
};

export const ITEM_RARITIES = {
  common:    { label: "Commun",    color: "#9CA3AF", emoji: "⚪" },
  uncommon:  { label: "Peu commun",color: "#34D399", emoji: "🟢" },
  rare:      { label: "Rare",      color: "#60A5FA", emoji: "🔵" },
  epic:      { label: "Épique",    color: "#A855F7", emoji: "🟣" },
  legendary: { label: "Légendaire",color: "#FBBF24", emoji: "🟡" },
  mythic:    { label: "Mythique",  color: "#EF4444", emoji: "🔴" },
} as const;

export const RACES = [
  "Céleste", "Elfe Sylvestre", "Humain", "Bête-Démon",
  "Vampire", "Démon", "Chimère", "Néant",
] as const;

export const EMBLEM = "https://cdn.discordapp.com/icons/1363662449860468884/a_8ab39a27c04a4b6a5b8c6f0b5d0e3f1f.webp?size=128";

export const BOT_COLORS = {
  primary:    0xD4AF37, // Gold
  secondary:  0x6B21A8, // Deep purple
  success:    0x059669, // Emerald
  danger:     0xDC2626, // Red
  info:       0x2563EB, // Blue
  dark:       0x1A1A2E, // Dark navy
  muted:      0x6B7280, // Gray
} as const;

// XP table: level → cumulative XP needed
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.8));
}

// Salary cooldown: 7 days in ms
export const SALARY_COOLDOWN = 7 * 24 * 60 * 60 * 1000;