import { db } from '../src/lib/db'

// ═══════════════════════════════════════════════════════════════
//  REALM DATA
// ═══════════════════════════════════════════════════════════════

const realms = [
  { name: 'Valkyrheim',          description: 'Terres Glacées du Nord',       type: 'connu',  dangerMoy: 3 },
  { name: 'Aurelon',             description: 'Forêt Primordiale',            type: 'connu',  dangerMoy: 2 },
  { name: 'Grandbell',           description: 'Plaines Royales',              type: 'connu',  dangerMoy: 1 },
  { name: 'Xianlun',             description: 'Montagnes Spirituelles',       type: 'connu',  dangerMoy: 3 },
  { name: 'Akatsura',            description: 'Archipel Volcanique',          type: 'connu',  dangerMoy: 4 },
  { name: 'Novarche',            description: 'Désert des Ancêtres',          type: 'connu',  dangerMoy: 2 },
  { name: 'Zaharan',             description: 'Royaume Souterrain',           type: 'caché',  dangerMoy: 5 },
  { name: 'Shantara',            description: 'Terres Interdites',            type: 'caché',  dangerMoy: 4 },
  { name: 'Abîme',               description: 'Dimension Inconnue',           type: 'caché',  dangerMoy: 5 },
  { name: 'Astra',               description: 'Dimension Parallèle',          type: 'caché',  dangerMoy: 4 },
  { name: 'Celest',              description: 'Royaume Céleste',              type: 'caché',  dangerMoy: 5 },
  { name: 'Overworld',           description: 'Monde Materiel',               type: 'connu',  dangerMoy: 1 },
  { name: 'Monde des Esprits',   description: 'Royâume des Âmes',             type: 'caché',  dangerMoy: 3 },
  { name: 'Les Enfers',          description: 'Royaume des Morts',            type: 'caché',  dangerMoy: 5 },
  { name: 'Les Limbes',          description: 'Espace Intermédiaire',         type: 'caché',  dangerMoy: 2 },
  { name: 'Les Donjons',         description: 'Sous-Espaces',                 type: 'caché',  dangerMoy: 4 },
  { name: 'Les Inconnus',        description: '????',                         type: 'caché',  dangerMoy: 5 },
]

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// ═══════════════════════════════════════════════════════════════
//  CREATURE DATA
// ═══════════════════════════════════════════════════════════════

interface CreatureSeed {
  realmSlug: string
  slug: string
  name: string
  nameJp: string
  citation: string
  dangerLevel: number
  rank: string
  classe: string
  localisation: string
  description: string
  comportement: string
  signatureShinso: string
  pouvoirs: string
  variantes: string | null
  caracteristiques: string | null
  tags: string
}

