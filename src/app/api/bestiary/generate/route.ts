import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/zai";

const LORE_CONTEXT = `Vous êtes le maître du Bestiaire d'Ascension, un univers de RP narratif. Le monde possède 8 races (Vampires, Dragons, Démons, Titans, Elfes Sylvains, Humains, Demis-Bêtes, Fées), 8 arts magiques, 8 régions (Valkyrheim, Aurelon, Grandbell, Xianlun, Akatsura, Novarche, Zaharan, Shantara), et 6 factions (La Royauté, Trias Obscuras, La Confrérie, Église Solaris, Concorde Magique, Société des Explorateurs). Les créatures doivent être cohérentes avec cet écosystème.`;

function buildPrompt(region?: string, biome?: string, level?: number) {
  const constraints = [];
  if (region) constraints.push(`Région: ${region}`);
  if (biome) constraints.push(`Biome: ${biome}`);
  if (level) constraints.push(`Niveau moyen des joueurs: ${level}`);

  return `${LORE_CONTEXT}

Génère UNE créature de ce monde. ${constraints.length > 0 ? "Contraintes: " + constraints.join(", ") + "." : ""}

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) avec cette structure exacte:
{
  "id": "slug-unique-en-kebab-case",
  "name": "Nom de la créature",
  "nameJp": "名前 en japonais",
  "classification": "Dragon / Bête / Démon / Esprit / Insecte / Aquatique / Élémentaire / Morte-Vivante / Chimère",
  "rarity": "common",
  "dangerLevel": "D",
  "element": "Feu",
  "habitat": "Description du lieu où vit la créature",
  "behavior": "Description du comportement en combat et au repos",
  "description": "Description narrative immersive de 3-4 phrases",
  "lore": "Histoire et légendes liées à cette créature (2-3 phrases)",
  "stats": { "pv": 500, "attaque": 300, "defense": 200, "vitesse": 350, "magie": 400 },
  "skills": [
    { "name": "Nom de la compétence", "description": "Description courte" }
  ],
  "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
  "resistances": ["Résistance 1"],
  "drops": [
    { "name": "Objet obtenu", "rarity": "common", "dropRate": "60%" }
  ],
  "zones": ["Zone d'apparition 1"],
  "factionInteraction": "Description de la relation avec les factions",
  "relatedSpecies": ["Espèce liée 1"]
}

Les stats doivent être cohérentes avec la rareté (common: 100-300, rare: 200-500, epic: 400-700, legendary: 600-900, mythic: 800-1000). Le dangerLevel doit correspondre aussi (common: D-C, rare: B-C, epic: A-B, legendary: S-A, mythic: SSS-S).
Le lore doit référencer les régions, races et factions d'Ascension de façon crédible. L'élément doit correspondre au biome/habitat.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, biome, level, count = 1 } = body;

    const creatures = [];

    for (let i = 0; i < Math.min(count, 6); i++) {
      let content: string;
      try {
        const completion = await chatCompletion([
          { role: "system", content: LORE_CONTEXT },
          { role: "user", content: buildPrompt(region, biome, level) },
        ]);

        content = completion.choices?.[0]?.message?.content;
        if (!content) throw new Error("Réponse vide du modèle");
      } catch (err) {
        console.error("[BESTIARY] SDK failed:", err instanceof Error ? err.message : err);
        return NextResponse.json(
          { success: false, error: "Erreur lors de la génération par IA. Réessaie dans quelques instants." },
          { status: 500 }
        );
      }

      // Clean markdown wrapping if present
      content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

      try {
        const creature = JSON.parse(content);
        creatures.push(creature);
      } catch {
        // Fallback creature if JSON parsing fails
        creatures.push({
          id: `creature-${Date.now()}-${i}`,
          name: "Créature Mystérieuse",
          nameJp: "謎の生き物",
          classification: "Inconnue",
          rarity: "rare",
          dangerLevel: "B",
          element: "Arcane",
          habitat: "Inconnu",
          behavior: "Imprévisible",
          description: "Une créature que même les érudits de la Concorde Magique n'osent pas classifier.",
          lore: content.slice(0, 300),
          stats: { pv: 400, attaque: 300, defense: 250, vitesse: 350, magie: 500 },
          skills: [{ name: "Capacité Inconnue", description: "Pouvoir non identifié" }],
          weaknesses: ["Inconnues"],
          resistances: ["Arcane"],
          drops: [],
          zones: ["Inconnues"],
          factionInteraction: "Aucune interaction documentée",
          relatedSpecies: [],
        });
      }
    }

    return NextResponse.json({ success: true, creatures, provider: "z-ai-sdk" });
  } catch (error) {
    console.error("[BESTIARY API]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}