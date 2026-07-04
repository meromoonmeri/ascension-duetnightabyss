export interface GrimoireSection {
  id: string;
  number: string; // Roman numeral
  title: string;
  subtitle: string;
  content: string; // Can contain markdown-like formatting
  type: "text" | "table" | "interactive" | "quote";
  tableData?: { headers: string[]; rows: { col1: string; col2: string }[] };
}

export const GRIMOIRE_SECTIONS: GrimoireSection[] = [
  {
    id: "source-magicules",
    number: "I",
    title: "La Source et les Magicules",
    subtitle: "Énergie universelle",
    type: "text",
    content: `La **Source** est l'énergie potentielle de tout l'univers. Elle est appelée selon les cultures : Mana, Ki, Aether ou énergie spirituelle — mais reste identique dans son essence.

Elle ne possède aucune conscience et ne produit aucun effet seule. Elle n'interagit avec rien d'autre qu'elle-même dans son état naturel.

**Magicules** : La Source existe sous forme de particules neutres et instables appelées **Magicules** : passives, sans effet autonome, elles saturent le monde entier.

La densité des Magicules varie selon les zones. Un marais maudit, un volcan, une forêt ancienne regorgent de Magicules denses, tandis qu'une zone habitée par les humains en contient très peu. Plus la concentration ambiante est forte, plus les êtres qui y vivent ont un potentiel élevé dès la naissance.

Tout être vivant absorbe naturellement des Magicules de son environnement pour les convertir en énergie personnelle. Ces magicules servent à alimenter leurs compétences passives. Les monstres, esprits et créatures nées de zones à forte concentration démarrent avec un potentiel et des compétences passives largement supérieurs aux races dites « communes ».`,
  },
  {
    id: "ep",
    number: "II",
    title: "L'EP",
    subtitle: "Énergie Potentielle",
    type: "text",
    content: `Chaque être possède une masse d'énergie inerte appelée **EP**, qui représente sa réserve personnelle de Magicules convertis. L'EP est invisible à l'œil nu mais peut être perçue par quiconque maîtrise la Perception. Une EP élevée "déborde" sur les plans, créant une pression écrasante et une aura presque palpable autour de l'individu.

L'EP sert à tout : activer/exprimer une compétence, maintenir une transformation, renforcer le corps, lancer une magie. Plus une action est exigeante, plus elle consomme d'EP.

**Plus un personnage possède d'EP, plus sa puissance brute est élevée.** C'est la mesure directe de sa force.

**Comment l'EP augmente :**
• L'entraînement constant
• L'absorption d'EP d'un adversaire vaincu ou d'un cadavre
• L'évolution de rang`,
  },
  {
    id: "fondamentaux",
    number: "III",
    title: "Les Fondamentaux",
    subtitle: "Bases de manipulation",
    type: "table",
    content: "Avant même de développer des Compétences, tout utilisateur de la Source apprend à manier le flux qui est à l'origine de toutes les capacités. Ces manières de contrôler le flux à l'état brut sont qualifiées de **Fondamentaux**. Ils s'appliquent à toute Compétence et sont au nombre de cinq. À partir du Rang D, ils deviennent des réflexes de combat.",
    tableData: {
      headers: ["FONDAMENTAL", "DESCRIPTION"],
      rows: [
        { col1: "Perception", col2: "La première étape de la maîtrise de l'énergie. Percevoir la pression oppressante des êtres puissants et voir le flux d'autrui." },
        { col1: "Éveil", col2: "La capacité d'absorber et convertir des magicules neutres en magicules personnelles. Usage avancé : conversion à distance." },
        { col1: "Effacement", col2: "Reconvertir des magicules personnelles en magicules neutres pour les relâcher. Rend l'utilisateur indétectable par la Perception." },
        { col1: "Contrôle", col2: "Contrôler librement son flux de magicules personnelles — les déplacer et en changer la forme. Quand deux flux se rencontrent, la densité détermine lequel l'emporte." },
        { col1: "Expression", col2: "Transformer l'énergie en pouvoir. Permet de dépenser de l'EP pour exprimer une Compétence, qu'elle soit innée ou acquise." },
      ],
    },
  },
  {
    id: "build",
    number: "IV",
    title: "Le Build",
    subtitle: "Structure d'un combattant",
    type: "table",
    content: "Un personnage est défini par quatre piliers, qui correspondent directement aux catégories de Compétences.",
    tableData: {
      headers: ["PILIER", "DESCRIPTION"],
      rows: [
        { col1: "Pilier 1 — Race", col2: "Instincts et affinités innés — source des Compétences Innées." },
        { col1: "Pilier 2 — Fondamentaux", col2: "Maîtrise de la Source — socle commun à toutes les Compétences." },
        { col1: "Pilier 3 — Disciplines", col2: "Techniques apprises — source des Compétences Acquises et des Extra Compétences." },
        { col1: "Pilier 4 — Compétence Unique", col2: "Pouvoir personnel — loi propre au personnage." },
      ],
    },
  },
  {
    id: "competences",
    number: "V",
    title: "Les Compétences",
    subtitle: "Quatre catégories",
    type: "table",
    content: "Les Compétences se répartissent en quatre catégories. Toute Compétence s'analyse aussi selon sa fonction (Passive, Active, Globale, Offensive, Défensive, Utilitaire) et le Plan sur lequel elle agit.",
    tableData: {
      headers: ["CATÉGORIE", "DESCRIPTION"],
      rows: [
        { col1: "Compétences Innées", col2: "Présentes dès la naissance, liées à la race ou à l'héritage. Coûtent peu d'EP, très stables." },
        { col1: "Compétences Acquises", col2: "Obtenues par l'entraînement, l'étude, l'expérience de combat ou l'observation d'une technique adverse." },
        { col1: "Extra Compétences", col2: "Capacités secondaires accompagnant une montée en rang. Renforcent l'usage du build (résistance, sens, régénération)." },
        { col1: "Compétence Unique", col2: "Le cœur absolu du personnage. Une seule par individu, définissant une loi personnelle." },
      ],
    },
  },
  {
    id: "plans",
    number: "VI",
    title: "Les 4 Plans",
    subtitle: "Grille de lecture",
    type: "table",
    content: "Les Plans sont différentes « couches » spatio-temporelles qui contiennent différents types d'entités. Toute Compétence agit sur un ou plusieurs de ces quatre Plans. Un pouvoir ne sort jamais des Plans — ils décrivent uniquement comment il agit.",
    tableData: {
      headers: ["PLAN", "DESCRIPTION"],
      rows: [
        { col1: "Physique", col2: "Agit sur le corps, la matière, la force." },
        { col1: "Spirituel", col2: "Agit sur la mémoire, la volonté, la réflexion et les émotions." },
        { col1: "Cognitif", col2: "Agit sur la perception et les sens." },
        { col1: "Conceptuel", col2: "Agit sur des règles, des notions, des conditions, des liens, des principes." },
      ],
    },
  },
  {
    id: "formes",
    number: "VII",
    title: "Les 3 Formes d'Expression",
    subtitle: "Manières d'utiliser la Source",
    type: "table",
    content: "Toute Compétence peut s'exprimer de trois façons.",
    tableData: {
      headers: ["FORME", "DESCRIPTION"],
      rows: [
        { col1: "1 — Interne", col2: "Effets sur soi (boost, perception accrue, résistance)." },
        { col1: "2 — Projetée", col2: "Attaques classiques (projectiles, explosions, rayon, etc.)." },
        { col1: "3 — Délocalisée", col2: "Effets apparaissant directement à distance (génération dans l'espace ciblé, effets de zone)." },
      ],
    },
  },
  {
    id: "competence-unique",
    number: "VIII",
    title: "Compétence Unique",
    subtitle: "Loi personnelle",
    type: "interactive",
    content: `La Compétence Unique est le cœur absolu du personnage. **Une seule par individu**, en principe incapable d'évoluer en une autre sauf événement narratif majeur. Elle définit une **loi personnelle** qui s'applique à la façon dont l'EP se manifeste.

Deux personnages avec la même Compétence Unique réagiront différemment selon leur personnalité, leur passé et leur intention. Elle peut agir sur **plusieurs Plans à la fois**.

**OBLIGATOIRE sur la fiche :** l'effet exact, le ou les Plans utilisés, les limites, la logique d'application.

**Exemple interactif — Compétence Unique « Feu » :**

Cliquez sur un Plan ci-dessous pour voir l'effet correspondant :`,
  },
  {
    id: "rangs",
    number: "IX",
    title: "Les Rangs",
    subtitle: "Une échelle de puissance",
    type: "table",
    content: "Le rang d'un personnage ne mesure pas seulement sa puissance brute : il reflète aussi la stabilité de son contrôle sur l'EP et ses compétences. **Note : ce système de rangs mesure la puissance globale d'un personnage (toutes races confondues), distinct des rangs de progression propres à chaque race.**",
    tableData: {
      headers: ["RANG", "CE QU'IL APPORTE"],
      rows: [
        { col1: "F", col2: "Rang d'entrée. EP faible, Fondamentaux instables, Compétences Innées seules ou presque inexistantes." },
        { col1: "E", col2: "Premiers réflexes de combat. Une Compétence Acquise commence à émerger." },
        { col1: "D", col2: "Les Fondamentaux deviennent des réflexes. Le build se stabilise." },
        { col1: "C", col2: "EP conséquent, Extra Compétences accessibles. Le personnage commence à peser dans un affrontement." },
        { col1: "B", col2: "Hax plus complexes : combinaisons de Plans, effets à double tranchant. Influence régionale." },
        { col1: "A", col2: "Puissance redoutée. La Compétence Unique gagne en portée et en finesse d'application." },
        { col1: "S", col2: "Rang d'exception. EP massif, contrôle quasi parfait, capable de renverser une bataille à lui seul." },
        { col1: "SS+", col2: "Tout autre niveau de maîtrise. Chaque action peut marquer l'histoire." },
        { col1: "SSS+", col2: "Au-delà de l'échelle commune. Peu de forces peuvent rivaliser ou même percevoir son plein potentiel." },
        { col1: "EX", col2: "Rang hors-norme, à la frontière du mythe. Réservé aux entités dont l'existence redéfinit l'équilibre du monde." },
      ],
    },
  },
  {
    id: "resonance",
    number: "X",
    title: "Résonance & Contestation",
    subtitle: "Pression énergétique",
    type: "text",
    content: `Le flux d'un individu peut exercer une pression sur d'autres flux — qu'il s'agisse du flux d'autrui ou des magicules neutres. Cela permet de :
• Perturber une Compétence en cours avant son activation complète
• Contester une zone d'énergie
• Désorganiser un flux adverse

Pour réussir à interrompre une Compétence adverse, il faut **une quantité ou densité de flux supérieure et un timing précis** — rendant l'opération complexe.

**Limites :** Dépend surtout du timing et du Contrôle de celui qui l'exerce.`,
  },
  {
    id: "combat",
    number: "XI",
    title: "Système de Combat",
    subtitle: "Clash et résolution",
    type: "text",
    content: `Le combat repose sur le timing, la lecture des effets, le contrôle, le positionnement et l'interaction des compétences.

**Un Clash n'existe que si deux effets sont incompatibles et entrent en contact direct.** Sinon, ils coexistent.

**Résolution d'un Clash** — trois facteurs, jamais un simple chiffre :
1. **L'écart d'EP** entre les deux partis (différence abyssale à partir de deux rangs)
2. **L'interaction entre les Compétences** — un effet intelligemment choisi peut éviter une confrontation directe
3. **Le Contrôle** — la densité et la concentration d'énergie peut contourner une quantité plus élevée

Le contexte et la position narrative peuvent permettre d'éviter les clash. La force brute ne fait pas tout.`,
  },
  {
    id: "regle-finale",
    number: "XII",
    title: "Règle Finale",
    subtitle: "",
    type: "quote",
    content: "Votre hax ne gagne pas systématiquement les combats. Ce sont la maîtrise, la cohérence et la stratégie qui déterminent le résultat.",
  },
];

// Interactive example for Compétence Unique "Feu"
export const FEU_EXAMPLE = [
  { plan: "Physique", effect: "Brûlure via du feu classique, peut être éteinte avec l'eau.", icon: "🔥", color: "#EF4444" },
  { plan: "Spirituel", effect: "Brûlure des souvenirs.", icon: "💔", color: "#A855F7" },
  { plan: "Cognitif", effect: "Perception de chaleur / douleur fantôme (sensation de brûlure).", icon: "👁", color: "#3B82F6" },
  { plan: "Conceptuel", effect: "Effet de brûlure « absolu ».", icon: "✦", color: "#F59E0B" },
];