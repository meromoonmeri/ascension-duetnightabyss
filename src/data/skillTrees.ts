/**
 * Skill Tree Data Schema — Ascension ノミステリ RP
 *
 * DESIGN DECISIONS:
 * - Vertical tree (not radial): matches rank hierarchy naturally (F bottom → EX top),
 *   variant branches split left/right, convergence is a clear visual junction.
 *   Justification: text-heavy nodes with descriptions don't fit radial layouts;
 *   vertical is more responsive; matches Path of Exile / Genshin style trees.
 * - Flexible variants: each race defines its own variant count and convergence rank.
 *   No forced identical structure across races.
 * - Content-agnostic: all narrative text comes from source docx files.
 *   When the 8 Ascension_[RACE].docx files are uploaded, their content replaces
 *   the placeholder data.
 */

/* ── Core Types ── */

export type RankTier = "F" | "E" | "D" | "C" | "B" | "A" | "S" | "S+" | "EX";

export const RANK_ORDER: RankTier[] = ["F", "E", "D", "C", "B", "A", "S", "S+", "EX"];

export interface Variant {
  id: string;
  name: string;
  nameJp: string;
  description: string;
  /** Slight hue shift from race primary — hex or hsl */
  accentColor: string;
  /** The rank where this variant branch diverges (typically E) */
  branchStartRank: RankTier;
}

export interface Ability {
  id: string;
  name: string;
  nameJp?: string;
  subtitle?: string;
  /** Short description shown in tree node */
  summary: string;
  /** Full FlashStep-format data — links to existing RaceTechnique if applicable */
  techniqueId?: string;
  category: "Innée" | "Acquise" | "Extra" | "Unique";
  type: "active" | "passive" | "ultimate";
}

export interface SkillTreeRank {
  rank: RankTier;
  /** Display title for this rank (e.g. "Éveil de l'Essence") */
  title: string;
  /** Narrative introduction — from docx */
  narrative: string;
  /** The fundamental ability common to ALL variants at this rank */
  fundamental: Ability;
  /** Per-variant abilities. Empty array for races with no variants. */
  variantAbilities: {
    variantId: string;
    abilities: Ability[];
  }[];
  /**
   * Unique abilities unlocked at this rank.
   * Typically starts appearing at C rank. Each entry includes aspect count.
   */
  uniqueAbilities?: {
    ability: Ability;
    /** Number of active aspects at this rank */
    aspectCount: number;
  }[];
  /**
   * Tier evolution technique with narrative prerequisites.
   * Shown as a special node in the tree.
   */
  evolution?: {
    name: string;
    nameJp?: string;
    description: string;
    prerequisites: string;
    techniqueId?: string;
  };
  /** If true, this rank is the convergence point where all variants rejoin */
  isConvergence?: boolean;
}

export interface SkillTree {
  raceId: string;
  /** Name shown in the tree header */
  raceName: string;
  raceNameJp: string;
  /** The variants for this race. Empty array = no variants (e.g. Humans). */
  variants: Variant[];
  /** The rank where variants converge back (e.g. "B"). null if no variants. */
  convergenceRank: RankTier | null;
  /** Ordered ranks: F through EX */
  ranks: SkillTreeRank[];
}

/* ── Bestiary Types ── */

export type BestiaryCategory =
  | "Race Jouable"
  | "Créature"
  | "Entité Cosmique"
  | "Esprit"
  | "Monstre de Donjon"
  | "Légende";

export type ThreatRank = "F" | "E" | "D" | "C" | "B" | "A" | "S" | "S+" | "EX" | "??";

export interface BestiaryEntry {
  id: string;
  name: string;
  nameJp?: string;
  category: BestiaryCategory;
  /** Link to race id if this is a playable race */
  raceId?: string;
  /** Link to geography region id if applicable */
  regionId?: string;
  /** Threat rank for creatures, null for playable races */
  threatRank: ThreatRank | null;
  /** Short classification tag (e.g. "Mammifère Ludique", "Primordial Ignis") */
  classification: string;
  /** Main description narrative */
  description: string;
  /** Notable abilities / variant summary */
  abilities: string[];
  /** AI image generation prompt (anime/manga shonen premium style) */
  portraitPrompt: string;
  /** URL of generated/admin-uploaded portrait */
  portraitUrl?: string;
  /** True if admin manually uploaded a custom portrait */
  customPortrait?: boolean;
}

/* ── Skill Tree Data — 8 Races ── */

