"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, ImageIcon } from "lucide-react";
import type { CreatureDetailData } from "./CreatureDetail";

const RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"];
const CLASSES = [
  "Bête", "Spectre", "Draconique", "Humanoïde", "Élémentaire",
  "Insectoïde", "Végétal", "Aquatique", "Céleste", "Démoniaque",
  "Arachnide", "Aviaire", "Reptilien", "Fongique", "Crystallin",
];

interface CreatureEditModalProps {
  creature: CreatureDetailData;
  open: boolean;
  onClose: () => void;
  onSave: (updated: CreatureDetailData) => void;
}

export default function CreatureEditModal({
  creature,
  open,
  onClose,
  onSave,
}: CreatureEditModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState(creature.name);
  const [nameJp, setNameJp] = useState(creature.subtitle || "");
  const [citation, setCitation] = useState(creature.citation || "");
  const [classe, setClasse] = useState(creature.classe);
  const [rank, setRank] = useState(creature.rank);
  const [dangerLevel, setDangerLevel] = useState(creature.dangerLevel);
  const [imageUrl, setImageUrl] = useState(creature.imageUrl || "");
  const [description, setDescription] = useState(creature.description.join("\n"));
  const [comportement, setComportement] = useState(creature.comportement);
  const [imagePreview, setImagePreview] = useState(creature.imageUrl || "");

  useEffect(() => {
    if (open) {
      setName(creature.name);
      setNameJp(creature.subtitle || "");
      setCitation(creature.citation || "");
      setClasse(creature.classe);
      setRank(creature.rank);
      setDangerLevel(creature.dangerLevel);
      setImageUrl(creature.imageUrl || "");
      setImagePreview(creature.imageUrl || "");
      setDescription(creature.description.join("\n"));
      setComportement(creature.comportement);
      setError("");
    }
  }, [open, creature]);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        name,
        nameJp: nameJp || null,
        citation: citation || null,
        classe,
        rank,
        dangerLevel,
        imageUrl: imageUrl || null,
        description: description.split("\n").filter((s) => s.trim()),
        comportement,
      };

      const res = await fetch(`/api/bestiary/creatures/${creature.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }

      const data = await res.json();
      onSave({
        ...creature,
        name: data.creature.name,
        slug: data.creature.slug,
        subtitle: data.creature.nameJp || undefined,
        citation: data.creature.citation || undefined,
        imageUrl: data.creature.imageUrl || undefined,
        rank: data.creature.rank,
        dangerLevel: data.creature.dangerLevel,
        classe: data.creature.classe || "",
        description: Array.isArray(data.creature.description)
          ? data.creature.description
          : data.creature.description?.split("\n") || [],
        comportement: data.creature.comportement || "",
      });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-[#E5E7EB] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#c9a25a]/50";
  const labelClass = "font-display text-[0.6rem] tracking-[0.15em] uppercase mb-1.5 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/[0.1] shadow-2xl"
        style={{
          background: "linear-gradient(180deg, #111118 0%, #0a0e1a 100%)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] px-6 py-4"
          style={{ background: "rgba(17,17,24,0.95)", backdropFilter: "blur(12px)" }}>
          <h2 className="font-display text-sm tracking-[0.15em] uppercase" style={{ color: "#c9a25a" }}>
            ✦ Éditer la Créature
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/[0.06] cursor-pointer">
            <X size={18} style={{ color: "#9CA3AF" }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Row: Name + NameJp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nom</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Nom Japonais</label>
              <input className={inputClass} value={nameJp} onChange={(e) => setNameJp(e.target.value)} placeholder="カタカナ" />
            </div>
          </div>

          {/* Citation */}
          <div>
            <label className={labelClass}>Citation</label>
            <input className={inputClass} value={citation} onChange={(e) => setCitation(e.target.value)} placeholder="« Citation poétique »" />
          </div>

          {/* Row: Classe + Rank + Danger */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Classe</label>
              <select className={inputClass} value={classe} onChange={(e) => setClasse(e.target.value)}>
                <option value="">—</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rang</label>
              <select className={inputClass} value={rank} onChange={(e) => setRank(e.target.value)}>
                {RANKS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Niveau de Danger</label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDangerLevel(n)}
                    className="text-lg cursor-pointer transition-all"
                    style={{
                      color: n <= dangerLevel ? "#c9a25a" : "rgba(255,255,255,0.15)",
                      textShadow: n <= dangerLevel ? "0 0 6px rgba(201,162,90,0.5)" : "none",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className={labelClass}>URL de l&apos;Image</label>
            <div className="flex gap-2">
              <input
                className={inputClass + " flex-1"}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://i.pinimg.com/..."
              />
              {imageUrl && (
                <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-white/[0.1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview("")}
                  />
                </div>
              )}
            </div>
            {imagePreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-white/[0.08] max-h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full object-contain max-h-48"
                  onError={() => setImagePreview("")}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass + " min-h-[120px] resize-y"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Un paragraphe par ligne..."
              rows={6}
            />
          </div>

          {/* Comportement */}
          <div>
            <label className={labelClass}>Comportement</label>
            <textarea
              className={inputClass + " min-h-[80px] resize-y"}
              value={comportement}
              onChange={(e) => setComportement(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-white/[0.08] px-6 py-4"
          style={{ background: "rgba(17,17,24,0.95)", backdropFilter: "blur(12px)" }}>
          <button
            onClick={onClose}
            className="font-display text-[0.65rem] tracking-[0.12em] uppercase px-5 py-2.5 rounded-lg border border-white/[0.1] text-[#9CA3AF] transition-colors hover:bg-white/[0.04] cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 font-display text-[0.65rem] tracking-[0.12em] uppercase px-5 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              color: "#000",
              background: "linear-gradient(135deg, #c9a25a 0%, #a8843a 100%)",
              boxShadow: "0 0 20px rgba(201,162,90,0.2)",
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}