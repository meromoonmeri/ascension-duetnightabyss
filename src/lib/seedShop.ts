import { db } from "@/lib/db";

const SHOP_ITEMS = [
  // ─── BANNERS ───
  {
    name: "Crépuscule Écarlate",
    nameJp: "緋色の黄昏",
    description: "Une bannière aux teintes de sang et d'or, évoquant les dernières lueurs d'un soleil agonisant sur les champs de bataille.",
    price: 500,
    type: "banner",
    rarity: "common",
    config: JSON.stringify({ gradient: "linear-gradient(135deg, #1a0a0a 0%, #4a0e0e 30%, #8B0000 60%, #D4AF37 100%)" }),
  },
  {
    name: "Abîme Stellaire",
    nameJp: "星淵",
    description: "Les profondeurs du cosmos capturées dans une bannière. Les étoiles y dansent entre les nébuleuses violacées.",
    price: 800,
    type: "banner",
    rarity: "rare",
    config: JSON.stringify({ gradient: "linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 30%, #4a0a6a 60%, #8B5CF6 100%)" }),
  },
  {
    name: "Souffle du Dragon",
    nameJp: "竜の息吹",
    description: "Une bannière imprégnée de l'essence draconique. Les flammes dorées y dansent éternellement.",
    price: 1500,
    type: "banner",
    rarity: "epic",
    config: JSON.stringify({ gradient: "linear-gradient(135deg, #0a0500 0%, #4a2800 30%, #D4AF37 60%, #FFD700 100%)" }),
  },
  {
    name: "Voile du Vide",
    nameJp: "虚空のヴェール",
    description: "Une bannière tissée dans le tissu même de la réalité. Le néant y palpite, et les regards s'y perdent.",
    price: 3000,
    type: "banner",
    rarity: "legendary",
    config: JSON.stringify({ gradient: "linear-gradient(135deg, #000000 0%, #0a0a0f 25%, #1a1a2e 50%, #16213e 75%, #0f3460 100%)" }),
  },
  {
    name: "Forêt Enchantée",
    nameJp: "魔の森",
    description: "Les murmures d'une forêt primordiale capturés dans une bannière vivante de verdure et de mystère.",
    price: 600,
    type: "banner",
    rarity: "common",
    config: JSON.stringify({ gradient: "linear-gradient(135deg, #0a1a0a 0%, #0a3a1a 30%, #22C55E 60%, #86EFAC 100%)" }),
  },
  {
    name: "Royaume de Glace",
    nameJp: "氷の王国",
    description: "Le froid éternel des contrées polaires figé dans une bannière cristalline.",
    price: 700,
    type: "banner",
    rarity: "rare",
    config: JSON.stringify({ gradient: "linear-gradient(135deg, #0a0f1a 0%, #1a3a5a 30%, #38BDF8 60%, #BAE6FD 100%)" }),
  },

  // ─── FRAMES ───
  {
    name: "Cadre Solaire",
    nameJp: "太陽の額縁",
    description: "Un cadre doré qui irradie la chaleur de l'étoile matinale. Élégant et majestueux.",
    price: 400,
    type: "frame",
    rarity: "common",
    config: JSON.stringify({ border: "2px solid #D4AF37", glow: "0 0 15px rgba(212,175,55,0.3)" }),
  },
  {
    name: "Cadre Abyssal",
    nameJp: "深淵の額縁",
    description: "Un cadre qui semble absorber la lumière autour de lui. Les bords tremblent légèrement.",
    price: 800,
    type: "frame",
    rarity: "rare",
    config: JSON.stringify({ border: "2px solid #8B5CF6", glow: "0 0 20px rgba(139,92,246,0.4)" }),
  },
  {
    name: "Cadre Primordial",
    nameJp: "始原の額縁",
    description: "Un cadre forgé dans l'essence même de la création. Il pulse d'une lueur ancienne.",
    price: 2000,
    type: "frame",
    rarity: "epic",
    config: JSON.stringify({ border: "2px solid #E879A8", glow: "0 0 25px rgba(232,121,168,0.5), 0 0 50px rgba(232,121,168,0.2)" }),
  },
  {
    name: "Cadre du Créateur",
    nameJp: "創造者の額縁",
    description: "Le cadre ultime. Seul ceux qui ont touché à l'Ascension peuvent le porter. Il défie les lois de la réalité.",
    price: 5000,
    type: "frame",
    rarity: "legendary",
    config: JSON.stringify({ border: "2px solid transparent", glow: "0 0 30px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.3), inset 0 0 30px rgba(212,175,55,0.1)", gradient: "linear-gradient(135deg, #D4AF37, #E879A8, #8B5CF6, #D4AF37)" }),
  },

  // ─── BADGES ───
  {
    name: "Étoile Filante",
    nameJp: "流星",
    description: "Une étoile qui a traversé le ciel d'Ascension. Symbole de vitesse et de grâce.",
    price: 300,
    type: "badge",
    rarity: "common",
    config: JSON.stringify({ icon: "✦", color: "#FCD34D" }),
  },
  {
    name: "Lame Spectrale",
    nameJp: "幽霊剣",
    description: "L'empreinte d'une âme guerrière. Elle brille d'un éclat spectral dans l'obscurité.",
    price: 600,
    type: "badge",
    rarity: "rare",
    config: JSON.stringify({ icon: "⚔", color: "#60A5FA" }),
  },
  {
    name: "Œil du Dragon",
    nameJp: "龍の目",
    description: "Un œil ambré qui semble suivre les regards. Les dragons voient tout, toujours.",
    price: 1200,
    type: "badge",
    rarity: "epic",
    config: JSON.stringify({ icon: "👁", color: "#F59E0B" }),
  },
  {
    name: "Sceau de l'EX",
    nameJp: "EXの印章",
    description: "Le sceau ultime, réservé à ceux qui ont atteint le sommet de l'Ascension.",
    price: 4000,
    type: "badge",
    rarity: "legendary",
    config: JSON.stringify({ icon: "⛧", color: "#E879A8" }),
  },
  {
    name: "Fleur de Lotus",
    nameJp: "蓮の花",
    description: "Un lotus éternel qui ne fane jamais. Symbole de pureté et de renaissance.",
    price: 350,
    type: "badge",
    rarity: "common",
    config: JSON.stringify({ icon: "❀", color: "#F9A8D4" }),
  },
  {
    name: "Crâne Infernal",
    nameJp: "地獄の髑髏",
    description: "Un crâne entouré de flammes démoniaques. L'essence même de l'abîme.",
    price: 700,
    type: "badge",
    rarity: "rare",
    config: JSON.stringify({ icon: "💀", color: "#EF4444" }),
  },

  // ─── BACKGROUNDS ───
  {
    name: "Nébuleuse Dorée",
    nameJp: "金色星雲",
    description: "Un fond doré parsemé de particules lumineuses, comme flotter dans une nébuleuse d'or.",
    price: 600,
    type: "background",
    rarity: "rare",
    config: JSON.stringify({ particles: true, particleColor: "#D4AF37", bgGradient: "radial-gradient(ellipse at 30% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)" }),
  },
  {
    name: "Pluie d'Étoiles",
    nameJp: "星の雨",
    description: "Des étoiles qui tombent doucement en arrière-plan, créant une atmosphère onirique.",
    price: 1000,
    type: "background",
    rarity: "epic",
    config: JSON.stringify({ particles: true, particleColor: "#BAE6FD", falling: true, bgGradient: "radial-gradient(ellipse at 70% 30%, rgba(56,189,248,0.06) 0%, transparent 70%)" }),
  },

  // ─── TITLE STYLES ───
  {
    name: "Titre Runique",
    nameJp: "ルーンの称号",
    description: "Votre titre s'affiche avec des runes anciennes qui scintillent doucement.",
    price: 500,
    type: "title_style",
    rarity: "rare",
    config: JSON.stringify({ fontFamily: "'Cinzel', serif", letterSpacing: "0.3em", textShadow: "0 0 10px rgba(212,175,55,0.5)" }),
  },
  {
    name: "Titre Draconique",
    nameJp: "龍の称号",
    description: "Un titre d'une puissance terrifiante, comme gravé par les griffes d'un dragon primordial.",
    price: 2000,
    type: "title_style",
    rarity: "epic",
    config: JSON.stringify({ fontFamily: "'Cinzel', serif", letterSpacing: "0.2em", textShadow: "0 0 15px rgba(212,175,55,0.7), 0 0 30px rgba(212,175,55,0.3)", color: "#D4AF37" }),
  },
  {
    name: "Titre du Vide",
    nameJp: "虚空の称号",
    description: "Un titre qui semble exister entre les dimensions. Seuls les Transcendants peuvent le porter.",
    price: 4000,
    type: "title_style",
    rarity: "legendary",
    config: JSON.stringify({ fontFamily: "'Cinzel', serif", letterSpacing: "0.25em", textShadow: "0 0 20px rgba(232,121,168,0.6), 0 0 40px rgba(139,92,246,0.3)", gradient: "linear-gradient(90deg, #E879A8, #D4AF37, #8B5CF6)" }),
  },
];

async function seed() {
  console.log(`Seeding ${SHOP_ITEMS.length} shop items...`);

  for (const item of SHOP_ITEMS) {
    const existing = await db.shopItem.findFirst({ where: { name: item.name } });
    if (existing) {
      console.log(`  ⊘ ${item.name} — already exists`);
      continue;
    }
    await db.shopItem.create({ data: item });
    console.log(`  ✓ ${item.name} — ${item.rarity} (${item.price} ᛝ)`);
  }

  console.log("Seed complete.");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));