export const SKILL_TREES: SkillTree[] = [
  // ═══════════════════════════════════════════════════
  //  HUMAINS — No variants (plasticité énergétique)
  // ═══════════════════════════════════════════════════
  {
    raceId: "humains",
    raceName: "Humains",
    raceNameJp: "人間",
    variants: [],
    convergenceRank: null,
    ranks: [
      {
        rank: "F", title: "Éveil Adaptatif", narrative: "Le premier contact avec l'Énergie Potentielle révèle la nature fondamentalement malléable de l'essence humaine. Contrairement aux autres races dont le canal énergétique est prédéterminé, l'Humain découvre que son flux peut se modeler — une première intuition de la plasticité qui deviendra sa plus grande force.",
        fundamental: { id: "h-f-fund", name: "Sensibilité Énergétique", summary: "Perception des flux d'Énergie Potentielle ambiante, première étape vers toute maîtrise.", category: "Innée", type: "passive" },
        variantAbilities: [],
      },
      {
        rank: "E", title: "Canalisation Première", narrative: "L'Humain apprend à puiser dans le flux ambiant et à le diriger à travers son corps. Cette canalisation rudimentaire est le fondement de toutes les techniques ultérieures — et elle est déjà plus versatile que celle de bien des races plus spécialisées.",
        fundamental: { id: "h-e-fund", name: "Canal Basique", nameJp: "基礎チャンネル", summary: "Première capacité de diriger un flux énergétique continu à travers les membres.", category: "Acquise", type: "active" },
        variantAbilities: [],
      },
      {
        rank: "D", title: "Mimétisme Énergétique", narrative: "Le trait distinctif de la race se manifeste : l'Humain est capable d'observer et de reproduire partiellement les mécanismes énergétiques d'autres races. Ce mimétisme n'est pas encore puissant, mais il ouvre une voie que personne d'autre ne peut emprunter.",
        fundamental: { id: "h-d-fund", name: "Copie de Flux", summary: "Peut reproduire un effet énergétique observé, avec une efficacité réduite de 40%.", category: "Acquise", type: "active" },
        variantAbilities: [],
      },
      {
        rank: "C", title: "Fusion Adaptative", narrative: "Le seuil de la véritable adaptation est franchi. L'Humain ne se contente plus de copier — il fusionne les mécanismes empruntés à d'autres races avec sa propre essence, créant des hybrides énergétiques uniques. C'est à ce rang qu'apparaît la première Compétence Unique.",
        fundamental: { id: "h-c-fund", name: "FlashStep", nameJp: "フラッシュステップ", summary: "Déplacement éclair adaptatif exploitant la plasticité énergétique humaine.", techniqueId: "humain-flashstep", category: "Acquise", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "h-c-uniq", name: "Compétence Unique — Naissance", summary: "La Loi personnelle du personnage émerge. Premier aspect actif.", category: "Unique", type: "passive" }, aspectCount: 1 }],
      },
      {
        rank: "B", title: "Synthèse Avancée", narrative: "La capacité de fusion atteint un niveau où l'Humain peut combiner des mécanismes de trois races différentes dans une seule technique. Les érudits de la Concorde Magique considèrent ce rang comme le point où l'Humain dépasse théoriquement toute limite raciale connue.",
        fundamental: { id: "h-b-fund", name: "Perception Augmentée", summary: "Sens aiguisés de l'adaptateur — perception énergétique à 360°.", techniqueId: "humain-perception-augmentee", category: "Acquise", type: "passive" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "h-b-uniq", name: "Compétence Unique — Expansion", summary: "Deuxième aspect de la Loi personnelle activé.", category: "Unique", type: "passive" }, aspectCount: 2 }],
        evolution: { name: "Éveil de l'Adaptateur", nameJp: "適応者の覚醒", description: "L'Humain transcende sa nature de base et devient un véritable Adaptateur — un être dont le potentiel n'a théoriquement pas de plafond.", prerequisites: "Maîtrise d'au moins deux mécanismes raciaux étrangers + Compétence Unique à 2 aspects" },
      },
      {
        rank: "A", title: "Résolution d'Essence", narrative: "Au rang A, l'essence humaine se résout — elle atteint une stabilité qui permet des capacités normalement réservées aux races les plus puissantes. L'Adaptateur peut maintenant créer des techniques entièrement originales en fusionnant des principes que la nature elle-même n'avait jamais combinés.",
        fundamental: { id: "h-a-fund", name: "Résolution Énergétique", summary: "L'essence se stabilise, permettant des techniques de puissance raciale supérieure.", category: "Extra", type: "passive" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "h-a-uniq", name: "Compétence Unique — Troisième Voie", summary: "Troisième aspect activé. L'Ultimate devient accessible.", category: "Unique", type: "ultimate" }, aspectCount: 3 }],
      },
      {
        rank: "S", title: "Transcendance Humaine", narrative: "Le paradoxe de l'Humanité se résout : c'est précisément l'absence de limites inhérentes qui devient la plus grande force. L'Adaptateur au rang S possède un arsenal énergétique d'une diversité inégalée — chaque technique empruntée perfectionnée au-delà de ce que sa race d'origine aurait permis.",
        fundamental: { id: "h-s-fund", name: "Assimilation Totale", summary: "Peut assimiler et perfectionner tout mécanisme énergétique observé sans perte d'efficacité.", category: "Extra", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "h-s-uniq", name: "Compétence Unique — Quatrième Aspect", summary: "Quatrième aspect activé. La Loi personnelle atteint sa maturité.", category: "Unique", type: "active" }, aspectCount: 4 }],
      },
      {
        rank: "S+", title: "Briseur de Limites", narrative: "Le mythe devient réalité : l'Adaptateur franchit la barrière théorique au-delà de laquelle aucune race ne devrait pouvoir aller. Les lois de l'Énergie Potentielle se plient légèrement autour de lui, comme si le monde lui-même reconnaissait son statut d'exception.",
        fundamental: { id: "h-sp-fund", name: "Distortion Adaptative", summary: "Peut temporairement altérer les lois énergétiques locales pour optimiser ses techniques.", category: "Extra", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "h-sp-uniq", name: "Compétence Unique — Cinquième Aspect", summary: "Cinquième aspect activé. Domaine de la Loi personnelle élargi.", category: "Unique", type: "ultimate" }, aspectCount: 5 }],
        evolution: { name: "Brise-Limite", description: "L'Adaptateur défie les fondements mêmes du Système des Énergies Potentielles.", prerequisites: "Assimilation totale de 4 mécanismes raciaux + Compétence Unique à 5 aspects + survie à une Rupture de rang S" },
      },
      {
        rank: "EX", title: "L'Illimité", narrative: "Il n'existe pas de mot dans aucune langue connue pour décrire ce qu'est un Humain de rang EX. Les archives de la Concorde Magique ne recensent que trois cas dans toute l'histoire. Ce n'est plus un Humain — c'est une force de la nature douée de conscience et de volonté propre, capable de remodeler les fondements de la réalité elle-même.",
        fundamental: { id: "h-ex-fund", name: "Loi Personnelle — Réalisation", summary: "La Loi personnelle de l'Adaptateur se manifeste comme une loi du monde, au même titre que celles gravées par les Primordiaux.", category: "Unique", type: "ultimate" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "h-ex-uniq", name: "Tous les Aspects", summary: "La totalité des aspects de la Loi personnelle est activée simultanément.", category: "Unique", type: "ultimate" }, aspectCount: 6 }],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  //  DRAGONS — 2 variants: Véritable vs Slayer
  // ═══════════════════════════════════════════════════
  {
    raceId: "dragons",
    raceName: "Dragons",
    raceNameJp: "ドラゴン",
    variants: [
      { id: "veritable", name: "Dragon Véritable", nameJp: "真龍", description: "Les descendants directs des Primordiaux, porteurs du sang des créateurs du monde.", accentColor: "#FF6B35", branchStartRank: "E" },
      { id: "slayer", name: "Dragon Slayer", nameJp: "ドラゴンスレイヤー", description: "Des guerriers qui ont absorbé l'essence draconique par la force du combat.", accentColor: "#8B5CF6", branchStartRank: "E" },
    ],
    convergenceRank: "B",
    ranks: [
      {
        rank: "F", title: "Écailles Naissantes", narrative: "Le premier éveil draconique se manifeste par une affinité élémentaire spontanée. Que l'on porte le sang des Primordiaux ou qu'on l'ait conquis, le feu coule dans les veines.",
        fundamental: { id: "d-f-fund", name: "Souffle Primordial", nameJp: "始源のブレス", summary: "Première manifestation du souffle élémentaire — court mais intense.", techniqueId: "dragon-souffle-primordial", category: "Innée", type: "active" },
        variantAbilities: [],
      },
      {
        rank: "E", title: "Voie du Sang ou de l'Épée", narrative: "Le choix irréversible se pose : suivre la voie du sang ancestral (Véritable) ou celle de la conquête par l'épée (Slayer). Ce choix détermine toute la progression future.",
        fundamental: { id: "d-e-fund", name: "Armure d'Écailles", summary: "Première couche de protection draconique — résistance élémentaire de base.", category: "Innée", type: "passive" },
        variantAbilities: [
          { variantId: "veritable", abilities: [{ id: "d-e-ver1", name: "Sang Ancien", summary: "Le sang des Primordiaux s'éveille, amplifiant l'affinité élémentaire naturelle.", category: "Innée", type: "passive" }] },
          { variantId: "slayer", abilities: [{ id: "d-e-sly1", name: "Marque du Slayer", summary: "La première marque d'absorption draconique apparaît sur le corps.", category: "Acquise", type: "passive" }] },
        ],
      },
      {
        rank: "D", title: "Croissance Draconique", narrative: "La puissance élémentaire grandit. Le Véritable sent ses écailles s'épaissir et son souffle s'allonger. Le Slayer voit ses marques se multiplier et sa résistance au feu s'affirmer.",
        fundamental: { id: "d-d-fund", name: "Souffle Étendu", summary: "Le souffle élémentaire gagne en portée et en puissance.", category: "Acquise", type: "active" },
        variantAbilities: [
          { variantId: "veritable", abilities: [{ id: "d-d-ver1", name: "Écailles Renforcées", summary: "L'armure naturelle résiste désormais aux attaques énergétiques.", category: "Innée", type: "passive" }] },
          { variantId: "slayer", abilities: [{ id: "d-d-sly1", name: "Absorption Énergétique", summary: "Peut absorber une fraction de l'énergie des attaques reçues.", category: "Acquise", type: "passive" }] },
        ],
      },
      {
        rank: "C", title: "Première Métamorphose", narrative: "Le corps commence à changer. Pour le Véritable, des traits draconiques physiques apparaissent. Pour le Slayer, la fusion avec l'essence absorbée s'approfondit au point de modifier sa physiologie.",
        fundamental: { id: "d-c-fund", name: "Métamorphose Partielle", summary: "Transformation partielle du corps — bras ou jambes prennent des traits draconiques.", category: "Acquise", type: "active" },
        variantAbilities: [
          { variantId: "veritable", abilities: [{ id: "d-c-ver1", name: "Vol Naissant", summary: "Des ailes émergent, permettant un vol court et un planage prolongé.", category: "Extra", type: "active" }] },
          { variantId: "slayer", abilities: [{ id: "d-c-sly1", name: "Contre-Souffle", summary: "Peut dévier et renvoyer un souffle élémentaire absorbé.", category: "Acquise", type: "active" }] },
        ],
        uniqueAbilities: [{ ability: { id: "d-c-uniq", name: "Compétence Unique — Œil du Dragon", summary: "Perception élémentaire supérieure. Premier aspect de la Loi personnelle.", category: "Unique", type: "passive" }, aspectCount: 1 }],
      },
      {
        rank: "B", title: "Convergence Draconique", narrative: "Les deux voies se rejoignent. Que l'on soit né du sang ou qu'on l'ait conquis, la puissance draconique à ce rang est fondamentalement la même. La différence n'est plus dans la nature du pouvoir, mais dans la façon dont on l'a obtenu — et ce qui a été sacrifié pour y parvenir.",
        fundamental: { id: "d-b-fund", name: "Forme Demi-Dragon", summary: "Transformation complète en forme demi-dragon — puissance physique et élémentaire décuplée.", category: "Extra", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "d-b-uniq", name: "Compétence Unique — Domaine Élémentaire", summary: "Deuxième aspect. La zone d'influence élémentaire s'élargit.", category: "Unique", type: "active" }, aspectCount: 2 }],
        isConvergence: true,
        evolution: { name: "Éveil du Dragon Intérieur", nameJp: "内なる龍の覚醒", description: "La nature draconique s'affirme définitivement. Plus aucun retour en arrière n'est possible.", prerequisites: "Maîtrise complète de la forme partielle + survie à un combat de rang B" },
      },
      {
        rank: "A", title: "Souveraineté Élémentaire", narrative: "Le Dragon de rang A ne contrôle plus un élément — il le commande. Les flammes obéissent, les tempêtes se taisent, la terre tremble à sa demande. Le monde matériel lui-même semble fléchir face à sa volonté.",
        fundamental: { id: "d-a-fund", name: "Commandement Élémentaire", summary: "Contrôle total d'un élément sur un rayon de 50 mètres.", category: "Extra", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "d-a-uniq", name: "Compétence Unique — Troisième Aspect", summary: "L'Ultimate draconique devient accessible.", category: "Unique", type: "ultimate" }, aspectCount: 3 }],
      },
      {
        rank: "S", title: "Ascension Draconique", narrative: "Le corps et l'âme fusionnent avec l'essence élémentaire. Le Dragon de rang S n'est plus entièrement matériel — il existe simultanément sur le plan physique et sur le plan énergétique, ce qui le rend extrêmement difficile à atteindre.",
        fundamental: { id: "d-s-fund", name: "Existence Duale", summary: "Le corps existe partiellement sur le plan énergétique — les attaques physiques passent à travers.", category: "Extra", type: "passive" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "d-s-uniq", name: "Compétence Unique — Quatrième Aspect", summary: "La Loi personnelle draconique atteint sa puissance maximale.", category: "Unique", type: "active" }, aspectCount: 4 }],
      },
      {
        rank: "S+", title: "Héritage Primordial", narrative: "Le Dragon touche à l'héritage des créateurs du monde. Son élément n'est plus un simple pouvoir — c'est une extension de son être, une loi qu'il impose à la réalité autour de lui.",
        fundamental: { id: "d-sp-fund", name: "Souffle de Création", summary: "Le souffle élémentaire peut modifier la matière elle-même — pas seulement la détruire.", category: "Extra", type: "ultimate" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "d-sp-uniq", name: "Compétence Unique — Cinquième Aspect", summary: "Domaine de la Loi étendu au plan spirituel.", category: "Unique", type: "ultimate" }, aspectCount: 5 }],
        evolution: { name: "Résurgence Primordiale", description: "Le lien avec les Dragons Primordiaux se réveille pleinement.", prerequisites: "Existence Duale maîtrisée + survie à une Nuit de Walpurgis" },
      },
      {
        rank: "EX", title: "Dragon Primordial Réincarné", narrative: "Un seul Dragon dans l'histoire a atteint ce rang. Il ne s'agissait pas d'un Primordial lui-même, mais d'un être qui avait assimilé tellement d'essence draconique qu'il en était devenu l'égal. Son nom a été effacé des archives — pas par les hommes, mais par le monde lui-même.",
        fundamental: { id: "d-ex-fund", name: "Loi Draconique Suprême", summary: "L'élément du Dragon devient une loi fondamentale de la réalité dans un périmètre défini.", category: "Unique", type: "ultimate" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "d-ex-uniq", name: "Tous les Aspects — Dragon Suprême", summary: "La totalité de la Loi draconique est réalisée. L'être est un Primordial de fait.", category: "Unique", type: "ultimate" }, aspectCount: 6 }],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  //  VAMPIRES — 3 variants: Hybride / Maudit / Pur
  // ═══════════════════════════════════════════════════
  {
    raceId: "vampires",
    raceName: "Vampires",
    raceNameJp: "ヴァンパイア",
    variants: [
      { id: "hybride", name: "Sang Hybride", nameJp: "混血サング", description: "Nés d'une union entre un vampire et un mortel. Puissance modérée mais grande adaptation.", accentColor: "#C0392B", branchStartRank: "E" },
      { id: "maudit", name: "Sang Maudit", nameJp: "呪われサング", description: "Mortels transformés par la Morsure. Puissance brute mais instabilité chronique.", accentColor: "#6C3483", branchStartRank: "E" },
      { id: "pur", name: "Sang Pur", nameJp: "純血サング", description: "Lignée vampires non diluée depuis des millénaires. Puissance innée prodigieuse.", accentColor: "#E74C3C", branchStartRank: "E" },
    ],
    convergenceRank: "B",
    ranks: [
      {
        rank: "F", title: "Première Morsure", narrative: "Que le sang coule par naissance, par morsure ou par héritage, le premier éveil vampirique est toujours le même : une soif qui n'a rien de physique, une faim d'énergie vitale qui définit tout ce qui suivra.",
        fundamental: { id: "v-f-fund", name: "Soif Vitale", summary: "Première manifestation de la faim d'énergie — perception des sources de vie.", category: "Innée", type: "passive" },
        variantAbilities: [],
      },
      {
        rank: "E", title: "Lignée ou Morsure", narrative: "La nature du sang définit la voie : l'Hybride hérite de deux mondes, le Maudit subit la transformation, le Pur porte l'héritage millénaire.",
        fundamental: { id: "v-e-fund", name: "Autorité Sanguinaire", summary: "Premier contrôle du sang — peut le manipuler dans un rayon court.", techniqueId: "vampire-autorite-sanguinaire", category: "Innée", type: "active" },
        variantAbilities: [
          { variantId: "hybride", abilities: [{ id: "v-e-hyb1", name: "Dualité Sang-Mortel", summary: "L'Hybride peut maintenir temporairement des capacités de sa lignée mortelle.", category: "Innée", type: "passive" }] },
          { variantId: "maudit", abilities: [{ id: "v-e-mau1", name: "Folie Sanguinaire", summary: "Puissance décuplée dans les états de faim extrême — au prix de la contrôle.", category: "Innée", type: "active" }] },
          { variantId: "pur", abilities: [{ id: "v-e-pur1", name: "Héritage Ancien", summary: "Les capacités innées du Sang Pur se manifestent sans entraînement.", category: "Innée", type: "passive" }] },
        ],
      },
      {
        rank: "D", title: "Cape d'Ombre", narrative: "L'ombre devient un allié naturel. Le vampire apprend à se fondre dans les ténèbres, à se déplacer entre les ombres comme d'autres marchent sur la terre.",
        fundamental: { id: "v-d-fund", name: "Cape d'Ombre", nameJp: "影のクローク", summary: "Fusion avec les ombres environnantes — invisibilité dans l'obscurité.", techniqueId: "vampire-cape-d-ombre", category: "Acquise", type: "active" },
        variantAbilities: [
          { variantId: "hybride", abilities: [{ id: "v-d-hyb1", name: "Résistance Solaire Partielle", summary: "L'Hybride tolère la lumière directe pendant de courtes durées.", category: "Extra", type: "passive" }] },
          { variantId: "maudit", abilities: [{ id: "v-d-mau1", name: "Régénération Accélérée", summary: "La chair se reforme rapidement en absorbant l'énergie ambiante.", category: "Innée", type: "passive" }] },
          { variantId: "pur", abilities: [{ id: "v-d-pur1", name: "Domination Sanguinaire", summary: "Peut manipuler le sang d'autrui à distance — immobilisation, extraction.", category: "Acquise", type: "active" }] },
        ],
      },
      {
        rank: "C", title: "Marque du Prédateur", narrative: "Le vampire devient un prédateur véritable. Ses sens sont aiguisés au-delà de l'humainement possible, sa vitesse défie la perception, et sa présence seule peut paralyser les proies.",
        fundamental: { id: "v-c-fund", name: "Présence Predatoire", summary: "Aura de terreur passive — les êtres faibles sont paralysés par la simple présence.", category: "Acquise", type: "passive" },
        variantAbilities: [
          { variantId: "hybride", abilities: [{ id: "v-c-hyb1", name: "Sang Adaptatif", summary: "Peut absorber des propriétés du sang ingéré temporairement.", category: "Extra", type: "active" }] },
          { variantId: "maudit", abilities: [{ id: "v-c-mau1", name: "Transformation Partielle", summary: "Le corps se transforme — griffes, crocs, pupilles vampiriques.", category: "Acquise", type: "active" }] },
          { variantId: "pur", abilities: [{ id: "v-c-pur1", name: "Liens de Sang", summary: "Peut créer des liens télépathiques avec ceux dont il a bu le sang.", category: "Acquise", type: "active" }] },
        ],
        uniqueAbilities: [{ ability: { id: "v-c-uniq", name: "Compétence Unique — Premier Sang", summary: "La Loi personnelle du sang se manifeste. Premier aspect.", category: "Unique", type: "passive" }, aspectCount: 1 }],
      },
      {
        rank: "B", title: "Convergence Sanguinaire", narrative: "Les trois voies du sang se rejoignent. Qu'il soit Hybride, Maudit ou Pur, le vampire de rang B est un être d'une puissance redoutable dont la soif est devenue un outil plutôt qu'une faiblesse.",
        fundamental: { id: "v-b-fund", name: "Maîtrise Sanguinaire Totale", summary: "Contrôle absolu du sang dans un périmètre étendu — manipulation offensive et défensive.", category: "Extra", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "v-b-uniq", name: "Compétence Unique — Deuxième Sang", summary: "Deuxième aspect de la Loi personnelle.", category: "Unique", type: "active" }, aspectCount: 2 }],
        isConvergence: true,
        evolution: { name: "Ascension Nocturne", description: "Le vampire transcende sa dépendance au sang et en fait un pouvoir autonome.", prerequisites: "Maîtrise de la Cape d'Ombre + Présence Prédatrice active" },
      },
      {
        rank: "A", title: "Seigneur de la Nuit", narrative: "Le vampire de rang A est un Seigneur de la Nuit dans le sens le plus littéral. Les ténèbres elles-mêmes répondent à son appel, et la nuit devient son domaine — un territoire où les lois de la réalité s'adoucissent en sa faveur.",
        fundamental: { id: "v-a-fund", name: "Domaine Nocturne", summary: "Crée une zone de ténèbres renforcées où ses capacités sont amplifiées de 200%.", category: "Extra", type: "ultimate" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "v-a-uniq", name: "Compétence Unique — Troisième Sang", summary: "L'Ultimate vampirique se dévoile.", category: "Unique", type: "ultimate" }, aspectCount: 3 }],
      },
      {
        rank: "S", title: "Progenitor", narrative: "Au rang S, le vampire peut créer des progenitures — d'autres vampires liés à lui par le sang. Il devient le fondateur d'une lignée, un être dont le pouvoir grandit avec chaque vampire qu'il a engendré.",
        fundamental: { id: "v-s-fund", name: "Création de Lignée", summary: "Peut transformer un mortel en vampire avec une morsure ritualisée.", category: "Extra", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "v-s-uniq", name: "Compétence Unique — Quatrième Sang", summary: "La Loi personnelle atteint sa maturité.", category: "Unique", type: "active" }, aspectCount: 4 }],
      },
      {
        rank: "S+", title: "L'Immortel", narrative: "Le vampire de rang S+ a transcendé la mortalité elle-même. Le vieillissement s'arrête, les maladies n'ont plus d'effet, et même la destruction partielle du corps peut être inversée — à condition qu'une réserve de sang soit disponible.",
        fundamental: { id: "v-sp-fund", name: "Immortalité Biologique", summary: "Le corps ne vieillit plus et se régénère de presque toute blessure.", category: "Extra", type: "passive" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "v-sp-uniq", name: "Compétence Unique — Cinquième Sang", summary: "La Loi personnelle s'étend au plan conceptuel.", category: "Unique", type: "ultimate" }, aspectCount: 5 }],
        evolution: { name: "Éternité Nocturne", description: "Le vampire devient un être intemporel.", prerequisites: "Domaine Nocturne maîtrisé + Création d'au moins 3 progenitures" },
      },
      {
        rank: "EX", title: "Le Cauchemar Originel", narrative: "Les légendes parlent d'un être qui existait avant les vampires — l'entité dont le premier mordu naquit. Le vampire de rang EX ne serait pas la culmination de la lignée, mais la résurgence de ce Cauchemar Originel, un prédateur cosmique qui se nourrit de l'énergie vitale des mondes.",
        fundamental: { id: "v-ex-fund", name: "Faim Cosmique", summary: "Peut drainer l'énergie vitale d'une zone entière — créatures, plantes, et jusqu'au sol lui-même.", category: "Unique", type: "ultimate" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "v-ex-uniq", name: "Tous les Sangs", summary: "La Loi personnelle atteint sa réalisation totale.", category: "Unique", type: "ultimate" }, aspectCount: 6 }],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  //  ELFES — 2 variants: Sylvain vs Céleste
  // ═══════════════════════════════════════════════════
  {
    raceId: "elfes",
    raceName: "Elfes",
    raceNameJp: "エルフ",
    variants: [
      { id: "sylvain", name: "Elfe Sylvain", nameJp: "森エルフ", description: "Gardiens des forêts primordiales, maîtres du Chant des Racines.", accentColor: "#2ECC71", branchStartRank: "E" },
      { id: "celeste", name: "Elfe Céleste", nameJp: "天エルフ", description: "Descendants des elfes qui touchèrent le plan divin, affinités lunaires.", accentColor: "#9B59B6", branchStartRank: "E" },
    ],
    convergenceRank: "B",
    ranks: [
      {
        rank: "F", title: "Écoute de la Forêt", narrative: "Le premier éveil elfique est une ouverture : les sens s'affinent, la nature devient lisible, et les murmures du monde vivant deviennent compréhensibles.",
        fundamental: { id: "e-f-fund", name: "Lien Sylvestre", nameJp: "森の絆", summary: "Connexion empathique avec la flore environnante.", techniqueId: "elfe-lien-sylvestre", category: "Innée", type: "passive" },
        variantAbilities: [],
      },
      {
        rank: "E", title: "Voie de la Terre ou des Cieux", narrative: "Le choix se pose : s'enraciner dans le monde matériel (Sylvain) ou s'ouvrir aux plans supérieurs (Céleste).",
        fundamental: { id: "e-e-fund", name: "Perception Élargie", summary: "Les sens elfiques dépassent les limites physiques — vision dans l'obscurité, ouïe sur de longues distances.", category: "Innée", type: "passive" },
        variantAbilities: [
          { variantId: "sylvain", abilities: [{ id: "e-e-syl1", name: "Croissance Accélérée", summary: "Peut accélérer la pousse des plantes dans un rayon de 10 mètres.", category: "Acquise", type: "active" }] },
          { variantId: "celeste", abilities: [{ id: "e-e-cel1", name: "Affinité Lunaire", summary: "La lumière de la lune amplifie les capacités magiques de 50%.", category: "Innée", type: "passive" }] },
        ],
      },
      {
        rank: "D", title: "Harmonie Élémentaire", narrative: "L'elfe apprend à canaliser l'énergie naturelle non plus par simple connexion, mais par une harmonie active avec les éléments.",
        fundamental: { id: "e-d-fund", name: "Harmonie Naturelle", summary: "Résistance accrue aux éléments naturels et régénération en milieu naturel.", category: "Acquise", type: "passive" },
        variantAbilities: [
          { variantId: "sylvain", abilities: [{ id: "e-d-syl1", name: "Marionnette Végétale", summary: "Contrôle partiel de plantes — lianes, racines, branchages comme extensions du corps.", category: "Acquise", type: "active" }] },
          { variantId: "celeste", abilities: [{ id: "e-d-cel1", name: "Étoile Guide", summary: "Invoque un éclat lumineux céleste qui révèle l'invisible et guide les alliés.", category: "Acquise", type: "active" }] },
        ],
      },
      {
        rank: "C", title: "Chant des Racines / Litanie Céleste", narrative: "La forme ultime de l'art elfique se manifeste : un chant qui n'est pas seulement sonore, mais une vibration qui touche le tissu même de la réalité.",
        fundamental: { id: "e-c-fund", name: "Chant Elfique", summary: "Le chant peut influencer les émotions, la croissance et les phénomènes naturels.", category: "Acquise", type: "active" },
        variantAbilities: [
          { variantId: "sylvain", abilities: [{ id: "e-c-syl1", name: "Chant des Racines", summary: "Réveille la mémoire ancienne de la forêt — les arbres combattent aux côtés de l'elfe.", category: "Extra", type: "active" }] },
          { variantId: "celeste", abilities: [{ id: "e-c-cel1", name: "Litanie Céleste", summary: "Les constellations répondent au chant — lumière, guidance, et bouclier stellaire.", category: "Extra", type: "active" }] },
        ],
        uniqueAbilities: [{ ability: { id: "e-c-uniq", name: "Compétence Unique — Premier Chant", summary: "La Loi personnelle elfique se manifeste par le chant.", category: "Unique", type: "passive" }, aspectCount: 1 }],
      },
      {
        rank: "B", title: "Convergence Elfique", narrative: "Terre et Ciel se rencontrent. L'elfe de rang B maîtrise les deux harmonies et les fusionne en une seule mélodie primordiale.",
        fundamental: { id: "e-b-fund", name: "Mélodie Primordiale", summary: "Fusion du Chant des Racines et de la Litanie Céleste en une seule technique.", category: "Extra", type: "active" },
        variantAbilities: [],
        uniqueAbilities: [{ ability: { id: "e-b-uniq", name: "Compétence Unique — Deuxième Chant", summary: "Deuxième aspect de la Loi personnelle.", category: "Unique", type: "active" }, aspectCount: 2 }],
        isConvergence: true,
      },
      {
        rank: "A", title: "Archonte de la Nature", narrative: "L'elfe ne commande plus à la nature — il est la nature. Les arbres le reconnaissent comme l'un des leurs, les rivières détournent leur cours pour le servir, et les tempêtes se calment en sa présence.",
        fundamental: { id: "e-a-fund", name: "Communion Totale", summary: "L'elfe perçoit tout ce qui vit dans un rayon de 1 kilomètre.", category: "Extra", type: "passive" },
        variantAbilities: [], uniqueAbilities: [{ ability: { id: "e-a-uniq", name: "Compétence Unique — Troisième Chant", summary: "L'Ultimate elfique.", category: "Unique", type: "ultimate" }, aspectCount: 3 }],
      },
      { rank: "S", title: "Gardien Millénaire", narrative: "Les Gardiens Millénaires sont les elfes les plus anciens — certains ont plus de cinq siècles. Leur connexion au monde vivant est si profonde qu'ils ressentent chaque arbre abattu, chaque rivière polluée.", fundamental: { id: "e-s-fund", name: "Mémoire du Monde", summary: "Accès à la mémoire collective du monde vivant.", category: "Extra", type: "passive" }, variantAbilities: [], uniqueAbilities: [{ ability: { id: "e-s-uniq", name: "Quatrième Chant", summary: "La Loi personnelle s'étend au plan spirituel.", category: "Unique", type: "active" }, aspectCount: 4 }] },
      { rank: "S+", title: "Incarnation Primordiale", narrative: "L'elfe devient une incarnation vivante des forces qui régissent le monde naturel. Son chant peut modifier les écosystèmes entiers, guérir des étendues stériles, ou inverser la mort d'une zone.", fundamental: { id: "e-sp-fund", name: "Renaissance", summary: "Peut restaurer un écosystème détruit en quelques heures.", category: "Extra", type: "ultimate" }, variantAbilities: [], uniqueAbilities: [{ ability: { id: "e-sp-uniq", name: "Cinquième Chant", summary: "Domaine de la Loi étendu.", category: "Unique", type: "ultimate" }, aspectCount: 5 }], evolution: { name: "Renaissance Primordiale", description: "L'elfe devient un avec le monde.", prerequisites: "Mémoire du Monde maîtrisée + Communion Totale active" } },
      { rank: "EX", title: "La Voix du Monde", narrative: "L'elfe de rang EX est la Voix du Monde lui-même — une conscience qui englobe tout ce qui vit, tout ce qui pousse, tout ce qui respire. Les archives de la Concorde mentionnent un seul tel être, qui disparut un jour en marchant simplement dans la forêt — et devint la forêt.", fundamental: { id: "e-ex-fund", name: "Le Monde Est le Chant", summary: "L'elfe ne chante plus pour influencer le monde — il EST le monde.", category: "Unique", type: "ultimate" }, variantAbilities: [], uniqueAbilities: [{ ability: { id: "e-ex-uniq", name: "Tous les Chants", summary: "Réalisation totale de la Loi elfique.", category: "Unique", type: "ultimate" }, aspectCount: 6 }] },
    ],
  },

  // ═══════════════════════════════════════════════════
  //  Remaining 5 races — condensed (schema-complete, content pending docx)
  // ═══════════════════════════════════════════════════
  // HOMMES-BÊTES, TITANS, DÉMONS, FÉES use the same schema.
  // Full narrative content will be replaced when docx files are uploaded.
];

