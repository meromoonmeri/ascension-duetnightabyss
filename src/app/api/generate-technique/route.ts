import { NextRequest, NextResponse } from "next/server";
import { ART_DATA, type ArtTechnique } from "@/data/arts";
import { chatCompletion } from "@/lib/zai";

const SYSTEM_PROMPT = `Tu es le Gardien des Archives d'Ascension, un scribe cosmique chargé de documenter les techniques de l'Énergie Potentielle.

UNIVERS : Ascension ノミステリ RP — un monde de rôle-play narratif avec 8 races (Célestes, Elfes Sylvestres, Humains, Bêtes-Démons, Vampires, Démons, Chimères, Néants) et 8 Arts de magie.

FORMAT DE RÉPONSE : Tu DOIS répondre UNIQUEMENT avec un JSON valide (pas de markdown, pas de backticks, pas de texte avant ou après).

RÈGLES STRICTES :
- Le contenu doit être COHÉRENT avec l'Art spécifié et sa thématique
- Les descriptions doivent être VIVANTES et IMMERSIVES, style fantasy épique
- Les faiblesses doivent être RÉALISTES et ÉQUILIBRÉES
- Le rang doit être varié (E, D, C, B, A, S, SS, SSS — ne pas toujours SSS)
- Les vecteurs doivent correspondre à la philosophie de l'Art
- TOUS les champs sont OBLIGATOIRES`;

const TECHNIQUE_SCHEMA = `{
  "nameFr": "nom en français de la technique",
  "subtitle": "sous-titre court poétique",
  "rank": "E, D, C, B, A, S, SS ou SSS",
  "style": "Spécialiste, Hybride, Secondaire Hybride ou Polyvalent",
  "classification": "classification",
  "nature": "nature élémentaire ou conceptuelle",
  "vecteur": "vecteur d'application",
  "portee": "Contact, Courte, Moyenne ou Longue",
  "techniqueParente": "technique parente ou Aucune",
  "techniqueDerivee": "technique dérivée ou Aucune",
  "vueEnsemble": "description globale immersive (3-4 phrases)",
  "effets": ["effet 1", "effet 2"],
  "fonctionnement": ["étape 1", "étape 2", "étape 3"],
  "faiblesses": ["faiblesse 1", "faiblesse 2"]
}`;

const JP_NAME_PROMPT = `Tu es un expert en langue japonaise et en naming de techniques de combat fantasy (shōnen/seinen).
Pour chaque technique donnée, tu dois créer un nom japonais authentique composé de kanji réels.

RÈGLES :
- Utilise 3-6 kanji authentiques
- Le nom doit refléter le concept de la technique
- Style : similaire aux noms de techniques dans Naruto, Jujutsu Kaisen, Bleach
- Répond UNIQUEMENT avec le nom japonais, rien d'autre
- Exemples : 天照大神の炎, 氷輪丸, 千鳥, 羅生門, 須佐能乎`;

function parseJson(raw: string): Record<string, unknown> {
  let s = raw.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  return JSON.parse(s.trim()) as Record<string, unknown>;
}

function buildTechnique(t: Record<string, unknown>, nameJp: string, artName: string): ArtTechnique {
  const str = (key: string, fallback: string) =>
    (typeof t[key] === "string" && t[key]!.toString().trim()) ? t[key]!.toString().trim() : fallback;
  const arr = (key: string, fallback: string[]) =>
    (Array.isArray(t[key]) && t[key].length > 0) ? t[key] as string[] : fallback;

  return {
    id: "",
    nameJp: nameJp || "未命名の術",
    nameFr: str("nameFr", "Technique Sans Nom"),
    subtitle: str("subtitle", artName),
    rank: str("rank", "B"),
    style: str("style", "Spécialiste") as ArtTechnique["style"],
    classification: str("classification", "Non classée"),
    nature: str("nature", "Inconnue"),
    vecteur: str("vecteur", "Direct"),
    portee: str("portee", "Moyenne"),
    techniqueParente: str("techniqueParente", "Aucune"),
    techniqueDerivee: str("techniqueDerivee", "Aucune"),
    vueEnsemble: str("vueEnsemble", "Une technique mystérieuse."),
    effets: arr("effets", ["Effet inconnu"]),
    fonctionnement: arr("fonctionnement", ["Mécanisme inconnu"]),
    faiblesses: arr("faiblesses", ["Faiblesse inconnue"]),
  };
}

async function generateWithSDK(userMessage: string, artName: string): Promise<ArtTechnique> {
  // Step 1: Generate technique JSON
  const fullPrompt = `${SYSTEM_PROMPT}\n\nJSON requis :\n${TECHNIQUE_SCHEMA}\n\nNote : le champ nameJp sera généré séparément, ne l'inclus pas.`;
  const techCompletion = await chatCompletion([
    { role: "system", content: fullPrompt },
    { role: "user", content: userMessage },
  ]);
  const raw = techCompletion.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Réponse vide du modèle");
  const parsed = parseJson(raw);

  // Step 2: Generate Japanese name separately
  const nameFr = (parsed.nameFr as string) || artName;
  const jpCompletion = await chatCompletion([
    { role: "system", content: JP_NAME_PROMPT },
    { role: "user", content: `Donne un nom japonais authentique pour cette technique : "${nameFr}"` },
  ]);
  const jpName = jpCompletion.choices?.[0]?.message?.content?.trim() || "未命名の術";

  return buildTechnique(parsed, jpName, artName);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { artId, customPrompt } = body;

    if (!artId) {
      return NextResponse.json({ error: "artId requis" }, { status: 400 });
    }

    const art = ART_DATA.find((a) => a.id === artId);
    if (!art) {
      return NextResponse.json({ error: "Art non trouvé" }, { status: 404 });
    }

    const branchInfo = art.subBranches
      .filter((b) => !b.isForbidden)
      .map((b) => b.name + " — " + b.description)
      .join("; ");

    const userMessage = customPrompt
      ? `Génère une technique pour l'Art "${art.name}" en tenant compte de cette demande spécifique : ${customPrompt}\n\nDescription de l'Art : ${art.description}\nBranches disponibles : ${branchInfo}\nSous-titre : ${art.subtitle}`
      : `Génère une technique aléatoire pour l'Art "${art.name}".\n\nDescription de l'Art : ${art.description}\nBranches disponibles : ${branchInfo}\nSous-titre : ${art.subtitle}\n\nChoisis une branche au hasard parmi celles disponibles et un rang varié (E à SSS). Sois créatif et immersif.`;

    let technique: ArtTechnique;

    try {
      technique = await generateWithSDK(userMessage, art.name);
    } catch (err) {
      console.error("[TechGen] SDK failed:", err instanceof Error ? err.message : err);
      return NextResponse.json(
        { error: "Erreur lors de la génération. Réessaie dans quelques instants." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, technique, provider: "z-ai-sdk" });
  } catch (error) {
    console.error("[TechGen] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}