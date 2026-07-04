export interface FactionData {
  id: string;
  name: string;
  nameJp: string;
  motto: string;
  description: string;
  hierarchy: string[];
  ideology: string;
  objectives: string[];
  methods: string[];
  reputation: string;
  colors: { primary: string; secondary: string; bg: string; text: string; glow: string };
  symbol: string;
  structure?: { rank: string; title: string; description: string }[];
  extraSections?: { title: string; content: string }[];
}

export const FACTIONS: FactionData[] = [
  {
    id: "royaute",
    name: "La Royauté",
    nameJp: "王政",
    motto: "L'ordre est le pilier de la civilisation.",
    description:
      "Les Royaumes représentent l'ensemble des nations souveraines, monarchies, empires et états reconnus à travers les Sept Continents. Bien qu'ils possèdent chacun leur propre culture, leur propre armée, leurs propres lois et leurs propres ambitions, ils sont généralement regroupés sous une même appellation lorsqu'il est question de politique internationale : la Royauté. Les Royaumes constituent la première ligne de défense de la civilisation face aux Donjons, aux invasions démoniaques et aux organisations criminelles.",
    hierarchy: [
      "Roi / Reine / Dirigeant",
      "Prince / Princesse",
      "Régent",
      "Noble",
      "Général d'Armée",
      "Commandant",
      "Chevalier Royal",
      "Garde Royal",
      "Diplomate",
      "Officier Militaire",
      "Soldat",
    ],
    ideology:
      "Préserver la souveraineté et assurer la stabilité des terres face aux nombreuses menaces du monde. Maintenir l'ordre sur leurs territoires, assurer la sécurité des populations, développer leur puissance économique et militaire.",
    objectives: [
      "Maintenir l'ordre sur leurs territoires",
      "Assurer la sécurité des populations",
      "Développer leur puissance économique et militaire",
      "Défendre leurs frontières",
      "Gérer les crises liées aux Donjons",
      "Préserver l'équilibre politique mondial",
      "Étendre leur influence diplomatique",
    ],
    methods: [
      "Armées régulières",
      "Gardes royales",
      "Réseaux diplomatiques",
      "Institutions magiques",
      "Forteresses et cités protégées",
      "Flottes navales",
      "Services de renseignement",
      "Accords commerciaux internationaux",
    ],
    reputation:
      "Pour la majorité de la population, les Royaumes représentent la stabilité, la sécurité et la continuité des civilisations. Pour leurs détracteurs, ils incarnent les privilèges, la bureaucratie et la corruption politique.",
    colors: {
      primary: "#C9A84C",
      secondary: "#4A6FA5",
      bg: "#1a1608",
      text: "#E8D5A3",
      glow: "rgba(201,168,76,0.3)",
    },
    symbol: "👑",
  },
  {
    id: "triade",
    name: "La Trias Obscuras",
    nameJp: "闇の三位一体",
    motto: "Tout possède une valeur — ce que le monde refuse finit toujours par nous appartenir.",
    description:
      "La Trias Obscuras, plus communément appelée la Triade Sombre, est la plus vaste organisation criminelle des Terres de l'Ouest. Contrairement à une simple guilde noire ou une mafia classique, la Triade agit comme une immense confédération regroupant des dizaines d'organisations clandestines : guildes d'assassins, compagnies mercenaires, réseaux de contrebande, cartels occultes, trafiquants d'artefacts, marchés noirs et syndicats criminels indépendants. Elle existe pour empêcher que les organisations clandestines des Terres de l'Ouest ne s'entre-détruisent complètement.",
    hierarchy: [
      "Conseil des Cendres",
      "Chefs de Guildes",
      "Lieutenants",
      "Exécuteurs",
      "Agents",
      "Recrues",
    ],
    ideology:
      "La Triade ne cherche ni lumière ni justice — elle cherche la survie dans l'ombre. Entre l'Église qui condamne les âmes et la Concorde qui contrôle le Mana, les ombres n'avaient plus leur place. Alors elles se sont unies.",
    objectives: [
      "Maintenir l'équilibre entre organisations criminelles",
      "Contrôler les activités illégales des Terres de l'Ouest",
      "Résister à l'Église Solaris et à la Concorde Magique",
      "Prospérer dans l'ombre du système",
    ],
    methods: [
      "Assassinats politiques",
      "Contrebande",
      "Trafic d'artefacts",
      "Marchés noirs",
      "Espionnage",
      "Mercenariat",
      "Extorsion",
      "Manipulation politique",
    ],
    reputation:
      "L'organisation criminelle la plus puissante et la plus crainte des Terres de l'Ouest. Sa simple mention suffit à glacer le sang des marchands et des nobles.",
    colors: {
      primary: "#8B0000",
      secondary: "#1a1a1a",
      bg: "#0d0505",
      text: "#D4A0A0",
      glow: "rgba(139,0,0,0.4)",
    },
    symbol: "⛧",
    structure: [
      {
        rank: "Conseil des Cendres",
        title: "Direction suprême",
        description:
          "Assemblée des chefs des plus puissantes organisations criminelles. Aucun membre ne possède d'autorité absolue — le pouvoir dépend de la richesse, l'influence, le territoire et la peur.",
      },
      {
        rank: "Le Pacte Noir",
        title: "Loi interne",
        description:
          "Ne jamais attaquer une réunion du Conseil. Respecter les contrats validés. Ne pas provoquer l'Église ou la Concorde inutilement. Partager les informations majeures. Verser une part des bénéfices au Conseil.",
      },
    ],
    extraSections: [
      {
        title: "Les Factions de la Triade",
        content:
          "Guildes d'assassins spécialisés dans les meurtres politiques. Compagnies mercenaires vendant leurs armées aux royaumes. Trafiquants de reliques interdites. Passeurs du marché noir. Collecteurs de dettes. Cartels de drogues alchimiques. Réseaux occultes pratiquant des arts interdits.",
      },
    ],
  },
  {
    id: "confrerie",
    name: "La Confrérie",
    nameJp: "同志団",
    motto: "Les royaumes ne protègent pas le monde. Ils le maintiennent à genoux.",
    description:
      "La Confrérie est une organisation clandestine et révolutionnaire présente sur les Sept Continents. Contrairement à la Trias Obscuras, la Confrérie ne cherche ni richesse ni influence criminelle — c'est une organisation terroriste idéologique. Son objectif est de renverser les royaumes, détruire les institutions en place et imposer un nouvel ordre par la force. Elle recrute grâce à la colère du monde.",
    hierarchy: [
      "Cellules indépendantes",
      "Agents dormants",
      "Operatifs",
      "Sympathisants",
    ],
    ideology:
      "Les grandes puissances maintiennent volontairement le monde dans un cycle de domination construit sur l'exploitation des faibles, le contrôle des éveillés et la corruption politique. Un monde nouveau ne peut naître qu'après l'effondrement de l'ancien.",
    objectives: [
      "Renverser les gouvernements des Sept Continents",
      "Détruire les systèmes jugés oppressifs",
      "Éliminer les figures symboliques du pouvoir",
      "Déclencher des révolutions populaires",
      "Faire s'effondrer l'ordre mondial actuel",
    ],
    methods: [
      "Attentats",
      "Assassinats politiques",
      "Sabotages",
      "Coups d'État",
      "Infiltration gouvernementale",
      "Propagande révolutionnaire",
      "Manipulation des conflits civils",
    ],
    reputation:
      "L'organisation terroriste la plus dangereuse de l'ère. Mais dans certaines régions abandonnées par les royaumes, certains voient la Confrérie comme les seuls prêts à agir.",
    colors: {
      primary: "#6B4226",
      secondary: "#2a1a0a",
      bg: "#0f0a05",
      text: "#C4A882",
      glow: "rgba(107,66,38,0.4)",
    },
    symbol: "🔥",
  },
  {
    id: "eglise-solaris",
    name: "L'Église Solaris",
    nameJp: "ソラリス教",
    motto: "Là où la lumière brille, l'ombre s'agenouille.",
    description:
      "Considérée comme la religion dominante des Terres de l'Ouest, l'Église impose le culte du Saint Soleil comme vérité absolue. Née durant les anciennes Guerres du Crépuscule, elle affirme avoir été fondée par Sol Invictus, archange du Feu Céleste. L'Église détient le monopole des naissances et des funérailles, et une armée de croisés dispersée sur tout le continent. Tout royaume désirant exister ou commercer doit obtenir l'Ave Solis, la bénédiction du Saint Soleil.",
    hierarchy: [
      "Guide Suprême",
      "Les Sept Septéniens (Concile Doré)",
      "Les Douze Paladins",
      "Les Inquisiteurs Solaires",
      "Les Clercs",
      "Les Fidèles",
    ],
    ideology:
      "L'ombre est une dette envers la lumière, et seul le pardon solaire peut purifier les âmes corrompues. La lumière n'accepte aucun partage — toute magie profane est une corruption du flux divin.",
    objectives: [
      "Étendre le culte du Saint Soleil",
      "Purifier les terres corrompues",
      "Traquer les hérétiques et créatures démoniaques",
      "Maintenir l'ordre spirituel du continent",
      "Contrôler les naissances et les funérailles",
    ],
    methods: [
      "Croisades",
      "Inquisitions",
      "Purifications",
      "Exorcismes",
      "Bénédictions (Ave Solis)",
      "Armée de croisés",
      "Magie Sainte et Aether",
    ],
    reputation:
      "La religion dominante et la plus puissante institution spirituelle des Terres de l'Ouest. Ses Inquisiteurs sont craints dans toutes les régions. Certains affirment que ses membres finissent par perdre leur humanité.",
    colors: {
      primary: "#F5D76E",
      secondary: "#FFF8E7",
      bg: "#0f0d05",
      text: "#FFF5D4",
      glow: "rgba(245,215,110,0.4)",
    },
    symbol: "☀",
    structure: [
      {
        rank: "Guide Suprême",
        title: "La Voix du Soleil (PNJ)",
        description:
          "Dirigeant absolu de l'Église. Sa parole vaut loi sacrée. Il proclame les croisades et nomme les Paladins.",
      },
      {
        rank: "Concile Doré",
        title: "Les Sept Septéniens",
        description:
          "Les sept plus hauts sages, héritiers des fondateurs. Ensemble, ils possèdent une autorité capable de faire tomber des royaumes.",
      },
      {
        rank: "Les Douze Paladins",
        title: "Lances du Saint Soleil",
        description:
          "Champions ultimes recevant une arme bénie, une armure solaire et un fragment d'un Sceau d'Aube. Chacun incarne une vertu : Justice, Foi, Pureté, Discipline, Sacrifice, Loyauté...",
      },
      {
        rank: "Les Inquisiteurs",
        title: "Ombres de la Lumière",
        description:
          "Exécuteurs du Dogme. Autorité absolue pour arrêter, juger, purifier ou exécuter sans procès. Utilisent des flammes sacrées et des arts solaires.",
      },
      {
        rank: "Les Clercs",
        title: "Porteurs de Lumière",
        description:
          "Cœur spirituel de l'Église. Présents dans chaque cité. Guident les prières, bénissent les peuples, soignent par la lumière sacrée.",
      },
    ],
    extraSections: [
      {
        title: "La Magie Sainte",
        content:
          "Énergie sacrée exclusivement réservée aux adeptes de l'Église Solaris. Cette lumière pure rejette instinctivement tout ce que son utilisateur considère comme impur. Les prêtres les plus puissants peuvent incinérer les âmes corrompues ou matérialiser la foi collective sous forme de lumière tangible.",
      },
    ],
  },
  {
    id: "concorde-magique",
    name: "La Concorde Magique",
    nameJp: "魔法協定",
    motto: "Per arcanum ad veritatem — Par les mystères vers la vérité.",
    description:
      "La Concorde Magique règne sur tout ce qui touche au Mana, aux arts mystiques et aux lois de la magie. Aucun royaume, aucune Église, aucun souverain ne peut ignorer son autorité sans risquer une intervention des Veilleurs du Mana. Depuis le Jour de la Conjuration, elle s'est imposée comme la gardienne absolue des arts mystiques — décidant quelles magies doivent être préservées, lesquelles doivent être interdites.",
    hierarchy: [
      "Les Dix Archimages (Conseil des Mages Sacrés)",
      "Les Grands Magisters",
      "La Milice Magique (Veilleurs du Mana)",
      "Les Magistes",
      "Les Apprentis",
    ],
    ideology:
      "La magie n'existe pas pour servir les hommes. Ce sont les hommes qui doivent apprendre à survivre à la magie.",
    objectives: [
      "Contrôler l'usage de la magie",
      "Classer les magies (preservées, interdites, défendues)",
      "Former les futurs sorciers",
      "Intervenir contre les menaces surnaturelles",
      "Préserver les connaissances arcaniques",
    ],
    methods: [
      "Lois du Mana",
      "Veilleurs du Mana (arrestations, sceaux anti-magie, effacement de souvoenirs, prisons dimensionnelles)",
      "Conclave du Mana (décisions annuelles)",
      "Purges magiques",
      "Recherches arcaniques",
    ],
    reputation:
      "Peu d'organisations inspirent autant de respect ou de crainte que la Concorde Magique. Invisible aux yeux du peuple mais omniprésente dans les affaires du monde.",
    colors: {
      primary: "#9B59B6",
      secondary: "#C39BD3",
      bg: "#0d0a14",
      text: "#D7C4E8",
      glow: "rgba(155,89,182,0.4)",
    },
    symbol: "🔮",
    structure: [
      {
        rank: "Conseil des Mages Sacrés",
        title: "Les Dix Archimages",
        description:
          "Les dix plus puissants sorciers du monde connu. Chacun représente une branche majeure de la magie. Ils se réunissent au Conclave du Mana pour décider des nouvelles lois magiques, classifications et sanctions.",
      },
      {
        rank: "Grands Magisters",
        title: "Gardiens du Savoir",
        description:
          "Dirigeants des académies, bibliothèques interdites et grandes institutions magiques. Souvent d'anciens Archimages ou érudits de plusieurs siècles.",
      },
      {
        rank: "Milice Magique",
        title: "Les Veilleurs du Mana",
        description:
          "Bras armé de la Concorde. Divisée en Chevaliers Sacrés (sceaux anti-magie), Exécuteurs (chasseurs de mages interdits) et Sentinelles (enquêteurs).",
      },
      {
        rank: "Magistes",
        title: "Sorciers Confirmés",
        description:
          "Cœur de la Concorde. Sorciers reconnus pouvant enseigner, rejoindre des académies, effectuer des recherches ou servir comme mages royaux.",
      },
      {
        rank: "Apprentis",
        title: "Initiés",
        description:
          "Jeunes pratiquants suivant une formation extrêmement difficile. Apprennent le contrôle du Mana, les lois de la magie, les langues anciennes et la maîtrise des sceaux.",
      },
    ],
  },
  {
    id: "explorateurs",
    name: "Société des Explorateurs",
    nameJp: "探検者協会",
    motto:
      "Le monde n'a jamais été inexploré. Il a simplement été abandonné par ceux qui avaient trop peur de le traverser.",
    description:
      "La Grande Guilde Indépendante des Aventuriers ne doit son existence à aucun roi, aucun édit, aucune volonté politique. Née d'un vide que personne d'autre ne voulait combler au lendemain des Guerres du Crépuscule, elle rassemble mercenaires sans guerre, chasseurs de reliques, érudits bannis et survivants n'ayant plus rien à perdre. Les royaumes n'eurent pas d'autre choix que de négocier : liberté totale en échange d'un enregistrement officiel et d'une rémunération pour leurs services. Leur classement par étoiles détermine renommée, force et expertise.",
    hierarchy: [
      "★★★★★ Légende Vivante",
      "★★★★ Maître Explorateur",
      "★★★ Explorateur Confirmé",
      "★★ Explorateur Aguerri",
      "★ Novice",
      "Recrue non étoilée",
    ],
    ideology:
      "Le monde a besoin de ceux qui osent aller là où les autres ne vont pas. La liberté est leur seule loi.",
    objectives: [
      "Explorer les zones inconnues",
      "Cartographier les territoires dangereux",
      "Protéger les convois et les civils",
      "Vaincre les créatures des donjons",
      "Rassembler des connaissances sur le monde",
      "Maintenir les routes ouvertes",
    ],
    methods: [
      "Exploration de donjons",
      "Chasse aux créatures",
      "Escorte de convois",
      "Cartographie",
      "Sauvetage de survivants",
      "Collecte d'artefacts",
      "Reconnaissance militaire",
    ],
    reputation:
      "Institution mondiale respectée mais indépendante. Dans les zones abandonnées par les royaumes, les Explorateurs sont souvent les seuls à maintenir un semblant d'ordre.",
    colors: {
      primary: "#CD853F",
      secondary: "#2E7D32",
      bg: "#0f0c08",
      text: "#D4B896",
      glow: "rgba(205,133,63,0.4)",
    },
    symbol: "⭐",
    extraSections: [
      {
        title: "Système de Classement par Étoiles",
        content:
          "Le rangement des aventuriers se fait par étoiles : plus d'étoiles, plus le membre est renommé, fort et expert. Les étoiles ne s'obtiennent pas par un simple examen — elles se gagnent sur le terrain, à travers les missions accomplies, les périls surmontés et la reconnaissance de ses pairs. Un aventurier à cinq étoiles est une légende vivante dont le nom résonne à travers les continents.",
      },
    ],
  },
];

export function getFactionById(id: string): FactionData | undefined {
  return FACTIONS.find((f) => f.id === id);
}
