export interface CosmologySection {
  id: string;
  title: string;
  titleJp: string;
  subtitle: string;
  content: string[];
  quote?: string;
  subSections?: { title: string; content: string[] }[];
}

export interface GeographySection {
  id: string;
  title: string;
  titleJp: string;
  content: string[];
  subSections?: { title: string; content: string[] }[];
}

export const COSMOLOGY_DATA: CosmologySection[] = [
  // ─── SECTION 1: DEUX ORIGINES, AUCUN LIEN ───
  {
    id: "deux-origines",
    title: "Deux Origines, Aucun Lien",
    titleJp: "二つの起源、結び目なし",
    subtitle:
      "Toute cosmologie cherche un commencement unique. Celle-ci en refuse l'idée.",
    content: [
      "Toute cosmologie cherche un commencement unique. Celle-ci en refuse l'idée. Il existe deux strates de puissance absolue dans ce monde — les Sept Dragons Primordiaux et les Dix Primordiaux Sans Visage — et aucune des deux ne précède, n'engendre, ni ne dépend de l'autre.",
      "Les érudits qui ont tenté de les relier par une généalogie unique se sont tous trompés, ou ont sombré dans la folie. Les Dragons sont des forces. Les Primordiaux sont des absences. Les deux existent, séparément, sans qu'aucune logique commune ne les explique.",
      "Les Sept Dragons façonnent ce qui existe : l'origine, la fin, le changement, l'espace, le temps, l'infini et l'équilibre qui les retient ensemble. Ils sont la charpente du monde — visibles dans leurs effets, vénérés, craints, parfois combattus.",
      "Les Dix Primordiaux, eux, ne façonnent rien. Ils sont antérieurs à l'idée même de façonner. On ne les vénère pas : on les évite. Leur existence n'est pas un fait théologique mais une fissure dans la compréhension — et ceux qui les étudient trop longtemps cessent souvent d'être tout à fait humains.",
    ],
    quote:
      "Cherche un pont entre les Sept et les Dix, et tu ne trouveras qu'un gouffre qui te répond par ton propre écho.",
  },

  // ─── SECTION 2: LES SEPT DRAGONS PRIMORDIAUX ───
  {
    id: "dragons-primordiaux",
    title: "Les Sept Dragons Primordiaux",
    titleJp: "七つの始源の龍",
    subtitle: "De l'Origine absolue au Néant final — la charpente du monde",
    content: [
      "Avant toute civilisation, avant toute mémoire, sept forces ont pris forme de dragon — non par choix, mais parce que la forme du dragon est la seule que la réalité tolère pour contenir une puissance de cette ampleur sans s'effondrer immédiatement.",
      "Chaque Dragon gouverne un aspect fondamental de l'existence. Ensemble, ils ne forment pas une famille, ni une hiérarchie stricte — ils forment un système d'équilibre fragile, où le septième (l'Équilibre lui-même) existe uniquement pour empêcher les six autres de s'annuler ou de se dévorer mutuellement.",
      "Six forces tirent le monde dans six directions. La septième ne tire pas. Elle tient.",
    ],
    subSections: [
      {
        title: "I · Dragon de l'Origine — Celui-qui-a-Soufflé-le-Premier ☀",
        content: [
          "ORIGINE ABSOLUE · CHAOS · NAISSANCE",
          "L'origine absolue, la naissance de toute chose, le premier souffle. Avant lui, il n'y avait pas de « avant » — seulement un chaos sans forme que son premier souffle a brisé en possibilités.",
          "Patron de toute création, toute naissance, tout commencement. Son souffle originel continue de circuler dans chaque étincelle de vie nouvelle.",
          "Représenté comme un dragon de flammes dorées sans fin ni début visible.",
        ],
      },
      {
        title: "II · Dragon de la Fin — Celle-qui-Referme-Tout ✕",
        content: [
          "ACHÈVEMENT · NÉANT · CONCLUSION",
          "L'achèvement inévitable, la dernière étape de toute existence. Elle ne détruit pas — elle complète. Tout ce qui naît du souffle de l'Origine finira, un jour, dans son silence.",
          "Patronne de la mort, de l'extinction et des conclusions de tout cycle. Son approche est ressentie comme un froid qui ne vient pas de l'air mais du temps lui-même.",
          "Représentée comme un dragon aux écailles ternes, à demi dissous dans le vide.",
        ],
      },
      {
        title: "III · Dragon du Changement — Le Serpent-qui-Mue ↻",
        content: [
          "RÉGRESSION · STAGNATION · ÉVOLUTION",
          "Représente la régression, la stagnation et l'évolution — toute transformation du monde, qu'elle soit progrès ou déclin. Il ne juge pas le sens du changement ; il en est simplement la cause.",
          "Patron de toute mutation, métamorphose, révolution et décadence. Apparaît différemment à chaque témoin — jamais deux récits identiques de sa forme.",
          "Représenté comme un dragon dont les écailles changent perpétuellement de motif.",
        ],
      },
      {
        title: "IV · Dragon de l'Espace — La Carte Vivante ⬢",
        content: [
          "DISTANCES · DIMENSIONS · VIDE",
          "Gouverne les distances, les dimensions, le vide et les frontières du réel. C'est par sa volonté que deux points ne sont jamais au même endroit, et que le vide entre les choses a un sens.",
          "Patron de la géographie, des dimensions parallèles et des portails. On dit que ses écailles contiennent toutes les cartes qui ont existé et existeront.",
          "Représenté comme un dragon dont le corps semble se plier dans des angles impossibles.",
        ],
      },
      {
        title: "V · Dragon du Temps — L'Horloge Sans Cadran ⧖",
        content: [
          "FLUX · CYCLES · ÈRES",
          "Incarne le flux, les cycles, le vieillissement et les ères. Il ne se déplace pas dans le temps — il EST le temps, et tout ce qui vieillit, se souvient ou espère, le fait à travers lui.",
          "Patron des cycles saisonniers, du vieillissement et des grandes ères historiques. Son cœur bat au rythme exact d'une seconde, depuis toujours, pour toujours.",
          "Représenté comme un dragon dont la silhouette change selon l'âge de celui qui le regarde.",
        ],
      },
      {
        title:
          "VI · Dragon de l'Infini — Ce-qui-Ne-Finit-Jamais-de-Compter ∞",
        content: [
          "ILLIMITÉ · DÉMESURE · INCOMPRÉHENSION",
          "Représente ce qui dépasse toute limite, toute mesure et toute compréhension. Le seul Dragon dont aucun érudit n'a jamais pu décrire complètement la forme — car la décrire complètement prendrait un temps infini.",
          "Patron de tout ce qui est sans limite : les nombres, les possibilités, les multivers. Aucune représentation de lui n'est considérée complète, même par ses propres prêtres.",
          "Décrit comme un dragon dont on ne voit jamais plus qu'un fragment à la fois.",
        ],
      },
      {
        title: "VII · Dragon de l'Équilibre — Le Fléau de la Balance ☯",
        content: [
          "HARMONIE · NEUTRALITÉ · RETENUE",
          "Maintient l'harmonie entre les forces opposées ; ni création ni destruction, ni ordre ni chaos, mais le point où tout demeure possible sans s'effondrer.",
          "Le seul Dragon sans domaine propre — son domaine est l'absence de domination des six autres. Intervient rarement, mais lorsqu'il le fait, c'est pour repousser un déséquilibre cosmique.",
          "Représenté comme un dragon à demi doré, à demi sombre, parfaitement symétrique.",
        ],
      },
    ],
  },

  // ─── SECTION 3: LES DIX PRIMORDIAUX SANS VISAGE ───
  {
    id: "primordiaux-sans-visage",
    title: "Les Dix Primordiaux Sans Visage",
    titleJp: "無面の十始源",
    subtitle: "Ce qui précédait déjà le commencement",
    content: [
      "Les Dix ne sont pas des dieux. Ils ne sont pas des dragons. Ils n'ont pas de forme stable, pas de temple cohérent, et la plupart des civilisations qui ont tenté de les nommer ont fini par disparaître ou changer de nom elles-mêmes.",
      "Souvent représentés dans les jeux de cartes du tarot, on ne sait pas s'ils ont créé quoi que ce soit. On ignore même s'ils sont conscients. Tout ce que l'on sait, c'est que leurs noms, lorsqu'ils sont prononcés dans le bon ordre, au mauvais endroit, ont déjà modifié des choses qui n'auraient jamais dû pouvoir changer.",
      "Dix noms. Dix absences. Aucune statue n'a jamais été achevée à leur image — l'artisan, chaque fois, a cessé d'exister avant d'avoir terminé.",
    ],
    quote: "Ne les appelle pas des dieux. Les dieux, eux, savent qu'on les regarde.",
    subSections: [
      {
        title: "01 · Celui-qui-Respire-le-Premier",
        content: [
          "Le souffle avant l'existence du souffle. Antérieur même au concept de « concept ». On dit que chaque inspiration dans l'univers est un écho lointain et déformé de la sienne — y compris celles qui n'ont pas encore eu lieu.",
        ],
      },
      {
        title: "02 · La Loi Sans Écoute",
        content: [
          "La règle qui s'applique sans jamais regarder qui elle frappe. Elle ne punit pas. Elle ne pardonne pas. Elle constate, et ce constat suffit à rendre réel ce qu'elle a observé — même quand personne, absolument personne, n'aurait dû pouvoir le savoir.",
        ],
      },
      {
        title: "03 · Le Tisseur Qui Ne Finit Jamais",
        content: [
          "Le métier à tisser dont la toile n'a ni bord ni motif répété. Chaque destinée est un fil. Il n'a jamais terminé une seule toile, et certains érudits pensent que c'est précisément pour cela que l'avenir reste encore possible.",
        ],
      },
      {
        title: "04 · Celui d'Avant les Visages",
        content: [
          "Le son qui précédait ceux qui pourraient l'entendre. On raconte qu'avant qu'il n'existe une seule oreille dans tout l'univers, un être déjà. Personne ne sait ce qu'il faisait.",
        ],
      },
      {
        title: "05 · L'Indifférent",
        content: [
          "L'artisan dont l'atelier n'apparaît dans aucune réalité observable. Il façonne quelque chose, en permanence, dans un espace qu'aucune carte ne peut situer. On entend parfois, dans le silence absolu, le bruit lointain d'un marteau.",
        ],
      },
      {
        title: "06 · L'\u0152il Qui Regarde Sans Être Là",
        content: [
          "L'observation pure, détachée de tout observateur. Aucun corps, aucun temple, aucune trace. Pourtant, dans les moments de solitude la plus totale, beaucoup rapportent la certitude irréfutable d'être vus. Aucun ne peut dire par quoi.",
        ],
      },
      {
        title: "07 · Le Flux Qui N'a Pas de Source",
        content: [
          "Le courant qui s'écoule sans jamais avoir commencé de couler. Pas un dieu de l'eau, ni de l'énergie, ni du temps — un mouvement pur, sans origine ni destination.",
        ],
      },
      {
        title: "08 · L'Homme Dans le Mur",
        content: [
          "L'adhérence silencieuse qui empêche tout de s'effondrer en poussière séparée. Sans lui, chaque atome de chaque monde se dispersait instantanément dans des directions qui n'existent même pas encore.",
        ],
      },
      {
        title: "09 · La Voix du Silence",
        content: [
          "La force anonyme qui répare ce qui n'aurait jamais dû se briser. Quand une loi de la réalité se fissure, quelque chose la referme avant que quiconque ne le remarque.",
        ],
      },
      {
        title: "10 · Le Récit Qui N'a Jamais Commencé",
        content: [
          "L'histoire qui se raconte sans premier chapitre ni narrateur. La cosmologie elle-même pourrait n'être qu'un fragment de son récit sans fin. Il n'a pas de morale. Il n'a pas de fin annoncée. Il continue, simplement, et nous sommes dedans.",
        ],
      },
    ],
  },

  // ─── SECTION 4: LES XARMEKTH ───
  {
    id: "xarmekth",
    title: "Les Xarmekth",
    titleJp: "ザルメクス",
    subtitle: "La rouille qui pense",
    content: [
      "Les Xarmekth ne sont ni des machines, ni des esprits, ni des monstres au sens classique. Ils sont ce qui arrive quand une portion de réalité a été « réparée » trop de fois par des mains qui n'auraient jamais dû y toucher.",
      "La légende veut qu'ils soient nés d'un fragment du Marteau Qui Corrige en Silence — un Primordial — tombé sur une zone du monde où le Dragon du Changement et le Dragon de l'Équilibre se disputaient déjà l'influence.",
      "Chaque Xarmekth est un fragment de logique brisée ayant pris une forme physique cohérente — souvent métallique, organique-cristalline, ou un mélange instable des deux. Ils ne se reproduisent pas — ils se RÉPLIQUENT. Une zone touchée devient progressivement plus « cohérente » et plus « morte ».",
    ],
    quote:
      "Un Xarmekth n'est pas cassé. Un Xarmekth EST la cassure, devenue assez stable pour marcher.",
    subSections: [
      {
        title: "⚙ Xarmekth-Racine — Souche Originelle",
        content: [
          "Statique · Rampante. Les premiers observés, immobiles, ancrés au sol comme des excroissances métalliques. Ils ne se déplacent jamais, mais leur zone d'influence « corrective » s'étend lentement, année après année, transformant la végétation environnante en motifs géométriques parfaits et sans vie.",
        ],
      },
      {
        title: "⊙ Xarmekth-Écho — Souche Itinérante",
        content: [
          "Mobile · Imitatrice. Capables de se déplacer en imitant grossièrement la démarche des créatures qu'ils ont « corrigées ». Les survivants décrivent une sensation glaçante de familiarité dans ses mouvements — comme un souvenir qui ne serait pas le leur.",
        ],
      },
      {
        title: "◎ Xarmekth-Noyau — Souche Rare",
        content: [
          "Stable · Quasi-Consciente. Extrêmement rares, et terrifiants pour cette seule raison : ils semblent capables d'anticiper. Leur seule présence confirmée a coïncidé avec la disparition totale d'une cité mineure du Sud, dont les ruines restent parfaitement intactes et silencieuses à ce jour.",
        ],
      },
    ],
  },

  // ─── SECTION 5: DIVINITÉS DU MONDE CONNU ───
  {
    id: "divinites",
    title: "Les Divinités du Monde Connu",
    titleJp: "既知世界の神々",
    subtitle: "Panthéon vivant, vénéré, et profondément humain",
    content: [
      "Entre les forces inaccessibles des Dragons et l'horreur abstraite des Primordiaux, le monde connu a façonné son propre panthéon — des divinités plus proches, plus narratives, et bien plus présentes dans la vie quotidienne des mortels.",
      "Aucune théologie officielle ne s'accorde sur leur origine exacte. Certains les considèrent comme des fragments du souffle du Dragon de l'Origine ayant pris conscience. D'autres pensent qu'elles sont nées spontanément de la foi collective.",
      "Ces huit divinités ne prétendent jamais égaler la puissance des Sept Dragons — et la plupart refusent même de discuter de l'existence des Dix Primordiaux.",
    ],
    quote: "Même les dieux baissent les yeux quand on prononce certains noms.",
    subSections: [
      {
        title: "☀ Solaris — Le Dieu-Soleil",
        content: [
          "LUMIÈRE · CHALEUR · VIGILANCE",
          "Solaris règne sur le ciel diurne et la lumière qui permet la vie. Figure paternelle et martiale, représenté comme une armure de flammes dorées sans visage distinct. Les soldats et les bâtisseurs lui vouent un respect quasi-militaire.",
        ],
      },
      {
        title: "☾ Nyxara — Déesse de la Nuit",
        content: [
          "OBSCURITÉ · RÊVES · SECRETS",
          "Sœur opposée et complémentaire de Solaris, elle gouverne la nuit, les rêves et tout ce qui se cache dans l'ombre. Représentée comme une silhouette féminine voilée d'étoiles.",
        ],
      },
      {
        title: "❀ Gracefield — Dame des Moissons",
        content: [
          "FERTILITÉ · ABONDANCE · CYCLES NATURELS",
          "Veille sur les récoltes et le cycle naturel de croissance et de repos. Représentée comme une figure maternelle dont les cheveux se transforment en blé doré. La divinité la plus universellement aimée du monde rural.",
        ],
      },
      {
        title: "⚔ Avalon — Seigneur de Guerre",
        content: [
          "BATAILLE · HONNEUR · SACRIFICE",
          "Dieu de la guerre, du courage et du sacrifice héroïque. Représenté avec une hache fendue par mille combats. Il ne promet jamais la victoire — seulement un trépas glorieux.",
        ],
      },
      {
        title: "⚖ Meridia — Juge des Âmes",
        content: [
          "JUSTICE · VÉRITÉ · JUGEMENT",
          "Pèse les actes des mortels. Représentée aveugle, tenant une balance parfaitement immobile. Patronne des juges et de tous ceux qui cherchent la vérité.",
        ],
      },
      {
        title: "≈ Thalwenn — Seigneur des Eaux Profondes",
        content: [
          "OCÉANS · TEMPÊTES · MYSTÈRES SOUS-MARINS",
          "Règne sur les mers et les créatures abyssales encore inconnues. Les marins lui offrent les premières gouttes de chaque cargaison par crainte plus que par dévotion.",
        ],
      },
      {
        title: "✦ Nilyne — Dame de la Fortune",
        content: [
          "CHANCE · DESTIN · OPPORTUNITÉ",
          "Invoquée avant chaque pari et chaque décision risquée. Représentée avec des dés cosmiques flottant autour d'elle. Elle ne favorise personne — elle se contente d'observer, amusée.",
        ],
      },
      {
        title: "✚ Orvenne — Médecin des Âges",
        content: [
          "GUÉRISON · COMPASSION · RENAISSANCE",
          "Divinité de la médecine et de la seconde chance. Vénérée dans tous les temples-hôpitaux. Représentée tenant un bourgeon naissant entre des mains usées par d'innombrables soins.",
        ],
      },
    ],
  },

  // ─── SECTION 6: RELIGIONS DU MONDE CONNU ───
  {
    id: "religions",
    title: "Les Religions du Monde Connu",
    titleJp: "既知世界の宗教",
    subtitle: "Croyances, cultes et institutions à travers les terres connues",
    content: [
      "La diversité religieuse du monde connu reflète la diversité de ses peuples et de ses terres. Certaines régions vénèrent un panthéon complet, d'autres se concentrent sur une seule divinité protectrice.",
      "Priez qui vous voulez. Mais ne nommez jamais les Dix à voix haute, même en plaisantant. Le silence, parfois, est la seule prière qui protège vraiment.",
    ],
    subSections: [
      {
        title: "L'Église du Soleil Éternel",
        content: [
          "Royaumes du Centre et de l'Est — Culte : Solaris",
          "Religion d'État la plus répandue, structurée en hiérarchie militaire et cléricale stricte. Prône la discipline et la lumière comme métaphore de la vérité.",
          "Ordres de paladins-inquisiteurs chargés de traquer les cultes interdits. Fête majeure : le Solstice d'Or.",
        ],
      },
      {
        title: "Les Noctambules",
        content: [
          "Cités portuaires et quartiers nocturnes — Culte : Nyxara",
          "Culte discret, dissimulé derrière plusieurs sociétés de couverture. Leur mission est de veiller au bon fonctionnement des artefacts.",
          "Rituels pratiqués exclusivement après le coucher du soleil. Fête majeure : la Nuit des Mille Chuchotements.",
        ],
      },
      {
        title: "Le Pacte des Moissons",
        content: [
          "Régions agricoles et villages ruraux — Culte : Gracefield",
          "Tradition rurale ancienne, plus communautaire qu'institutionnelle. Chaque village entretient son propre autel à Gracefield.",
          "Offrandes de la première récolte à chaque saison. Fête majeure : la Veillée des Premiers Grains.",
        ],
      },
      {
        title: "Les Victoriens",
        content: [
          "Royaumes guerriers et mercenariat — Culte : Avalon",
          "Plus un code d'honneur martial qu'une religion structurée. La mort au combat y est considérée comme une bénédiction.",
          "Serment de la Hache prononcé avant chaque bataille. Fête majeure : le Jour des Lames Tombées.",
        ],
      },
      {
        title: "Le Tribunal de la Balance",
        content: [
          "Cités judiciaires — Culte : Meridia",
          "Institution juridico-religieuse fusionnant tribunal civil et temple. Les juges sont à la fois magistrats et clercs.",
          "Procès ouverts par une invocation rituelle de Meridia. Fête majeure : le Jour du Verdict Silencieux.",
        ],
      },
      {
        title: "Les Alchimistes de l'Abysse",
        content: [
          "Côtes, ports et communautés insulaires — Culte : Thalwenn",
          "Culte craintif plutôt que dévotionnel, pratiqué par quasiment tous les marins. Rituels de superstition protectrice.",
          "Offrande obligatoire avant chaque départ en mer. Fête majeure : la Nuit des Profondeurs Calmes.",
        ],
      },
      {
        title: "Le Cercle d'Or",
        content: [
          "Cités marchandes et quartiers des jeux — Culte : Aurelyne",
          "Culte semi-clandestin populaire parmi marchands et joueurs. Immensément populaire dans la culture populaire.",
          "Aucune doctrine fixe — chaque fidèle interprète la chance à sa manière. Fête majeure : le Tournoi du Hasard Doré.",
        ],
      },
      {
        title: "L'Ordre des Mains Guérisseuses",
        content: [
          "Temples-hôpitaux — Culte : Orvenne",
          "Institution médicale universellement respectée, transcendant les conflits entre cultes. Aucune arme tolérée dans l'enceinte des temples.",
          "Formation médicale rigoureuse combinée à enseignement spirituel. Fête majeure : le Jour du Premier Souffle.",
        ],
      },
      {
        title: "⚠ Les Cultes Interdits",
        content: [
          "Les Adorateurs du Solstice — culte clandestin voué au Dragon de l'Origine, traqué par l'Église du Jour Éternel.",
          "L'Ordre du Sablier Brisé — secte d'érudits ayant tenté de manipuler le Dragon du Temps, dissoute après une catastrophe non documentée.",
          "Les Murmures sans Nom — individus isolés prononçant les noms des Dix Primordiaux, retrouvés incohérents ou jamais retrouvés.",
          "La Secte de la Démone — culte voué à une entité féminine au nom effacé. La renaissance par la corruption, les pactes et la métamorphose de l'âme.",
          "Le Voile Rouge — organisation clandestine liée à la Triade, infiltrant royaumes et guildes pour altérer le cours des événements.",
          "Les Hérétiques du Grimoire — ordre ésotérique de dangereux érudits collectionnant savoirs interdits, convaincus que les dieux ne sont que les auteurs d'un manuscrit inachevé.",
          "Tartaros — culte occultiste voué aux Sept Démons Primordiaux. Chaque adepte conclut un Pacte sacrifiant une partie de son existence pour un fragment de puissance démoniaque.",
          "Le Sanctuaire des Lecteurs — secte dont personne ne connaît la date de fondation. Ses traces apparaissent dans les archives les plus anciennes comme les plus récentes, toujours sous un nom différent.",
        ],
      },
    ],
  },
];