const creatures: CreatureSeed[] = [
  // ───────────────────────────────────────────────────────────
  //  CREATURE 1 — Vouyvre
  // ───────────────────────────────────────────────────────────
  {
    realmSlug: 'valkyrheim',
    slug: 'vouyvre',
    name: 'Vouyvre',
    nameJp: 'ヴイヴル',
    citation:
      "Entre ciel et mer, elle rampe, s'envole, puis retombe avec le fracas des mondes.",
    dangerLevel: 4,
    rank: 'A',
    classe: 'Serpent ailé ancestral — Avatar du Flux aquatique et tellurique',
    localisation: JSON.stringify([
      'Falaises océaniques',
      'Cavernes humides',
      'Deltas cristallins',
      'Ruines englouties',
    ]),
    description: `La Vouyvre est un serpent colossal dont l'existence borde la légende et la terreur. Son corps, long de plusieurs centaines de mètres, est couvert d'écailles d'un blanc nacré qui captent la lumière ambiante et la réfractent en arcs-en-ciel fuyants. Chaque écaille est une lentille vivante, un fragment de cristal organique pulsant au rythme des marées. Lorsqu'elle vole, ses ailes membraneuses — translucides comme des voiles de brume — s'étirent sur des centaines de mètres, projetant des ombres mouvantes sur les terres en dessous. Les marins de Valkyrheim racontent que voir son ombre est un présage de tempête, mais que survirent à la tempête ceux qui prient en regardant l'arc-en-ciel inversé qu'elle laisse dans son sillage.

Son œil unique, situé au centre d'un crâne en forme de fer de lance, brille d'un éclat saphir intense. Cet œil ne voit pas la matière : il perçoit les courants de shinso, les flux d'énergie qui traversent le monde comme des rivières invisibles. On dit qu'une Vouyvre peut sentir une pensée troublée à des lieues de distance, et que les créatures prises dans son regard perdent le sens de la direction, hypnotisées par la profondeur liquide de sa pupille. Son regard est à la fois sa arme la plus subtile et sa plus grande vulnérabilité : l'œil est le siège de son Cœur-Larme, le joyau cristallin qui abrite son essence.

La Vouyvre ne chasse pas les mortels — elle n'en a que faire. Elle se nourrit des courants d'énergie potentielle qui s'accumulent dans les zones de convergence des flux, les mêmes endroits où les ruines anciennes émergent des profondeurs. Sa présence provoque des distorsions climatiques involontaires : pluies torrentielles, brumes épaisses, cyclones naissants. Les guildes d'explorateurs la classent au rang A non pas pour sa férocité, mais pour la dévastation collatérale de son simple passage. Un seul battement d'aile peut déclencher un raz-de-marée. Un seul souffle peut engloutir une vallée sous la brume.`,
    comportement: `La Vouyvre est profondément solitaire. Elle ne tolère aucune autre créature dans un rayon de plusieurs lieues autour de son lieu de repos, et les rares tentatives d'approche se soldent par des manifestations climatiques violentes — non pas de l'agressivité, mais de l'anxiété. Elle ne construit pas de nid ; elle s'enroule dans les cavités naturelles des falaises ou au fond de fosses marines, son corps formant un cercle protecteur autour de son Cœur-Larme. Les observations suggèrent qu'elle entre dans des périodes de léthargie pouvant durer des décennies, durant lesquelles son corps cristallise partiellement et fusionne avec la roche environnante. À son réveil, le premier souffle déclenche toujours une tempête.`,
    signatureShinso: `Flux dominant : Eau / Vent / Éclat
Résonance : fluide, tourbillonnaire, réverbérante
Effets : distorsion du climat local, création de cyclones, fusion partielle entre air et eau

Son énergie potentiel se manifeste par un halo spiralé visible autour de son corps, un anneau de lumière liquide vibrant comme la surface d'un lac.`,
    pouvoirs: JSON.stringify([
      {
        name: 'Souffle de la Marée Céleste',
        description:
          "Un torrent d'eau pure et de vent comprimé, créant un impact qui peut retourner un navire.",
      },
      {
        name: 'Appel du Flux',
        description:
          'Invoque les courants d\'énergie potentiel pour altérer les marées, la pluie ou la brume sur des lieues.',
      },
      {
        name: 'Mue du Ciel',
        description:
          'La Vouyvre peut fondre son corps dans les nuages, devenant intangible et foudroyante.',
      },
      {
        name: "Regard de l'Abîme",
        description:
          "Son œil perçoit les émotions comme des vagues ; une créature observée sent ses pensées se déformer.",
      },
    ]),
    variantes: JSON.stringify([
      {
        name: "Vouyvre d'Abysses",
        citation: 'Ses ailes sont les ombres du soleil.',
        description:
          "Née dans les fosses marines, elle a perdu la lumière de son joyau et manipule les courants de gravité.",
        flux: 'Eau / Ténèbres',
        pouvoirs: ['Implosion liquide', 'Camouflage total', 'Asphyxie magique'],
      },
      {
        name: 'Vouyvre des Cimes',
        citation:
          'Son cri déclenche les tempêtes, mais son souffle rend la pluie fertile.',
        description:
          "Habitante des montagnes, son joyau pulse d'un bleu pâle. Elle contrôle la brume et les éclairs.",
        flux: 'Air / Lumière',
        pouvoirs: [
          'Tornades contrôlées',
          'Respiration de flux régénérant',
          'Éclairs bénis',
        ],
      },
    ]),
    caracteristiques: JSON.stringify({
      taille: '80 à 240 mètres de long',
      poids: 'Variable selon l\'humidité (3-10 tonnes)',
      presence:
        'Arc-en-ciel inversé dans les nuages, bruissement d\'ailes dans la mer',
      approche: 'Impossible',
      particularite: 'Son Cœur-Larme se reforme après sa mort',
    }),
    tags: JSON.stringify(['reptilien', 'eau', 'vent', 'vol', 'ancien']),
  },

  // ───────────────────────────────────────────────────────────
  //  CREATURE 2 — Golem de Cendre
  // ───────────────────────────────────────────────────────────
  {
    realmSlug: 'akatsura',
    slug: 'golem-de-cendre',
    name: 'Golem de Cendre',
    nameJp: '灰のゴーレム',
    citation: 'Né du magma, il marche sans but, et chaque pas laisse une cicatrice de verre.',
    dangerLevel: 3,
    rank: 'B',
    classe: 'Construct volcanique',
    localisation: JSON.stringify([
      'Flancs des volcans actifs',
      'Couées de lave refroidie',
      'Grottes de basalte',
    ]),
    description: `Le Golem de Cendre est un construct animé par le shinso résiduel des éruptions volcaniques d'Akatsura. Son corps, haut de quatre à six mètres, est un amas compact de cendres soudées par la chaleur et la pression magique, formant une silhouette vaguement humanoïde. Des fissures incandescentes parcourent sa surface, laissant échapper un filet constant de fumée et de braises. Ses yeux sont deux cratères miniatures d'où jaillit une lueur orangée pulsante, et ses poings, larges comme des tonneaux, frappent le sol avec une force sismique capable de fendre les routes de pierre.

Il ne possède aucune conscience propre — il obéit aux impulsions géothermiques du terrain. Lorsqu'un volcan entre en agitation, les golems émergent des coulées et patrouillent les flancs de la montagne, détruisant tout ce qui obstrue les cheminées magiques. Ils sont incapables de discernement : un village, une caravane ou un rocher reçoivent le même traitement. Les insulaires d'Akatsura ont appris à lire les signes précurseurs — tremblements de terre localisés, odeur de soufre anormale — pour évacuer avant l'émergence.`,
    comportement: `Entièrement dépourvu de volonté propre, le Golem de Cendre agit comme un automate géologique. Il ne dort ni ne se repose ; lorsque son énergie interne s'épuise, il s'immobilise et se fige en une statue de basalte jusqu'à la prochaine éruption. Il ne réagit pas à la douleur ni à la peur, mais il attaque tout ce qui approche à moins de vingt mètres pendant ses périodes d'activité.`,
    signatureShinso: `Flux dominant : Feu / Terre
Résonance : sourde, tectonique, explosive
Effets : fissuration du sol, projection de cendres brûlantes, augmentation locale de la température

Son énergie se manifeste par des fissures lumineuses sur sa carapace et un nuage de cendres persistant.`,
    pouvoirs: JSON.stringify([
      {
        name: 'Impact Sismique',
        description:
          'Un coup de poing au sol qui provoque une onde de choc fissurant la terre sur un rayon de trente mètres.',
      },
      {
        name: 'Nuage de Cendres',
        description:
          'Libère un nuage toxique de cendres volcaniques qui aveugle et brûle les voies respiratoires dans un large périmètre.',
      },
    ]),
    variantes: null,
    caracteristiques: JSON.stringify({
      taille: '4 à 6 mètres',
      poids: '15 à 25 tonnes',
      presence: 'Tremblements sourds, odeur de soufre, fissures incandescentes au sol',
      approche: 'Possible en périodes de repos — extrêmement dangereux en activité',
      particularite: "S'immobilise en statue de basalte quand son énergie s'épuise",
    }),
    tags: JSON.stringify(['construct', 'feu', 'terre', 'volcanique']),
  },

  // ───────────────────────────────────────────────────────────
  //  CREATURE 3 — Spectre de l'Aube
  // ───────────────────────────────────────────────────────────
  {
    realmSlug: 'monde-des-esprits',
    slug: 'spectre-de-l-aube',
    name: 'Spectre de l\'Aube',
    nameJp: '夜明けの亡霊',
    citation: 'Il apparaît quand le dernier éclat de nuit cède à l\'aube — et emporte avec lui ceux qui regardent trop longtemps.',
    dangerLevel: 5,
    rank: 'S',
    classe: 'Entité spirituelle ancestrale',
    localisation: JSON.stringify([
      'Frontière entre Monde des Esprits et Overworld',
      'Lieux de mort violente',
      'Ruines de temples anciens',
      'Carrefours dimensionnels',
    ]),
    description: `Le Spectre de l'Aube est l'une des entités les plus redoutées du Monde des Esprits, non pas pour sa puissance brute — bien qu'elle soit considérable — mais pour son absolue inviolabilité. Il n'a pas de corps matériel. Il existe comme une déchirure dans le tissu de la réalité, une silhouette humaine dont les contours sont formés de lumière du matin filtrant à travers un voile de brume spectrale. Ses traits sont indistincts, toujours à la lisière de la reconnaissance, comme le visage d'un souvenir qu'on n'arrive pas à saisir. Ceux qui l'ont observé de près décrivent un sentiment d'extase et de terreur mêlées, comme si l'entité émanait simultanément la promesse du repos éternel et la menace de l'oubli total.

Le Spectre n'attaque pas au sens conventionnel. Il apparaît à l'aube, dans les instants où la nuit se dissout, et son simple regard provoque ce que les chamans nomment "l'Éveil Blanc" — un état de conscience altéré où le corps du spectateur commence à se dématérialiser, ses molécules se dispersant dans les flux de shinso ambiant. Le processus est indolore, lent et irréversible. Les victimes ne meurent pas ; elles se dissolvent, devenant elles-mêmes des esprits errants, souvent incapables de comprendre ce qui leur est arrivé. En quelques minutes, un être vivant peut être réduit à une silhouette translucide, puis à un murmure, puis à rien.

Les guildes de chasseurs classent le Spectre au rang S en raison de sa nature intangible — les armes physiques le traversent sans effet, et la plupart des sorts de protection spirituelle ne font que ralentir légèrement son influence. Seuls les artefacts capables de manipuler les flux dimensionnels ou de solidifier l'éther ont quelque espoir de repousser son regard. Les rares récits de survie mentionnent tous un détail commun : les survivants ont fermé les yeux et chanté jusqu'au lever complet du soleil.`,
    comportement: `Le Spectre de l'Aube ne montre aucune intentionnalité malveillante — il semble obéir à un cycle cosmique, apparaissant invariablement à l'aube et disparaissant lorsque le soleil est entièrement levé. Il ne poursuit pas ses cibles ; il se contente d'être là, et son existence même est le danger. Les esprits du Monde des Esprits le contournent avec une déférence craintive, ce qui suggère qu'il occupe une place singulière dans la hiérarchie invisible de ce royaume. On ne lui connaît aucun lieu de repos ni aucune forme de communication.`,
    signatureShinso: `Flux dominant : Lumière / Esprit / Vide
Résonance : éthérée, silencieuse, dissolvante
Effets : dématérialisation progressive des entités physiques, altération de la perception du temps, annulation partielle des barrières dimensionnelles

Son énergie se manifeste par une aura pâle qui brouille les contours de tout ce qu'elle touche.`,
    pouvoirs: JSON.stringify([
      {
        name: 'Regard de l\'Éveil Blanc',
        description:
          'Le regard du Spectre déclenche la dématérialisation progressive de toute créature vivante dans son champ de vision.',
      },
      {
        name: 'Voile de l\'Aube',
        description:
          'Enveloppe une zone dans une brume spectrale qui neutralise les sorts de protection et les barrières physiques.',
      },
      {
        name: 'Appel du Repost',
        description:
          'Un murmure inaudible qui plonge les esprits vulnérables dans un sommeil dont ils ne se réveillent qu\'en tant qu\'esprits.',
      },
    ]),
    variantes: null,
    caracteristiques: JSON.stringify({
      taille: 'Variable — silhouette humaine de 1,80 m à plusieurs dizaines de mètres',
      poids: 'Nul — entité immatérielle',
      presence: 'Lueur pâle à l\'aube, brouillage visuel, sensation de vertige et d\'extase',
      approche: 'Strictement déconseillée',
      particularite: 'Disparaît automatiquement au lever complet du soleil',
    }),
    tags: JSON.stringify(['esprit', 'lumière', 'vide', 'intangible', 'ancestral']),
  },
]