// Helper: generate a basic skill tree for races pending docx content
function makeBasicTree(
  raceId: string,
  raceName: string,
  raceNameJp: string,
  variants: { id: string; name: string; nameJp: string; desc: string; color: string }[],
  convergenceRank: RankTier | null,
  rankTitles: string[],
  rankNarratives: string[],
  fundamentals: { name: string; summary: string; techId?: string }[],
): SkillTree {
  const orders: RankTier[] = ["F", "E", "D", "C", "B", "A", "S", "S+", "EX"];
  const convIdx = convergenceRank ? orders.indexOf(convergenceRank) : -1;

  return {
    raceId, raceName, raceNameJp,
    variants: variants.map(v => ({ id: v.id, name: v.name, nameJp: v.nameJp, description: v.desc, accentColor: v.color, branchStartRank: "E" as RankTier })),
    convergenceRank,
    ranks: orders.map((rank, i) => ({
      rank,
      title: rankTitles[i] || `Rang ${rank}`,
      narrative: rankNarratives[i] || "Contenu en attente des fichiers sources.",
      fundamental: { id: `${raceId}-${rank}-fund`, name: fundamentals[i]?.name || `Capacité ${rank}`, summary: fundamentals[i]?.summary || "Capacité fondamentale de ce rang.", techniqueId: fundamentals[i]?.techId, category: (i < 2 ? "Innée" : "Acquise") as Ability["category"], type: "active" as const },
      variantAbilities: variants.map(v => ({
        variantId: v.id,
        abilities: [{ id: `${raceId}-${rank}-${v.id}`, name: `Variante ${v.name}`, summary: `Capacité spécifique à la voie ${v.name}.`, category: "Acquise" as const, type: "active" as const }],
      })),
      uniqueAbilities: i >= 3 ? [{ ability: { id: `${raceId}-${rank}-uniq`, name: `Compétence Unique — Rang ${rank}`, summary: `${Math.min(i - 2, 6)} aspect(s) actif(s).`, category: "Unique" as const, type: (i >= 5 ? "ultimate" : "passive") as const }, aspectCount: Math.min(i - 2, 6) }] : undefined,
      isConvergence: i === convIdx ? true : undefined,
      ...(i === 4 ? { evolution: { name: `Évolution ${rank}`, description: `Seuil d'évolution du rang ${rank}.`, prerequisites: "Prérequis narratifs en attente." } } : {}),
      ...(i === 7 ? { evolution: { name: `Évolution ${rank}`, description: `Seuil d'évolution du rang ${rank}.`, prerequisites: "Prérequis narratifs en attente." } } : {}),
    })),
  };
}

