import { db } from "../src/lib/db";

type ShopItemData = {
  name: string;
  nameJp?: string;
  description: string;
  price: number;
  type: "banner" | "frame" | "badge" | "background" | "effect" | "title_style";
  rarity: "common" | "rare" | "epic" | "legendary";
  imageUrl?: string;
  config?: string;
  active?: boolean;
  maxStock?: number | null;
  totalSold?: number;
};

const shopItems: ShopItemData[] = [
  // ═══════════════════════════════════════════════════════════════
  // BANNIÈRES (type: "banner") — Anime profile banners
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Uchiha",
    nameJp: "ウチハ",
    description: "Bannière du clan Uchiha — Sharingan éveillé",
    price: 1000,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/banners/uchiha_01_thumb.png",
  },
  {
    name: "Ishtar & Ereshkigal",
    nameJp: "イシュタル＆エレシュキガル",
    description: "Les deux déesses de Babylone — Fate/Grand Order",
    price: 1000,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/banners/fgo_01_thumb.png",
  },
  {
    name: "Chiaki Nanami",
    nameJp: "七海やちよ",
    description: "La Super High School Level Gamer — Danganronpa",
    price: 1000,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/banners/Chiaki_Nanami_Preview.png",
  },
  {
    name: "Budget Pack",
    nameJp: null,
    description: "Un pack économique pour les débutants de l'éther",
    price: 300,
    type: "banner",
    rarity: "common",
    imageUrl: "https://cdn.shoob.gg/images/content/cards.png",
  },
  {
    name: "Sōru",
    nameJp: "ソウル",
    description: "Une bannière simple et élégante",
    price: 75,
    type: "banner",
    rarity: "common",
    imageUrl: "https://cdn.shoob.gg/attachments/1572124024396.png",
  },
  {
    name: "Roshidere",
    nameJp: "ロシデレ",
    description: "Alya par moments agit parfois un peu curieusement — Animé épique",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/d64b72bd818ab3e2209684262633400b7d6d922cd7de8eb714401b82641ede27-preview.gif",
  },
  {
    name: "The Final War (MHA)",
    nameJp: "最終戦争",
    description: "La guerre finale de My Hero Academia — Animation épique",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/046f4928b3b25a7ac6fc8351da3b84433d6e182dd5083589761c8df2d154e071-preview.gif",
  },
  {
    name: "The Apothecary Diaries",
    nameJp: "薬屋のひとりごと",
    description: "Les Chroniques de l'Apothicaire — Animation épique",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/c8c7b09ba57025b22ce588071b42f2299856094db8e7984c2b79a809b34be36f-preview.gif",
  },
  {
    name: "Spice and Wolf",
    nameJp: "狼と香辛料",
    description: "Holo la sage louve — Animation épique",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/af903618976fdf04db9cca17df2628bf9f3dc29d39b00dd8f6fc9593ff25e19e-preview.gif",
  },
  {
    name: "Eighty Six",
    nameJp: "86-エイティシックス-",
    description: "Les déchus de l'empire — Animation épique",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/d54dcbed8e6a982d170c1c546666e20eb0dae7d121faa41eb38bd3bb61cc746c-preview.gif",
  },
  {
    name: "Mashle",
    nameJp: "マッシュル",
    description: "La magie et les muscles — Animation épique",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/539404953aa6ecb6531d56c045ad8a52206685b244633a512179a9a73c72a057-preview.gif",
  },
  {
    name: "Echoes of Eternity (Frieren)",
    nameJp: "葬送のフリーレン",
    description: "Les échos de l'éternité — Frieren: Beyond Journey's End",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/145936a30b13442292db2b57272899d5db97130484b41bd024e61f6d06b3f7de-preview.gif",
  },
  {
    name: "Gogeta (Dragon Ball)",
    nameJp: "ゴジータ",
    description: "La fusion ultime Saiyan — Dragon Ball",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/0f937707ea6c635238a0ee653f77bc63aa467b0c0601c84df8f655f1651bd0c3-preview.gif",
  },
  {
    name: "Kakegurui",
    nameJp: "賭ケグルイ",
    description: "Le jeu compulsif — Yumeko Jabami",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/f55e54d917a23c85912439a796e46e35ef3f8420943aaa44a3a57935a1b0a58f-preview.gif",
  },
  {
    name: "Mushoku Tensei",
    nameJp: "無職転生",
    description: "La vie dans un autre monde — Jobless Reincarnation",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/c97ab9b087d348ee646374343de1329f8a6db6c83f78878406b1d8f2ce3805e6-preview.gif",
  },
  {
    name: "Cursed Techniques (JJK)",
    nameJp: "呪術廻戦",
    description: "Les techniques maudites — Jujutsu Kaisen",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/39848c6869c7520beb5a45b5b85963da04eebbe5764160fbb1371dc331c3c343-preview.gif",
  },
  {
    name: "Konosuba",
    nameJp: "この素晴らしい世界に祝福を！",
    description: "Kono Subarashii Sekai ni Shukufuku wo! — Animation épique",
    price: 1000,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/c9f976f96e6595b04ca04f5abfbbeb4c2a1c6be79cceefa831d54130a6733f13-preview.gif",
  },
  {
    name: "Octopus Tentacle",
    nameJp: null,
    description: "Une bannière mystérieuse aux tentacules",
    price: 2000,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/3.png",
  },
  {
    name: "Sunset Jog",
    nameJp: null,
    description: "Un coucher de soleil apaisant pour le profil",
    price: 1500,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/banners/Sunset_Jog_Preview.png",
  },
  {
    name: "Night",
    nameJp: "夜",
    description: "Une bannière nocturne élégante",
    price: 1000,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/banners/Night.jpg",
  },
  {
    name: "Eva Type 01",
    nameJp: "エヴァ初号機",
    description: "L'Unité-01 d'Evangelion — Neon Genesis Evangelion",
    price: 1000,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/banners/eva_type_01_thumb.png",
  },
  {
    name: "Saber (Fate)",
    nameJp: "セイバー",
    description: "La Servant Artoria Pendragon — Fate/stay night",
    price: 3500,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/989d04c53fefa6fec4842900dd66472bb939c4115054208783c1cf7d57d13663-preview.jpg",
  },
  {
    name: "Genshin Christmas",
    nameJp: "原神クリスマス",
    description: "Célébration de Noël dans le monde de Teyvat",
    price: 3500,
    type: "banner",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/banners/d908cc3e83800da3871ba6891783373a4fa0141b1cc5a52a3e1a57573fcf82a3-preview.jpg",
  },
  {
    name: "Neko Duo",
    nameJp: "ネコデュオ",
    description: "Un duo de chats mignons pour votre profil",
    price: 750,
    type: "banner",
    rarity: "common",
    imageUrl: "https://cdn.shoob.gg/images/banners/neko_duo_thumb.png",
  },
  {
    name: "Attack on Titan #1",
    nameJp: "進撃の巨人",
    description: "Le mur Maria — L'Attaque des Titans",
    price: 1000,
    type: "banner",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/banners/aot1-thumb.png",
  },

  // ═══════════════════════════════════════════════════════════════
  // BADGES (type: "badge") — Small profile badges/icons
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Aberrant Demon",
    nameJp: "変異の悪魔",
    description: "Un badge démoniaque aberrant pour votre profil",
    price: 2100,
    type: "badge",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/47.png",
  },
  {
    name: "Aqua Marine",
    nameJp: "アクアマリン",
    description: "Un badge d'eau cristalline",
    price: 1500,
    type: "badge",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/13.png",
  },
  {
    name: "Aqua Sunrise",
    nameJp: "アクアサンライズ",
    description: "Un badge d'aube aquatique éclatante",
    price: 3300,
    type: "badge",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/ranks/43.png",
  },
  {
    name: "Aristocrat Neko Mask",
    nameJp: "貴族ネコマスク",
    description: "Un masque de chat aristocratique",
    price: 1800,
    type: "badge",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/4.png",
  },
  {
    name: "Autumn Catrina",
    nameJp: "秋のカトリーナ",
    description: "Un badge d'automne inspiré de la Catrina",
    price: 1300,
    type: "badge",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/17.png",
  },
  {
    name: "Baby Demon",
    nameJp: "ベビーデーモン",
    description: "Un petit démon mignon pour votre profil",
    price: 1600,
    type: "badge",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/44.png",
  },
  {
    name: "Bell Blossom",
    nameJp: "ベルブロッサム",
    description: "Une clochette florale éclatante",
    price: 4000,
    type: "badge",
    rarity: "epic",
    imageUrl: "https://cdn.shoob.gg/images/ranks/58.png",
  },
  {
    name: "Black Daruma Doll",
    nameJp: "黒いだるま",
    description: "Une poupée Daruma noire mystérieuse",
    price: 2050,
    type: "badge",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/71.png",
  },
  {
    name: "Black Moon",
    nameJp: "黒月",
    description: "Un badge de lune noire ensorcelée",
    price: 1200,
    type: "badge",
    rarity: "rare",
    imageUrl: "https://cdn.shoob.gg/images/ranks/10.png",
  },

  // ═══════════════════════════════════════════════════════════════
  // FONDS DE PROFIL (type: "background") — Steam-style profile backgrounds
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Nuit Étoilée",
    nameJp: "星空の夜",
    description: "Un fond de nuit étoilée profonde et mystérieuse",
    price: 500,
    type: "background",
    rarity: "common",
    config: '{"gradient":"linear-gradient(135deg, #0c1445 0%, #1a0a2e 50%, #0d1b2a 100%)"}',
  },
  {
    name: "Aube Dorée",
    nameJp: "黄金の夜明け",
    description: "Un fond d'aube dorée chaleureuse",
    price: 500,
    type: "background",
    rarity: "common",
    config: '{"gradient":"linear-gradient(135deg, #2d1810 0%, #4a2c17 50%, #1a1a2e 100%)"}',
  },
  {
    name: "Forêt Enchantée",
    nameJp: "魔法の森",
    description: "Un fond de forêt enchantée verdoyante",
    price: 500,
    type: "background",
    rarity: "common",
    config: '{"gradient":"linear-gradient(135deg, #0a1f0a 0%, #1a3a1a 50%, #0d2818 100%)"}',
  },
  {
    name: "Abysses Célestes",
    nameJp: "天界の深淵",
    description: "Un fond céleste aux abysses infinies",
    price: 500,
    type: "background",
    rarity: "common",
    config: '{"gradient":"linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d0d2a 100%)"}',
  },
  {
    name: "Flammes Éternelles",
    nameJp: "永遠の炎",
    description: "Un fond de flammes éternelles ardentes",
    price: 750,
    type: "background",
    rarity: "rare",
    config: '{"gradient":"linear-gradient(135deg, #2d0a0a 0%, #4a1a0a 50%, #1a0d0d 100%)"}',
  },
  {
    name: "Océan Profond",
    nameJp: "深海",
    description: "Un fond d'océan profond et mystérieux",
    price: 750,
    type: "background",
    rarity: "rare",
    config: '{"gradient":"linear-gradient(135deg, #0a1a2d 0%, #0a2a4a 50%, #0d1a2a 100%)"}',
  },
  {
    name: "Nébuleuse Arcanique",
    nameJp: "アルカナ星雲",
    description: "Un fond de nébuleuse arcanique envoûtante",
    price: 1000,
    type: "background",
    rarity: "rare",
    config: '{"gradient":"linear-gradient(135deg, #1a0a2d 0%, #2d1a4a 50%, #150d28 100%)"}',
  },
  {
    name: "Tempête Solaire",
    nameJp: "太陽風暴",
    description: "Un fond de tempête solaire éblouissante",
    price: 1500,
    type: "background",
    rarity: "epic",
    config: '{"gradient":"linear-gradient(135deg, #2d2a0a 0%, #4a3a0a 50%, #1a150a 100%)"}',
  },

  // ═══════════════════════════════════════════════════════════════
  // CADRES (type: "frame") — Profile frame borders
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Cadre Solaire",
    nameJp: "太陽の額縁",
    description: "Un cadre doré solaire pour votre avatar",
    price: 500,
    type: "frame",
    rarity: "common",
    config: '{"border":"2px solid #D4AF37", "shadow":"0 0 10px rgba(212,175,55,0.3)"}',
  },
  {
    name: "Cadre Argenté",
    nameJp: "銀の額縁",
    description: "Un cadre argenté élégant pour votre avatar",
    price: 500,
    type: "frame",
    rarity: "common",
    config: '{"border":"2px solid #C0C0C0", "shadow":"0 0 10px rgba(192,192,192,0.3)"}',
  },
  {
    name: "Cadre Sombre",
    nameJp: "闇の額縁",
    description: "Un cadre sombre et mystérieux pour votre avatar",
    price: 500,
    type: "frame",
    rarity: "common",
    config: '{"border":"2px solid #333", "shadow":"0 0 10px rgba(0,0,0,0.5)"}',
  },
  {
    name: "Cadre Arcanique",
    nameJp: "アルカナの額縁",
    description: "Un cadre arcanique violet aux pouvoirs magiques",
    price: 1000,
    type: "frame",
    rarity: "rare",
    config: '{"border":"2px solid #A855F7", "shadow":"0 0 15px rgba(168,85,247,0.4)"}',
  },
  {
    name: "Cadre Draconique",
    nameJp: "竜の額縁",
    description: "Un cadre draconique rouge de sang",
    price: 1000,
    type: "frame",
    rarity: "rare",
    config: '{"border":"2px solid #DC143C", "shadow":"0 0 15px rgba(220,20,60,0.4)"}',
  },
  {
    name: "Cadre Éthéré",
    nameJp: "エーテルの額縁",
    description: "Un cadre éthéré d'un bleu céleste immaculé",
    price: 1500,
    type: "frame",
    rarity: "epic",
    config: '{"border":"2px solid #00CED1", "shadow":"0 0 20px rgba(0,206,209,0.4)"}',
  },
  {
    name: "Cadre Primordial",
    nameJp: "太初の額縁",
    description: "Le cadre originel — Légendaire et intemporel",
    price: 5000,
    type: "frame",
    rarity: "legendary",
    config: '{"border":"3px solid #D4AF37", "shadow":"0 0 25px rgba(212,175,55,0.5), 0 0 50px rgba(212,175,55,0.2)"}',
  },
  {
    name: "Cadre de l'Ex",
    nameJp: "元カレの額縁",
    description: "Un cadre sombre avec une lueur bleutée fantomatique",
    price: 3000,
    type: "frame",
    rarity: "epic",
    config: '{"border":"2px solid #1a1a1a", "shadow":"0 0 20px rgba(100,100,255,0.4)"}',
  },
  {
    name: "Cadre du Créateur",
    nameJp: "創造主の額縁",
    description: "Le cadre du créateur — Réservé aux êtres suprêmes",
    price: 5000,
    type: "frame",
    rarity: "legendary",
    config: '{"border":"3px solid #FF6B6B", "shadow":"0 0 25px rgba(255,107,107,0.5), 0 0 50px rgba(255,107,107,0.2)"}',
  },
  {
    name: "Cadre Abysse Stell.",
    nameJp: "星の深淵の額縁",
    description: "Un cadre d'abysse stellaire aux reflets violets",
    price: 3000,
    type: "frame",
    rarity: "epic",
    config: '{"border":"2px solid #1a0a3d", "shadow":"0 0 20px rgba(100,50,200,0.4)"}',
  },

  // ═══════════════════════════════════════════════════════════════
  // EFFETS (type: "effect") — Animated profile effects
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Particules Dorées",
    nameJp: "金色の粒子",
    description: "Des particules dorées flottantes autour de votre profil",
    price: 2000,
    type: "effect",
    rarity: "rare",
    config: '{"type":"particles", "color":"#D4AF37"}',
  },
  {
    name: "Poussière d'Étoiles",
    nameJp: "星屑",
    description: "Une poussière d'étoiles scintillante",
    price: 2000,
    type: "effect",
    rarity: "rare",
    config: '{"type":"particles", "color":"#87CEEB"}',
  },
  {
    name: "Brasier",
    nameJp: "火炎",
    description: "Un brasier ardent de particules enflammées",
    price: 3000,
    type: "effect",
    rarity: "epic",
    config: '{"type":"particles", "color":"#FF4500"}',
  },
  {
    name: "Nébuleuse",
    nameJp: "星雲",
    description: "Une nébuleuse cosmique légendaire en particles",
    price: 5000,
    type: "effect",
    rarity: "legendary",
    config: '{"type":"particles", "color":"#A855F7"}',
  },

  // ═══════════════════════════════════════════════════════════════
  // TITRES (type: "title_style") — Custom title styles
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Titre Runique",
    nameJp: "ルーンの称号",
    description: "Un titre en or runique et italique",
    price: 1000,
    type: "title_style",
    rarity: "rare",
    config: '{"color":"#D4AF37", "style":"italic"}',
  },
  {
    name: "Titre Draconique",
    nameJp: "竜の称号",
    description: "Un titre rouge draconique et gras",
    price: 3000,
    type: "title_style",
    rarity: "epic",
    config: '{"color":"#DC143C", "style":"bold"}',
  },
  {
    name: "Titre du Vide",
    nameJp: "虚無の称号",
    description: "Un titre violet du vide et normal",
    price: 3000,
    type: "title_style",
    rarity: "epic",
    config: '{"color":"#6B21A8", "style":"normal"}',
  },
  {
    name: "Lame Spectrale",
    nameJp: "幽霊の刃",
    description: "Un titre spectral cyan et normal",
    price: 1500,
    type: "title_style",
    rarity: "rare",
    config: '{"color":"#00CED1", "style":"normal"}',
  },
];

async function main() {
  console.log(`Seeding ${shopItems.length} shop items...`);

  // Delete all existing shop items to ensure clean state
  const deleted = await db.shopItem.deleteMany({});
  if (deleted.count > 0) {
    console.log(`Deleted ${deleted.count} existing shop items.`);
  }

  // Insert all new items
  const result = await db.shopItem.createMany({
    data: shopItems.map((item) => ({
      name: item.name,
      nameJp: item.nameJp ?? null,
      description: item.description,
      price: item.price,
      type: item.type,
      rarity: item.rarity,
      imageUrl: item.imageUrl ?? null,
      config: item.config ?? null,
      active: item.active ?? true,
      maxStock: item.maxStock ?? null,
      totalSold: item.totalSold ?? 0,
    })),
  });

  console.log(`✅ Successfully inserted ${result.count} shop items.`);

  // Print summary by type
  const counts = await db.shopItem.groupBy({
    by: ["type"],
    _count: true,
  });
  console.log("\n📋 Summary by type:");
  for (const c of counts) {
    console.log(`   ${c.type}: ${c._count} items`);
  }

  const total = await db.shopItem.count();
  console.log(`\n🎯 Total: ${total} items in shop.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });