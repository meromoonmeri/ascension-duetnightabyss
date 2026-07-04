// Ascension Race Data
// Color palettes defined per race, visible in both day/night modes

export interface RankInfo {
  rank: string;
  label: string;
  description: string;
}

export interface RaceTechnique {
  id: string;
  nameJp: string;
  nameFr: string;
  subtitle: string;
  rank: string;
  classification: string;
  nature: string;
  vecteur: string;
  portee: string;
  techniqueParente: string;
  techniqueDerivee: string;
  vueEnsemble: string;
  effets: string[];
  fonctionnement: string[];
  faiblesses: string[];
  imageUrl?: string;
}

export interface RaceData {
  id: string;
  name: string;
  nameJp: string;
  subtitle: string;
  description: string;
  lore: string;
  characteristics: string[];
  // Color system
  colors: {
    primary: string;      // Main accent (borders, headers)
    secondary: string;    // Glow/highlight
    bg: string;           // Section background tint
    text: string;         // Text on dark bg
    textLight: string;    // Text on light bg
    glow: string;         // Box-shadow / halo color
  };
  dayColors: {
    primary: string;
    secondary: string;
    bg: string;
    text: string;
    glow: string;
  };
  ranks: RankInfo[];
  techniques: RaceTechnique[];
  icon: string; // Lucide icon name or emoji placeholder
  heroGif?: string; // Optional animated GIF for race detail hero
}

export const RANKS: RankInfo[] = [
  { rank: "F", label: "Novice", description: "Premier pas dans la voie de la race" },
  { rank: "E", label: "Apprenti", description: "Maîtrise des bases raciales" },
  { rank: "D", label: "Initié", description: "Début de la spécialisation" },
  { rank: "C", label: "Compétent", description: "Maîtrise solide des capacités raciales" },
  { rank: "B", label: "Expert", description: "Techniques avancées débloquées" },
  { rank: "A", label: "Élite", description: "Puissance raciale pleinement éveillée" },
  { rank: "S", label: "Maître", description: "Au sommet de la hiérarchie raciale" },
  { rank: "EX", label: "Transcendant", description: "Au-delà des limites connues" },
];