// ═══════════════════════════════════════════════════════════════
//  OBJECT DATA
// ═══════════════════════════════════════════════════════════════

const objets = [
  {
    name: 'Épée du Crépuscule',
    slug: 'epee-du-crepuscule',
    description:
      "Forgée dans les derniers rayons d'un soleil mourant, cette lame absorbe la lumière ambiante pour renforcer chaque coup. Son tranchant ne s'émousse jamais, mais elle affaiblit progressivement la vue de son porteur au fil des combats.",
    rank: 'A',
    type: 'Arme',
    effets: JSON.stringify([
      'Absorbe la lumière ambiante pour augmenter les dégâts de 30%',
      'Réduit la perception visuelle du porteur de 10% par heure d\'utilisation',
      'Émet une lueur crépusculaire dans un rayon de 5 mètres',
    ]),
    tags: JSON.stringify(['arme', 'lumière', 'légendaire']),
  },
  {
    name: 'Armure de l\'Abyssal',
    slug: 'armure-de-l-abyssal',
    description:
      "Couverte d'écailles fossilisées prélevées dans les profondeurs océaniques de Zaharan, cette armure confère une résistance quasi absolue contre la magie élémentaire. Cependant, son porteur ressent constamment la pression des abysses, ce qui altère lentement son esprit.",
    rank: 'S',
    type: 'Armure',
    effets: JSON.stringify([
      'Résistance magique élémentaire augmentée de 80%',
      'Résistance physique augmentée de 40%',
      'Confère la capacité de respirer sous l\'eau pendant 1 heure',
      'Provoque des hallucinations aquatiques après 6 heures de port continu',
    ]),
    tags: JSON.stringify(['armure', 'eau', 'abyssal', 'artéfact ancien']),
  },
  {
    name: 'Potion de Renaissance',
    slug: 'potion-de-renaissance',
    description:
      "Un élixir d'un rouge profond, brassé à partir de la sève du Cœur-Larme cristallisé. Elle restaure les blessures mortelles et redonne un souffle de vie, mais ne peut être utilisée qu'une seule fois par individu — le corps développe ensuite une immunité permanente.",
    rank: 'C',
    type: 'Potion',
    effets: JSON.stringify([
      'Restaure intégralement les points de vie, même depuis zéro',
      'Soigne les altérations d\'état et les maléfices mineurs',
      'Usage unique par individu — immunité permanente après la première utilisation',
    ]),
    tags: JSON.stringify(['potion', 'soin', 'consommable', 'limité']),
  },
  {
    name: 'Cœur-Larme d\'Éther',
    slug: 'coeur-larme-d-ether',
    description:
      "Un cristal vivant pulsant d'une lumière intérieure, considéré comme le joyau le plus pur de flux shinso jamais découvert. On raconte qu'il est le fragment d'une entité primordiale tombée lors de la première Convergence. Le tenir entre ses mains suffit à ressentir le battement d'un cœur cosmique.",
    rank: 'SS',
    type: 'Artefact',
    effets: JSON.stringify([
      'Amplifie tous les flux shinso du porteur de 200%',
      'Permet de percevoir les realms cachés dans un rayon de 10 lieues',
      'Peut ouvrir temporairement des brèches dimensionnelles',
      'Attire invariablement les créatures de rang S et au-delà',
      'Non échangeable — se lie irrévocablement au premier porteur',
    ]),
    tags: JSON.stringify(['artéfact', 'cristal', 'primordial', 'dimensionnel', 'unique']),
  },
  {
    name: 'Éclat de Novarche',
    slug: 'eclat-de-novarche',
    description:
      "Un fragment de roche désertique imprégné de shinso ancien, trouvé dans les profondeurs des dunes de Novarche. Modeste en apparence, il possède la propriété de purifier l'eau et de repousser les créatures souterraines. Les nomades le portent comme amulette de chance.",
    rank: 'D',
    type: 'Matériau',
    effets: JSON.stringify([
      'Purifie l\'eau contaminée dans un rayon de 2 mètres',
      'Repousse les créatures de rang D et inférieur dans un rayon de 5 mètres',
      'Peut être fondu avec des métaux pour créer des alliages résistants à la corrosion',
    ]),
    tags: JSON.stringify(['matériau', 'terre', 'purification', 'commun']),
  },
]