// HOMMES-BÊTES — 3 variants: Prédateur Terrestre / Maître des Cieux / Gardien des Abysses (convergence at B)
SKILL_TREES.push({
  raceId: "hommes-betes",
  raceName: "Hommes-Bêtes",
  raceNameJp: "獣人",
  variants: [
    {
      id: "predateur-terrestre",
      name: "Prédateur Terrestre",
      nameJp: "地上の捕食者",
      description: "Domination au Sol. Force brute, traque, et suprématie territoriale.",
      accentColor: "#E74C3C",
      branchStartRank: "E",
    },
    {
      id: "maitre-des-cieux",
      name: "Maître des Cieux",
      nameJp: "天の支配者",
      description: "Maîtrise des Vents. Vol, commandement des tempêtes et souveraineté aérienne.",
      accentColor: "#3498DB",
      branchStartRank: "E",
    },
    {
      id: "gardien-des-abysses",
      name: "Gardien des Abysses",
      nameJp: "深淵の守護者",
      description: "Immersion Abyssale. Contrôle des profondeurs, pression et lois maritimes.",
      accentColor: "#1ABC9C",
      branchStartRank: "E",
    },
  ],
  convergenceRank: "B",
  ranks: [
    // ── F — Fondamentaux Sauvages ──
    {
      rank: "F",
      title: "Fondamentaux Sauvages",
      narrative: "Le Rang F est consacré aux Fondamentaux universels. Le Totem Ancestral se manifeste comme frémissements instinctifs — griffes qui apparaissent involontairement, sens développés au-delà du normal.",
      fundamental: {
        id: "hb-f-fund",
        name: "Instinct Primal",
        summary: "Sens de danger hyper-développés. Intentions hostiles et variations vitales perçues. Identification des êtres les plus forts, intentions immédiates, entités spirituelles animales et lois ancestrales d'un lieu selon les aspects.",
        category: "Innée",
        type: "passive",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-f-4-pt", name: "Griffes du Totem I", summary: "Manifestation partielle des traits du Totem — griffes, crocs, peau renforcée.", category: "Acquise", type: "active" },
            { id: "hb-f-3-pt", name: "Résilience Naturelle I", summary: "Résistance aux poisons et environnements hostiles. Régénération passive.", category: "Acquise", type: "passive" },
            { id: "hb-f-2-pt", name: "Cri Totémique I", summary: "Rugissement libérant une pression physique. Zone d'intimidation instinctive.", category: "Acquise", type: "active" },
            { id: "hb-f-1-pt", name: "Lien du Totem I", summary: "Canal passif avec l'esprit du Totem Ancestral. Guidance instinctive en combat.", category: "Acquise", type: "passive" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-f-4-mc", name: "Griffes du Totem I", summary: "Manifestation partielle des traits du Totem — griffes, crocs, peau renforcée.", category: "Acquise", type: "active" },
            { id: "hb-f-3-mc", name: "Résilience Naturelle I", summary: "Résistance aux poisons et environnements hostiles. Régénération passive.", category: "Acquise", type: "passive" },
            { id: "hb-f-2-mc", name: "Cri Totémique I", summary: "Rugissement libérant une pression physique. Zone d'intimidation instinctive.", category: "Acquise", type: "active" },
            { id: "hb-f-1-mc", name: "Lien du Totem I", summary: "Canal passif avec l'esprit du Totem Ancestral. Guidance instinctive en combat.", category: "Acquise", type: "passive" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-f-4-ga", name: "Griffes du Totem I", summary: "Manifestation partielle des traits du Totem — griffes, crocs, peau renforcée.", category: "Acquise", type: "active" },
            { id: "hb-f-3-ga", name: "Résilience Naturelle I", summary: "Résistance aux poisons et environnements hostiles. Régénération passive.", category: "Acquise", type: "passive" },
            { id: "hb-f-2-ga", name: "Cri Totémique I", summary: "Rugissement libérant une pression physique. Zone d'intimidation instinctive.", category: "Acquise", type: "active" },
            { id: "hb-f-1-ga", name: "Lien du Totem I", summary: "Canal passif avec l'esprit du Totem Ancestral. Guidance instinctive en combat.", category: "Acquise", type: "passive" },
          ],
        },
      ],
      evolution: {
        name: "Sang Sauvage",
        description: "Le Totem Ancestral se manifeste. Corps adapté à la lignée.",
        prerequisites: "Entrer en contact avec l'esprit de son Totem Ancestral pour la première fois · Survivre à une chasse où l'on était la proie · Déclencher involontairement une transformation partielle sous la peur ou la rage",
      },
    },

    // ── E — Beastskin Naissant (variant choice) ──
    {
      rank: "E",
      title: "Beastskin Naissant",
      narrative: "Le flux vital laisse des traces perceptibles — le Beastskin traque par instinct seul. À E-0, le choix de variante est irréversible.",
      fundamental: {
        id: "hb-e-fund",
        name: "Traque Instinctive",
        summary: "Suivi d'une cible par son énergie résiduelle. La vitalité et la peur laissent des traces durables.",
        category: "Innée",
        type: "active",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-e-3-pt", name: "Peau Vivante I", summary: "Renforcement temporaire sous l'énergie spirituelle du Totem.", category: "Acquise", type: "passive" },
            { id: "hb-e-2-pt", name: "Danse de la Chasse I", summary: "Déplacement instinctif et imprévisible. Esquive et vitesse amplifiées.", category: "Acquise", type: "active" },
            { id: "hb-e-1-pt", name: "Résilience Naturelle II", summary: "Régénération accélérée en milieu naturel ou combat intense.", category: "Acquise", type: "passive" },
            { id: "hb-e-pt-1", name: "Forme Partielle I", summary: "Taille et masse augmentées. Traits animaux amplifiés.", category: "Acquise", type: "active" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-e-3-mc", name: "Peau Vivante I", summary: "Renforcement temporaire sous l'énergie spirituelle du Totem.", category: "Acquise", type: "passive" },
            { id: "hb-e-2-mc", name: "Danse de la Chasse I", summary: "Déplacement instinctif et imprévisible. Esquive et vitesse amplifiées.", category: "Acquise", type: "active" },
            { id: "hb-e-1-mc", name: "Résilience Naturelle II", summary: "Régénération accélérée en milieu naturel ou combat intense.", category: "Acquise", type: "passive" },
            { id: "hb-e-mc-1", name: "Vol Naissant", summary: "Déplacement aérien basique. Vitesse et manœuvrabilité limitées.", category: "Acquise", type: "active" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-e-3-ga", name: "Peau Vivante I", summary: "Renforcement temporaire sous l'énergie spirituelle du Totem.", category: "Acquise", type: "passive" },
            { id: "hb-e-2-ga", name: "Danse de la Chasse I", summary: "Déplacement instinctif et imprévisible. Esquive et vitesse amplifiées.", category: "Acquise", type: "active" },
            { id: "hb-e-1-ga", name: "Résilience Naturelle II", summary: "Régénération accélérée en milieu naturel ou combat intense.", category: "Acquise", type: "passive" },
            { id: "hb-e-ga-1", name: "Immersion I", summary: "Respiration aquatique. Déplacement fluide en milieu liquide.", category: "Acquise", type: "active" },
          ],
        },
      ],
      evolution: {
        name: "Marque du Totem",
        description: "Marque du Totem imprimée sur une cible ou un lieu. Persistante et réelle.",
        prerequisites: "Traquer et vaincre un être de rang D en terrain hostile sans aide · Accomplir un rite de passage totémique · Être accepté par un ancien de sa variante",
      },
    },

    // ── D — Guerrier Totémique ──
    {
      rank: "D",
      title: "Guerrier Totémique",
      narrative: "Les faiblesses adverses deviennent perceptibles. Chaque variante développe sa maîtrise de son domaine.",
      fundamental: {
        id: "hb-d-fund",
        name: "Lecture des Faiblesses",
        summary: "Les faiblesses adverses brillent dans la perception via le flux vital.",
        category: "Innée",
        type: "passive",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-d-3-pt", name: "Mutation Active I", summary: "Nouvelles mutations physiques issues du Totem selon les besoins du combat.", category: "Acquise", type: "active" },
            { id: "hb-d-2-pt", name: "Furie Totémique I", summary: "Libération partielle du flux totémique — boost massif temporaire.", category: "Acquise", type: "active" },
            { id: "hb-d-1-pt", name: "Griffes du Totem II", summary: "Armes naturelles déchirant les défenses magiques de rang D.", category: "Acquise", type: "active" },
            { id: "hb-d-pt-1", name: "Domination au Sol I", summary: "Maîtrise absolue du combat au corps à corps. Traction et force décuplées sur sol naturel.", category: "Acquise", type: "active" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-d-3-mc", name: "Mutation Active I", summary: "Nouvelles mutations physiques issues du Totem selon les besoins du combat.", category: "Acquise", type: "active" },
            { id: "hb-d-2-mc", name: "Furie Totémique I", summary: "Libération partielle du flux totémique — boost massif temporaire.", category: "Acquise", type: "active" },
            { id: "hb-d-1-mc", name: "Griffes du Totem II", summary: "Armes naturelles déchirant les défenses magiques de rang D.", category: "Acquise", type: "active" },
            { id: "hb-d-mc-1", name: "Maîtrise des Vents I", summary: "Vol naturel actif. Vitesse et manœuvrabilité aériennes.", category: "Acquise", type: "active" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-d-3-ga", name: "Mutation Active I", summary: "Nouvelles mutations physiques issues du Totem selon les besoins du combat.", category: "Acquise", type: "active" },
            { id: "hb-d-2-ga", name: "Furie Totémique I", summary: "Libération partielle du flux totémique — boost massif temporaire.", category: "Acquise", type: "active" },
            { id: "hb-d-1-ga", name: "Griffes du Totem II", summary: "Armes naturelles déchirant les défenses magiques de rang D.", category: "Acquise", type: "active" },
            { id: "hb-d-ga-1", name: "Immersion Abyssale I", summary: "Respiration et déplacement parfaits dans tout milieu liquide ou sous-terrain.", category: "Acquise", type: "active" },
          ],
        },
      ],
      evolution: {
        name: "Territoire du Totem",
        description: "Territoire totémique délimité. Les règles de la lignée s'y appliquent.",
        prerequisites: "Maintenir une transformation partielle pendant un combat complet · Vaincre un être de rang C en pleine nature · Recevoir le titre de guerrier de l'esprit ancestral",
      },
    },

    // ── C — Incarnation Partielle du Totem (Unique abilities unlocked) ──
    {
      rank: "C",
      title: "Incarnation Partielle",
      narrative: "Le plan spirituel du Totem s'ouvre. L'Esprit Ancestral dialogue directement. Les compétences raciales uniques sont débloquées.",
      fundamental: {
        id: "hb-c-fund",
        name: "Communion du Totem",
        summary: "Plan spirituel du Totem pleinement ouvert. Dialogue direct avec sa bête ancestrale.",
        category: "Innée",
        type: "passive",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-c-3-pt", name: "Lien de Meute Spirituel I", summary: "Réseau spirituel avec les alliés totémiques. Partage de force et perception.", category: "Acquise", type: "passive" },
            { id: "hb-c-2-pt", name: "Cri de l'Ancêtre I", summary: "Le cri porte la voix de l'Ancêtre — effet spirituel sur les âmes proches.", category: "Acquise", type: "active" },
            { id: "hb-c-1-pt", name: "Forme Partielle II", summary: "Transformation approfondie. Capacités avancées de variante débloquées.", category: "Acquise", type: "active" },
            { id: "hb-c-pt-1", name: "Seigneur du Territoire I", summary: "Zone de chasse active. Tout ce qui y entre est identifié et ralenti instinctivement.", category: "Acquise", type: "active" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-c-3-mc", name: "Lien de Meute Spirituel I", summary: "Réseau spirituel avec les alliés totémiques. Partage de force et perception.", category: "Acquise", type: "passive" },
            { id: "hb-c-2-mc", name: "Cri de l'Ancêtre I", summary: "Le cri porte la voix de l'Ancêtre — effet spirituel sur les âmes proches.", category: "Acquise", type: "active" },
            { id: "hb-c-1-mc", name: "Forme Partielle II", summary: "Transformation approfondie. Capacités avancées de variante débloquées.", category: "Acquise", type: "active" },
            { id: "hb-c-mc-1", name: "Commandement des Cieux I", summary: "Diriger et communiquer avec les créatures ailées. Tempêtes et vents commandés.", category: "Acquise", type: "active" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-c-3-ga", name: "Lien de Meute Spirituel I", summary: "Réseau spirituel avec les alliés totémiques. Partage de force et perception.", category: "Acquise", type: "passive" },
            { id: "hb-c-2-ga", name: "Cri de l'Ancêtre I", summary: "Le cri porte la voix de l'Ancêtre — effet spirituel sur les âmes proches.", category: "Acquise", type: "active" },
            { id: "hb-c-1-ga", name: "Forme Partielle II", summary: "Transformation approfondie. Capacités avancées de variante débloquées.", category: "Acquise", type: "active" },
            { id: "hb-c-ga-1", name: "Loi des Profondeurs I", summary: "Zone abyssale active. Les lois des profondeurs s'appliquent.", category: "Acquise", type: "active" },
          ],
        },
      ],
      uniqueAbilities: [
        {
          ability: {
            id: "hb-c-uniq-pt",
            name: "Prédation Absolue",
            summary: "L'apex incontestable de la chaîne alimentaire. Aucune proie ne peut lui échapper dans son territoire.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 1,
        },
        {
          ability: {
            id: "hb-c-uniq-mc",
            name: "Souverain des Tempêtes",
            summary: "Commande les forces de l'air et de la tempête. Le ciel est son domaine absolu.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 1,
        },
        {
          ability: {
            id: "hb-c-uniq-ga",
            name: "Loi des Profondeurs",
            summary: "Impose les lois des profondeurs à la surface. Sa zone devient un abîme artificiel.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 1,
        },
      ],
      evolution: {
        name: "Voix de l'Ancêtre",
        description: "Autorité de l'Ancêtre Totémique dans la voix. S'impose aux êtres liés au même concept.",
        prerequisites: "Communier avec son Ancêtre Totémique pendant 3 jours · Défendre son territoire contre une menace de rang B · Être reconnu comme Héraut par 3 êtres de sa lignée",
      },
    },

    // ── B — Héraut du Totem (CONVERGENCE) ──
    {
      rank: "B",
      title: "Héraut du Totem",
      narrative: "Les trois variantes convergent en B-0. Le Totem s'incarne dans le combattant — commande naturelle sur toutes créatures liées.",
      fundamental: {
        id: "hb-b-fund",
        name: "Commandement Totémique",
        summary: "Commandement des esprits animaux de rang inférieur. Toute créature liée au Totem perçue.",
        category: "Innée",
        type: "active",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-b-3-pt", name: "Territoire Spirituel I", summary: "Dans son territoire : perception totale, prédiction parfaite, contrôle des éléments totémiques.", category: "Extra", type: "passive" },
            { id: "hb-b-2-pt", name: "Mutation Légendaire I", summary: "Mutation unique issue du plus profond de la lignée totémique ancestrale.", category: "Extra", type: "active" },
            { id: "hb-b-1-pt", name: "Furie Totémique II", summary: "La furie totémique est permanente au combat. Aucun contrôle sacrifié.", category: "Extra", type: "passive" },
            { id: "hb-b-pt-1", name: "Chasseur Légendaire I", summary: "Capacités de traque et combat au sol transcendant l'humain. La proie ne peut fuir.", category: "Extra", type: "active" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-b-3-mc", name: "Territoire Spirituel I", summary: "Dans son territoire : perception totale, prédiction parfaite, contrôle des éléments totémiques.", category: "Extra", type: "passive" },
            { id: "hb-b-2-mc", name: "Mutation Légendaire I", summary: "Mutation unique issue du plus profond de la lignée totémique ancestrale.", category: "Extra", type: "active" },
            { id: "hb-b-1-mc", name: "Furie Totémique II", summary: "La furie totémique est permanente au combat. Aucun contrôle sacrifié.", category: "Extra", type: "passive" },
            { id: "hb-b-mc-1", name: "Tempête Incarnée I", summary: "Le corps génère des vents et foudres. Domination absolue de l'espace aérien.", category: "Extra", type: "active" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-b-3-ga", name: "Territoire Spirituel I", summary: "Dans son territoire : perception totale, prédiction parfaite, contrôle des éléments totémiques.", category: "Extra", type: "passive" },
            { id: "hb-b-2-ga", name: "Mutation Légendaire I", summary: "Mutation unique issue du plus profond de la lignée totémique ancestrale.", category: "Extra", type: "active" },
            { id: "hb-b-1-ga", name: "Furie Totémique II", summary: "La furie totémique est permanente au combat. Aucun contrôle sacrifié.", category: "Extra", type: "passive" },
            { id: "hb-b-ga-1", name: "Abîme Vivant I", summary: "Les profondeurs obéissent à la volonté. Pression et flux abyssaux commandés.", category: "Extra", type: "active" },
          ],
        },
      ],
      uniqueAbilities: [
        {
          ability: {
            id: "hb-b-uniq-pt",
            name: "Prédation Absolue — Évolution II",
            summary: "La prédation s'étend au plan spirituel. Les proies ne peuvent fuir même sur d'autres plans.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 2,
        },
        {
          ability: {
            id: "hb-b-uniq-mc",
            name: "Souverain des Tempêtes — Évolution II",
            summary: "Les tempêtes deviennent des entités conscientes à ses ordres.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 2,
        },
        {
          ability: {
            id: "hb-b-uniq-ga",
            name: "Loi des Profondeurs — Évolution II",
            summary: "Les lois abyssales s'imposent sur de vastes zones sans limite environnementale.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 2,
        },
      ],
      evolution: {
        name: "Incarnation Totémique",
        description: "Fusion temporaire avec l'Ancêtre Totémique. Sa nature devient celle du Totem primordial.",
        prerequisites: "Invoquer l'esprit du Totem en combat pendant 1 heure · Soumettre 5 êtres de rang B · Être reconnu comme Seigneur par l'Ancêtre lui-même",
      },
      isConvergence: true,
    },

    // ── A — Seigneur du Totem ──
    {
      rank: "A",
      title: "Seigneur du Totem",
      narrative: "La loi du concept totémique est malléable dans sa zone. Instincts et nature y obéissent. Trois aspects actifs simultanément.",
      fundamental: {
        id: "hb-a-fund",
        name: "Loi du Totem",
        summary: "La loi du concept totémique est malléable dans sa zone. Instincts et nature y obéissent.",
        category: "Extra",
        type: "active",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-a-4-pt", name: "Loi du Totem I", summary: "Imposer la loi du concept totémique dans une zone.", category: "Extra", type: "active" },
            { id: "hb-a-3-pt", name: "Instinct Universel I", summary: "Conscience partagée avec tous les êtres de l'essence totémique mondiale.", category: "Extra", type: "passive" },
            { id: "hb-a-2-pt", name: "Incarnation du Concept I", summary: "Le combattant devient la manifestation vivante du concept de son Totem.", category: "Extra", type: "active" },
            { id: "hb-a-1-pt", name: "Invocation du Totem II", summary: "Invocation de plusieurs formes spirituelles du Totem simultanément.", category: "Extra", type: "active" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-a-4-mc", name: "Loi du Totem I", summary: "Imposer la loi du concept totémique dans une zone.", category: "Extra", type: "active" },
            { id: "hb-a-3-mc", name: "Instinct Universel I", summary: "Conscience partagée avec tous les êtres de l'essence totémique mondiale.", category: "Extra", type: "passive" },
            { id: "hb-a-2-mc", name: "Incarnation du Concept I", summary: "Le combattant devient la manifestation vivante du concept de son Totem.", category: "Extra", type: "active" },
            { id: "hb-a-1-mc", name: "Invocation du Totem II", summary: "Invocation de plusieurs formes spirituelles du Totem simultanément.", category: "Extra", type: "active" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-a-4-ga", name: "Loi du Totem I", summary: "Imposer la loi du concept totémique dans une zone.", category: "Extra", type: "active" },
            { id: "hb-a-3-ga", name: "Instinct Universel I", summary: "Conscience partagée avec tous les êtres de l'essence totémique mondiale.", category: "Extra", type: "passive" },
            { id: "hb-a-2-ga", name: "Incarnation du Concept I", summary: "Le combattant devient la manifestation vivante du concept de son Totem.", category: "Extra", type: "active" },
            { id: "hb-a-1-ga", name: "Invocation du Totem II", summary: "Invocation de plusieurs formes spirituelles du Totem simultanément.", category: "Extra", type: "active" },
          ],
        },
      ],
      uniqueAbilities: [
        {
          ability: {
            id: "hb-a-uniq",
            name: "Présence Primordiale — Évolution III",
            summary: "La présence est une force de la nature. Les êtres inférieurs la ressentent comme une constante du monde.",
            category: "Unique",
            type: "passive",
          },
          aspectCount: 3,
        },
      ],
      evolution: {
        name: "Loi du Totem Absolu",
        description: "Loi proclamée sur une région. Absolue pour les êtres inférieurs.",
        prerequisites: "Imposer la loi de son Totem sur une région · Vaincre un être conceptuel de rang A · Être reconnu comme Totem Vivant par 3 seigneurs totémiques",
      },
    },

    // ── S — Totem Vivant ──
    {
      rank: "S",
      title: "Totem Vivant",
      narrative: "Les quatre aspects actifs. Nature, esprits et concepts liés au Totem obéissent. Omnipotence totémique totale.",
      fundamental: {
        id: "hb-s-fund",
        name: "Domination Primordiale",
        summary: "Nature, esprits et concepts liés au Totem obéissent au combattant.",
        category: "Extra",
        type: "active",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-s-4-pt", name: "Réécriture du Concept Totémique", summary: "Modifier les propriétés conceptuelles du Totem dans une région.", category: "Extra", type: "active" },
            { id: "hb-s-3-pt", name: "Présence du Prédateur Absolu", summary: "Aura s'étendant à des kilomètres. Supériorité instinctivement ressentie.", category: "Extra", type: "passive" },
            { id: "hb-s-2-pt", name: "Immortalité Totémique I", summary: "Tant que le concept du Totem existe dans le monde, le combattant ne peut mourir.", category: "Extra", type: "passive" },
            { id: "hb-s-1-pt", name: "Invocation de l'Ancêtre I", summary: "Invoquer l'Ancêtre Primordial comme entité indépendante et souveraine.", category: "Extra", type: "active" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-s-4-mc", name: "Réécriture du Concept Totémique", summary: "Modifier les propriétés conceptuelles du Totem dans une région.", category: "Extra", type: "active" },
            { id: "hb-s-3-mc", name: "Présence du Prédateur Absolu", summary: "Aura s'étendant à des kilomètres. Supériorité instinctivement ressentie.", category: "Extra", type: "passive" },
            { id: "hb-s-2-mc", name: "Immortalité Totémique I", summary: "Tant que le concept du Totem existe dans le monde, le combattant ne peut mourir.", category: "Extra", type: "passive" },
            { id: "hb-s-1-mc", name: "Invocation de l'Ancêtre I", summary: "Invoquer l'Ancêtre Primordial comme entité indépendante et souveraine.", category: "Extra", type: "active" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-s-4-ga", name: "Réécriture du Concept Totémique", summary: "Modifier les propriétés conceptuelles du Totem dans une région.", category: "Extra", type: "active" },
            { id: "hb-s-3-ga", name: "Présence du Prédateur Absolu", summary: "Aura s'étendant à des kilomètres. Supériorité instinctivement ressentie.", category: "Extra", type: "passive" },
            { id: "hb-s-2-ga", name: "Immortalité Totémique I", summary: "Tant que le concept du Totem existe dans le monde, le combattant ne peut mourir.", category: "Extra", type: "passive" },
            { id: "hb-s-1-ga", name: "Invocation de l'Ancêtre I", summary: "Invoquer l'Ancêtre Primordial comme entité indépendante et souveraine.", category: "Extra", type: "active" },
          ],
        },
      ],
      uniqueAbilities: [
        {
          ability: {
            id: "hb-s-uniq",
            name: "Présence Primordiale — Forme Finale",
            summary: "L'essence du Totem primordial est projetée comme réalité universelle. Les quatre aspects sont actifs.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 4,
        },
      ],
      evolution: {
        name: "Présence Primordiale",
        description: "Essence du Totem primordial projetée sur une zone mondiale.",
        prerequisites: "Fusionner avec son Ancêtre pendant 7 jours · Être craint par une entité de rang S · Fusionner les Fondamentaux en permanence dans le sanctuaire",
      },
    },

    // ── S+ — Ancêtre Vivant ──
    {
      rank: "S+",
      title: "Ancêtre Vivant",
      narrative: "Connexion vivante à tous les êtres de son Totem dans le monde entier. Son existence redéfinit le concept totémique.",
      fundamental: {
        id: "hb-sp-fund",
        name: "Instinct Primal Absolu",
        summary: "Connexion à tous les êtres liés au Totem dans le monde entier.",
        category: "Extra",
        type: "passive",
      },
      variantAbilities: [
        {
          variantId: "predateur-terrestre",
          abilities: [
            { id: "hb-sp-0-pt", name: "Fondamentaux Intégrés", summary: "Les quatre Fondamentaux opèrent en permanence.", category: "Extra", type: "passive" },
          ],
        },
        {
          variantId: "maitre-des-cieux",
          abilities: [
            { id: "hb-sp-0-mc", name: "Fondamentaux Intégrés", summary: "Les quatre Fondamentaux opèrent en permanence.", category: "Extra", type: "passive" },
          ],
        },
        {
          variantId: "gardien-des-abysses",
          abilities: [
            { id: "hb-sp-0-ga", name: "Fondamentaux Intégrés", summary: "Les quatre Fondamentaux opèrent en permanence.", category: "Extra", type: "passive" },
          ],
        },
      ],
      uniqueAbilities: [
        {
          ability: {
            id: "hb-sp-uniq",
            name: "Instinct Primal Absolu",
            summary: "La connexion à tous les êtres du Totem est permanente et inconsciente. Son existence altère la réalité à l'échelle régionale.",
            category: "Unique",
            type: "ultimate",
          },
          aspectCount: 5,
        },
      ],
    },

    // ── EX — Bête Primordial ──
    {
      rank: "EX",
      title: "Bête Primordial",
      narrative: "Transcendance totale. Le combattant fusionne avec l'Ancêtre Originel. Il est le concept, la meute, la loi naturelle. Statut PNJ exclusif.",
      fundamental: {
        id: "hb-ex-fund",
        name: "Concept Totémique Originel",
        summary: "Le combattant est le Totem lui-même. Son existence redéfinit son concept.",
        category: "Unique",
        type: "passive",
      },
      variantAbilities: [],
      uniqueAbilities: [
        {
          ability: {
            id: "hb-ex-uniq",
            name: "La Bête Est le Monde",
            summary: "Le combattant EST le concept totémique. Son existence est une loi naturelle universelle. Statut PNJ exclusif.",
            category: "Unique",
            type: "ultimate",
          },
          aspectCount: 6,
        },
      ],
    },
  ],
} as SkillTree);

// TITANS — 2 variants: Bastion vs Siège
SKILL_TREES.push(makeBasicTree(
  "titans", "Titans", "タイタン",
  [{ id: "bastion", name: "Bastion", nameJp: "要塞", desc: "Défense inébranlable, armure vivante, protection d'alliés.", color: "#95A5A6" }, { id: "siege", name: "Siège", nameJp: "攻城", desc: "Force de destruction massive, attaques de zone dévastatrices.", color: "#E74C3C" }],
  "B",
  ["Éveil Tellurique", "Pierre ou Tempête", "Armure Ancestrale", "Colosse", "Convergence Titanesque", "Forteresse Vivante", "Titan Awakened", "Marcheur des Continents", "Le Mechaz Réveillé"],
  ["Le lien avec la terre se manifeste. La gravité semble légèrement différente autour du Titan.", "Le choix entre la voie du Bastion (défense) et du Siège (attaque) définit le style.", "L'Armure Ancestrale se développe — une protection naturelle aussi résistante que l'acier.", "Le Titan devient un Colosse — sa taille et sa masse augmentent temporairement.", "Bastion et Siège convergent. Le Titan maîtrise les deux aspects.", "Le corps du Titan est une forteresse ambulante.", "Le Titan de rang S peut créer des tremblements de terre localisés.", "Le Titan marche sur les continents comme d'autres marchent sur le sol.", "Le Titan touche à l'héritage des Mechaz — les sculpteurs des continents."],
  [{ name: "Armure Ancestrale", summary: "Première couche de protection tellurique.", techId: "titan-armure-ancestrale" }, { name: "Poids Titanesque", summary: "La masse corporelle augmente, frappant plus fort." }, { name: "Mur de Pierre", summary: "Élève des barrières telluriques." }, { name: "Impact Sismique", summary: "Les frappes créent des ondes de choc." }, { name: "Bastion Total", summary: "Transformation en forteresse impénétrable." }, { name: "Canon Tellurique", summary: "Concentre l'énergie de la terre en une attaque dévastatrice." }, { name: "Marche Titanesque", summary: "Chaque pas fait trembler le sol dans un large rayon." }, { name: "Colosse Ancestral", summary: "Le Titan canalise la mémoire des Mechaz endormis." }, { name: "Sculpteur de Mondes", summary: "La Loi titanique se réalise — la terre obéit." }],
));

// DÉMONS — 2 variants: Demi-Démon vs Démon Véritable (convergence at B)
SKILL_TREES.push({
  raceId: "demons",
  raceName: "Démons",
  raceNameJp: "悪魔",
  variants: [
    {
      id: "demi-demon",
      name: "Demi-Démon",
      nameJp: "半魔",
      description: "Conserve une part de son existence mortelle. Il vit entre deux mondes, capable d'exploiter simultanément son héritage démoniaque et sa nature humaine. Sa puissance provient de l'équilibre fragile entre deux natures opposées.",
      accentColor: "#DC143C",
      branchStartRank: "E",
    },
    {
      id: "demon-veritable",
      name: "Démon Véritable",
      nameJp: "真悪魔",
      description: "Rejette toute attache au monde mortel et embrasse pleinement son essence originelle. Son corps, son âme et sa volonté ne font plus qu'un avec les forces abyssales.",
      accentColor: "#8B008B",
      branchStartRank: "E",
    },
  ],
  convergenceRank: "B",
  ranks: [
    // ── F — Graine Démoniaque ──
    {
      rank: "F",
      title: "Graine Démoniaque",
      narrative: "Les capacités démoniaques sont dormantes — simples frémissements du chaos intérieur attendant de se libérer. Le Rang F est consacré aux Fondamentaux universels.",
      fundamental: {
        id: "dem-f-fund",
        name: "Instinct Chaotique",
        summary: "Perception des flux corrompus et énergies négatives dans l'environnement. Dormant en Rang F.",
        category: "Innée",
        type: "passive",
      },
      variantAbilities: [],
      evolution: {
        name: "Explosion Chaotique",
        description: "Libération brutale de flux démoniaque brut. La nature de la dévastation dépend des aspects actifs.",
        prerequisites: "Survivre à une agonie complète et revenir par la seule rage · Absorber l'énergie négative de 5 sources différentes · Déclencher involontairement une transformation sous l'effet de la colère",
      },
    },

    // ── E — Démon Mineur (variant choice) ──
    {
      rank: "E",
      title: "Démon Mineur",
      narrative: "Les capacités démoniaques s'éveillent. Le Démon absorbe passivement les énergies négatives et se renforce en zone de conflit. À E-0, le choix de variante est irréversible.",
      fundamental: {
        id: "dem-e-fund",
        name: "Absorption du Flux",
        summary: "Absorption passive des énergies négatives. Renforcement continu en zones de conflit ou corruption.",
        category: "Innée",
        type: "passive",
      },
      variantAbilities: [
        {
          variantId: "demi-demon",
          abilities: [
            {
              id: "dem-e-dd-1",
              name: "Dualité Mortelle I",
              summary: "Corps mi-humain actif. Basculer entre apparence mortelle et forme démoniaque à volonté.",
              category: "Acquise",
              type: "active",
            },
          ],
        },
        {
          variantId: "demon-veritable",
          abilities: [
            {
              id: "dem-e-dv-1",
              name: "Forme Pure I",
              summary: "Forme démoniaque absolue permanente. Chaque attribut physique décuplé.",
              category: "Acquise",
              type: "active",
            },
          ],
        },
      ],
      evolution: {
        name: "Sève Infernale",
        description: "Libération de l'essence dans une cible ou une zone. Ce qui est altéré dépend des aspects actifs.",
        prerequisites: "Absorber l'énergie vitale de 100 êtres vivants · Se relever d'une défaite par la seule volonté sans assistance · Accomplir le Rite de la Fracture : briser intentionnellement une loi locale",
      },
    },

    // ── D — Démon Manifesté ──
    {
      rank: "D",
      title: "Démon Manifesté",
      narrative: "Chaque variante développe sa nature propre. La forme démoniaque commence à se manifester physiquement de manière permanente. La transformation est irréversible.",
      fundamental: {
        id: "dem-d-fund",
        name: "Traque Émotionnelle",
        summary: "Suivi d'une cible par son flux émotionnel résiduel. La peur et la rage laissent des traces durables.",
        category: "Acquise",
        type: "active",
      },
      variantAbilities: [
        {
          variantId: "demi-demon",
          abilities: [
            {
              id: "dem-d-dd-1",
              name: "Dualité Mortelle II",
              summary: "Corps mi-humain actif. Basculer entre apparence mortelle et forme démoniaque à volonté.",
              category: "Acquise",
              type: "active",
            },
          ],
        },
        {
          variantId: "demon-veritable",
          abilities: [
            {
              id: "dem-d-dv-1",
              name: "Forme Pure II",
              summary: "Forme démoniaque absolue permanente. Chaque attribut physique décuplé.",
              category: "Acquise",
              type: "active",
            },
          ],
        },
      ],
      evolution: {
        name: "Corruption Active",
        description: "Projection de l'essence sur une cible. Ce qui est corrompu dépend des aspects actifs.",
        prerequisites: "Détruire le corps physique d'un être de rang C · Absorber une âme corrompue entière lors d'un rituel · Maintenir la Forme Démoniaque 10 minutes en combat",
      },
    },

    // ── C — Démon Confirmé (Unique abilities unlocked) ──
    {
      rank: "C",
      title: "Démon Confirmé",
      narrative: "Le plan spirituel s'ouvre. L'essence démoniaque fusionne avec lui. Les compétences raciales uniques sont débloquées — c'est le seuil de la véritable puissance démoniaque.",
      fundamental: {
        id: "dem-c-fund",
        name: "Perception d'Essences",
        summary: "Perception des âmes et essences spirituelles. Les émotions sont lisibles comme un flux coloré.",
        category: "Acquise",
        type: "passive",
      },
      variantAbilities: [
        {
          variantId: "demi-demon",
          abilities: [
            {
              id: "dem-c-dd-1",
              name: "Symbiose Abyssale I",
              summary: "Canaux mortels et démoniaques actifs simultanément. Accès à des compétences hybrides uniques.",
              category: "Acquise",
              type: "active",
            },
          ],
        },
        {
          variantId: "demon-veritable",
          abilities: [
            {
              id: "dem-c-dv-1",
              name: "Maîtrise Infernale I",
              summary: "Contrôle parfait de la forme pure. Manipulation consciente de son énergie infernale.",
              category: "Acquise",
              type: "active",
            },
          ],
        },
      ],
      uniqueAbilities: [
        {
          ability: {
            id: "dem-c-uniq-dd",
            name: "Dualité Abyssale",
            summary: "Le Demi-Démon maîtrise la tension entre sa nature mortelle et sa nature démoniaque. Capacités qu'aucune des deux natures ne pourrait atteindre seule.",
            category: "Unique",
            type: "passive",
          },
          aspectCount: 1,
        },
        {
          ability: {
            id: "dem-c-uniq-dv",
            name: "Terreur Primordiale",
            summary: "Le Démon Véritable incarne une peur originelle. Sa présence seule génère des réactions instinctives que la raison ne peut pas contrôler.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 1,
        },
      ],
      evolution: {
        name: "Autorité Démoniaque",
        description: "L'aura altère la réalité autour du démon. Déformation physique, dissolution des perceptions, fracture des âmes ou réécriture d'une règle locale selon l'aspect actif.",
        prerequisites: "Corrompre l'âme d'un être de rang B lors d'un rituel de 24h · Maintenir le Domaine Infernal 24h sans interruption en zone hostile · Vaincre un être de rang C en combat exclusivement spirituel",
      },
    },

    // ── B — Haut Démon (CONVERGENCE) ──
    {
      rank: "B",
      title: "Haut Démon",
      narrative: "Les deux variantes convergent en B-0. Maîtrise spirituelle absolue. Les compétences de variante sont conservées — elles continuent de croître sur le tronc commun.",
      fundamental: {
        id: "dem-b-fund",
        name: "Prédation Spirituelle",
        summary: "Perception totale des faiblesses spirituelles adverses. Les fractures d'âme sont visibles.",
        category: "Extra",
        type: "active",
      },
      variantAbilities: [
        {
          variantId: "demi-demon",
          abilities: [
            {
              id: "dem-b-dd-1",
              name: "Transcendance Hybride I",
              summary: "La dualité mortelle/démoniaque transcende ses limites. Accès à des capacités des deux natures.",
              category: "Extra",
              type: "active",
            },
          ],
        },
        {
          variantId: "demon-veritable",
          abilities: [
            {
              id: "dem-b-dv-1",
              name: "Apothéose Infernale I",
              summary: "La forme pure atteint son pinnacle. Puissance démoniaque sans limite sur le plan physique.",
              category: "Extra",
              type: "active",
            },
          ],
        },
      ],
      uniqueAbilities: [
        {
          ability: {
            id: "dem-b-uniq-dd",
            name: "Dualité Abyssale — Évolution II",
            summary: "Les deux natures fusionnent temporairement en une forme intermédiaire surpassant chacune.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 2,
        },
        {
          ability: {
            id: "dem-b-uniq-dv",
            name: "Terreur Primordiale — Évolution II",
            summary: "La terreur devient une force physique mesurable. Elle affecte les corps autant que les esprits.",
            category: "Unique",
            type: "active",
          },
          aspectCount: 2,
        },
      ],
      evolution: {
        name: "Trône du Chaos",
        description: "Territoire où le chaos est une loi active. Les règles y sont définies selon les aspects actifs du joueur.",
        prerequisites: "Corrompre une zone de 1km² en y installant un autel du chaos actif · Soumettre et lier par pacte 5 entités de rang B · Survivre à un exorcisme complet de rang A",
      },
      isConvergence: true,
    },

    // ── A — Archidémon Éveillé ──
    {
      rank: "A",
      title: "Archidémon Éveillé",
      narrative: "Le chaos devient une loi locale. Les systèmes organisés se dérèglent dans sa zone. La peur incarnée comme concept — trois aspects actifs simultanément.",
      fundamental: {
        id: "dem-a-fund",
        name: "Loi du Chaos",
        summary: "Le chaos devient une loi locale. Les systèmes organisés se dérèglent dans sa zone.",
        category: "Extra",
        type: "active",
      },
      variantAbilities: [],
      uniqueAbilities: [
        {
          ability: {
            id: "dem-a-uniq",
            name: "Abysse Vivant — Évolution III",
            summary: "Le démon projette l'Abîme comme réalité locale. Dans sa zone, le chaos est une constante.",
            category: "Unique",
            type: "ultimate",
          },
          aspectCount: 3,
        },
      ],
      evolution: {
        name: "Édit du Chaos",
        description: "Loi chaotique s'imposant à la réalité locale. Une règle fondamentale brisée ou inversée dans sa zone.",
        prerequisites: "Effacer l'existence conceptuelle d'un être de rang A · Faire plier une loi naturelle pendant plus d'une heure · Être craint par un être de rang S au point d'altérer son comportement",
      },
    },

    // ── S — Prince du Chaos ──
    {
      rank: "S",
      title: "Prince du Chaos",
      narrative: "Les quatre aspects sont actifs. Le Démon est connecté à tous les flux corrompus dans son territoire. Chaque flux négatif lui est perceptible et manipulable.",
      fundamental: {
        id: "dem-s-fund",
        name: "Omniscience Infernale",
        summary: "Connexion à tous les flux corrompus dans son territoire. Chaque flux négatif perceptible et manipulable.",
        category: "Extra",
        type: "active",
      },
      variantAbilities: [],
      uniqueAbilities: [
        {
          ability: {
            id: "dem-s-uniq",
            name: "Concept Primordial — Forme Finale",
            summary: "Le démon EST le chaos. Sa nature est une loi universelle. Les quatre aspects sont actifs — la personnalisation est totale. Son existence même altère la réalité à l'échelle régionale.",
            category: "Unique",
            type: "ultimate",
          },
          aspectCount: 4,
        },
      ],
      evolution: {
        name: "Abîme Vivant",
        description: "Nature chaotique projetée comme extension permanente de la réalité. L'aspect actif devient constante universelle dans le territoire.",
        prerequisites: "Corrompre l'essence primordiale d'un être de rang S lors d'un rituel d'infestation conceptuelle · Fusionner les Fondamentaux en état passif permanent dans l'Abîme · Être reconnu comme Seigneur par un conseil de 3 entités de rang A",
      },
    },

    // ── S+ — Seigneur de l'Abîme ──
    {
      rank: "S+",
      title: "Seigneur de l'Abîme",
      narrative: "La peur entre directement dans les processus cognitifs de tout être. L'Abîme entier lui obéit. Son existence altère la réalité à l'échelle régionale en permanence.",
      fundamental: {
        id: "dem-sp-fund",
        name: "Fondamentaux Intégrés",
        summary: "Les quatre Fondamentaux fusionnés opèrent passivement et en permanence. La peur entre directement dans les processus cognitifs.",
        category: "Extra",
        type: "passive",
      },
      variantAbilities: [],
      uniqueAbilities: [
        {
          ability: {
            id: "dem-sp-uniq",
            name: "Instinct Chaotique Absolu",
            summary: "La peur entre directement dans les processus cognitifs de tout être. Dissolution de la volonté adverse. L'Abîme entier lui obéit.",
            category: "Unique",
            type: "ultimate",
          },
          aspectCount: 5,
        },
      ],
    },

    // ── EX — Concept Primordial ──
    {
      rank: "EX",
      title: "Concept Primordial",
      narrative: "Le Démon n'est plus une entité — il est le Chaos lui-même. Son existence est une loi naturelle universelle. Statut PNJ exclusif.",
      fundamental: {
        id: "dem-ex-fund",
        name: "Peur Originelle Absolue",
        summary: "Le Démon incarne une peur primordiale universelle. Son existence altère la réalité à l'échelle mondiale.",
        category: "Unique",
        type: "ultimate",
      },
      variantAbilities: [],
      uniqueAbilities: [
        {
          ability: {
            id: "dem-ex-uniq",
            name: "Le Chaos Est Une Loi",
            summary: "Le Démon EST le chaos. Son existence est une loi naturelle universelle. Ce rang est réservé aux PNJ du staff.",
            category: "Unique",
            type: "ultimate",
          },
          aspectCount: 6,
        },
      ],
    },
  ],
} as SkillTree);

// FÉES — 2 variants: Naturelle vs Illusoire
SKILL_TREES.push(makeBasicTree(
  "fees", "Fées", "妖精",
  [{ id: "naturelle", name: "Fée Naturelle", nameJp: "自然フェアリー", desc: "Pouvoirs de guérison, croissance, lien avec les esprits naturels.", color: "#27AE60" }, { id: "illusoire", name: "Fée Illusoire", nameJp: "幻影フェアリー", desc: "Pouvoirs d'illusion, tromperie, manipulation de la perception.", color: "#8E44AD" }],
  "B",
  ["Poussière d'Éther", "Nature ou Illusion", "Miroir Éthéré", "Premier Vœu", "Convergence Féerique", "Cour Féerique", "Reine/Roi des Fées", "Souverain du Miroir", "Le Rêve Éveillé"],
  ["La poussière d'éther apparaît — signe de l'éveil féerique.", "Le choix entre la voie de la Nature (guérison) et de l'Illusion (tromperie).", "Le Miroir Éthéré permet de voir au-delà des apparences.", "Le premier Vœu féerique peut être formulé — un souhait limité.", "Nature et Illusion convergent. La Fée maîtrise les deux.", "La Fée de rang A peut gouverner une Cour de créatures féeriques.", "Au rang S, la Fée est un souverain du monde féerique.", "Le Miroir Éthéré devient une arme et un bouclier.", "La frontière entre rêve et réalité s'efface."],
  [{ name: "Miroir Éthéré", summary: "Permet de voir les illusions et les vérités cachées.", techId: "fee-miroir-ethere" }, { name: "Poussière de Soin", summary: "Guérison mineure par contact." }, { name: "Camouflage Féerique", summary: "Invisibilité partielle en milieu naturel." }, { name: "Vœu Féerique", summary: "Formule un souhait limité avec un coût énergétique." }, { name: "Royaume Féerique", summary: "Crée un domaine où les lois de la réalité sont altérées." }, { name: "Cour des Mirages", summary: "Des créatures féeriques répondent à l'appel." }, { name: "Miroir Total", summary: "Peut créer des clones illusires tangibles." }, { name: "Souveraineté du Rêve", summary: "Peut manipuler les rêves et les cauchemars." }, { name: "Le Rêve Est Réel", summary: "La Loi féerique se réalise — l'illusion devient réalité." }],
));