export const RACE_DATA: RaceData[] = [
  {
    id: "humains",
    name: "Humains",
    nameJp: "人間",
    subtitle: "La race de l'adaptabilité infinie",
    description: "Les Humains d'Ascension ne sont pas les êtres fragiles des mondes ordinaires. Leur trait racial fondamental est une plasticité énergétique sans équivalent : là où les autres races sont prisonnières de leur nature, les Humains peuvent emprunter, adapter et fusionner les mécanismes énergétiques des autres peuples.",
    lore: "Parmi les 180 nations du Traité Commercial de l'Éther, les Humains constituent la population la plus nombreuse et la plus répandue. Leur civilisation s'étend des plaines fertiles de Solaria aux cités marchandes de l'Archipel des Vents. Mais cette omniprésence ne signifie pas faiblesse — bien au contraire. C'est précisément leur diversité qui forge leur force.",
    characteristics: [
      "Adaptabilité énergétique — peut apprendre des techniques d'autres races",
      "Plasticité d'Éveil — les fondations raciales se moldent selon l'Art pratiqué",
      "Résilience cognitive — apprentissage accéléré des systèmes complexes",
      "Potentiel illimité — pas de plafond racial, seulement celui de l'effort",
    ],
    colors: {
      primary: "#4682B4",
      secondary: "#A9C4D8",
      bg: "rgba(70,130,180,0.08)",
      text: "#B0C4DE",
      textLight: "#2C5F8A",
      glow: "rgba(70,130,180,0.4)",
    },
    dayColors: {
      primary: "#2C5F8A",
      secondary: "#4682B4",
      bg: "rgba(70,130,180,0.06)",
      text: "#1E3A5F",
      glow: "rgba(44,95,138,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "humain-flashstep",
        nameJp: "フラッシュステップ",
        nameFr: "FlashStep",
        subtitle: "Déplacement Éclair Adaptatif",
        rank: "C",
        classification: "Technique",
        nature: "Acquise",
        vecteur: "Flux Énergétique",
        portee: "Soi-même",
        techniqueParente: "—",
        techniqueDerivee: "FlashStep — Variante Ombre",
        vueEnsemble: "FlashStep est une technique de déplacement instantané qui exploite la plasticité énergétique humaine. Le pratiquant canalise une impulsion de flux dans ses membres inférieurs, propulsant son corps sur une distance de 3 cases en un éclair.",
        effets: [
          "Déplacement instantané de 3 cases dans une direction choisie",
          "Aucune trace énergétique résiduelle après le déplacement",
          "Peut être enchaîné une fois par tour",
        ],
        fonctionnement: [
          "Le pratiquant concentre son flux dans les jambes pendant 0.5 secondes",
          "L'énergie est libérée en une impulsion contrôlée propulsant le corps",
          "Le déplacement est si rapide qu'il est perçu comme une téléportation",
        ],
        faiblesses: [
          "Ne peut pas traverser les obstacles solides",
          "Laisse une micro-pause de 0.2s entre les déplacements",
          "Coût énergétique croît avec la distance effective parcourue",
        ],
      },
      {
        id: "humain-perception-augmentee",
        nameJp: "強化知覚",
        nameFr: "Perception Augmentée",
        subtitle: "Sens Aiguisés de l'Adaptateur",
        rank: "B",
        classification: "Passif",
        nature: "Innée",
        vecteur: "Sens Naturels",
        portee: "Soi-même",
        techniqueParente: "—",
        techniqueDerivee: "Vision Totale",
        vueEnsemble: "Les Humains ayant atteint le rang B développent naturellement une perception supérieure. Leurs sens s'affûtent au-delà des limites physiques normales, leur permettant de détecter les fluctuations énergétiques dans un rayon de 20 mètres.",
        effets: [
          "Détection des présences énergétiques dans un rayon de 20m",
          "Sensibilisation aux variations de flux ambiant",
          "Réflexes améliorés de 40% face aux attaques surprises",
        ],
        fonctionnement: [
          "Le système nerveux s'adapte progressivement aux stimuli énergétiques",
          "Le cerveau traite les informations sensorielles à une vitesse accrue",
          "Une carte mentale de l'environnement énergétique se construit en temps réel",
        ],
        faiblesses: [
          "Sensibilité accrue aux attaques sonores et sensorielles",
          "Ne fonctionne pas dans les zones de nullité énergétique",
          "Fatigue mentale en cas d'utilisation prolongée",
        ],
      },
    ],
    icon: "/icone-humain.png",
  },
  {
    id: "elfes",
    name: "Elfes",
    nameJp: "エルフ",
    subtitle: "Gardiens de la forêt primordiale",
    description: "Les Elfes sont les enfants de la forêt primordiale, liés par un pacte ancestral aux arbres-mondres. Leur longévité dépasse celle de toutes les autres races — certains Elfes vivent plus de mille ans. Cette immortalité relative leur confère une sagesse et une maîtrise des arts naturels inégalées.",
    lore: "Les Elfes habitent les canopées des Forêts d'Argent, des territoires si vastes qu'une vie humaine entière ne suffirait pas à en explorer les confins. Leur civilisation est structurée en Circles — des communautés sylvestres dirigées par des Archontes ayant vécu plusieurs siècles.",
    characteristics: [
      "Longévité millénaire — mémoire accumulée sur des siècles",
      "Affinité sylvestre — communion naturelle avec la flore",
      "Perception éthérée — vision au-delà du spectre visible",
      "Mana ambiant — régénération énergétique accélérée en forêt",
    ],
    colors: {
      primary: "#2E8B57",
      secondary: "#90EE90",
      bg: "rgba(46,139,87,0.08)",
      text: "#A8D5BA",
      textLight: "#1B5E3A",
      glow: "rgba(46,139,87,0.4)",
    },
    dayColors: {
      primary: "#1B5E3A",
      secondary: "#2E8B57",
      bg: "rgba(46,139,87,0.06)",
      text: "#0D3B24",
      glow: "rgba(27,94,58,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "elfe-lien-sylvestre",
        nameJp: "森の絆",
        nameFr: "Lien Sylvestre",
        subtitle: "Communion avec le monde végétal",
        rank: "A",
        classification: "Unique",
        nature: "Innée",
        vecteur: "Flora",
        portee: "Zone (50m)",
        techniqueParente: "—",
        techniqueDerivee: "Lien Sylvestre — Domination",
        vueEnsemble: "Le Lien Sylvestre est la capacité innée suprême des Elfes. En activant ce lien, l'Elfe fusionne temporairement sa conscience avec le réseau mycélien de la forêt environnante, percevant tout ce qui se trouve dans un rayon de 50 mètres comme s'il s'agissait de son propre corps.",
        effets: [
          "Perception totale dans un rayon de 50m via le réseau végétal",
          "Contrôle partiel de la flore dans la zone (croissance accélérée, mouvements)",
          "Partage de sensations avec les êtres végétaux connectés",
        ],
        fonctionnement: [
          "L'Elfe établit un contact physique avec un arbre ou une racine",
          "Son flux énergétique se propage dans le réseau mycélien en 2 secondes",
          "La conscience de l'Elfe se dilate pour englober la zone couverte",
        ],
        faiblesses: [
          "Inutilisable en milieu urbain ou désertique sans végétation",
          "L'Elfe est vulnérable pendant la phase de connexion (2s)",
          "Dégâts infligés à la flore connectée se répercutent partiellement",
        ],
      },
    ],
    icon: "/icone-elfe.png",
  },
  {
    id: "hommes-betes",
    name: "Hommes-Bêtes",
    nameJp: "獣人",
    subtitle: "La férocité primordiale incarnée",
    description: "Les Hommes-Bêtes portent en eux le sang des ancêtres sauvages. Mi-humains, mi-animaux, ils incarnent la fusion entre civilisation et instinct. Leur puissance brute est sans équivalent parmi les races mortelles, et leurs sens sont aiguisés bien au-delà de la norme.",
    lore: "Les clans de Hommes-Bêtes sont dispersés à travers les territoires sauvages du monde. Chaque clan est lié à un ancêtre animal spécifique — félin, lupin, ursidé, aviaire — dont il hérite les traits et les capacités fondamentales.",
    characteristics: [
      "Force primordiale — puissance physique 2-3x supérieure à un humain du même rang",
      "Instinct prédateur — réactions de combat quasi-instantanées",
      "Sens surdéveloppés — odorat, ouïe et vision nocturne exceptionnels",
      "Mue bestiale — transformation partielle ou totale selon le rang",
    ],
    colors: {
      primary: "#D2691E",
      secondary: "#FFBF00",
      bg: "rgba(210,105,30,0.08)",
      text: "#E8C49A",
      textLight: "#8B4513",
      glow: "rgba(210,105,30,0.4)",
    },
    dayColors: {
      primary: "#8B4513",
      secondary: "#D2691E",
      bg: "rgba(210,105,30,0.06)",
      text: "#5C2E0E",
      glow: "rgba(139,69,19,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "betes-mue-sauvage",
        nameJp: "野獣変身",
        nameFr: "Mue Sauvage",
        subtitle: "L'éveil de la bête intérieure",
        rank: "B",
        classification: "Fondamentale",
        nature: "Innée",
        vecteur: "Corps",
        portee: "Soi-même",
        techniqueParente: "—",
        techniqueDerivee: "Mue Totale",
        vueEnsemble: "La Mue Sauvage est le fondement du combat Homme-Bête. Le pratiquant libère partiellement son héritage animal, transformant ses membres en armes naturelles tout en conservant sa conscience humaine.",
        effets: [
          "Transformation partielle : griffes, crocs, pelage, yeux luminescents",
          "Force physique multipliée par 2.5",
          "Vitesse et réflexes augmentés de 60%",
        ],
        fonctionnement: [
          "Le pratiquant canalise son instinct primordial via son flux énergétique",
          "La transformation débute par les extrémités et s'étend en 1.5 secondes",
          "L'état se maintient tant que le flux est alimenté",
        ],
        faiblesses: [
          "L'instinct peut submerger la raison en cas de forte émotion",
          "Vulnérabilité accrue aux techniques anti-transformation",
          "Durée limitée par les réserves de flux du pratiquant",
        ],
      },
    ],
    icon: "/icone-homme-bete.png",
  },
  {
    id: "titans",
    name: "Titans",
    nameJp: "タイタン",
    subtitle: "Les piliers du monde ancien",
    description: "Les Titans sont les êtres les plus massifs et les plus résistants de tout le monde d'Ascension. Leur corps est littéralement façonné dans la roche vivante — un héritage direct des Mechaz qui ont sculpté les continents. Leur patience est légendaire, tout comme leur puissance dévastatrice.",
    lore: "On raconte que les premiers Titans émergèrent des entrailles de la terre lorsque les Mechaz achevèrent de sculpter les reliefs du monde. Chaque Titan est relié à un territoire spécifique — une montagne, une vallée, un plateau — dont il est le gardien naturel.",
    characteristics: [
      "Armure vivante — peau de roche avec résistance naturelle exceptionnelle",
      "Force titanesque — capable de soulever des masses colossales",
      "Résilience sismique — immunisé aux dégâts de chute et de compression",
      "Géomancie innée — manipulation partielle de la terre et de la pierre",
    ],
    colors: {
      primary: "#C19A6B",
      secondary: "#8B7355",
      bg: "rgba(193,154,107,0.08)",
      text: "#D4C4A8",
      textLight: "#6B5B3E",
      glow: "rgba(193,154,107,0.4)",
    },
    dayColors: {
      primary: "#6B5B3E",
      secondary: "#C19A6B",
      bg: "rgba(193,154,107,0.06)",
      text: "#4A3F2B",
      glow: "rgba(107,91,62,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "titan-armure-ancestrale",
        nameJp: "先祖の鎧",
        nameFr: "Armure Ancestrale",
        subtitle: "La roche du monde comme bouclier",
        rank: "A",
        classification: "Fondamentale",
        nature: "Innée",
        vecteur: "Terre",
        portee: "Soi-même",
        techniqueParente: "—",
        techniqueDerivee: "Forteresse Vivante",
        vueEnsemble: "L'Armure Ancestrale est la capacité signature des Titans. En fusionnant avec la roche environnante, le Titan enveloppe son corps d'une carapace de pierre vivante qui absorbe et redirige l'énergie des impacts reçus.",
        effets: [
          "Réduction des dégâts physiques de 70%",
          "Absorption et stockage de l'énergie cinétique des impacts",
          "Libération de l'énergie stockée sous forme d'onde de choc",
        ],
        fonctionnement: [
          "Le Titan entre en résonance avec les minéraux environnants",
          "La pierre se modèle autour de son corps en 3 secondes",
          "L'armure est vivante et s'adapte aux menaces perçues",
        ],
        faiblesses: [
          "Vitesse de déplacement réduite de 40% sous armure complète",
          "Vulnérable aux attaques énergétiques pures (non-physiques)",
          "L'armure se fragilise si le Titan est éloigné de toute source minérale",
        ],
      },
    ],
    icon: "/icone-titan.png",
    heroGif: "/race-titan.gif",
  },
  {
    id: "demons",
    name: "Démons",
    nameJp: "悪魔",
    subtitle: "Les descendants des abysses",
    description: "Les Démons sont les enfants des plans infernaux, des êtres dont l'énergie est naturellement imprégnée des forces destructrices de l'abîme. Leur puissance croît avec l'intensité de leurs émotions — la colère, la fascination, le désir — ce qui les rend aussi imprévisibles que redoutables.",
    lore: "Les Démons d'Ascension ne sont pas les créatures maléfiques des légendes populaires. Ils naissent des Rifts — des déchirures entre les plans de réalité — et possèdent leur propre civilisation structurée autour de Cliques, des organisations hiérarchiques dirigées par les plus puissants d'entre eux.",
    characteristics: [
      "Émotion amplificatrice — puissance croît avec l'intensité émotionnelle",
      "Rift-walking — capacité innée de franchir partiellement les plans",
      "Aura corruptrice — l'énergie démoniaque affaiblit les ennemis proches",
      "Résilience abyssale — régénération accélérée dans les environnements sombres",
    ],
    colors: {
      primary: "#7B2FBE",
      secondary: "#A855F7",
      bg: "rgba(123,47,190,0.08)",
      text: "#C4A8E8",
      textLight: "#4A1A7A",
      glow: "rgba(123,47,190,0.4)",
    },
    dayColors: {
      primary: "#4A1A7A",
      secondary: "#7B2FBE",
      bg: "rgba(123,47,190,0.06)",
      text: "#2D0F4A",
      glow: "rgba(74,26,122,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "demon-porte-abyssale",
        nameJp: "深淵の門",
        nameFr: "Porte Abyssale",
        subtitle: "Fracture entre les plans de réalité",
        rank: "S",
        classification: "Unique",
        nature: "Innée",
        vecteur: "Rift",
        portee: "Zone (30m)",
        techniqueParente: "—",
        techniqueDerivee: "—",
        vueEnsemble: "La Porte Abyssale est l'expression ultime du pouvoir démoniaque. Le Démon ouvre une brèche temporaire entre le plan matériel et l'Abîme, libérant une vague d'énergie corrosive qui consume tout sur son passage.",
        effets: [
          "Ouverture d'un Rift de 10m de diamètre pendant 30 secondes",
          "Vague d'énergie abyssale infligeant des dégâts continus dans la zone",
          "Invocation partielle de créatures abyssales mineures",
        ],
        fonctionnement: [
          "Le Démon canalise son émotion la plus intense comme clé d'ouverture",
          "Le tissu de la réalité se déchire en 5 secondes d'incantation",
          "L'énergie abyssale s'écoule librement tant que la Porte reste ouverte",
        ],
        faiblesses: [
          "Le Démon est vulnérable pendant les 5 secondes d'incantation",
          "La Porte peut se retourner contre son invocateur si son contrôle faiblit",
          "Coût énergétique colossal — réservé aux situations extrêmes",
        ],
      },
    ],
    icon: "/icone-demon.png",
  },
  {
    id: "vampires",
    name: "Vampires",
    nameJp: "ヴァンパイア",
    subtitle: "La noblesse du sang éternel",
    description: "Les Vampires d'Ascension sont bien plus que des buveurs de sang. Ils sont les gardiens d'un héritage sanguin millénaire, une lignée de noblesse sombre dont le pouvoir se transmet de génération en génération. Chaque goutte de sang qu'ils consomment renforce leur lien avec leurs ancêtres.",
    lore: "La Maison du Sang Radieux — le plus ancien lignage vampire — règne sur les territoires crépusculaires depuis des millénaires. Les Vampires vivent dans des cités souterraines d'une beauté gothique, où le sang coule littéralement dans les murs — un réseau de veines vivantes qui alimente leurs domaines en énergie.",
    characteristics: [
      "Hémancratie — pouvoir croît avec la pureté et l'ancienneté du sang absorbé",
      "Vitæ — énergie vitale extraite du sang, remplaçant le flux standard",
      "Domination sanguinaire — contrôle partiel des êtres ayant du sang",
      "Immortalité conditionnelle — ne meurt que par destruction du cœur vampire",
    ],
    colors: {
      primary: "#8B0000",
      secondary: "#D4AF37",
      bg: "rgba(139,0,0,0.08)",
      text: "#E8B4B8",
      textLight: "#5C0000",
      glow: "rgba(139,0,0,0.4)",
    },
    dayColors: {
      primary: "#5C0000",
      secondary: "#8B0000",
      bg: "rgba(139,0,0,0.06)",
      text: "#3D0000",
      glow: "rgba(92,0,0,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "vampire-autorite-sanguinaire",
        nameJp: "血の権威",
        nameFr: "Autorité Sanguinaire",
        subtitle: "Le commandement du sang noble",
        rank: "C",
        classification: "Acquise",
        nature: "Active",
        vecteur: "Vitæ",
        portee: "Contact (5m)",
        techniqueParente: "—",
        techniqueDerivee: "Autorité Sanguinaire — Domination Totale",
        vueEnsemble: "L'Autorité Sanguinaire est l'une des capacités les plus redoutées du lignage vampire. En imposant sa volonté via le Vitæ — l'énergie vitale extraite du sang — le Vampire peut exercer un contrôle partiel sur les êtres vivants dotés de sang.",
        effets: [
          "Immobilisation temporaire d'une cible ayant du sang (3 secondes)",
          "Perception des émotions et de l'état physique via le sang de la cible",
          "Commandement simple pouvant être imposé (reculer, s'arrêter, se baisser)",
        ],
        fonctionnement: [
          "Le Vampire projette son Vitæ vers la cible via le regard ou le contact",
          "L'énergie entre en résonance avec le sang de la cible en 0.8 secondes",
          "Un lien de contrôle se forme, permettant l'immobilisation ou le commandement",
        ],
        faiblesses: [
          "Inefficace contre les êtres sans sang (Démons de haut rang, golems)",
          "La résistance de la cible diminue l'effet (les rangs supérieurs résistent mieux)",
          "Chaque utilisation consomme une quantité significative de Vitæ",
        ],
      },
      {
        id: "vampire-cape-d-ombre",
        nameJp: "影のマント",
        nameFr: "Cape d'Ombre",
        subtitle: "Fusion avec les ténèbres",
        rank: "B",
        classification: "Fondamentale",
        nature: "Innée",
        vecteur: "Ombre",
        portee: "Soi-même",
        techniqueParente: "—",
        techniqueDerivee: "Téléportation Sombre",
        vueEnsemble: "La Cape d'Ombre permet au Vampire de se fondre dans les ombres environnantes, devenant virtuellement invisible et intangible pendant une courte durée. C'est la capacité de furtivité signature du lignage.",
        effets: [
          "Invisibilité totale dans les zones d'ombre pendant 10 secondes",
          "Intangibilité partielle — les attaques physiques traversent le corps",
          "Déplacement silencieux et sans trace",
        ],
        fonctionnement: [
          "Le Vampire absorbe les ombres environnantes dans son manteau de Vitæ",
          "Son corps se densifie en une forme ombrale semi-immatérielle",
          "L'état se maintient tant que le Vampire reste dans une zone d'ombre suffisante",
        ],
        faiblesses: [
          "Annulé par la lumière directe et intense",
          "Les attaques énergétiques restent efficaces",
          "Le Vampire ne peut pas attaquer pendant la fusion ombrale",
        ],
      },
    ],
    icon: "/icone-vampire.png",
  },
  {
    id: "dragons",
    name: "Dragons",
    nameJp: "ドラゴン",
    subtitle: "Les descendants des Primordiaux",
    description: "Les Dragons d'Ascension sont les héritiers directs des Dragons Primordiaux qui façonnèrent le monde à l'aube des temps. Bien que diminués par rapport à leurs ancêtres cosmiques, ils restent les êtres les plus puissants du monde matériel — capables de réduire des cités entières en cendres d'un seul souffle.",
    lore: "Les Dragons Primordiaux — créateurs du monde selon le Codex Cosmologique — engendrèrent les races draconiques il y a des éons. Les Dragons modernes ne sont que des échos de cette puissance originelle, mais un écho suffisamment puissant pour dominer les cieux et terroriser les nations.",
    characteristics: [
      "Souffle élémentaire — attaque devastatrice selon l'affinité (feu, glace, foudre, etc.)",
      "Écailles renforcées — armure naturelle parmi les plus résistantes",
      "Vol supersonique — vitesse en vol inégalée par toute autre race",
      "Héritage primordial — accès partiel aux mémoires des Dragons Primordiaux",
    ],
    colors: {
      primary: "#CC5500",
      secondary: "#CD7F32",
      bg: "rgba(204,85,0,0.08)",
      text: "#F0C090",
      textLight: "#8B3A00",
      glow: "rgba(204,85,0,0.4)",
    },
    dayColors: {
      primary: "#8B3A00",
      secondary: "#CC5500",
      bg: "rgba(204,85,0,0.06)",
      text: "#5C2600",
      glow: "rgba(139,58,0,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "dragon-souffle-primordial",
        nameJp: "原初の息吹",
        nameFr: "Souffle Primordial",
        subtitle: "L'héritage du créateur du monde",
        rank: "S",
        classification: "Unique",
        nature: "Innée",
        vecteur: "Élément (Feu)",
        portee: "Cône (100m)",
        techniqueParente: "—",
        techniqueDerivee: "—",
        vueEnsemble: "Le Souffle Primordial est la technique la plus destructrice accessible à un Dragon. En canalisant l'héritage de ses ancêtres Primordiaux, le Dragon libère un torrent élémentaire d'une puissance capable de réduire une forêt entière en cendres.",
        effets: [
          "Cône de flamme de 100m de portée, 30m de large à l'extrémité",
          "Température suffisante pour fondre le métal et la pierre",
          "Zone de brûlure résiduelle persistant pendant 1 minute",
        ],
        fonctionnement: [
          "Le Dragon accumule son énergie élémentaire dans sa gorge pendant 3 secondes",
          "L'énergie se mélange à son souffle physique, créant un plasma élémentaire",
          "Le souffle est libéré en un jet continu de 5 secondes",
        ],
        faiblesses: [
          "Temps de préparation de 3 secondes pendant lequel le Dragon est vulnérable",
          "Épuisement sévère après utilisation — 10 minutes de récupération minimum",
          "Directionnel — ne peut pas changer de direction une fois lancé",
        ],
      },
    ],
    icon: "/icone-dragon.png",
  },
  {
    id: "fees",
    name: "Fées",
    nameJp: "妖精",
    subtitle: "Les esprits de l'éther lumineux",
    description: "Les Fées sont les êtres les plus mystérieux et les plus insaisissables d'Ascension. Nées de la condensation de l'Énergie Potentielle pure, elles ne possèdent pas de corps matériel fixe — leur forme est une projection de leur volonté sur le tissu de la réalité.",
    lore: "Les Fées n'ont pas de civilisation au sens traditionnel. Elles existent dans les interstices entre les plans, les lieux où l'Énergie Potentielle est la plus dense. Les mortels ne les rencontrent que dans des moments de grâce — lever de lune, aube rosée, crépuscule d'orage.",
    characteristics: [
      "Immatérialité — forme changeante, pas de corps fixe",
      "Illusion majeure — manipulation de la perception et de la réalité locale",
      "Lumière éthérée — capacité de guérison et de purification",
      "Métamorphose — adaptation de la forme à toute situation",
    ],
    colors: {
      primary: "#E879A8",
      secondary: "#F0D0FF",
      bg: "rgba(232,121,168,0.08)",
      text: "#F0D0E8",
      textLight: "#9B4D6E",
      glow: "rgba(232,121,168,0.4)",
    },
    dayColors: {
      primary: "#9B4D6E",
      secondary: "#E879A8",
      bg: "rgba(232,121,168,0.06)",
      text: "#6B3550",
      glow: "rgba(155,77,110,0.3)",
    },
    ranks: RANKS,
    techniques: [
      {
        id: "fee-miroir-ethere",
        nameJp: "エーテルミラー",
        nameFr: "Miroir Éthéré",
        subtitle: "Réflexion de la réalité déformée",
        rank: "A",
        classification: "Unique",
        nature: "Innée",
        vecteur: "Éther",
        portee: "Zone (40m)",
        techniqueParente: "—",
        techniqueDerivee: "Miroir Brisé — Fragmentation",
        vueEnsemble: "Le Miroir Éthéré est la capacité de manipulation de la réalité signature des Fées. En créant une surface réfléchissante d'énergie pure, la Fée peut dupliquer, inverser ou déformer la réalité dans un rayon de 40 mètres.",
        effets: [
          "Création d'illusions parfaites indiscernables de la réalité",
          "Inversion de la gravité locale dans la zone d'effet",
          "Création de clones éthérés capables d'interagir partiellement",
        ],
        fonctionnement: [
          "La Fée condense l'énergie ambiante en une surface plane et réfléchissante",
          "En regardant dans le miroir, elle choisit quelle réalité altérer",
          "La déformation se propage depuis le miroir dans un rayon de 40m",
        ],
        faiblesses: [
          "Le miroir peut être brisé par une attaque suffisamment puissante",
          "Les effets disparaissent immédiatement si la Fée perd concentration",
          "Ne fonctionne pas dans les zones de nullité énergétique",
        ],
      },
    ],
    icon: "/icone-fee.png",
  },
];

export function getRaceById(id: string): RaceData | undefined {
  return RACE_DATA.find((r) => r.id === id);
}

export function getTechniqueByRaceAndId(raceId: string, techniqueId: string): RaceTechnique | undefined {
  const race = getRaceById(raceId);
  return race?.techniques.find((t) => t.id === techniqueId);
}