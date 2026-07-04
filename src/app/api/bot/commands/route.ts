import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    commands: [
      { name: "/register", description: "Créer ton personnage dans le monde d'Ascension", category: "personnage" },
      { name: "/profile", description: "Afficher ta fiche de personnage", category: "personnage" },
      { name: "/inventory", description: "Voir ton inventaire d'objets", category: "personnage" },
      { name: "/salary", description: "Toucher ta paie hebdomadaire", category: "économie" },
      { name: "/rank", description: "Voir les rangs sociaux et salaires", category: "économie" },
      { name: "/kingdom", description: "Rejoindre, quitter ou gérer un royaume", category: "royaume" },
      { name: "/market", description: "Acheter et vendre au marché", category: "économie" },
      { name: "/stand", description: "Gérer ton stand de marchand", category: "économie" },
      { name: "/guild", description: "Créer ou rejoindre une guilde", category: "social" },
      { name: "/quest", description: "Obtenir et gérer des quêtes IA", category: "quêtes" },
      { name: "/npc", description: "Configurer les NPCs de RP (Admin)", category: "rp" },
      { name: "/wiki", description: "Lien vers le wiki Ascension", category: "utilitaire" },
      { name: "/help", description: "Liste de toutes les commandes", category: "utilitaire" },
    ],
  });
}