import { db } from "@/lib/db";

// ═══════════════════════════════════════════════════════════════
//  Auto-seed Pinterest keywords (no auth required — called internally)
// ═══════════════════════════════════════════════════════════════

const KEYWORDS_BY_CATEGORY: Record<string, string[]> = {
  style: [
    "Manhwa", "Manhwa Action", "Manhwa Magic", "Manhwa Fight", "Manhwa Skill",
    "Manhwa Ability", "Manhwa Aura", "Manhwa Character", "Manhwa Character Design",
    "Manga Panel", "Manga Action Panel", "Manga Fight Scene", "Manga Magic",
    "Manga Energy", "Manga Aura", "Anime Effect", "Anime VFX", "Anime Skill",
    "Anime Power", "Anime Magic Circle", "Cel Shading", "Digital Painting",
    "Concept Art", "Splash Art", "Key Art", "Character Illustration",
    "Japanese Ink Style", "Korean Fantasy", "Webtoon Fantasy",
    "Solo Leveling Style", "Tower of God Style", "Omniscient Reader Style",
  ],
  element: [
    "Elemental Magic", "Fire Magic", "Ice Magic", "Lightning Magic", "Wind Magic",
    "Earth Magic", "Shadow Magic", "Holy Magic", "Arcane Symbols", "Rune Design",
    "Magic Glyph", "Magic Circle", "Magic Explosion", "Energy Burst",
    "Aura Effect", "Particle Effect",
  ],
  race: [
    "Dragon Fan Art", "Demon Fan Art", "Angel Fan Art", "Fantasy Creature",
    "Creature Design", "Monster Design", "Boss Design",
  ],
  weapon: [
    "Fantasy Spell", "Fantasy Weapon", "Fantasy Sword", "Fantasy Armor",
  ],
  vfx: [
    "Visual Effects", "Anime VFX", "Energy Burst", "Aura Effect",
    "Particle Effect", "Magic Explosion",
  ],
  composition: [
    "Manga Panel", "Manga Action Panel", "Manga Fight Scene",
    "Cinematic Fantasy", "Epic Fantasy", "High Fantasy", "Dark Fantasy",
    "Cinematic Lighting",
  ],
  mood: [
    "Epic Fantasy", "High Fantasy", "Dark Fantasy", "Cinematic Fantasy",
  ],
  reference: [
    "Fantasy UI", "RPG Interface", "Skill Tree", "RPG Skill Icon",
    "MMORPG Skill", "Environment Concept Art", "Fantasy Landscape",
    "Ancient Ruins", "Floating Islands", "Magic Forest",
    "Fantasy Castle", "Fantasy Character",
  ],
};

export async function seedPinterestKeywords(): Promise<number> {
  // Get existing keywords to skip duplicates
  const existing = new Set(
    (await db.pinterestKeyword.findMany({ select: { keyword: true } })).map(
      (k) => k.keyword
    )
  );

  const toCreate: { keyword: string; category: string }[] = [];

  for (const [category, keywords] of Object.entries(KEYWORDS_BY_CATEGORY)) {
    for (const keyword of keywords) {
      if (!existing.has(keyword)) {
        toCreate.push({ keyword, category });
      }
    }
  }

  if (toCreate.length > 0) {
    await db.pinterestKeyword.createMany({
      data: toCreate.map((entry) => ({
        keyword: entry.keyword,
        category: entry.category,
        tags: "[]",
        weight: 1,
        isActive: true,
      })),
    });
  }

  console.log(`[ILLUSTRATE] Seeded ${toCreate.length} Pinterest keywords`);
  return toCreate.length;
}
