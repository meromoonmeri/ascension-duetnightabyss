"use client";

import { useState, useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useNavigation } from "@/store/navigationStore";
import { FourPointStar } from "@/components/shared/Ornaments";

interface SeqData {
  seq: number;
  narrative: string;
  portee: string;
  force: string;
  durabilite: string;
  ap: string;
  dc: string;
  apRaw: number;
}
interface RankData {
  rank: string;
  label: string;
  tierVS: string;
  color: string;
  seqs: SeqData[];
}

const m = (seq: number, narrative: string, portee: string, force: string, durabilite: string, ap: string, dc: string, apRaw: number): SeqData =>
  ({ seq, narrative, portee, force, durabilite, ap, dc, apRaw });

const RANKS: RankData[] = [
  // ── F : Sous-humain → 9-A  |  50 J → 500 J  |  mult ×10 ──
  { rank: "F", label: "Faible", tierVS: "9-B → 9-A", color: "#78716C", seqs: [
    m(9, "Seuil d'entrée",    "1 m",   "Mur fragile",        "Corps humain",           "50 J",   "Sous-humain",     50),
    m(8, "Première montée",   "3 m",   "Mur en bois",        "Athlète entraîné",      "65 J",   "Sous-humain+",    64.58),
    m(7, "Affirmation",       "5 m",   "Mur en plâtre",      "Combattant amateur",     "83 J",   "Athlète humain",  83.41),
    m(6, "Progrès constant",  "8 m",   "Mur en brique",      "Expert en arts martiaux","108 J",   "10-A",           107.7),
    m(5, "Mi-chemin",         "13 m",  "Cloison renforcée",  "Soldat d'élite",        "139 J",  "9-C",            139.1),
    m(4, "Accélération",      "19 m",  "Mur creusé",         "Agent spécial",         "180 J",  "9-B-",           179.7),
    m(3, "Pré-apogée",        "27 m",  "Béton cellulaire",   "Opératif avancé",       "232 J",  "9-B",            232.1),
    m(2, "Seuil critique",    "36 m",  "Béton armé fin",     "Supra-humain naissant",  "300 J",  "9-B+",           299.7),
    m(1, "Aube de la puissance","44 m","Béton armé",         "Guerrier confirmé",      "387 J",  "9-A-",           387.1),
    m(0, "Apogée — seuil d'évolution","50 m","Béton armé épais","Éveillé de rang F",    "500 J",  "9-A",            500),
  ]},
  // ── E : 9-A → 8-C  |  1 kJ → 15 kJ  |  mult ×15 ──
  { rank: "E", label: "Modéré", tierVS: "9-A → 8-C", color: "#9CA3AF", seqs: [
    m(9, "Seuil d'entrée",    "10 m",  "Petit bâtiment",      "Mur renforcé",          "1,0 kJ",  "9-A",   1000),
    m(8, "Première montée",   "30 m",  "Bâtiment bas",        "Béton épais",           "1,4 kJ",  "9-A+",  1351),
    m(7, "Affirmation",       "80 m",  "Maison individuelle", "Acier fin",             "1,8 kJ",  "High 9-A",1825),
    m(6, "Progrès constant",  "150 m", "Petit immeuble",      "Acier standard",        "2,5 kJ",  "8-C-",  2466),
    m(5, "Mi-chemin",         "300 m", "Immeuble RDC",        "Alliage résistant",     "3,3 kJ",  "8-C",   3332),
    m(4, "Accélération",      "600 m", "Immeuble 2 étages",   "Carapace organique",    "4,5 kJ",  "8-C",   4502),
    m(3, "Pré-apogée",        "900 m", "Immeuble 3 étages",   "Composite renforcé",    "6,1 kJ",  "8-C+",  6082),
    m(2, "Seuil critique",    "1,3 km","Immeuble 4 étages",   "Blindage léger",        "8,2 kJ",  "8-C+",  8217),
    m(1, "Aube de la puissance","1,7 km","Bâtiment commercial","Blindage moyen",        "11 kJ",   "High 8-C",11100),
    m(0, "Apogée — seuil d'évolution","2 km","Bâtiment multi-étages","Éveillé de rang E","15 kJ",    "8-C",   15000),
  ]},
  // ── D : 8-B → 8-A  |  50 kJ → 1 MJ  |  mult ×20 ──
  { rank: "D", label: "Fort", tierVS: "8-B → 8-A", color: "#3B82F6", seqs: [
    m(9, "Seuil d'entrée",    "50 m",  "Bâtiment commercial",  "Blindage lourd",        "50 kJ",   "8-B",    50000),
    m(8, "Première montée",   "120 m", "Grande structure",     "Carapace minérale",     "70 kJ",   "8-B",    69750),
    m(7, "Affirmation",       "300 m", "Tour basse",           "Roche magique",         "97 kJ",   "8-B+",   97290),
    m(6, "Progrès constant",  "700 m", "Tour moyenne",         "Obsidienne renforcée",  "136 kJ",  "8-B+",   135700),
    m(5, "Mi-chemin",         "1,5 km","Tour haute",           "Adamantine fine",       "189 kJ",  "8-A-",   189300),
    m(4, "Accélération",      "3 km",  "Gratte-ciel moyen",    "Adamantine",            "264 kJ",  "8-A-",   264100),
    m(3, "Pré-apogée",        "5 km",  "Gratte-ciel",          "Orichalque fin",        "368 kJ",  "8-A",    368400),
    m(2, "Seuil critique",    "7 km",  "Tour massive",         "Orichalque",            "514 kJ",  "8-A",    513900),
    m(1, "Aube de la puissance","8,5 km","Méga-structure",     "Égide mineure",         "717 kJ",  "8-A+",   716900),
    m(0, "Apogée — seuil d'évolution","10 km","Pôle urbain",   "Éveillé de rang D",    "1,0 MJ",  "8-A",    1000000),
  ]},
  // ── C : 8-A → 7-C  |  5 MJ → 250 MJ  |  mult ×50 ──
  { rank: "C", label: "Puissant", tierVS: "8-A → 7-C", color: "#22C55E", seqs: [
    m(9, "Seuil d'entrée",    "200 m",  "Pôle urbain",       "Égide mineure",          "5,0 MJ",  "8-A",    5e6),
    m(8, "Première montée",   "600 m",  "Quartier",          "Égide standard",         "7,7 MJ",  "8-A+",   7.722e6),
    m(7, "Affirmation",       "2 km",   "District",          "Égide renforcée",        "12 MJ",   "7-C-",   1.193e7),
    m(6, "Progrès constant",  "7 km",   "Ville petite",      "Barrière énergétique",   "18 MJ",   "7-C-",   1.842e7),
    m(5, "Mi-chemin",         "20 km",  "Ville moyenne",     "Bouclier arcanique",     "28 MJ",   "7-C",    2.845e7),
    m(4, "Accélération",      "40 km",  "Ville grande",      "Armure runique",         "44 MJ",   "7-C",    4.394e7),
    m(3, "Pré-apogée",        "60 km",  "Métropole",         "Carapace divine",        "68 MJ",   "7-C+",   6.786e7),
    m(2, "Seuil critique",    "80 km",  "Conurbation",       "Aegis mineure",          "105 MJ",  "7-C+",   1.048e8),
    m(1, "Aube de la puissance","92 km","Région urbaine",    "Aegis",                  "162 MJ",  "High 7-C",1.619e8),
    m(0, "Apogée — seuil d'évolution","100 km","Ville-État","Éveillé de rang C",      "250 MJ",  "7-C",    2.5e8),
  ]},
  // ── B : 7-B → 7-A  |  5 GJ → 500 GJ  |  mult ×100 ──
  { rank: "B", label: "Exceptionnel", tierVS: "7-B → 7-A", color: "#A855F7", seqs: [
    m(9, "Seuil d'entrée",    "500 m",  "Ville-État",         "Aegis",                  "5,0 GJ",  "7-B",    5e9),
    m(8, "Première montée",   "2 km",   "Petite métropole",   "Aegis renforcée",        "8,3 GJ",  "7-B",    8.341e9),
    m(7, "Affirmation",       "5 km",   "Métropole",          "Armure sacrée",          "14 GJ",   "7-B+",   1.391e10),
    m(6, "Progrès constant",  "10 km",  "Grande métropole",   "Carapace astrale",       "23 GJ",   "7-B+",   2.321e10),
    m(5, "Mi-chemin",         "17 km",  "Mégalopole",         "Bouclier planétaire",    "39 GJ",   "7-A-",   3.871e10),
    m(4, "Accélération",      "24 km",  "Région",             "Forteresse vivante",     "65 GJ",   "7-A-",   6.458e10),
    m(3, "Pré-apogée",        "32 km",  "Territoire",         "Noyau cristallin",       "108 GJ",  "7-A",    1.077e11),
    m(2, "Seuil critique",    "40 km",  "Province",           "Barrière dimensionnelle","180 GJ",  "7-A",    1.797e11),
    m(1, "Aube de la puissance","46 km","Domaine",            "Voile stellaire",        "300 GJ",  "7-A+",   2.997e11),
    m(0, "Apogée — seuil d'évolution","50 km","Nation entière","Éveillé de rang B",     "500 GJ",  "7-A",    5e11),
  ]},
  // ── A : 6-C → 6-B  |  2 TJ → 400 TJ  |  mult ×200 ──
  { rank: "A", label: "Redoutable", tierVS: "6-C → 6-B", color: "#EF4444", seqs: [
    m(9, "Seuil d'entrée",    "2 km",   "Nation entière",       "Voile stellaire",       "2,0 TJ",  "6-C",    2e12),
    m(8, "Première montée",   "8 km",   "Alliance de nations",  "Armure cosmique",       "3,6 TJ",  "6-C+",   3.603e12),
    m(7, "Affirmation",       "30 km",  "Continent partie",     "Blindage gravitationnel","6,5 TJ",  "6-B-",   6.492e12),
    m(6, "Progrès constant",  "80 km",  "Sous-continent",       "Coque planétaire",      "12 TJ",   "6-B-",   1.17e13),
    m(5, "Mi-chemin",         "180 km", "Grande péninsule",     "Noyau tellurique",      "21 TJ",   "6-B",    2.107e13),
    m(4, "Accélération",      "280 km", "Pays immense",         "Écorce de titano",      "38 TJ",   "6-B",    3.796e13),
    m(3, "Pré-apogée",        "370 km", "Sous-continent",       "Aegis tellurique",      "68 TJ",   "6-B+",   6.84e13),
    m(2, "Seuil critique",    "430 km", "Quasi-continent",      "Barrière continentale", "123 TJ",  "6-B+",   1.232e14),
    m(1, "Aube de la puissance","470 km","Continent partie",    "Cœur de montagne",      "222 TJ",  "High 6-B",2.22e14),
    m(0, "Apogée — seuil d'évolution","500 km","Montagne titanesque","Éveillé de rang A","400 TJ",  "6-B",    4e14),
  ]},
  // ── S : 6-A → 5-C  |  100 TJ → 50 PJ  |  mult ×500 ──
  { rank: "S", label: "Cataclysmique", tierVS: "6-A → 5-C", color: "#F59E0B", seqs: [
    m(9, "Seuil d'entrée",    "10 km",    "Montagne titanesque",  "Cœur de montagne",      "100 TJ",  "6-A",    1e14),
    m(8, "Première montée",   "40 km",    "Chaîne de montagnes",  "Noyau magmatique",      "199 TJ",  "6-A+",   1.995e14),
    m(7, "Affirmation",       "120 km",   "Île majeure",          "Manteau terrestre",     "398 TJ",  "5-C-",   3.979e14),
    m(6, "Progrès constant",  "400 km",   "Grande île",          "Manteau renforcé",      "794 TJ",  "5-C-",   7.937e14),
    m(5, "Mi-chemin",         "1 200 km", "Petit continent",       "Noyau planétaire",      "1,6 PJ",  "5-C",    1.583e15),
    m(4, "Accélération",      "2 500 km", "Continent",            "Écorce continentale",   "3,2 PJ",  "5-C",    3.158e15),
    m(3, "Pré-apogée",        "3 500 km", "Grande masse terrestre","Manteau profond",       "6,3 PJ",  "5-C+",   6.3e15),
    m(2, "Seuil critique",    "4 200 km", "Super-continent",      "Noyau planétaire complet","13 PJ", "5-C+",   1.257e16),
    m(1, "Aube de la puissance","4 650 km","Planète partie",      "Bouclier planétaire total","25 PJ","5-C+",   2.507e16),
    m(0, "Apogée — seuil d'évolution","5 000 km","Continent dévastateur","Éveillé de rang S","50 PJ",  "5-C",    5e16),
  ]},
  // ── S+ : 5-B → 4-C  |  500 PJ → 1 EJ  |  mult ×2 ──
  { rank: "S+", label: "Souverain", tierVS: "5-B → 4-C", color: "#E8B830", seqs: [
    m(9, "Seuil d'entrée",    "50 km",   "Péninsule",            "Bouclier planétaire total","500 PJ","5-B",    5e17),
    m(8, "Première montée",   "200 km",  "Île mineure",          "Armure planétaire",     "540 PJ",  "5-B",    5.4e17),
    m(7, "Affirmation",       "800 km",  "Île majeure",          "Carapace lithosphérique","583 PJ",  "5-B+",   5.833e17),
    m(6, "Progrès constant",  "2 500 km","Grande île",           "Coque planétaire",       "630 PJ",  "5-A-",   6.3e17),
    m(5, "Mi-chemin",         "8 000 km","Archipel",             "Noyau stellaire inerte","680 PJ",  "5-A-",   6.804e17),
    m(4, "Accélération",      "15 000 km","Petit continent",     "Manteau stellaire",     "735 PJ",  "5-A",    7.349e17),
    m(3, "Pré-apogée",        "25 000 km","Sous-continent",      "Noyau magnétique",      "794 PJ",  "4-C-",   7.937e17),
    m(2, "Seuil critique",    "35 000 km","Continent",           "Pression jovienne",     "857 PJ",  "4-C-",   8.572e17),
    m(1, "Aube de la puissance","42 000 km","Super-continent",   "Atmosphère stellaire",  "926 PJ",  "4-C",    9.259e17),
    m(0, "Apogée — seuil d'évolution","50 000 km","Montagne titanesque","Éveillé de rang S+","1,0 EJ","4-C",  1e18),
  ]},
  // ── SS+ : 4-B → 4-A  |  10 EJ → 100 EJ  |  mult ×10 ──
  { rank: "SS+", label: "Transcendant", tierVS: "4-B → 4-A", color: "#D4AF37", seqs: [
    m(9, "Seuil d'entrée",    "50 000 km",  "Continent dévastateur","Bouclier planétaire total","10 EJ", "4-B",    1e19),
    m(8, "Première montée",   "100 000 km", "Surface planétaire",  "Armure planétaire",     "13 EJ",  "4-B",    1.292e19),
    m(7, "Affirmation",       "200 000 km", "Hémisphère",          "Carapace lithosphérique","17 EJ",  "4-B+",   1.668e19),
    m(6, "Progrès constant",  "500 000 km", "Planète faible",      "Coque planétaire",       "22 EJ",  "4-B+",   2.154e19),
    m(5, "Mi-chemin",         "1 Mkm",      "Planète standard",    "Noyau stellaire inerte","28 EJ",  "4-A-",   2.783e19),
    m(4, "Accélération",      "2 Mkm",      "Planète massive",     "Manteau stellaire",     "36 EJ",  "4-A-",   3.594e19),
    m(3, "Pré-apogée",        "5 Mkm",      "Super-Terre",         "Noyau magnétique",      "46 EJ",  "4-A",    4.642e19),
    m(2, "Seuil critique",    "10 Mkm",     "Géante gazeuse",      "Pression jovienne",     "60 EJ",  "4-A",    5.995e19),
    m(1, "Aube de la puissance","20 Mkm",   "Système proche",      "Atmosphère stellaire",  "77 EJ",  "4-A+",   7.743e19),
    m(0, "Apogée — seuil d'évolution","Planétaire","Proximité lunaire","Éveillé de rang SS+","100 EJ","4-A",  1e20),
  ]},
  // ── SSS+ : 3-A → 2-C  |  500 EJ → 50 ZJ  |  mult ×100 ──
  { rank: "SSS+", label: "Cosmique", tierVS: "3-A → 2-C", color: "#E879A8", seqs: [
    m(9, "Seuil d'entrée",    "Planétaire",    "Proximité lunaire",    "Atmosphère stellaire",    "500 EJ",  "3-A",     5e20),
    m(8, "Première montée",   "Orbite lunaire","Surface lunaire",     "Écorce lunaire",          "834 EJ",  "3-A+",    8.341e20),
    m(7, "Affirmation",       "Système Terre-Lune","Lune entière",    "Noyau lunaire",           "1,4 ZJ",  "3-A+",    1.391e21),
    m(6, "Progrès constant",  "Espace proche", "Système Terre-Lune",  "Gravité lunaire maîtrisée","2,3 ZJ", "2-C-",    2.321e21),
    m(5, "Mi-chemin",         "Orbite terrestre","Espace proche",     "Coque spatiale",          "3,9 ZJ",  "2-C-",    3.871e21),
    m(4, "Accélération",      "Orbite martienne","Orbite terrestre",  "Blindage orbital",        "6,5 ZJ",  "2-C",     6.458e21),
    m(3, "Pré-apogée",        "Système solaire intérieur","Orbite martienne","Bouclier interplanétaire","11 ZJ","2-C",1.077e22),
    m(2, "Seuil critique",    "Système solaire","Système solaire intérieur","Aegis solaire",     "18 ZJ",  "2-C+",    1.797e22),
    m(1, "Aube de la puissance","Système solaire étendu","Système solaire","Voile solaire",        "30 ZJ",  "2-C+",    2.997e22),
    m(0, "Apogée — seuil d'évolution","Stellaire","Étoile proximale","Éveillé de rang SSS+",    "50 ZJ",  "2-C",     5e22),
  ]},
  // ── EX : 2-B → EX  |  500 ZJ → ∞  |  stellaire+ ──
  { rank: "EX", label: "Au-delà", tierVS: "2-B → EX", color: "#FF69B4", seqs: [
    m(9, "Seuil d'entrée",    "Stellaire",           "Étoile proximale",    "Voile solaire",          "500 ZJ",       "2-B",     5e23),
    m(8, "Première montée",   "Système stellaire",   "Étoile de type G",    "Noyau stellaire",        "5 YJ",         "2-B+",    5e24),
    m(7, "Affirmation",       "Système multiple",    "Étoile massive",      "Manteau stellaire",      "50 YJ",        "2-A",     5e25),
    m(6, "Progrès constant",  "Amas ouvert",         "Supernova",           "Écorce stellaire",       "500 YJ",       "2-A+",    5e26),
    m(5, "Mi-chemin",         "Nébuleuse",           "Hypernova",           "Noyau stellaire actif",  "5×10³ YJ",    "Low 2-C", 5e27),
    m(4, "Accélération",      "Amas stellaire",      "Trou noir stellaire", "Horizon des événements", "5×10⁴ YJ",   "2-C",     5e28),
    m(3, "Pré-apogée",        "Système galactique",  "Trou noir massif",    "Singularité stable",     "5×10⁵ YJ",   "2-C+",    5e29),
    m(2, "Seuil critique",    "Bras galactique",     "Galaxie partie",      "Transcendance",          "5×10³⁰ J",   "High 2-C",5e30),
    m(1, "Aube de la puissance","Galaxie → Au-delà","Galaxie entière",     "Omnirésistance",         "5×10³² J",   "EX-",     5e32),
    m(0, "Apogée — seuil d'évolution","Multivers local","Multivers local",  "Conscience cosmique",    "Hors échelle — non quantifiable","EX",-1),
  ]},
];