// ═══════════════════════════════════════════════════════════════
//  MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('════════════════════════════════════════════')
  console.log('  SEED BESTIARY — Realms, Creatures, Objects')
  console.log('════════════════════════════════════════════\n')

  // Helper: filter out records whose unique field already exists (SQLite-safe dedup)
  async function getExistingSlugs(model: 'realm' | 'creature' | 'objet', field: string, slugs: string[]) {
    const rows = await (db[model] as any).findMany({
      where: { [field]: { in: slugs } },
      select: { [field]: true },
    })
    return new Set(rows.map((r: any) => r[field]))
  }

  // ─── 1. Seed Realms ───────────────────────────────────────
  console.log(`[1/3] Seeding ${realms.length} realms...`)

  const realmSlugs = realms.map((r) => slugify(r.name))
  const existingRealmSlugs = await getExistingSlugs('realm', 'slug', realmSlugs)
  const newRealms = realms.filter((r) => !existingRealmSlugs.has(slugify(r.name)))

  if (newRealms.length > 0) {
    await db.realm.createMany({
      data: newRealms.map((r) => ({
        name: r.name,
        description: r.description,
        type: r.type,
        dangerMoy: r.dangerMoy,
        slug: slugify(r.name),
        imageUrl: null,
      })),
    })
    console.log(`   ✅ Inserted ${newRealms.length} new realms (skipped ${existingRealmSlugs.size} existing).\n`)
  } else {
    console.log(`   ⏭️  All ${realms.length} realms already exist — skipped.\n`)
  }

  // ─── 2. Seed Creatures (need realm IDs) ──────────────────
  console.log(`[2/3] Seeding ${creatures.length} creatures...`)

  // Look up all required realm IDs by slug
  const creatureRealmSlugs = [...new Set(creatures.map((c) => c.realmSlug))]
  const realmRecords = await db.realm.findMany({
    where: { slug: { in: creatureRealmSlugs } },
    select: { id: true, slug: true },
  })

  const realmMap = new Map(realmRecords.map((r) => [r.slug, r.id]))

  // Verify all required realms exist
  for (const slug of creatureRealmSlugs) {
    if (!realmMap.has(slug)) {
      throw new Error(`Realm with slug "${slug}" not found in database. Cannot seed creature.`)
    }
  }

  const creatureSlugs = creatures.map((c) => c.slug)
  const existingCreatureSlugs = await getExistingSlugs('creature', 'slug', creatureSlugs)
  const newCreatures = creatures.filter((c) => !existingCreatureSlugs.has(c.slug))

  if (newCreatures.length > 0) {
    await db.creature.createMany({
      data: newCreatures.map((c) => ({
        name: c.name,
        nameJp: c.nameJp,
        slug: c.slug,
        citation: c.citation,
        dangerLevel: c.dangerLevel,
        rank: c.rank,
        classe: c.classe,
        localisation: c.localisation,
        description: c.description,
        comportement: c.comportement,
        signatureShinso: c.signatureShinso,
        pouvoirs: c.pouvoirs,
        variantes: c.variantes,
        caracteristiques: c.caracteristiques,
        tags: c.tags,
        realmId: realmMap.get(c.realmSlug)!,
        imageUrl: null,
        source: 'ASCENSION',
      })),
    })
    console.log(`   ✅ Inserted ${newCreatures.length} new creatures (skipped ${existingCreatureSlugs.size} existing).\n`)
  } else {
    console.log(`   ⏭️  All ${creatures.length} creatures already exist — skipped.\n`)
  }

  // ─── 3. Seed Objects ──────────────────────────────────────
  console.log(`[3/3] Seeding ${objets.length} objects...`)

  const objetSlugs = objets.map((o) => o.slug)
  const existingObjetSlugs = await getExistingSlugs('objet', 'slug', objetSlugs)
  const newObjets = objets.filter((o) => !existingObjetSlugs.has(o.slug))

  if (newObjets.length > 0) {
    await db.objet.createMany({
      data: newObjets.map((o) => ({
        name: o.name,
        slug: o.slug,
        description: o.description,
        rank: o.rank,
        type: o.type,
        effets: o.effets,
        tags: o.tags,
        imageUrl: null,
        source: 'ASCENSION',
      })),
    })
    console.log(`   ✅ Inserted ${newObjets.length} new objects (skipped ${existingObjetSlugs.size} existing).\n`)
  } else {
    console.log(`   ⏭️  All ${objets.length} objects already exist — skipped.\n`)
  }

  // ─── Summary ──────────────────────────────────────────────
  console.log('════════════════════════════════════════════')
  console.log('  SEED COMPLETE')
  console.log('════════════════════════════════════════════')

  const totalRealms = await db.realm.count()
  const totalCreatures = await db.creature.count()
  const totalObjets = await db.objet.count()

  console.log(`   Realms:    ${totalRealms}`)
  console.log(`   Creatures: ${totalCreatures}`)
  console.log(`   Objects:   ${totalObjets}`)
  console.log('════════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })