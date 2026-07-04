// Ascension Arts Data — 8 Arts de magie (sources canoniques)

export interface ArtTechnique {
  id: string;
  nameJp: string;
  nameFr: string;
  subtitle: string;
  rank: string;
  style: "Spécialiste" | "Hybride" | "Secondaire Hybride" | "Polyvalent";
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

export interface SubBranch {
  id: string;
  name: string;
  description: string;
  items: string[];
  isForbidden?: boolean;
}

export interface ArtData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  lore: string;
  subBranches: SubBranch[];
  colors: {
    primary: string;
    secondary: string;
    bg: string;
    text: string;
    textLight: string;
    glow: string;
  };
  dayColors: {
    primary: string;
    secondary: string;
    bg: string;
    text: string;
    glow: string;
  };
  icon: string;
}

export const ART_DATA: ArtData[] = [
  // ═══════════════════════════════════════════
  // 1. LES ARTS ÉLÉMENTAIRES
  // ═══════════════════════════════════════════
  {
    id: "arts-elementaires",
    name: "Les Arts Élémentaires",
    subtitle: "La maîtrise des forces fondamentales de la réalité",
    description:
      "Les Arts Élémentaires constituent la base de toute pratique magique dans le monde d'Ascension. Ils reposent sur la canalisation de l'Énergie Potentielle à travers les affinités élémentaires innées du pratiquant, permettant la manipulation directe des forces naturelles qui composent la réalité matérielle. De la flamme la plus simple à la gravité elle-même, les Arts Élémentaires couvrent un spectre allant des forces les plus accessibles aux plus abstraites et destructrices.",
    lore:
      "Chaque être naît avec une affinité élémentaire latente, déterminée par son essence spirituelle et son lignage. Les Académies Élémentaires — de Solaria aux Monastères de Vent des Montagnes Flottantes — enseignent les fondements de la manipulation élémentaire à des milliers d'apprentis chaque année. Les Éléments Fondamentaux sont accessibles à tous les pratiquants disposant d'une affinité correspondante, mais les Éléments Supérieurs exigent des décennies de maîtrise et une compréhension profonde de la nature même de l'Énergie Potentielle.",
    subBranches: [
      {
        id: "elements-fondamentaux",
        name: "Éléments Fondamentaux",
        description:
          "Les quatre piliers de la réalité matérielle — Feu, Eau, Terre et Air. Ce sont les éléments les plus répandus et les plus accessibles. Quasiment tous les pratiquants élémentaires commencent par l'un de ces quatre, dont la maîtrise conditionne l'accès aux éléments supérieurs.",
        items: [
          "Feu — Manipulation de la chaleur, de la flamme et de la combustion. Du simple éclairage à l'incinération de zone.",
          "Eau — Contrôle des liquides, des courants et de l'humidité. Inclut la manipulation de la glace à bas niveau.",
          "Terre — Maîtrise des roches, des minéraux et de la structure du sol. Permet la création de barrières et la manipulation géologique.",
          "Air — Contrôle des vents, de la pression atmosphérique et des gaz. Du souffle coupant à la suppression de l'oxygène.",
        ],
      },
      {
        id: "elements-secondaires",
        name: "Éléments Secondaires",
        description:
          "Déclinaisons avancées des éléments fondamentaux, les éléments secondaires naissent de la combinaison ou de l'affinage de deux éléments de base. Ils exigent une double affinité ou une maîtrise poussée d'un élément fondamental associée à une compréhension théorique solide.",
        items: [
          "Glace — Affinement extrême de l'élément Eau. Manipulation du froid absolu, cristallisation et fragmentation.",
          "Foudre — Synthèse de l'Air et du Feu. Décharges électriques, arcs, champs électromagnétiques localisés.",
          "Sable — Déclinaison de la Terre. Contrôle des particules fines, érosion accélérée, tempêtes de sable.",
          "Métal — Affinement de la Terre. Forge instantanée, manipulation des alliages, blindage métallique.",
          "Lave — Fusion du Feu et de la Terre. Flux magmatiques, solidification, création de terrain volcanique.",
          "Vapeur — Combinaison de l'Eau et du Feu. Brouillards occultants, surpression thermique.",
        ],
      },
      {
        id: "elements-superieurs",
        name: "Éléments Supérieurs",
        description:
          "Les éléments supérieurs transcendent la matière visible. Leur manipulation requiert non seulement une puissance considérable mais aussi une compréhension conceptuelle des lois fondamentales de la réalité. Seuls les pratiquants de rang S et au-delà y accèdent généralement, et leur usage est étroitement surveillé par les autorités magiques.",
        items: [
          "Gravité — Altération du champ gravitationnel local. Lévitation, écrasement, inversion de gravité sur zone.",
          "Magnétisme — Contrôle des forces magnétiques. Manipulation des métaux à distance, boussoles spirituelles, champs de force.",
          "Entropie — Accélération ou décélération de la dégradation naturelle. Vieillissement accéléré de la matière, désintégration contrôlée.",
          "Néant — L'élément le plus abstrait et le plus dangereux. Création de zones de vide absolu où ni la matière ni l'énergie ne persistent.",
        ],
      },
      {
        id: "arts-interdits-elementaires",
        name: "Arts Interdits",
        description:
          "Certains usages des Arts Élémentaires sont formellement proscrits par le Traité de la Concorde Magique. Ces pratiques, jugées trop destructrices ou trop instables, sont punies de sanctions sévères allant jusqu'à la mise à mort dans les nations les plus strictes.",
        items: [
          " Fusion élémentaire chaotique — Mélange non contrôlé d'éléments incompatibles provoquant des réactions en chaîne imprévisibles.",
          " Invocation d'éléments primordiaux — Appel de forces élémentaires pures dépassant la capacité de contrôle du pratiquant.",
          " Élémentation corporelle — Transformation permanente du propre corps en un élément, entraînant la perte de l'humanité.",
        ],
        isForbidden: true,
      },
    ],
    colors: {
      primary: "#E85D04",
      secondary: "#FAA307",
      bg: "rgba(232,93,4,0.08)",
      text: "#F5C882",
      textLight: "#A63E00",
      glow: "rgba(232,93,4,0.4)",
    },
    dayColors: {
      primary: "#A63E00",
      secondary: "#E85D04",
      bg: "rgba(232,93,4,0.06)",
      text: "#6B2600",
      glow: "rgba(166,62,0,0.3)",
    },
    icon: "🔥",
  },

  // ═══════════════════════════════════════════
  // 2. LES ARTS DU COMBAT
  // ═══════════════════════════════════════════
  {
    id: "arts-du-combat",
    name: "Les Arts du Combat",
    subtitle: "L'ultime dépassement des limites du corps par le Ki",
    description:
      "Les Arts du Combat reposent sur l'utilisation du Ki — l'énergie vitale interne du pratiquant — pour dépasser les limites physiques naturelles du corps. Contrairement aux autres Arts qui canalisent l'Énergie Potentielle extérieure, les Arts du Combat transforment l'énergie interne en puissance brute, vitesse, résistance et capacité de destruction. C'est l'Art le plus ancien, le plus direct, et le plus meurtrier au corps-à-corps.",
    lore:
      "Avant l'invention des systèmes académiques et des théories de l'Énergie Potentielle, les guerriers primordiaux découvrirent instinctivement comment canaliser leur volonté de survivre en puissance physique. Les premiers maîtres de combat développèrent les fondations des capacités du Ki bien avant que quiconque ne nomme l'Énergie Potentielle. Aujourd'hui encore, les Arts du Combat restent l'Art le plus pratiqué par les aventuriers de rang inférieur, car ils ne nécessitent aucune affinité élémentaire — seulement la volonté et l'entraînement.",
    subBranches: [
      {
        id: "ki-renforcement",
        name: "Capacités Fondamentales du Ki",
        description:
          "Les neuf capacités fondamentales constituent le socle de toute pratique des Arts du Combat. Chacune peut être développée indépendamment, mais leur puissance réelle se révèle lorsqu'elles sont combinées. Un maître des Arts du Combat ne se contente pas de frapper fort — il synchronise chaque capacité pour créer des enchaînements imprévisibles et dévastateurs.",
        items: [
          "Renforcement Corporel — Augmentation de la force physique brute en canalisant le Ki dans les muscles. Permet de soulever des masses considérables et d'augmenter la puissance d'impact.",
          "Reflet de Vitesse — Amplification de la vitesse de déplacement et de réaction. Au plus haut niveau, le pratiquant laisse des afterimages et semble se téléporter.",
          "Projection de Ki — Émission du Ki sous forme d'ondes ou de projectiles énergétiques. Permet d'attaquer à distance sans contact direct.",
          "Impulsion Cinétique — Concentration du Ki dans un point d'impact pour démultiplier la force cinétique. Un simple doigt peut percer l'acier.",
          "Armure Énergétique — Enveloppement du corps dans une coque de Ki qui absorbe les dommages. Diffère du renforcement : c'est une barrière, pas une augmentation.",
          "Impact Brut — Libération soudaine et totale du Ki accumulé en un seul coup dévastateur. L'équivalent d'une déflagration corporelle.",
          "Onde de Choc — Décharge de Ki dans toutes les directions à partir du corps. Efficace contre les ennemis environnants et pour briser des attaques.",
          "Marche sur Flux — Technique de déplacement avancée : le pratiquant marche sur des courants de Ki qu'il génère sous ses pieds, lui permettant de se déplacer dans les airs ou sur des surfaces instables.",
          "Extension de Portée — Allongement du Ki au-delà des limites physiques du corps. Les poings et les jambes frappent à plusieurs mètres de distance grâce à des projections de Ki solidifiées.",
        ],
      },
    ],
    colors: {
      primary: "#DC2626",
      secondary: "#FCA5A5",
      bg: "rgba(220,38,38,0.08)",
      text: "#F5B0B0",
      textLight: "#991B1B",
      glow: "rgba(220,38,38,0.4)",
    },
    dayColors: {
      primary: "#991B1B",
      secondary: "#DC2626",
      bg: "rgba(220,38,38,0.06)",
      text: "#7F1D1D",
      glow: "rgba(153,27,27,0.3)",
    },
    icon: "⚔️",
  },

  // ═══════════════════════════════════════════
  // 3. LES ARTS RUNIQUES
  // ═══════════════════════════════════════════
  {
    id: "arts-runiques",
    name: "Les Arts Runiques",
    subtitle: "L'écriture primordiale qui sculpte la réalité",
    description:
      "Les Arts Runiques sont la discipline des sceaux, des enchantements et de la programmation magique. Les runes — symboles primordiaux gravés dans le tissu même de la réalité — permettent de stocker, de transformer et de libérer l'énergie selon des lois précises et immuables. Là où les autres Arts exigent une canalisation continue, les Arts Runiques permettent de préparer des effets à l'avance et de les déclencher sur commande.",
    lore:
      "Les runes furent découvertes il y a des millénaires, gravées dans les parois des cavernes les plus profondes du monde. Les premiers runistes crurent d'abord à des marques naturelles, avant de réaliser que ces symboles répondaient à leur énergie — s'illuminant, vibrant, obéissant. Aujourd'hui, les runes sont intégrées à presque tous les aspects de la vie quotidienne d'Ascension : sceaux de protection sur les portes, enchantements sur les armes, cercles rituels dans les donjons, et même des runes de communication à travers les continents.",
    subBranches: [
      {
        id: "transmutation-runique",
        name: "Transmutation Runique",
        description:
          "Branche fondamentale des Arts Runiques, la Transmutation permet de modifier les propriétés physiques et chimiques de la matière en appliquant des séquences de runes sur un objet ou une substance. C'est la base de la forge enchantée et de l'alchimie runique.",
        items: [
          "Transformation des propriétés matérielles — Durcissement, allègement, changement de texture.",
          "Transmutation d'éléments — Conversion d'un matériau en un autre (pierre en fer, bois en cristal).",
          "Sceaux de conservation — Runes préservant l'état d'un objet ou d'une substance indéfiniment.",
        ],
      },
      {
        id: "materialisation",
        name: "Matérialisation",
        description:
          "La Matérialisation runique permet de créer des objets et des structures à partir de l'Énergie Potentielle pure, en utilisant des schémas runiques comme plans de construction. L'objet materialisé persiste tant que la rune le soutient, ou peut être rendu permanent par des enchantements spécialisés.",
        items: [
          "Création d'armes et d'outils runiques — Materialisation d'équipement de combat ou utilitaire.",
          "Construction de barrières et de murs — Érection rapide de structures défensives.",
          "Génération de projectiles — Création de munitions runiques (flèches, lances, boulets).",
        ],
      },
      {
        id: "metamorphose",
        name: "Métamorphose",
        description:
          "La Métamorphose runique va au-delà de la simple transmutation de matière — elle modifie la forme et parfois la nature même des êtres vivants ou des objets complexes. C'est l'une des branches les plus délicates et les plus surveillées des Arts Runiques.",
        items: [
          "Modification corporelle temporaire — Changement d'apparence, de taille ou de structure physique.",
          "Métamorphose animale — Transformation partielle ou totale en une créature spécifique.",
          "Hybridation — Fusion temporaire de caractéristiques de différentes espèces.",
        ],
      },
      {
        id: "scellement",
        name: "Scellement",
        description:
          "Le Scellement est l'art de confiner, de piéger et de verrouiller. Les runes de scellement sont parmi les plus puissantes et les plus difficiles à briser. Elles servent à emprisonner des entités, à sceller des pouvoirs dangereux, ou à protéger des zones entières.",
        items: [
          "Sceaux de confinement — Emprisonnement d'entités ou d'énergies dans un espace délimité.",
          "Scellement de pouvoirs — Suppression temporaire ou permanente des capacités d'un individu.",
          "Barrières runiques — Déploiement de périmètres de protection impossibles à traverser sans la clé runique.",
        ],
      },
      {
        id: "enchantement-structure",
        name: "Enchantement Structuré",
        description:
          "L'Enchantement Structuré est l'application systématique de séquences runiques sur des objets, des armures, des armes ou des bâtiments pour leur conférer des propriétés magiques durables. C'est la branche la plus utilisée commercialement — les enchantements d'armes et d'armures sont la base de l'économie artisanale magique.",
        items: [
          "Enchantement d'armes — Ajout d'effets élémentaux, perçants ou destructeurs aux armes.",
          "Enchantement d'armures — Renforcement magique de la résistance, légèreté, ou propriétés spéciales.",
          "Enchantement d'infrastructure — Runes appliquées aux bâtiments pour la protection, le climat, ou la surveillance.",
        ],
      },
    ],
    colors: {
      primary: "#0EA5E9",
      secondary: "#7DD3FC",
      bg: "rgba(14,165,233,0.08)",
      text: "#A5D8F0",
      textLight: "#0369A1",
      glow: "rgba(14,165,233,0.4)",
    },
    dayColors: {
      primary: "#0369A1",
      secondary: "#0EA5E9",
      bg: "rgba(14,165,233,0.06)",
      text: "#024E7A",
      glow: "rgba(3,105,161,0.3)",
    },
    icon: "🔮",
  },

  // ═══════════════════════════════════════════
  // 4. LES ARTS INVISIBLES
  // ═══════════════════════════════════════════
  {
    id: "arts-invisibles",
    name: "Les Arts Invisibles",
    subtitle: "Les arts de ce qui ne se voit pas — esprit, espace et réalité",
    description:
      "Les Arts Invisibles regroupent l'ensemble des pratiques magiques qui agissent sur des plans imperceptibles à l'œil nu — l'esprit, l'âme, l'espace, le temps et les lois causales de la réalité. Leurs pratiquants ne produisent pas d'explosions ni de projections visibles ; leur pouvoir s'exerce dans l'ombre, la discrétion et la subtilité. Les Arts Invisibles sont les plus redoutés par ceux qui comprennent leur portée véritable.",
    lore:
      "Les Arts Invisibles furent longtemps considérés comme de la superstition ou de la magie mineure, car leurs effets ne sont pas directement observables. Ce n'est qu'avec le développement de la Voyance que les érudits purent mesurer l'étendue réelle de ces pratiques. Aujourd'hui, les specialists des Arts Invisibles sont parmi les individus les plus influents — et les plus dangereux — du monde d'Ascension, car ils peuvent altérer la perception, manipuler l'esprit, et même modifier les lois de la causalité.",
    subBranches: [
      {
        id: "occultisme-spiritisme",
        name: "Occultisme & Spiritisme",
        description:
          "L'Occultisme et le Spiritisme sont les branches des Arts Invisibles qui concernent le monde des esprits, des âmes et des entités incorporelles. Leurs pratiquants communiquent avec les défunts, invoquent des esprits, et perçoivent les résidus énergétiques laissés par les êtres passés.",
        items: [
          "Communication avec les défunts — Établissement d'un canal de communication avec les âmes errantes.",
          "Invocation d'esprits — Appel et liaison temporaire d'entités spirituelles pour guidance ou combat.",
          "Perception spectrale — Vision des résidus spirituels, des empreintes énergétiques et des auras.",
          "Exorcisme et purification — Dissipation d'entités malveillantes et nettoyage des lieux hantés.",
        ],
      },
      {
        id: "voyance-divination",
        name: "Voyance & Divination",
        description:
          "La Voyance et la Divination permettent de percevoir au-delà des sens normaux — voir l'avenir, le passé caché, les lieux distants, et les vérités enfouies. C'est l'une des branches les plus précieuses en renseignement et en exploration.",
        items: [
          "Clairvoyance — Vision à distance de lieux, d'événements ou d'individus en temps réel.",
          "Précognition — Perception fragmentaire des événements futurs probables.",
          "Rétrocognition — Vision des événements passés liés à un lieu ou un objet.",
          "Divination par les runes — Utilisation de runes spéciales comme outil de divination codifiée.",
        ],
      },
      {
        id: "mentalisme",
        name: "Mentalisme",
        description:
          "Le Mentalisme est la branche la plus invasive des Arts Invisibles. Elle permet d'accéder à l'esprit d'autrui — lire les pensées, influencer les décisions, implanter des suggestions, et dans les cas extrêmes, prendre le contrôle total d'un individu.",
        items: [
          "Télépathie — Lecture et transmission de pensées à distance.",
          "Suggestion mentale — Implantation subtile d'idées ou d'impulsions dans l'esprit d'une cible.",
          "Contrôle mental — Prise de possession partielle ou totale de l'esprit d'un individu.",
          "Bouclier psychique — Protection contre les intrusions mentales et les tentatives de contrôle.",
        ],
      },
      {
        id: "illusions",
        name: "Illusions",
        description:
          "Les Illusions altèrent la perception sensorielle des cibles sans modifier la réalité matérielle. Un illusionniste de haut niveau peut créer des mondes entiers perçus comme réels par ses victimes, rendant impossible la distinction entre le vrai et le faux.",
        items: [
          "Illusions visuelles — Création d'images, de mirages et de scènes complètes.",
          "Illusions sonores — Génération de voix, de bruits et de musiques inexistantes.",
          "Illusions olfactives et tactiles — Simulation complète de sensations physiques.",
          "Illusion totale — Environnement sensoriel complet impossible à distinguer de la réalité.",
        ],
      },
      {
        id: "spatialite",
        name: "Spatialité",
        description:
          "La Spatialité est la maîtrise de l'espace lui-même — distances, dimensions et positions. Ses pratiquants peuvent plier l'espace, créer des portails, et modifier les distances perçues entre deux points.",
        items: [
          "Téléportation — Déplacement instantané entre deux points de l'espace.",
          "Portails dimensionnels — Création de passages stables entre deux lieux éloignés.",
          "Distorsion spatiale — Modification des distances (rapprochement ou éloignement instantané).",
          "Poches spatiales — Création d'espaces de stockage hors de la réalité matérielle.",
        ],
      },
      {
        id: "temporalite",
        name: "Temporalité",
        description:
          "La Temporalité est la branche la plus abstraite et la plus dangereuse des Arts Invisibles. Elle touche à l'écoulement du temps lui-même — son accélération, son ralentissement, et dans les cas les plus extrêmes, sa manipulation ponctuelle.",
        items: [
          "Ralentissement temporel — Réduction de la vitesse d'écoulement du temps dans une zone.",
          "Accélération temporelle — Augmentation de la vitesse d'écoulement du temps sur une cible ou une zone.",
          "Stase temporelle — Figement complet du temps dans un espace délimité.",
          "Flash temporel — Retour en arrière de quelques secondes sur un événement spécifique (usage extrêmement limité et épuisant).",
        ],
      },
      {
        id: "causalite-realite",
        name: "Causalité & Réalité",
        description:
          "La Causalité et la Réalité constituent le sommet absolu des Arts Invisibles — et potentiellement de tous les Arts. Leurs pratiquants peuvent altérer les chaînes causales et modifier les propriétés fondamentales de la réalité elle-même. C'est un pouvoir qui frôle les Arts Défendus.",
        items: [
          "Altération causale — Modification des liens de cause à effet (rendre un événement plus ou moins probable).",
          "Réécriture de réalité — Changement temporaire des lois physiques dans un périmètre donné.",
          "Négation de probabilité — Rendu impossible d'un événement qui aurait dû se produire (et inversement).",
        ],
      },
    ],
    colors: {
      primary: "#A855F7",
      secondary: "#D8B4FE",
      bg: "rgba(168,85,247,0.08)",
      text: "#D4B8F0",
      textLight: "#6B21A8",
      glow: "rgba(168,85,247,0.4)",
    },
    dayColors: {
      primary: "#6B21A8",
      secondary: "#A855F7",
      bg: "rgba(168,85,247,0.06)",
      text: "#4A1580",
      glow: "rgba(107,33,168,0.3)",
    },
    icon: "👁️",
  },

  // ═══════════════════════════════════════════
  // 5. LES ARTS ARCANISTES
  // ═══════════════════════════════════════════
  {
    id: "arts-arcanistes",
    name: "Les Arts Arcanistes",
    subtitle: "La science brute de l'Énergie Potentielle dans sa forme la plus pure",
    description:
      "Les Arts Arcanistes sont l'étude et la manipulation de l'Énergie Potentielle dans sa forme la plus brute et la plus abstraite — sans filtre élémentaire, sans canalisation par le Ki, sans structure runique. L'arcaniste travaille directement avec la force fondamentale qui sous-tend toute magie, ce qui lui confère une polyvalence et une puissance théoriquement illimitées, au prix d'une difficulté de maîtrise extrême.",
    lore:
      "Les Arts Arcanistes furent les derniers à être formalisés en tant que discipline académique. Pendant des siècles, l'énergie brute était considérée comme trop instable et trop dangereuse pour être manipulée directement. Ce ne fut que lorsque les premiers arcanistes prouvèrent que l'Énergie Potentielle pouvait être isolée et contrôlée sans vecteur intermédiaire que cette discipline fut reconnue. Les arcanistes sont aujourd'hui parmi les praticiens les plus respectés — et les plus craints — car leur pouvoir n'est limité que par leur compréhension théorique et leur capacité à canaliser une énergie aussi instable.",
    subBranches: [
      {
        id: "mecanique-arcanique",
        name: "Mécanique Arcanique",
        description:
          "La Mécanique Arcanique est l'application structurée et théorique de l'Énergie Potentielle brute. Elle s'apparente à une science : les arcanistes étudient les lois qui régissent l'énergie magique, développent des formules et des théorèmes, et appliquent des protocoles précis pour obtenir des effets reproductibles.",
        items: [
          "Théorie des flux — Étude et manipulation des courants d'Énergie Potentielle dans l'environnement.",
          "Formules arcaniques — Application de calculs mathématiques à la magie pour des résultats précis et reproductibles.",
          "Circuits arcaniques — Création de réseaux de canaux énergétiques pour redistribuer ou amplifier la puissance.",
          "Analyse de résidus — Lecture et interprétation des traces d'Énergie Potentielle laissées par des sorts ou des événements magiques.",
        ],
      },
      {
        id: "physique-arcanique",
        name: "Physique Arcanique (Potentiel Brut)",
        description:
          "La Physique Arcanique est l'application directe et brute de l'Énergie Potentielle sans aucun filtre ni structure intermédiaire. C'est la forme la plus puissante et la plus instable des Arts Arcanistes — l'énergie brute est canalisée telle quelle, produisant des effets dévastateurs mais difficilement contrôlables.",
        items: [
          "Décharge arcanique brute — Libération massive d'énergie non filtrée. Puissance maximale, précision minimale.",
          "Champ de force arcanique — Création de barrières composées d'énergie brute pure.",
          "Condensation énergétique — Compression de l'Énergie Potentielle en un point unique pour une libération explosive.",
          "Rayon arcanique — Projection concentrée d'énergie brute en un faisceau continu.",
        ],
      },
      {
        id: "arcanes-interdits",
        name: "Arts Arcanes Interdits",
        description:
          "Certaines applications des Arts Arcanistes sont formellement interdites en raison de leur dangerosité extrême — non seulement pour la cible, mais pour le pratiquant lui-même et potentiellement pour la réalité environnante. Ces pratiques sont punies de la peine de mort dans la majorité des nations.",
        items: [
          "Surgénération arcanique — Dépassement des limites de canalisation de l'Énergie Potentielle, risquant l'effondrement énergétique du pratiquant et de la zone environnante.",
          "Manipulation du noyau énergétique — Altération directe de la source d'Énergie Potentielle d'une zone ou d'un être, pouvant provoquer des catastrophes irréversibles.",
          "Fusion arcanique — Tentative de fusionner l'essence énergétique de deux êtres, pratique considérée comme l'un des crimes les plus graves.",
        ],
        isForbidden: true,
      },
    ],
    colors: {
      primary: "#8B5CF6",
      secondary: "#C4B5FD",
      bg: "rgba(139,92,246,0.08)",
      text: "#C8B8F0",
      textLight: "#5B21B6",
      glow: "rgba(139,92,246,0.4)",
    },
    dayColors: {
      primary: "#5B21B6",
      secondary: "#8B5CF6",
      bg: "rgba(139,92,246,0.06)",
      text: "#4C1D95",
      glow: "rgba(91,33,182,0.3)",
    },
    icon: "✨",
  },

  // ═══════════════════════════════════════════
  // 6. LES ARTS MÉDICINAUX
  // ═══════════════════════════════════════════
  {
    id: "arts-medicaux",
    name: "Les Arts Médicinaux",
    subtitle: "La guérison, la préservation et la transformation du vivant",
    description:
      "Les Arts Médicinaux regroupent l'ensemble des pratiques magiques dédiées à la guérison, à la préservation de la vie, et à la modification biologique. Du simple soin de blessure à la régénération de membres, de la chirurgie magique à la transfusion d'énergie vitale, ces Arts sont indispensables à toute aventure et à toute civilisation. Les praticiens médicaux sont parmi les membres les plus respectés et les plus recherchés de toute société.",
    lore:
      "Les Arts Médicinaux furent les premiers Arts à être systématisés, bien avant les Académies de combat ou de magie élémentaire. La nécessité de guérir les blessures et de combattre les maladies poussa les premières civilisations à développer des techniques de soin basées sur l'Énergie Potentielle. Au fil des millénaires, ces techniques se divisèrent en branches spécialisées — chacune répondant à un besoin spécifique du corps et de l'esprit.",
    subBranches: [
      {
        id: "vitalisation",
        name: "Arts de la Vitalisation",
        description:
          "Les Arts de la Vitalisation sont la branche la plus fondamentale et la plus pratiquée des Arts Médicinaux. Ils consistent à stimuler les processus naturels de guérison du corps en y injectant de l'Énergie Potentielle ciblée. Le praticien ne guérit pas directement — il accélère et amplifie la capacité innée du corps à se réparer.",
        items: [
          "Soin de blessures — Accélération de la cicatrisation des plaies, fractures et brûlures.",
          "Purge de poisons — Neutralisation et élimination des toxines et substances étrangères du corps.",
          "Restauration d'énergie — Réplenishment de l'énergie vitale d'un individu épuisé.",
          "Régénération tissulaire — Reconstruction de tissus endommagés, y compris les organes internes.",
        ],
      },
      {
        id: "chirurgie",
        name: "Arts de Chirurgie",
        description:
          "Les Arts de Chirurgie combinent la précision manuelle du chirurgien avec la canalisation de l'Énergie Potentielle pour des interventions impossibles par les moyens conventionnels. Le praticien utilise son énergie comme un scalpel, un suturant et un antiseptique simultanément.",
        items: [
          "Chirurgie énergétique — Incision, retrait et suturation utilisant uniquement l'énergie (pas de blade physique).",
          "Transplantation magique — Greffe d'organes ou de membres avec élimination du risque de rejet.",
          "Extraction de projectiles — Retrait précis de corps étrangers (flèches, éclats, fragments runiques) sans endommager les tissus environnants.",
          "Suture cellulaire — Fusion directe des cellules pour une guérison sans cicatrice.",
        ],
      },
      {
        id: "alteration-biologique",
        name: "Arts d'Altération Biologique",
        description:
          "Les Arts d'Altération Biologique vont au-delà de la guérison — ils modifient volontairement les caractéristiques biologiques d'un être vivant. Cette branche est étroitement surveillée car elle frôle les Arts Défendus lorsqu'elle est appliquée de manière permanente ou irréversible.",
        items: [
          "Amélioration sensorielle — Augmentation temporaire de la vue, de l'ouïe, de l'odorat ou du toucher.",
          "Modification physiologique — Changement temporaire des caractéristiques physiques (taille, densité, souplesse).",
          "Adaptation environnementale — Modification du corps pour résister à des conditions extrêmes (froid, chaleur, pression, toxines).",
          "Stimulation immunitaire — Renforcement massif et temporaire du système immunitaire.",
        ],
      },
      {
        id: "transfusion-vitale",
        name: "Arts de Transfusion Vitale",
        description:
          "Les Arts de Transfusion Vitale permettent de transférer de l'énergie vitale d'un individu à un autre. C'est une pratique délicate et potentiellement dangereuse pour le donneur — un transfert excessif peut entraîner l'épuisement vital, le coma, voire la mort.",
        items: [
          "Transfert d'énergie vitale — Don d'énergie de son propre corps à un autre individu pour accélérer sa guérison.",
          "Partage de vitalité — Répartition équitable de l'énergie vitale entre deux individus.",
          "Drain vital (interdit hors combat) — Prélèvement forcé d'énergie vitale d'une cible (strictement régulé).",
          "Symbiose vitale — Liaison temporaire des systèmes vitaux de deux individus pour un soutien mutuel.",
        ],
      },
      {
        id: "art-des-potions",
        name: "Art des Potions",
        description:
          "L'Art des Potions est la branche artisanale des Arts Médicinaux. Elle consiste à préparer des mélanges magiques — potions, onguents, élixirs — qui stockent des effets médicaux sous forme stable et consommable. C'est la forme la plus accessible et la plus commerciale des Arts Médicinaux.",
        items: [
          "Potions de soin — Potions restaurant la santé, soignant les blessures ou purifiant les poisons.",
          "Élixirs d'amélioration — Potions accordant des bonus temporaires (force, vitesse, résistance, perception).",
          "Antidotes — Préparations ciblées neutralisant des poisons ou toxines spécifiques.",
          "Potions de récupération — Mélanges restaurant l'énergie vitale ou l'Énergie Potentielle épuisée.",
          "Onguents et cataplasmes — Applications topiques à effets localisés (anti-inflammatoire, régénération cutanée, analgésique).",
        ],
      },
    ],
    colors: {
      primary: "#16A34A",
      secondary: "#86EFAC",
      bg: "rgba(22,163,74,0.08)",
      text: "#A8E6C0",
      textLight: "#0F6B31",
      glow: "rgba(22,163,74,0.4)",
    },
    dayColors: {
      primary: "#0F6B31",
      secondary: "#16A34A",
      bg: "rgba(22,163,74,0.06)",
      text: "#0A4D23",
      glow: "rgba(15,107,49,0.3)",
    },
    icon: "🌿",
  },

  // ═══════════════════════════════════════════
  // 7. L'ART DE LA FOI (singulier)
  // ═══════════════════════════════════════════
  {
    id: "art-de-la-foi",
    name: "L'Art de la Foi",
    subtitle: "La puissance accordée par la croyance et les entités divines",
    description:
      "L'Art de la Foi est unique parmi les huit Arts : sa puissance ne provient pas de l'Énergie Potentielle du pratiquant, mais de sa connexion avec une entité supérieure — une divinité, un esprit ancestral, ou une force spirituelle vénérée. Le fidèle canalise la puissance de sa divinité à travers sa foi, ses prières et ses actes. Plus sa dévotion est sincère et ses actes alignés avec les principes de son entité, plus le pouvoir qui lui est accordé est grand.",
    lore:
      "L'Art de la Foi existe depuis les origines du monde — les premiers peuples priaient les Dragons Primordiaux eux-mêmes, et certains reçoivent encore leur bénédiction aujourd'hui. Contrairement aux autres Arts qui reposent sur la technique et l'entraînement, la Foi exige avant tout une conviction absolue et une vie conforme aux principes de l'entité vénérée. Les miracles ne sont pas des techniques que l'on apprend — ce sont des dons que l'on mérite.",
    subBranches: [
      {
        id: "capacites-sacrees",
        name: "Capacités Sacrées Communes",
        description:
          "Les capacités sacrées communes sont les pouvoirs de base accessibles à tout fidèle ayant établi une connexion avec son entité. Elles sont relativement uniformes d'un culte à l'autre, bien que leur expression visuelle varie selon la divinité vénérée.",
        items: [
          "Bénédiction — Accroissement temporaire des capacités physiques ou spirituelles d'un allié.",
          "Purification — Dissipation des influences maléfiques, des malédictions et des entités corrompues.",
          "Soin par la foi — Guérison par canalisation directe de la puissance divine (différent de la vitalisation médicale).",
          "Protection sacrée — Création de barrières repoussant les êtres malveillants ou les attaques d'origine démoniaque.",
          "Lumière sacrée — Projection de lumière divine aveuglante les êtres des ténèbres.",
          "Exorcisme — Expulsion d'entités possédant un corps ou un lieu.",
        ],
      },
      {
        id: "miracles-porteurs",
        name: "Miracles & Porteurs de Miracle",
        description:
          "Les Miracles sont des manifestations extraordinaires de la puissance divine — des événements qui dépassent les capacités ordinaires de la Foi. Seuls les Porteurs de Miracle, des individus exceptionnellement choisis par leur divinité, peuvent les canaliser. Les Miracles ne sont ni appris ni entraînés — ils sont accordés par l'entité elle-même, souvent lors de moments de crise ou de dévotion extrême.",
        items: [
          "Résurrection — Restauration de la vie à un individu récemment décédé (extrêmement rare et coûteux).",
          "Intervention divine — Appel direct de la puissance de l'entité pour une manifestation ponctuelle d'une puissance dépassant les limites habituelles.",
          "Jugement sacré — Condamnation et punition divine d'une cible jugée coupable par les principes de l'entité.",
          "Prière exaucée — Réalisation d'un vœu aligné avec les principes de la divinité, dont la forme dépend entièrement de l'entité.",
        ],
      },
      {
        id: "systeme-des-serments",
        name: "Système des Serments",
        description:
          "Le Système des Serments est le cadre contractuel de l'Art de la Foi. Le fidèle formule des serments sacrés — des vœux contraignants liant sa volonté à celle de son entité. En respectant ses serments, le fidèle renforce sa connexion divine et accède à des pouvoirs supplémentaires. En les brisant, il subit des sanctions sévères allant de la perte de pouvoirs à la malédiction divine.",
        items: [
          "Serment de Protection — Vœu de protéger une personne, un lieu ou un groupe. Le fidèle gagne des bonus défensifs tant que le serment est honoré.",
          "Serment de Vérité — Vœu de ne jamais mentir ni tromper. Le fidèle gagne une aura de confiance et des capacités de détection du mensonge.",
          "Serment de Justice — Vœu de poursuivre et de punir les coupables. Le fidèle gagne des bonus offensifs contre les ennemis désignés.",
          "Serment de Pauvreté — Vœu de renoncer aux richesses matérielles. Le fidèle gagne des capacités de soin et de soutien renforcées.",
          "Serment de Vengeance — Vœu de traquer un ennemi spécifique jusqu'à sa destruction. Le fidèle gagne des capacités de pistage et des bonus de dégâts progressifs.",
          "Bris de Serment — Sanction automatique en cas de violation : perte temporaire ou permanente des pouvoirs sacrés, malédiction, ou dans les cas extrêmes, le rejet total par l'entité.",
        ],
      },
    ],
    colors: {
      primary: "#F59E0B",
      secondary: "#FDE68A",
      bg: "rgba(245,158,11,0.08)",
      text: "#F5E0A8",
      textLight: "#92400E",
      glow: "rgba(245,158,11,0.4)",
    },
    dayColors: {
      primary: "#92400E",
      secondary: "#F59E0B",
      bg: "rgba(245,158,11,0.06)",
      text: "#78350F",
      glow: "rgba(146,64,14,0.3)",
    },
    icon: "✝️",
  },

  // ═══════════════════════════════════════════
  // 8. LES ARTS DÉFENDUS
  // ═══════════════════════════════════════════
  {
    id: "arts-defendus",
    name: "Les Arts Défendus",
    subtitle: "La modification permanente et irréversible de la réalité",
    description:
      "Les Arts Défendus ne sont pas un Art comme les autres — c'est une catégorie englobant l'ensemble des pratiques magiques qui modifient la réalité de manière permanente et irréversible. Contrairement aux autres Arts dont les effets sont temporaires et réversibles, les Arts Défendus altèrent les fondements mêmes du monde, et cette altération persiste indéfiniment. Leur usage est universellement interdit par le Traité de la Concorde Magique, et les sanctions pour leur pratique vont de l'emprisonnement à perpétuité à la mise à mort immédiate.",
    lore:
      "Les Arts Défendus tirent leur nom du fait qu'ils sont, littéralement, défendus — interdits par toutes les nations signataires du Traité. Pourtant, ils continuent d'être pratiqués en secret par des cultes, des individus obsédés par le pouvoir, et — cas unique et terrifiant — par les Démons. Car les Démons, créatures nées hors des lois de la réalité, ne subissent pas le contrecoup habituel que subit tout pratiquant qui ose modifier la réalité de manière permanente. Cette exception fait des Démons les seuls êtres capables d'utiliser les Arts Défendus sans risquer leur propre existence.",
    subBranches: [
      {
        id: "modification-permanente",
        name: "Modification Permanente de la Réalité",
        description:
          "La caractéristique fondamentale des Arts Défendus est la permanence. Là où un sort élémentaire crée un feu qui s'éteint, un Art Défendu modifie les lois de la réalité elle-même de façon irréversible. Le praticien paie un prix terrible pour cette modification — un contrecoup proportionnel à l'ampleur du changement, qui peut aller de l'épuisement permanent à la destruction de l'âme.",
        items: [
          " altération des lois physiques permanentes — Modification définitive des constantes physiques dans une zone (gravité, temps, matière).",
          " Création de vie artificielle — Donner naissance à des êtres vivants à partir de rien, créatures dénuées d'âme et souvent instables.",
          " Résurrection véritable — Ramener un être à la vie de manière permanente, en modifiant la réalité pour annuler sa mort (le contrecoup est souvent fatal).",
          " Réécriture de l'essence — Modification permanente de la nature fondamentale d'un être (changement de race, d'élément, d'âme).",
          " Arrêt du temps — Figement définitif de l'écoulement du temps dans une zone (le contrecoup est la perte de tout sens du temps par le praticien).",
        ],
        isForbidden: true,
      },
      {
        id: "exception-demoniaque",
        name: "Exception Narrative : Les Démons",
        description:
          "Les Démons constituent l'unique exception connue à la règle du contrecoup des Arts Défendus. Nés hors des lois de la réalité matérielle, les Démons ne sont pas soumis au prix que paient les autres êtres当他们 utilisent ces arts. Cette particularité fait des Démons les praticiens les plus dangereux des Arts Défendus — ils peuvent modifier la réalité à volonté sans risquer leur propre existence, ce qui leur confère un pouvoir potentiellement illimité.",
        items: [
          " Immunité au contrecoup — Les Démons ne subissent pas de contrepartie négative lorsqu'ils modifient la réalité.",
          " Corruption de la réalité — Les modifications apportées par les Démons tendent à corrompre et déstabiliser la réalité environnante.",
          " Portails démoniaques — Les Démons utilisent les Arts Défendus pour ouvrir des passages entre leur plan d'origine et le monde matériel.",
          " Marque démoniaque — Altération permanente infligée à un être ou un lieu, le liant au plan démoniaque.",
        ],
        isForbidden: true,
      },
    ],
    colors: {
      primary: "#6B7280",
      secondary: "#9CA3AF",
      bg: "rgba(107,114,128,0.08)",
      text: "#C0C4CC",
      textLight: "#374151",
      glow: "rgba(107,114,128,0.4)",
    },
    dayColors: {
      primary: "#374151",
      secondary: "#6B7280",
      bg: "rgba(107,114,128,0.06)",
      text: "#1F2937",
      glow: "rgba(55,65,81,0.3)",
    },
    icon: "🔒",
  },
];

export function getArtById(id: string): ArtData | undefined {
  return ART_DATA.find((a) => a.id === id);
}