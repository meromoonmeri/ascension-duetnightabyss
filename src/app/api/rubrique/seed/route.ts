import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  // Find existing sections by slug
  const sections = await db.rubriqueSection.findMany();
  const bySlug = new Map(sections.map((s) => [s.slug, s.id]));

  const getSectionId = (slug: string) => {
    const id = bySlug.get(slug);
    if (!id) throw new Error(`Section "${slug}" not found — run section seed first`);
    return id;
  };

  // Ensure we have a competences section
  const competencesId = getSectionId('competences');
  const artefactsId = getSectionId('artefacts');
  const creaturesId = getSectionId('creatures');
  const mondeId = getSectionId('monde');

  // ─── Clean existing seed items (idempotent) ─────────────
  await db.rubriqueItem.deleteMany({
    where: {
      name: { in: [
        'Flamme Noire', 'Tsunami Abyssal', 'Pierre Éternelle', 'Tempête de Glace',
        'Souffle du Vide', 'Éruption Solaire', 'Torrent Ondine', 'Mur de Fer',
        'Siphon Élémentaire', 'Cyclone Temporel',
        'Frappe Adamantine', 'Veine de Fer', 'Cœur de Magma', 'Griffe du Gouffre', 'Forgeron Primordial',
        'Épée d\'Aurelion', 'Couronne des Abysses', 'Miroir des Âmes', 'Bague d\'Éternité', 'Lance du Crépuscule',
        'Aurelion', 'Leviathan des Abysses', 'Phénix Empyréen', 'Gardien des Brumes',
        'Royaume des Brumes', 'Sphère Éthérée', 'Plateau de l\'Aube', 'Gouffre Éternel', 'Nexus Dimensionnel',
      ]},
    },
  });

  let seeded = 0;

  // ─── 1. technique-art items (art techniques) ────────────
  const artTechSeeds = [
    {
      name: 'Flamme Noire', nameJp: '黒炎', subtitle: 'Manipulation avancée du Feu',
      rank: 'A', parentSlug: 'arts-elementaires',
      description: 'Une technique de manipulation du feu qui canalise la chaleur à son point de fusion maximal.',
      vueEnsemble: 'L\'utilisateur concentre l\'énergie potentielle dans ses paumes, générant une flamme noire capable de consumer n\'importe quelle matière.',
      metadata: { classification: 'Offensif', nature: 'Élémentaire', vecteur: 'Contact', portee: 'Moyenne', effets: ['Brûlure sévère', 'Dévoration'], faiblesses: ['Eau', 'Absorption énergétique'] },
    },
    {
      name: 'Tsunami Abyssal', nameJp: '深渊津波', subtitle: 'Manipulation avancée de l\'Eau',
      rank: 'S', parentSlug: 'arts-elementaires',
      description: 'Invoque un déferlement massif d\'eau comprimée capable de submerger des zones entières.',
      vueEnsemble: 'Technique dévastatrice qui rassemble l\'humidité ambiante en un mur d\'eau de plusieurs mètres, relâché comme un tsunami.',
      metadata: { classification: 'Offensif', nature: 'Élémentaire', vecteur: 'Ondes', portee: 'Longue', effets: ['Inondation', 'Écrasement', 'Désorientation'], faiblesses: ['Terre', 'Électricité'] },
    },
    {
      name: 'Pierre Éternelle', nameJp: '永遠の石', subtitle: 'Manipulation avancée de la Terre',
      rank: 'A', parentSlug: 'arts-elementaires',
      description: 'Crée des structures rocheuses impossibles à détruire par des moyens conventionnels.',
      vueEnsemble: 'Le manipulateur densifie les minéraux environnants jusqu\'à atteindre une dureté supra-moléculaire.',
      metadata: { classification: 'Défensif', nature: 'Élémentaire', vecteur: 'Contact', portee: 'Courte', effets: ['Barrière impénétrable', 'Stabilisation'], faiblesses: ['Son', 'Vibration'] },
    },
    {
      name: 'Tempête de Glace', nameJp: '氷嵐', subtitle: 'Manipulation avancée de l\'Air',
      rank: 'A', parentSlug: 'arts-elementaires',
      description: 'Génère une tempête de cristaux de glace dévastatrice qui lacère tout sur son passage.',
      vueEnsemble: 'Combine la manipulation de l\'air pour créer un cyclone et la précipitation de l\'humidité en micro-cristaux tranchants.',
      metadata: { classification: 'Offensif', nature: 'Hybride', vecteur: 'Zone', portee: 'Moyenne', effets: ['Lacération', 'Hypothermie', 'Réduction de visibilité'], faiblesses: ['Feu', 'Air pur'] },
    },
    {
      name: 'Souffle du Vide', nameJp: '虚空の息吹', subtitle: 'Technique spaciale interdite',
      rank: 'EX', parentSlug: 'dimension',
      description: 'Manipule l\'espace lui-même pour créer un vide absolu qui aspire tout.',
      vueEnsemble: 'L\'utilisateur déchire le tissu spatial, créant un point de singularité qui absorbe matière et énergie.',
      metadata: { classification: 'Offensif', nature: 'Dimensionnel', vecteur: 'Zone', portee: 'Variable', effets: ['Aspiration', 'Désintégration', 'Distorsion spatiale'], faiblesses: ['Stabilisateurs dimensionnels', 'Coût énergétique extrême'] },
    },
  ];

  for (let i = 0; i < artTechSeeds.length; i++) {
    const s = artTechSeeds[i];
    await db.rubriqueItem.create({
      data: {
        sectionId: competencesId,
        category: 'technique-art',
        parentSlug: s.parentSlug,
        name: s.name,
        nameJp: s.nameJp,
        subtitle: s.subtitle,
        rank: s.rank,
        description: s.description,
        vueEnsemble: s.vueEnsemble,
        metadata: JSON.stringify(s.metadata),
        order: i,
      },
    });
    seeded++;
  }

  // ─── 2. technique-racial items (race techniques) ────────
  const raceTechSeeds = [
    {
      name: 'Éruption Solaire', nameJp: '太陽爆発', subtitle: 'Technique innée Draconique',
      rank: 'S', parentSlug: 'elfe-sylvestre',
      description: 'Canalise l\'énergie vitale draconique en une déflagration solaire dévastatrice.',
      metadata: { classification: 'Offensif', nature: 'Raciale', vecteur: 'Projection', portee: 'Longue' },
    },
    {
      name: 'Torrent Ondine', nameJp: '水霊激流', subtitle: 'Technique innée Ondine',
      rank: 'A', parentSlug: 'elfe-sylvestre',
      description: 'Les Ondines génèrent un courant d\'eau pure capable de guérir ou de détruire.',
      metadata: { classification: 'Hybride', nature: 'Raciale', vecteur: 'Contact', portee: 'Moyenne' },
    },
    {
      name: 'Mur de Fer', nameJp: '鉄壁', subtitle: 'Technique innée Naine',
      rank: 'B', parentSlug: 'humains',
      description: 'Les Nains durcissent leur peau temporairement en alliage métallique naturel.',
      metadata: { classification: 'Défensif', nature: 'Raciale', vecteur: 'Soi', portee: 'Soi' },
    },
    {
      name: 'Siphon Élémentaire', nameJp: '元素吸収', subtitle: 'Technique innée Humaine',
      rank: 'A', parentSlug: 'humains',
      description: 'Les Humains peuvent temporairement absorber l\'énergie d\'un élément pour le rediriger.',
      metadata: { classification: 'Utilitaire', nature: 'Raciale', vecteur: 'Contact', portee: 'Courte' },
    },
    {
      name: 'Cyclone Temporel', nameJp: '時間旋風', subtitle: 'Technique innée Elfique',
      rank: 'SS', parentSlug: 'elfe-sylvestre',
      description: 'Les Elfes Sylvestres manipulent subtilement le flux temporel dans une zone restreinte.',
      metadata: { classification: 'Utilitaire', nature: 'Raciale', vecteur: 'Zone', portee: 'Moyenne' },
    },
  ];

  for (let i = 0; i < raceTechSeeds.length; i++) {
    const s = raceTechSeeds[i];
    await db.rubriqueItem.create({
      data: {
        sectionId: competencesId,
        category: 'technique-racial',
        parentSlug: s.parentSlug,
        name: s.name,
        nameJp: s.nameJp,
        subtitle: s.subtitle,
        rank: s.rank,
        description: s.description,
        metadata: JSON.stringify(s.metadata),
        order: i,
      },
    });
    seeded++;
  }

  // ─── 3. artefact items ─────────────────────────────────
  const artefactSeeds = [
    {
      name: 'Épée d\'Aurelion', nameJp: 'オーレリオンの剣', subtitle: 'L\'arme fondatrice du Premier Âge',
      rank: 'Mythique',
      description: 'Forgée dans le cœur d\'une étoile mourante, cette lame est le symbole du pouvoir absolu d\'Aurelion.',
      metadata: { element: 'Lumière', origin: 'Forge Stellaire', creator: 'Aurelion', rarity: 'mythic' },
    },
    {
      name: 'Couronne des Abysses', nameJp: '深淵の王冠', subtitle: 'Couronne du Seigneur des Abysses',
      rank: 'Légendaire',
      description: 'Une couronne ténébreuse qui confère le contrôle partiel sur les créatures abyssales.',
      metadata: { element: 'Ténèbres', origin: 'Abysses', creator: 'Inconnu', rarity: 'legendary' },
    },
    {
      name: 'Miroir des Âmes', nameJp: '魂の鏡', subtitle: 'Révèle la véritable essence des êtres',
      rank: 'Épique',
      description: 'Ce miroir ancien permet de voir l\'âme véritable de quiconque s\'y reflète.',
      metadata: { element: 'Neutre', origin: 'Temple du Miroir', creator: 'Prêtresse Lunara', rarity: 'epic' },
    },
    {
      name: 'Bague d\'Éternité', nameJp: '永遠の指輪', subtitle: 'Arrête temporairement le vieillissement',
      rank: 'Légendaire',
      description: 'Une bague qui, une fois activée, fige le temps pour son porteur pendant une durée limitée.',
      metadata: { element: 'Temps', origin: 'Royaume des Brumes', creator: 'Horloger Céleste', rarity: 'legendary' },
    },
    {
      name: 'Lance du Crépuscule', nameJp: '黄昏の槍', subtitle: 'Perce les barrières dimensionnelles',
      rank: 'Mythique',
      description: 'Une lance capable de percer les voiles entre les dimensions, créant des brèches temporaires.',
      metadata: { element: 'Dimension', origin: 'Nexus', creator: 'Architecte Dimensionnel', rarity: 'mythic' },
    },
  ];

  for (let i = 0; i < artefactSeeds.length; i++) {
    const s = artefactSeeds[i];
    await db.rubriqueItem.create({
      data: {
        sectionId: artefactsId,
        category: 'artefact',
        name: s.name,
        nameJp: s.nameJp,
        subtitle: s.subtitle,
        rank: s.rank,
        description: s.description,
        metadata: JSON.stringify(s.metadata),
        order: i,
      },
    });
    seeded++;
  }

  // ─── 4. creature items ─────────────────────────────────
  const creatureSeeds = [
    {
      name: 'Aurelion', nameJp: 'オーレリオン', subtitle: 'Le Dragon Primordial',
      rank: 'EX', parentSlug: 'dragon',
      description: 'L\'être le plus puissant du monde d\'Ascension. Aurelion est le premier dragon, né de la collision entre l\'Énergie Potentielle originelle et la matière primordiale.',
    },
    {
      name: 'Leviathan des Abysses', nameJp: '深淵のリヴァイアサン', subtitle: 'Gardien des profondeurs',
      rank: 'SS', parentSlug: 'serpent',
      description: 'Un serpent colossal qui habite les abysses océaniques. Sa simple présence altère les courants marins sur des milliers de kilomètres.',
    },
    {
      name: 'Phénix Empyréen', nameJp: '天国の不死鳥', subtitle: 'Oiseau de la renaissance éternelle',
      rank: 'S', parentSlug: 'oiseau',
      description: 'Créature de feu pur qui renaît de ses cendres. Ses larmes possèdent des propriétés curatives miracles.',
    },
    {
      name: 'Gardien des Brumes', nameJp: '霧の守護者', subtitle: 'Entité dimensionnelle errante',
      rank: 'S', parentSlug: 'esprit',
      description: 'Une entité composée de brume dimensionnelle qui protège les passages entre les royaumes.',
    },
  ];

  for (let i = 0; i < creatureSeeds.length; i++) {
    const s = creatureSeeds[i];
    await db.rubriqueItem.create({
      data: {
        sectionId: creaturesId,
        category: 'creature',
        parentSlug: s.parentSlug,
        name: s.name,
        nameJp: s.nameJp,
        subtitle: s.subtitle,
        rank: s.rank,
        description: s.description,
        order: i,
      },
    });
    seeded++;
  }

  // ─── 5. dimension items ────────────────────────────────
  const dimensionSeeds = [
    {
      name: 'Royaume des Brumes', nameJp: '霧の王国', subtitle: 'Dimension entre les mondes',
      description: 'Un royaume éthéré baigné de brumes perpétuelles, existant entre les plans de la réalité.',
    },
    {
      name: 'Sphère Éthérée', nameJp: 'エーテル球体', subtitle: 'Source de toute énergie potentielle',
      description: 'La dimension originelle d\'où provient toute l\'Énergie Potentielle du monde.',
    },
    {
      name: 'Plateau de l\'Aube', nameJp: '暁の台地', subtitle: 'Terre des premiers êtres',
      description: 'Un plateau flottant dans les cieux, berceau des civilisations les plus anciennes.',
    },
    {
      name: 'Gouffre Éternel', nameJp: '永遠の深淵', subtitle: 'Abysses sans fond',
      description: 'Une faille dimensionnelle d\'une profondeur insondable, abritant les créatures les plus terrifiantes.',
    },
    {
      name: 'Nexus Dimensionnel', nameJp: '次元ネクサス', subtitle: 'Point de convergence',
      description: 'Le nexus où toutes les dimensions se croisent, contrôlé par l\'Architecte Dimensionnel.',
    },
  ];

  for (let i = 0; i < dimensionSeeds.length; i++) {
    const s = dimensionSeeds[i];
    await db.rubriqueItem.create({
      data: {
        sectionId: mondeId,
        category: 'dimension',
        name: s.name,
        nameJp: s.nameJp,
        subtitle: s.subtitle,
        description: s.description,
        order: i,
      },
    });
    seeded++;
  }

  return NextResponse.json({ seeded });
}