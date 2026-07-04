"use client";

import { useNavigation } from "@/store/navigationStore";
import { getRaceById, getTechniqueByRaceAndId } from "@/data/races";
import TechniqueCard from "@/components/technique/TechniqueCard";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function TechniqueDisplayPage() {
  const { pageParams, goBack, navigate } = useNavigation();
  const raceId = pageParams.raceId as string;
  const techniqueId = pageParams.techniqueId as string;
  const accentColor = (pageParams.accentColor as string) || undefined;

  const race = getRaceById(raceId);
  const technique = getTechniqueByRaceAndId(raceId, techniqueId);

  if (!race || !technique) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display text-lg text-txt-tertiary tracking-[0.1em]">
            Technique non trouvée
          </p>
          <button
            onClick={goBack}
            className="mt-4 font-display text-xs tracking-[0.15em] uppercase text-txt-tertiary hover:text-silver transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <div className="flex items-center gap-2 text-xs font-body flex-wrap">
          <button
            onClick={() => navigate("home")}
            className="text-txt-tertiary hover:text-silver transition-colors"
          >
            Accueil
          </button>
          <ChevronRight className="w-3 h-3 text-txt-tertiary opacity-40" />
          <button
            onClick={() => navigate("races")}
            className="text-txt-tertiary hover:text-silver transition-colors"
          >
            Races
          </button>
          <ChevronRight className="w-3 h-3 text-txt-tertiary opacity-40" />
          <button
            onClick={() => navigate("race-detail", { raceId: race.id, name: race.name })}
            className="text-txt-tertiary hover:text-silver transition-colors"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {race.name}
          </button>
          <ChevronRight className="w-3 h-3 text-txt-tertiary opacity-40" />
          <span className="text-txt-secondary">{technique.nameFr}</span>
        </div>
      </div>

      {/* Technique Card */}
      <TechniqueCard
        data={{
          ...technique,
          raceColor: accentColor || race.colors.primary,
          techniqueNumber: 1,
        }}
      />
    </div>
  );
}