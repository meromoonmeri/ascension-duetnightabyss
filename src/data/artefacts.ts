// Ascension Artefact Data

export interface ArtefactStat {
  label: string;
  value: number;
}

export interface ArtefactAbility {
  name: string;
  type: 'passive' | 'active';
  description: string;
}

export interface ArtefactData {
  id: string;
  name: string;
  nameJp: string;
  subtitle: string;
  description: string;
  lore: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  element: string;
  creator: string;
  origin: string;
  knownOwners: string[];
  stats: ArtefactStat[];
  abilities: ArtefactAbility[];
  conditions: string;
  evolution?: string;
  interactions?: string;
  linkedFaction?: string;
  linkedRace?: string;
  icon: string;
}

export const ARTEFACT_DATA: ArtefactData[] = [
  {
    id: 'lame-crepusculaire',
    name: 'Lame Crépusculaire',
    nameJp: '黄昏の刃',
    subtitle: 'Épée forgée dans les ombres entre les mondes',
    description: 'Une lame dont le tranchant ne coupe pas la chair mais les liens entre les plans de réalité. Forgeé lors des Guerres du Crépuscule par un forgeron dont le nom a été effacé de tous les registres.',
    lore: 'La légende raconte que cette épée fut créée à partir d\'un fragment du Dragon Primordial de la Fin. Quiconque la manie peut percevoir les fissures entre les mondes et, dit-on, les franchir.',
    rarity: 'legendary',
    element: 'Ténèbres',
    creator: 'Le Forgeron Sans Nom',
    origin: 'Novarche — Forges Oubliées',
    knownOwners: ['Kael le Voyageur', 'La Dame Grise'],
    stats: [
      { label: 'Puissance', value: 890 },
      { label: 'Vitesse', value: 720 },
      { label: 'Résistance Magique', value: 650 },
      { label: 'Potential', value: 950 },
    ],
    abilities: [
      { name: 'Fente Dimensionnelle', type: 'active', description: 'Ouvre une brèche dans l\'espace, permettant de trancher à travers n\'importe quelle barrière.' },
      { name: 'Vision des Fissures', type: 'passive', description: 'Le porteur perçoit naturellement les passages entre les plans de réalité.' },
    ],
    conditions: 'Découverte dans les profondeurs du Donjon d\'Aurelon, étage 47. Nécessite une affinité avec l\'Art du Néant.',
    evolution: 'Lame Crépusculaire → Lame de l\'Abîme (après absorption de 1000 âmes démoniaques)',
    interactions: 'Synergie avec le Miroir des Ames — les âmes absorbées par l\'épée peuvent être transférées au miroir.',
    linkedFaction: 'La Confrérie',
    icon: '🗡️',
  },
  {
    id: 'couronne-solaire',
    name: 'Couronne Solaris',
    nameJp: 'ソラリスの王冠',
    subtitle: 'Symbole absolu de l\'autorité spirituelle',
    description: 'La couronne portée par le Guide Suprême de l\'Église Solaris. Elle canalise directement la lumière du Saint Soleil et confère à son porteur une autorité spirituelle absolue sur tous les fidèles.',
    lore: 'Cet artefact n\'est pas une création humaine. Selon les textes sacrés, la couronne descendit du ciel lors du Premier Lever, forgée par la lumière elle-même. Aucun mortel n\'en connaît le métal.',
    rarity: 'mythic',
    element: 'Lumière',
    creator: 'Le Saint Soleil (entité divine)',
    origin: 'Descente céleste — Premier Jour',
    knownOwners: ['Guide Suprême Alaric III', 'Sainte Vestale Liora'],
    stats: [
      { label: 'Autorité Spirituelle', value: 1000 },
      { label: 'Puissance Lumineuse', value: 980 },
      { label: 'Résistance', value: 900 },
      { label: 'Bénédiction', value: 1000 },
    ],
    abilities: [
      { name: 'Jugement Solaire', type: 'active', description: 'Invoque un pilier de lumière céleste capable de purifier une zone entière. Les créatures démoniaques subissent des dégâts dévastateurs.' },
      { name: 'Ave Solis', type: 'passive', description: 'Tous les alliés dans un rayon de 100m reçoivent un bonus de résistance magique et de soins.' },
      { name: 'Voix du Soleil', type: 'active', description: 'La parole du porteur devient loi sacrée — les fidèles doivent obéir.' },
    ],
    conditions: 'Seul le Guide Suprême légitime peut la porter. Toute autre tentative provoque une combustion spontanée.',
    linkedFaction: 'Église Solaris',
    icon: '👑',
  },
  {
    id: 'orbe-temporel',
    name: 'Orbe Temporel',
    nameJp: '時間の珠',
    subtitle: 'Fragment cristallisé du temps lui-même',
    description: 'Une sphère de cristal dans laquelle on peut observer le passé et l\'avenir. Son utilisation intensive peut altérer le flux temporel local.',
    lore: 'Trouvé dans les Ruines de Xianlun, cet orbe serait un fragment du Dragon Primordial du Temps. Les moines de Xianlun le gardent depuis des millénaires.',
    rarity: 'epic',
    element: 'Arcane',
    creator: 'Dragon Primordial du Temps (fragment)',
    origin: 'Xianlun — Temple des Ancêtres',
    knownOwners: ['Maître Yuan', 'Chroniqueur Liang'],
    stats: [
      { label: 'Perception Temporelle', value: 780 },
      { label: 'Manipulation', value: 600 },
      { label: 'Stabilité', value: 450 },
      { label: 'Potential', value: 820 },
    ],
    abilities: [
      { name: 'Vision Chronologique', type: 'active', description: 'Permet de voir 10 secondes dans le futur immédiat.' },
      { name: 'Ralentissement', type: 'passive', description: 'Le temps autour du porteur ralentit de 20%.' },
    ],
    conditions: 'Méditation de 7 jours dans le Temple des Ancêtres. Nécessite maîtrise de l\'Art Temporel.',
    linkedFaction: 'Société des Explorateurs',
    linkedRace: 'Humains (Xianluniens)',
    icon: '🔮',
  },
  {
    id: 'ceur-dragon',
    name: 'Cœur de Dragon',
    nameJp: '竜の心臓',
    subtitle: 'Le battement éternel d\'un Primordial',
    description: 'Un organe cristallisé extrait du corps d\'un Dragon Primordial après sa mort. Il pulse encore d\'une énergie colossale capable de modifier la réalité environnante.',
    lore: 'Les Dragons Primordiaux ne meurent pas vraiment — leur essence se fragmente. Chaque fragment reste imprégné d\'une volonté propre. Un Cœur de Dragon est l\'un des fragments les plus puissants.',
    rarity: 'mythic',
    element: 'Feu',
    creator: 'Dragon Primordial du Changement',
    origin: 'Inconnu — antérieur aux civilisations',
    knownOwners: ['Empereur-Dragon Vrakath', 'Illuminata la Prophétesse'],
    stats: [
      { label: 'Énergie Vitale', value: 1000 },
      { label: 'Puissance Élémentaire', value: 990 },
      { label: 'Résistance', value: 950 },
      { label: 'Volonté', value: 1000 },
    ],
    abilities: [
      { name: 'Souffle Primordial', type: 'active', description: 'Libère une vague d\'énergie draconique détruisant tout dans un rayon de 500m.' },
      { name: 'Résilience Ancestrale', type: 'passive', description: 'Le porteur ne peut pas être tué en un seul coup. Chaque coup fatal le laisse à 1 PV.' },
      { name: 'Domination Élémentaire', type: 'passive', description: 'Tous les arts élémentaires du porteur gagnent +50% de puissance.' },
    ],
    conditions: 'On ne peut pas \"obtenir\" un Cœur de Dragon. Il se lie à un être digne par sa propre volonté.',
    interactions: 'En présence d\'un autre Cœur de Dragon, les deux artefacts entrent en résonance et libèrent leur puissance maximale.',
    linkedRace: 'Dragons',
    icon: '❤️‍🔥',
  },
  {
    id: 'grimoire-interdit',
    name: 'Grimoire Interdit',
    nameJp: '禁断の魔導書',
    subtitle: 'Connaissances que la Concorde a voulu effacer',
    description: 'Un grimoire contenant des sorts classés comme interdits par la Concorde Magique. Ses pages semblent infinies et son contenu s\'adapte au lecteur.',
    lore: 'Ce grimoire est apparu simultanément dans sept bibliothèques différentes avant d\'être saisi par la Concorde. Il a échappé à trois reprises à la destruction et a fini dans les mains de la Trias Obscuras.',
    rarity: 'legendary',
    element: 'Arcane',
    creator: 'Inconnu',
    origin: 'Apparu simultanément dans sept lieux',
    knownOwners: ['Archimage Vaelthorn', 'La Bibliothécaire'],
    stats: [
      { label: 'Savoir Arcanique', value: 920 },
      { label: 'Versatilité', value: 880 },
      { label: 'Dangerosité', value: 950 },
      { label: 'Potential', value: 900 },
    ],
    abilities: [
      { name: 'Apprentissage Instantané', type: 'passive', description: 'Le porteur peut apprendre n\'importe quel sort en le lisant une seule fois dans le grimoire.' },
      { name: 'Sort Interdit', type: 'active', description: 'Permet de lancer un sort classé interdit par la Concorde, avec des effets imprévisibles.' },
    ],
    conditions: 'Le grimoire choisit son porteur. Il ne s\'ouvre que pour ceux dont la soif de savoir dépasse la peur.',
    interactions: 'Les Veilleurs du Mana peuvent détecter sa présence à plusieurs kilomètres.',
    linkedFaction: 'Trias Obscuras',
    icon: '📖',
  },
  {
    id: 'boussole-ether',
    name: 'Boussole d\'Éther',
    nameJp: 'エーテルの羅針盤',
    subtitle: 'Pointe toujours vers la source d\'Éther la plus proche',
    description: 'Une boussole dont l\'aiguille ne pointe pas le nord mais la concentration d\'Éther la plus puissante dans un rayon de 10 kilomètres.',
    lore: 'Fabriquée par les premiers Savantins d\'Aurelon, cette boussole est devenue un outil indispensable pour les Explorateurs de rang supérieur.',
    rarity: 'rare',
    element: 'Vent',
    creator: 'Maître Artisan Brumel',
    origin: 'Aurelon — Académie de Carnelia',
    knownOwners: ['Explorateurs ★★★ et plus'],
    stats: [
      { label: 'Portée de Détection', value: 450 },
      { label: 'Précision', value: 620 },
      { label: 'Résistance Magique', value: 300 },
      { label: 'Utilité', value: 700 },
    ],
    abilities: [
      { name: 'Pulsion Éthérique', type: 'active', description: 'Émet une onde révélant les gisements d\'Éther cachés.' },
    ],
    conditions: 'Achetable auprès de la Société des Explorateurs pour 5000 Éther.',
    linkedFaction: 'Société des Explorateurs',
    icon: '🧭',
  },
  {
    id: 'masque-sanglant',
    name: 'Masque Sanglant',
    nameJp: '血の仮面',
    subtitle: 'Le pouvoir des ancêtres vampires concentré',
    description: 'Un masque en obsidienne rouge qui confère à son porteur les capacités d\'absorption vitale des Vampires anciens. Le porteur peut drainner l\'énergie vitale de ses ennemis.',
    lore: 'Ce masque aurait appartenu au premier Progéniteur Vampire. Il fut perdu pendant les Guerres du Crépuscule et retrouvé millénaires plus tard dans un donjon de Valkyrheim.',
    rarity: 'epic',
    element: 'Sang',
    creator: 'Progéniteur Vampire Inconnu',
    origin: 'Valkyrheim — Tombeaux Anciens',
    knownOwners: ['Seigneur Vampirique Drakov'],
    stats: [
      { label: 'Absorption Vitale', value: 750 },
      { label: 'Force', value: 600 },
      { label: 'Régénération', value: 800 },
      { label: 'Potential', value: 700 },
    ],
    abilities: [
      { name: 'Drain Vital', type: 'active', description: 'Absorbe 30% des dégâts infligés sous forme de points de vie.' },
      { name: 'Soif Sanguinaire', type: 'passive', description: 'Les attaques du porteur infligent des saignements pendant 5 secondes.' },
    ],
    conditions: 'Donjon de Valkyrheim, étage 23. Nécessite d\'être de race Vampire ou d\'avoir appris l\'Art du Sang.',
    linkedRace: 'Vampires',
    icon: '🎭',
  },
  {
    id: 'bague-transmutation',
    name: 'Anneau de Transmutation',
    nameJp: '変換の指輪',
    subtitle: 'Transformez la matière à volonté',
    description: 'Un anneau permettant de modifier la structure moléculaire de la matière inanimée. Les alchimistes en rêvent depuis des siècles.',
    lore: 'Cet anneau fut créé par les plus grands alchimistes de Zaharan, qui passèrent trois générations à le parfaire. Il fut volé par la Trias Obscuras et sa localisation actuelle est inconnue.',
    rarity: 'epic',
    element: 'Terre',
    creator: 'Alchimistes de Zaharan (3ème génération)',
    origin: 'Zaharan — Cité Souterraine d\'Al-Khazam',
    knownOwners: ['Grand Alchimiste Nour', 'Inconnu (volé)'],
    stats: [
      { label: 'Transmutation', value: 820 },
      { label: 'Contrôle', value: 650 },
      { label: 'Précision', value: 700 },
      { label: 'Potential', value: 780 },
    ],
    abilities: [
      { name: 'Mutation Matérielle', type: 'active', description: 'Transforme un objet en un autre de masse équivalente.' },
      { name: 'Renforcement', type: 'passive', description: 'Les matériaux manipulés par le porteur gagnent +40% de résistance.' },
    ],
    conditions: 'Quête de la Société des Explorateurs — récupérer l\'anneau et le rapporter.',
    linkedRace: 'Humains (Zaharins)',
    icon: '💍',
  },
  {
    id: 'fiole-vide',
    name: 'Fiole du Vide',
    nameJp: '虚無の小瓶',
    subtitle: 'Contient l\'absence elle-même',
    description: 'Une fiole qui semble vide mais qui contient en réalité une quantité infinie de néant. Son ouverture provoque une implosion locale.',
    lore: "La Fiole du Vide est l'un des artefacts les plus dangereux du monde. Les Archimages de la Concorde l'ont scellée sous sept verrous dimensionnels.",
    rarity: 'legendary',
    element: 'Néant',
    creator: 'Archimage Nihilus',
    origin: 'Créée lors de la Guerre des Dix Primordiaux',
    knownOwners: ['Archimage Nihilus (défunt)'],
    stats: [
      { label: 'Destruction', value: 950 },
      { label: 'Contrôle du Vide', value: 900 },
      { label: 'Instabilité', value: 980 },
      { label: 'Potential', value: 870 },
    ],
    abilities: [
      { name: 'Implosion', type: 'active', description: 'Ouvre la fiole, créant un vide partiel qui attire et détruit tout dans un rayon de 50m.' },
      { name: 'Résistance au Vide', type: 'passive', description: 'Le porteur est immunisé contre les attaques basées sur le Néant.' },
    ],
    conditions: 'Accès restreint par la Concorde Magique. Classement : Défendu. Possession = peine de mort magique.',
    linkedFaction: 'Concorde Magique',
    icon: '🫙',
  },
  {
    id: 'lanterne-esprits',
    name: 'Lanterne des Esprits',
    nameJp: '精霊の灯籠',
    subtitle: 'Guide les âmes égarées vers le repos',
    description: 'Une lanterne qui brille d\'une lumière douce et apaisante. Elle permet de voir les esprits des défunts et de communiquer avec eux.',
    lore: 'Les Elfes Sylvains de Novarche affirment que cette lanterne existe depuis avant les premières civilisations. Elle veille sur les forêts primordiales et guide les âmes perdues.',
    rarity: 'rare',
    element: 'Lumière',
    creator: 'Inconnu — antérieur aux Elfes',
    origin: 'Novarche — Cœur de la Forêt Primordiale',
    knownOwners: ['Gardienne Sylva'],
    stats: [
      { label: 'Vision Spirituelle', value: 600 },
      { label: 'Apaisement', value: 700 },
      { label: 'Communication', value: 550 },
      { label: 'Utilité', value: 650 },
    ],
    abilities: [
      { name: 'Parler aux Morts', type: 'active', description: 'Permet de communiquer avec les esprits dans un rayon de 100m pendant 5 minutes.' },
    ],
    conditions: 'Donné par les Elfes Sylvains à ceux qui prouvent leur respect pour la forêt.',
    linkedRace: 'Elfes Sylvains',
    linkedFaction: 'Société des Explorateurs',
    icon: '🏮',
  },
  {
    id: 'epee-akatsurienne',
    name: 'Épée Akatsurienne',
    nameJp: '暁倉の刀',
    subtitle: 'Lame forgée dans le feu des volcans',
    description: 'Un katana forgé selon les techniques ancestrales d\'Akatsura. Sa lame est trempée dans le magma volcanique et peut canaliser l\'Art du Sang avec une précision mortelle.',
    lore: 'Chaque clan d\'Akatsura possède sa propre lame sacrée. L\'Épée Akatsurienne est la plus ancienne d\'entre elles, forgée par le premier Daimyō lors de la fondation de l\'archipel.',
    rarity: 'rare',
    element: 'Feu',
    creator: 'Premier Daimyō Akatsura',
    origin: 'Akatsura — Montagne du Feu Éternel',
    knownOwners: ['Daimyō Kenjiro', 'Samouraï Yukimura'],
    stats: [
      { label: 'Tranchant', value: 680 },
      { label: 'Vitesse', value: 750 },
      { label: 'Affinité Sang', value: 600 },
      { label: 'Potential', value: 550 },
    ],
    abilities: [
      { name: 'Lame Incandescente', type: 'active', description: 'La lame s\'enflamme, ajoutant des dégâts de feu à chaque coup.' },
    ],
    conditions: 'Transmission héréditaire au sein du clan dirigeant d\'Akatsura.',
    linkedRace: 'Humains (Akatsuriens)',
    icon: '⚔️',
  },
  {
    id: 'carapace-titan',
    name: 'Carapace du Titan',
    nameJp: 'タイタンの甲羅',
    subtitle: 'Une armure qui pèse autant qu\'une montagne',
    description: 'Une armure complète forgée dans la carapace fossilisée d\'un Titan ancien. Elle confère une résistance physique extraordinaire au prix d\'une mobilité réduite.',
    lore: 'Les Titans ne portaient pas d\'armure — ils EN étaient l\'armure. Cette carapace est le dernier vestige d\'un Titan mort il y a des millénaires, conservée par la Royauté de Grandbell.',
    rarity: 'epic',
    element: 'Terre',
    creator: 'Titan Ancien (fossile)',
    origin: 'Grandbell — Voûte Royale',
    knownOwners: ['Général Titan Magnus', 'Champion Royal Aldric'],
    stats: [
      { label: 'Défense', value: 900 },
      { label: 'Résistance Magique', value: 500 },
      { label: 'Force', value: 700 },
      { label: 'Mobilité', value: 200 },
    ],
    abilities: [
      { name: 'Mur Invincible', type: 'active', description: 'Le porteur devient invulnérable pendant 3 secondes mais ne peut pas bouger.' },
      { name: 'Poids Titanesque', type: 'passive', description: 'Chaque pas du porteur provoque un tremblement de terre dans un rayon de 5m.' },
    ],
    conditions: 'Récompense de la Royauté de Grandbell pour services exceptionnels. Nécessite une force minimale de 800.',
    linkedFaction: 'La Royauté',
    linkedRace: 'Titans',
    icon: '🛡️',
  },
];

export function getArtefactById(id: string): ArtefactData | undefined {
  return ARTEFACT_DATA.find(a => a.id === id);
}

export function getArtefactsByRarity(rarity: string): ArtefactData[] {
  if (rarity === 'all') return ARTEFACT_DATA;
  return ARTEFACT_DATA.filter(a => a.rarity === rarity);
}
