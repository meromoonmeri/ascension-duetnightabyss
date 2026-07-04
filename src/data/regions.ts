// Ascension World Regions Data
// 8 regions of the Known World + Unknown Territories

export interface RegionData {
  id: string;
  name: string;
  nameJp: string;
  subtitle: string; // e.g. "Terres du Nord"
  color: string;
  colorRgb: string; // for rgba() usage
  // Center position as % of map image (from VLM analysis)
  cx: number;
  cy: number;
  // Approximate clickable radius as % of map width
  radius: number;
  // Lore
  description: string;
  climat: string;
  peupleDominant: string;
  descriptionPeuple: string;
}

export const REGIONS: RegionData[] = [
  {
    id: "valkyrheim",
    name: "Valkyrheim",
    nameJp: "ヴァルキュールハイム",
    subtitle: "Terres du Nord",
    color: "#7EB8D8",
    colorRgb: "126,184,216",
    cx: 50,
    cy: 14,
    radius: 14,
    description:
      "Valkyrheim s'étend sur les vastes terres boréales du monde connu, un territoire dominé par des chaînes de montagnes couronnées de glace éternelle, des forêts de conifères millénaires et des fjords spectaculaires creusés par des glaciers anciens. Les aurores boréales illuminent les nuits pendant près de six mois par an, créant un ciel de lumières dansantes que les locaux nomment le « Manteau des Valkyries ».",
    climat: "Froid polaire en altitude, tempéré froid dans les vallées protégées. Hivers longs et rigoureux (jusqu'à 8 mois), étés brefs mais lumineux avec un soleil de minuit. Précipitations abondantes sous forme de neige.",
    peupleDominant: "Valkyries",
    descriptionPeuple:
      "Les Valkyries sont un peuple de guerriers et de chasseurs adaptés aux conditions extrêmes du Nord. Leur lien avec l'énergie du froid et du vent leur confère une résistance naturelle aux basses températures et une perception accrue. Leur société est structurée en clans dirigés par des Jarls, chacun responsable d'un territoire de chasse et de défense. Les Valkyries vénèrent les esprits des ancêtres et les créatures des cieux.",
  },
  {
    id: "aurelon",
    name: "Aurelon",
    nameJp: "オーレロン",
    subtitle: "Terres de l'Ouest",
    color: "#D4AF37",
    colorRgb: "212,175,55",
    cx: 20,
    cy: 28,
    radius: 13,
    description:
      "Aurelon est un continent de collines ondulantes, de plaines dorées et de forêts de chênes centenaires. Surnommé « le Berceau des Lettres », c'est ici que furent fondées les premières académies de magie et les plus anciennes bibliothèques du monde. La Concorde Magique y établit son siège après le Jour de la Conjuration, attirée par la concentration naturelle d'Énergie Potentielle dans les sous-sols cristallins de la région.",
    climat: "Tempéré océanique. Hivers doux et pluvieux, étés chauds mais modérés par les brises maritimes. Brouillards fréquents dans les vallées basses, surtout en automne.",
    peupleDominant: "Humains (Savantins)",
    descriptionPeuple:
      "Les Savantins d'Aurelon sont réputés pour leur quête perpétuelle de savoir. Cette région abrite les plus grands érudits, alchimistes et théoriciens de l'Énergie Potentielle. La société savantine est méritocratique : le statut social dépend des accomplissements académiques et magiques plutôt que de la naissance. La Concorde Magique y exerce une influence prépondérante.",
  },
  {
    id: "grandbell",
    name: "Grandbell",
    nameJp: "グランドベル",
    subtitle: "Terres du Centre",
    color: "#3DAA6D",
    colorRgb: "61,170,109",
    cx: 45,
    cy: 37,
    radius: 14,
    description:
      "Grandbell est le cœur politique et économique du monde connu. Cette région centrale est un carrefour entre toutes les grandes nations, un territoire de plaines fertiles, de fleuves navigables et de cités prospères. Le Traité Commercial de l'Éther y fut signé il y a 200 ans, unissant 180 nations sous un système monétaire commun. La Société des Guildes y maintient son quartier général international.",
    climat: "Tempéré continental. Saisons bien marquées avec des étés chauds et des hivers froids mais supportables. Terres agricoles parmi les plus fertiles du monde grâce aux dépôts alluvionnaires des fleuves.",
    peupleDominant: "Humains (Divers)",
    descriptionPeuple:
      "Grandbell est le melting-pot du monde — toutes les races y cohabitent dans les grandes cités marchandes. C'est le siège de la Société des Guildes, de nombreuses ambassades et du commerce international d'Éther. L'Église de Solaris y possède sa plus grande cathédrale. La diversité culturelle fait de Grandbell un centre d'échange permanent, mais aussi de tensions diplomatiques.",
  },
  {
    id: "xianlun",
    name: "Xianlun",
    nameJp: "仙論",
    subtitle: "Terres de l'Est",
    color: "#3BA8A8",
    colorRgb: "59,168,168",
    cx: 66,
    cy: 30,
    radius: 12,
    description:
      "Xianlun est un territoire de montagnes escarpées, de vallées encaissées et de rizières en terrasses qui s'élèvent vers le ciel. Les monastères suspendus et les pagodes ancestrales témoignent d'une civilisation millénaire vouée à l'équilibre entre le corps, l'esprit et l'énergie. Xianlun est réputé pour ses arts martiaux canalisation de l'Énergie Potentielle à travers le ki vital.",
    climat: "Montagnard avec variations extrêmes selon l'altitude. Vallées tempérées et humides, sommets enneigés permanents. Moussons importantes en été apportant des pluies torrentielles.",
    peupleDominant: "Humains (Xianluniens)",
    descriptionPeuple:
      "Les Xianluniens sont un peuple de philosophes et de guerriers qui poursuivent la perfection à travers la discipline du corps et de l'esprit. Leurs arts martiaux fusionnent technique de combat et canalisation de l'Énergie Potentielle. Les grands monastères forment des moines-guerriers d'une puissance redoutable. La hiérarchie repose sur le mérite martial et spirituel.",
  },
  {
    id: "akatsura",
    name: "Akatsura",
    nameJp: "暁倉",
    subtitle: "Terres de l'Extrême-Est",
    color: "#C73B3B",
    colorRgb: "199,59,59",
    cx: 86,
    cy: 26,
    radius: 12,
    description:
      "Akatsura est l'archipel le plus oriental du monde connu — un ensemble d'îles volcaniques entourées de mers profondes et courants imprévisibles. Les volcans actifs forment un cercle de feu naturel, et les sources thermales jaillissent à chaque tournant. Malgré son isolement géographique, Akatsura possède une culture raffinée et une tradition martiale redoutée à travers le monde.",
    climat: "Insulaire subtropical avec influence volcanique. Étés chauds et humides, hivers doux. Typhons fréquents en fin d'été. Activité sismique constante avec des éruptions occasionnelles.",
    peupleDominant: "Humains (Akatsuriens)",
    descriptionPeuple:
      "Les Akatsuriens sont un peuple insulaire fier et isolationniste, réputé pour la netteté de leurs lames et la précision de leurs Arts. Leur société est structurée en clans familiaux (les « Maisons ») dirigés par des Daimyōs. L'Art du Sang y est pratiqué depuis des siècles, bien que sous une forme codifiée et régulée qui échappe partiellement à l'interdiction de la Concorde Magique.",
  },
  {
    id: "novarche",
    name: "Novarche",
    nameJp: "ノヴァルシュ",
    subtitle: "Terres de l'Extrême-Ouest",
    color: "#8B6DB5",
    colorRgb: "139,109,181",
    cx: 14,
    cy: 52,
    radius: 12,
    description:
      "Novarche est un territoire mystérieux et sauvage situé aux confins occidentaux du monde connu. De vastes forêts primordiales y poussent sur des ruines d'une civilisation oubliée dont les origines se perdent dans la nuit des temps. Les Marais de l'Oubli, au cœur de Novarche, sont une zone où la réalité elle-même semble se déformer — les voyageurs y rapportent des hallucinations collectives et des distorsions temporelles.",
    climat: "Tempéré humide avec microclimats instables. Brouillards permanents dans les zones de ruines. Pluies irrégulières et parfois anormales. Températures variables selon la proximité des zones de distorsion.",
    peupleDominant: "Elfes Sylvains",
    descriptionPeuple:
      "Les Elfes Sylvains de Novarche sont les gardiens des forêts primordiales et des ruines antiques. Leur longévité exceptionnelle (plusieurs siècles) leur confère une mémoire collective des événements mondiaux. Ils pratiquent une forme ancienne de magie naturelle distincte des sept Arts conventionnels, qu'ils nomment le « Chant des Racines ». La Concorde Magique les observe avec un mélange de fascination et de méfiance.",
  },
  {
    id: "zaharan",
    name: "Zaharan",
    nameJp: "ザハラン",
    subtitle: "Terres du Sud",
    color: "#C9943A",
    colorRgb: "201,148,58",
    cx: 48,
    cy: 66,
    radius: 14,
    description:
      "Zaharan est un immense territoire de déserts de sable et de cristal, d'oasis luxuriantes et de cités-caravansérails construites autour de puits artésiens profonds. Les Déserts de Cristal — vastes étendues où le sable a été vitrifié par d'anciennes cataclysmes énergétiques — sont parmi les paysages les plus spectaculaires et dangereux du monde. La chaleur est suffocante le jour, glaciale la nuit.",
    climat: "Désertique extrême. Températures diurnes dépassant 50°C, nuits proches de 0°C. Temps couvert : moins de 10 jours par an. Tempêtes de sable fréquentes, parfois assez violentes pour ensevelir une caravane entière.",
    peupleDominant: "Humains (Zaharins)",
    descriptionPeuple:
      "Les Zaharins sont un peuple de nomades, marchands et bâtisseurs adaptés aux conditions désertiques les plus extrêmes. Leur maîtrise de l'Art de la Terre leur permet de créer des structures souterraines remarquables — véritables cités enterrées protégées de la chaleur. Les grandes familles marchandes de Zaharan contrôlent les routes commerciales Sud-Nord et détiennent des monopoles sur les ressources cristallines.",
  },
  {
    id: "shantara",
    name: "Shantara",
    nameJp: "シャンタラ",
    subtitle: "Terres du Sud-Est",
    color: "#2E8B6E",
    colorRgb: "46,139,110",
    cx: 84,
    cy: 58,
    radius: 11,
    description:
      "Shantara est une péninsule tropicale couverte de jungle dense, de mangroves labyrinthiques et de cascades spectaculaires. Les ruines d'un empire oublié émergent de la végétation à demi engloutie, témoins d'une civilisation qui maîtrisait des formes d'énergie aujourd'hui perdues. Les profondeurs des jungles de Shantara recèlent des Donjons naturels parmi les plus anciens et les plus dangereux du monde.",
    climat: "Tropical humide. Chaud et humide toute l'année avec des moussons saisonnières apportant des pluies diluviennes. Canopée dense créant un microclimat sombre et humide au sol. Faune et flore extrêmement dangereuses.",
    peupleDominant: "Demis-Bêtes",
    descriptionPeuple:
      "Les Demis-Bêtes de Shantara vivent en harmonie avec la jungle tropicale, combinant instincts animaux et intelligence humaine. Leur lien naturel avec la faune et la flore leur confère des capacités de survie exceptionnelles. Organisés en tribus dirigées par les plus forts et les plus sages, ils considèrent les Donjons de leur territoire comme des lieux sacrés à protéger plutôt qu'à piller.",
  },
];

