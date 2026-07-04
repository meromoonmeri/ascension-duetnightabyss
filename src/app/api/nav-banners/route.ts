import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_BANNERS = [
  { navLabel: "ACCUEIL", title: "L'Univers d'Ascension", subtitle: "Explorez le wiki officiel" },
  { navLabel: "UNIVERS", title: "Cosmologie & Géographie", subtitle: "Découvrez les mondes" },
  { navLabel: "ARTS", title: "Les Huit Arts", subtitle: "Maîtrisez des pouvoirs ancestraux" },
  { navLabel: "RACES", title: "Races d'Ascension", subtitle: "Humains, Elfes, Démons..." },
  { navLabel: "BESTIAIRE", title: "Bestiaire", subtitle: "Créatures du monde" },
  { navLabel: "ARTEFACTS", title: "Artefacts & Donjons", subtitle: "Trésors légendaires" },
  { navLabel: "FACTIONS", title: "Factions", subtitle: "Alliances et conflits" },
  { navLabel: "COMMUNAUTE", title: "Communauté", subtitle: "Serveur Discord, Événements, Quêtes" },
  { navLabel: "BANQUE", title: "Banque d'Ascension", subtitle: "Déposez, retirez, transférez votre Éther" },
  { navLabel: "PLUS", title: "Plus", subtitle: "Boutique, Bot, Profil..." },
] as const;

export async function GET() {
  try {
    let banners = await db.navBanner.findMany({
      where: { active: true },
    });

    // Seed default banners if none exist
    if (banners.length === 0) {
      await db.navBanner.createMany({
        data: DEFAULT_BANNERS.map((b) => ({
          navLabel: b.navLabel,
          title: b.title,
          subtitle: b.subtitle,
          bgColor: "rgba(201,168,76,0.08)",
        })),
      });

      banners = await db.navBanner.findMany({
        where: { active: true },
      });
    }

    // Index by navLabel for easy lookup
    const indexed: Record<string, (typeof banners)[number]> = {};
    for (const b of banners) {
      indexed[b.navLabel] = b;
    }

    return NextResponse.json({ banners: indexed });
  } catch (error) {
    console.error("Nav banners fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}