const NARR = ["Seuil d'entrée","Première montée","Affirmation","Progrès constant","Mi-chemin","Accélération","Pré-apogée","Seuil critique","Aube de la puissance","Apogée — seuil d'évolution"];

export default function ScalingPage() {
  useNavigation();
  const [rankIdx, setRankIdx] = useState(0);
  const [seqIdx, setSeqIdx] = useState(9);
  const [copied, setCopied] = useState(false);

  const rank = RANKS[rankIdx];
  const seq = rank.seqs[seqIdx];
  const progress = ((9 - seqIdx) / 9) * 100;

  const copySummary = useCallback(() => {
    const text = [
      "Rang " + rank.rank + " (" + rank.label + ")",
      "Séquence " + seq.seq,
      "Tier VS Battles: " + rank.tierVS,
      "",
      "Portée: " + seq.portee,
      "Force: " + seq.force,
      "Durabilité: " + seq.durabilite,
      "AP: " + seq.ap,
      "DC: " + seq.dc,
      "",
      seq.narrative,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [rank, seq]);

  const downloadDocx = useCallback(async () => {
    // Lazy-load docx only when user clicks download
    const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, VerticalAlign, BorderStyle: DocxBorderStyle } = await import("docx");
    const hdrBorders = {
      top: { style: DocxBorderStyle.SINGLE, size: 2, color: rank.color },
      bottom: { style: DocxBorderStyle.SINGLE, size: 2, color: rank.color },
      left: { style: DocxBorderStyle.SINGLE, size: 1, color: rank.color },
      right: { style: DocxBorderStyle.SINGLE, size: 1, color: rank.color },
    };
    const cellBorders = {
      top: { style: DocxBorderStyle.SINGLE, size: 1, color: "999999" },
      bottom: { style: DocxBorderStyle.SINGLE, size: 1, color: "999999" },
      left: { style: DocxBorderStyle.SINGLE, size: 1, color: "999999" },
      right: { style: DocxBorderStyle.SINGLE, size: 1, color: "999999" },
    };
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: "Rapport de Scaling — Ascension Wiki",
                  bold: true,
                  size: 32,
                  color: "1A1A2E",
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: [
                new TextRun({ text: `Rang ${rank.rank}`, bold: true, size: 26, color: rank.color, font: "Calibri" }),
                new TextRun({ text: ` (${rank.label})`, size: 24, color: "555555", font: "Calibri" }),
                new TextRun({ text: `  —  Tier VS Battles: ${rank.tierVS}`, size: 22, color: "777777", font: "Calibri" }),
              ],
            }),
            new Paragraph({ spacing: { after: 200 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: ["Séquence", "Portée", "Force", "Durabilité", "AP", "DC"].map((h) =>
                    new TableCell({
                      borders: hdrBorders,
                      width: { size: 100 / 6, type: WidthType.PERCENTAGE },
                      shading: { fill: rank.color, type: "clear" as any },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 60, after: 60 },
                          children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })],
                        }),
                      ],
                    }),
                  ),
                }),
                ...rank.seqs.map(
                  (s) =>
                    new TableRow({
                      children: [
                        String(s.seq),
                        s.portee,
                        s.force,
                        s.durabilite,
                        s.ap,
                        s.dc,
                      ].map((val, ci) =>
                        (new TableCell({
                          borders: cellBorders,
                          width: { size: 100 / 6, type: WidthType.PERCENTAGE },
                          verticalAlign: VerticalAlign.CENTER,
                          shading: s.seq === seqIdx ? { fill: "FFF8E7", type: "clear" as any } : undefined,
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              spacing: { before: 40, after: 40 },
                              children: [
                                new TextRun({
                                  text: val,
                                  bold: ci === 0 && s.seq === seqIdx,
                                  color: s.seq === seqIdx ? rank.color : "333333",
                                  size: 20,
                                  font: "Calibri",
                                }),
                              ],
                            }),
                          ],
                        })),
                      ),
                    }),
                  ),
              ],
            }),
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Généré par Ascension Wiki — Système de Scaling",
                  italics: true,
                  size: 16,
                  color: "AAAAAA",
                  font: "Calibri",
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scaling-rank-${rank.rank}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rank, seqIdx]);

  return (
    <div className="min-h-screen flex flex-col font-body text-txt-primary">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <FourPointStar size={18} color="var(--gold)" />
            <h1 className="font-display text-2xl sm:text-3xl tracking-widest" style={{ color: "var(--gold)" }}>
              CALCULATEUR DE SCALING
            </h1>
            <FourPointStar size={18} color="var(--gold)" />
          </div>
          <p className="text-sm text-txt-tertiary max-w-2xl mx-auto leading-relaxed">
            ⚡ Ce système mesure la puissance physique globale (toutes races confondues), distinct des rangs de progression par race.
          </p>
          <p className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: "var(--gold)", opacity: 0.7 }}>
            Rang de Puissance
          </p>
        </div>

        {/* Rank Selector */}
        <section className="space-y-2">
          <h2 className="font-display text-sm tracking-wider text-txt-tertiary uppercase">Rang</h2>
          <div className="flex flex-wrap gap-2">
            {RANKS.map((r, i) => (
              <button
                key={r.rank}
                onClick={() => { setRankIdx(i); setSeqIdx(9); }}
                className="px-3 py-1.5 rounded text-sm font-display tracking-wide transition-all duration-200 border"
                style={{
                  borderColor: i === rankIdx ? "var(--gold)" : "var(--border-primary)",
                  backgroundColor: i === rankIdx ? "var(--gold)" : "var(--bg-card)",
                  color: i === rankIdx ? "#0A0A0F" : "var(--text-primary)",
                }}
              >
                {r.rank}
              </button>
            ))}
          </div>
        </section>

        {/* Sequence Slider */}
        <section className="space-y-3 rounded-lg border p-5" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm tracking-wider text-txt-tertiary uppercase">Séquence</h2>
            <span className="font-display text-lg font-bold" style={{ color: "var(--gold)" }}>{seq.seq}</span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-10"
            value={[seqIdx]}
            onValueChange={([v]) => setSeqIdx(v)}
            min={0}
            max={9}
            step={1}
          >
            <Slider.Track className="relative grow h-2 rounded-full" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <Slider.Range className="absolute h-full rounded-full" style={{ background: "linear-gradient(90deg, #B8860B, #D4AF37, #FFD700)" }} />
            </Slider.Track>
            <Slider.Thumb
              className="block w-5 h-5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-lg"
              style={{
                background: "radial-gradient(circle at 35% 35%, #FFE66D, #D4AF37, #B8860B)",
                boxShadow: "0 0 12px rgba(212, 175, 55, 0.5), 0 0 4px rgba(212, 175, 55, 0.8)",
                border: "2px solid #FFD700",
              }}
              aria-label={`Séquence ${seqIdx}`}
            />
          </Slider.Root>
          <div className="flex justify-between text-xs text-txt-tertiary font-display">
            <span>0 — Apogée</span>
            <span className="text-txt-primary font-body italic text-sm" style={{ color: "var(--gold)", opacity: 0.85 }}>{seq.narrative}</span>
            <span>9 — Entrée</span>
          </div>
        </section>

        {/* Power Card */}
        <div
          className="rounded-lg p-[2px] space-y-0"
          style={{ background: "linear-gradient(135deg, #B8860B, #D4AF37, #FFD700, #D4AF37, #B8860B)" }}
        >
          <div className="rounded-[7px] p-5 sm:p-6 space-y-5" style={{ backgroundColor: "var(--bg-card)" }}>
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="font-display text-xl sm:text-2xl font-bold px-3 py-1 rounded"
              style={{ backgroundColor: rank.color, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {rank.rank}
            </span>
            <span className="font-display text-lg text-txt-secondary">
              Séq. {seq.seq} — <span className="text-txt-primary">{NARR[9 - seq.seq]}</span>
            </span>
            <span
              className="ml-auto text-xs font-display tracking-wider px-2.5 py-1 rounded-full border"
              style={{ borderColor: rank.color, color: rank.color }}
            >
              {rank.tierVS}
            </span>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["Portée", seq.portee],
              ["Force", seq.force],
              ["Durabilité", seq.durabilite],
              ["AP", seq.ap],
              ["DC", seq.dc],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded p-3 space-y-1" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <span className="text-xs font-display tracking-wider text-txt-tertiary uppercase">{label as string}</span>
                <div
                  className={
                    seq.ap === "Hors échelle — non quantifiable" && label === "AP"
                      ? "text-sm font-body italic"
                      : "text-sm font-body text-txt-primary"
                  }
                  style={seq.ap === "Hors échelle — non quantifiable" && label === "AP" ? { color: "var(--gold)" } : {}}
                >
                  {value as string}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-txt-tertiary font-display">
              <span>Séq. 9</span>
              <span>Progression dans le rang</span>
              <span>Séq. 0</span>
            </div>
            <div className="relative h-2.5 rounded-full overflow-visible" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out relative"
                style={{ width: progress + "%", backgroundColor: "var(--gold)" }}
              >
                <div
                  className="absolute -right-1.5 -top-1 w-4 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #FFE66D, #D4AF37, #B8860B)",
                    boxShadow: "0 0 10px rgba(212, 175, 55, 0.6), 0 0 3px rgba(212, 175, 55, 0.9)",
                    border: "1.5px solid #FFD700",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <button
              onClick={copySummary}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-display tracking-wide transition-all duration-200 border hover:opacity-80"
              style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
            >
              📋 Copier le résumé
              {copied && <span className="text-xs font-body italic text-green-400 ml-1">Copié !</span>}
            </button>
            <button
              onClick={downloadDocx}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-display tracking-wide transition-all duration-200 border hover:opacity-80"
              style={{ borderColor: rank.color, color: rank.color }}
            >
              📄 Télécharger .docx
            </button>
          </div>
          </div>
        </div>

        {/* Quick Reference Table */}
        <section className="space-y-3">
          <h2 className="font-display text-sm tracking-wider text-txt-tertiary uppercase">Référence rapide — Tiers VS Battles</h2>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <th className="text-left px-4 py-2.5 font-display text-xs tracking-wider text-txt-tertiary uppercase">Rang</th>
                    <th className="text-left px-4 py-2.5 font-display text-xs tracking-wider text-txt-tertiary uppercase">Label</th>
                    <th className="text-left px-4 py-2.5 font-display text-xs tracking-wider text-txt-tertiary uppercase">Tier VS Battles</th>
                    <th className="text-right px-4 py-2.5 font-display text-xs tracking-wider text-txt-tertiary uppercase">AP Max</th>
                  </tr>
                </thead>
                <tbody>
                  {RANKS.map((r) => (
                    <tr
                      key={r.rank}
                      onClick={() => { setRankIdx(RANKS.indexOf(r)); setSeqIdx(9); }}
                      className="cursor-pointer transition-colors duration-150 hover:opacity-80"
                      style={{ backgroundColor: RANKS.indexOf(r) === rankIdx ? "var(--bg-tertiary)" : "transparent" }}
                    >
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-block w-7 h-7 leading-7 text-center rounded text-xs font-display font-bold text-white"
                          style={{ backgroundColor: r.color }}
                        >
                          {r.rank}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-txt-secondary font-body">{r.label}</td>
                      <td className="px-4 py-2.5 font-body" style={{ color: r.color }}>{r.tierVS}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-txt-accent text-xs">{r.seqs[0].ap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}