export const GEOGRAPHY_DATA: GeographySection[] = [
  {
    id: "vue-ensemble",
    title: "Vue d'Ensemble du Monde",
    titleJp: "世界の全体像",
    content: [
      "Le monde d'Ascension compte 180 nations signataires du Traité Commercial de l'Éther, réparties sur plusieurs continents et territoires. La géographie est aussi diverse que les races qui l'habitent — des forêts millénaires aux déserts de cristal, des cités flottantes aux royaumes souterrains.",
      "Le continent central — Aerolis — abrite les nations les plus puissantes et les guildes les plus influentes. Les autres continents conservent leurs propres cultures, leurs propres conflits et leurs propres mystères.",
    ],
  },
  {
    id: "factions",
    title: "Les Grandes Factions",
    titleJp: "大勢力",
    content: [
      "Le monde d'Ascension est structuré autour de factions majeures qui dépassent les frontières nationales :",
      "La Concorde Magique — coalition de mages et érudits prônant l'étude et la compréhension de l'Énergie Potentielle. Elle gère les académies, les bibliothèques et la recherche fondamentale.",
      "L'Église de Solaris — religion dominante du continent central. Son influence s'étend sur 120 des 180 nations signataires. Elle considère les Donjons comme des anomalies et les pratiques interdites (Nécromancie, Art Draconique) comme des hérésies.",
      "La Société des Guildes — organisation internationale neutre supervisant les rangs d'aventuriers, les quêtes et le commerce éthéré. Son siège est indépendant de toute nation.",
      "La Guilde des Aventuriers — branche opérationnelle de la Société des Guildes, chargée des interventions sur le terrain (Donjons, Ruptures, créatures hostiles).",
    ],
  },
  {
    id: "walpurgis",
    title: "Walpurgis",
    titleJp: "ヴァルプルギス",
    content: [
      "Walpurgis est le nom donné au phénomène cyclique le plus redouté du monde d'Ascension. Tous les 50 ans, lorsque les planètes s'alignent et que l'Énergie Potentielle atteint son apogée, une vague de Ruptures massives se produit simultanement à travers le monde.",
      "Pendant la Nuit de Walpurgis — qui dure en réalité plusieurs semaines — des centaines de Donjons apparaissent, des créatures de tous les plans envahissent les territoires civilisés, et les lois de la réalité se distordent. C'est l'épreuve ultime pour les aventuriers et les nations du monde.",
      "La dernière Walpurgis, il y a 12 ans, vit la destruction de trois nations entières et l'émergence de nouveaux héros qui atteignirent le rang S en une seule nuit. La prochaine est prévue dans 38 ans.",
    ],
  },
  {
    id: "donjons",
    title: "Les Donjons",
    titleJp: "ダンジョン",
    content: [
      "Les Donjons sont des environnements autonomes nés de concentrations anormales d'Énergie Potentielle brute. L'espace se replie sur lui-même, créant un monde miniature où le temps, la matière et les lois naturelles obéissent à une logique propre.",
      "Au centre de chaque Donjon se trouve un Cœur — un artefact, une âme, une conscience ou un phénomène naturel qui détermine l'identité et le fonctionnement du Donjon. Détruire le Cœur est le moyen le plus sûr de sceller un Donjon définitivement.",
      "Les Donjons ne se manifestent pas uniquement dans les terres sauvages. Des archives recensent des cas où des quartiers entiers furent engloutis dans une distorsion spatiale, forçant aventuriers et soldats à pénétrer dans le Donjon pour secourir les survivants.",
      "L'écosystème d'un Donjon est autonome : créatures, ressources et structures se régénèrent via le Reflux Énergétique — un courant constant qui reconstruit tout ce qui a été détruit.",
    ],
  },
  {
    id: "economie",
    title: "Économie & Commerce",
    titleJp: "経済と交易",
    content: [
      "L'Éther est la monnaie universelle du monde, créée il y a 200 ans lors du Grand Conclave de Commerce. Chaque pièce est marquée d'un sceau runique unique, la rendant infalsifiable et traçable. 187 nations ont signé le Traité Commercial de l'Éther.",
      "La Société des Guildes supervise le système de récompenses de quêtes, avec des échelles allant de 100 éther (rang F) à plus d'un million d'éther (contrats EX). La Banque Centrale de l'Éther gère les transferts internationaux et les coffres sécurisés.",
      "Le marché libre offre un vaste catalogue d'objets et consommables, des simples bandages éthérisés (50 éther) aux Pierres de Réanimation (12 000 éther), en passant par les Cristaux de Téléportation et les Potions de Flux.",
    ],
  },
];