// ─── Aurelon Kingdom Data (Level 2 Zoom) ───

export interface KingdomData {
  id: string;
  name: string;
  capital?: string;
  region?: string;
  description: string;
  color: string;
  colorRgb: string;
  // Center position as % of map image
  cx: number;
  cy: number;
}

export const AURELON_KINGDOMS: KingdomData[] = [
  {
    id: "englesia",
    name: "Royaume d'Englesia",
    capital: "Carnelia",
    description: "La nouvelle monarchie savante du continent, Englesia est réputée pour ses académies de magie, ses bibliothèques royales et ses érudits. Son influence intellectuelle dépasse largement ses frontières et attire étudiants, mages et chercheurs venus de tout Aurelon.",
    color: "#5B8DEF",
    colorRgb: "91,141,239",
    cx: 16,
    cy: 24,
  },
  {
    id: "aurelion",
    name: "Royaume d'Aurelion",
    capital: "Aurelia",
    description: "Autrefois une puissance fondatrice et dominante des plaines centrales. Sa noblesse influente, ses vastes domaines agricoles et ses puissantes armées en font l'un des royaumes les plus respectés du continent.",
    color: "#D4AF37",
    colorRgb: "212,175,55",
    cx: 20,
    cy: 28,
  },
  {
    id: "valmont",
    name: "Royaume de Valmont",
    capital: "Farmus",
    description: "Terre fertile traversée par les principales routes commerciales, Valmont doit sa richesse à son agriculture, ses marchés et ses comptoirs marchands. Le royaume est reconnu pour son pragmatisme politique et ses relations économiques étendues à travers tout le continent.",
    color: "#4CAF50",
    colorRgb: "76,175,80",
    cx: 22,
    cy: 32,
  },
  {
    id: "brumel",
    name: "Royaume de Brumel",
    capital: "Port Lumière",
    description: "Réputé dans tout Aurelon pour son hospitalité, sa gastronomie raffinée et ses nombreuses auberges, Brumel est une destination privilégiée des marchands, voyageurs et aventuriers. Ses villes accueillantes, ses marchés animés et ses grandes fêtes saisonnières attirent des visiteurs venus de tous les horizons.",
    color: "#FF9800",
    colorRgb: "255,152,0",
    cx: 14,
    cy: 30,
  },
  {
    id: "castellan",
    name: "Royaume de Castellan",
    capital: "Alexandra",
    description: "Nation fortifiée dont les citadelles surveillent les principales frontières occidentales. Castellan possède une longue tradition militaire et demeure un acteur majeur dans la défense du continent contre les menaces extérieures.",
    color: "#78909C",
    colorRgb: "120,144,156",
    cx: 12,
    cy: 22,
  },
  {
    id: "rosval",
    name: "Royaume de Rosval",
    capital: "Rosenhal",
    description: "Situé entre vallées verdoyantes et forêts anciennes, Rosval est réputé pour ses artisans, ses vignobles et son raffinement culturel. Sa capitale, Rosenhal, est considérée comme l'une des plus belles cités du continent, mêlant architecture monumentale et traditions séculaires.",
    color: "#E91E63",
    colorRgb: "233,30,99",
    cx: 18,
    cy: 34,
  },
  {
    id: "albhelios",
    name: "Saint-Empire d'Albhelios",
    capital: "Solaris",
    description: "Puissante théocratie de l'Ouest, le Saint-Empire d'Albhelios est considéré comme le principal centre religieux du continent d'Aurelon. Gouverné par l'Empereur-Soleil et le Haut Clergé, l'Empire tire sa légitimité de la foi solaire qui unit ses peuples depuis des siècles. Ses vastes cathédrales, ses ordres sacrés et ses chevaliers consacrés incarnent l'autorité spirituelle de la région occidentale. Depuis sa capitale, Solaris, l'Empire exerce une influence considérable sur les affaires diplomatiques, culturelles et religieuses des royaumes voisins.",
    color: "#FFD700",
    colorRgb: "255,215,0",
    cx: 24,
    cy: 26,
  },
];

// Unknown territory fog zones (as % rectangles: x, y, w, h)
export const FOG_ZONES = [
  // Top edge
  { x: 0, y: 0, w: 100, h: 5 },
  // Bottom edge - the big unknown
  { x: 20, y: 75, w: 60, h: 25 },
  // Far left
  { x: 0, y: 0, w: 4, h: 100 },
  // Far right
  { x: 96, y: 0, w: 4, h: 100 },
  // Top-left corner
  { x: 0, y: 0, w: 8, h: 8 },
  // Top-right corner
  { x: 92, y: 0, w: 8, h: 10 },
  // Bottom-left
  { x: 0, y: 65, w: 15, h: 35 },
  // Bottom-right
  { x: 88, y: 65, w: 12, h: 35 },
];