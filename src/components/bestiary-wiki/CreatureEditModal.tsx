"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Image as ImageIcon } from "lucide-react";

interface Realm {
  id: string;
  name: string;
  slug: string;
}

interface Creature {
  id: string;
  slug: string;
  name: string;
  nameJp: string | null;
  citation: string | null;
  classe: string | null;
  rank: string;
  dangerLevel: number;
  imageUrl: string | null;
  description: string;
  comportement: string | null;
  signatureShinso: string;
  localisation: string;
  pouvoirs: string;
  variantes: string;
  caracteristiques: string;
  tags: string;
  source: string | null;
  realmId: string | null;
  realm: Realm | null;
}

interface CreatureEditModalProps {
  creature: Creature;
  onClose: () => void;
  onSave: (slug: string, data: Record<string, any>) => Promise<void>;
}

const RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"];

const CLASSES = [
  "Bête", "Démon", "Esprit", "Dragon", "Humanoïde",
  "Végétal", "Insecte", "Aquatique", "Mort-vivant", "Divin", "Construct", "Aberration"
];

export default function CreatureEditModal({ creature, onClose, onSave }: CreatureEditModalProps) {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [realms, setRealms] = useState<Realm[]>([]);

  // Form fields
  const [name, setName] = useState(creature.name);
  const [nameJp, setNameJp] = useState(creature.nameJp || "");
  const [citation, setCitation] = useState(creature.citation || "");
  const [classe, setClasse] = useState(creature.classe || "");
  const [rank, setRank] = useState(creature.rank);
  const [dangerLevel, setDangerLevel] = useState(String(creature.dangerLevel));
  const [imageUrl, setImageUrl] = useState(creature.imageUrl || "");
  const [description, setDescription] = useState(creature.description || "");
  const [comportement, setComportement] = useState(creature.comportement || "");
  const [realmId, setRealmId] = useState(creature.realmId || "");
  const [source, setSource] = useState(creature.source || "");

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    // Fetch realms for dropdown
    fetch("/api/bestiary/realms")
      .then(r => r.json())
      .then(d => d.realms && setRealms(d.realms))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(creature.slug, {
        name, nameJp, citation, classe, rank, dangerLevel: Number(dangerLevel),
        imageUrl: imageUrl || null, description, comportement,
        realmId: realmId || null, source,
      });
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e7eb",
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.5)",
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto pb-8"
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.08)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-base font-semibold" style={{ color: "#e5e7eb" }}>Modifier la créature</h3>
          <button onClick={handleClose} className="p-1.5 rounded-lg cursor-pointer" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Name & NameJp */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Nom</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Nom (日本語)</label>
              <input type="text" value={nameJp} onChange={e => setNameJp(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          {/* Citation */}
          <div>
            <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Citation</label>
            <input type="text" value={citation} onChange={e => setCitation(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} placeholder="&quot;...&quot;" />
          </div>

          {/* Classe & Rank */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Classe</label>
              <select value={classe} onChange={e => setClasse(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer" style={inputStyle}>
                <option value="">— Aucune —</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Rang</label>
              <select value={rank} onChange={e => setRank(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer" style={inputStyle}>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Danger</label>
              <select value={dangerLevel} onChange={e => setDangerLevel(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer" style={inputStyle}>
                {[1,2,3,4,5].map(d => <option key={d} value={String(d)}>{d}/5</option>)}
              </select>
            </div>
          </div>

          {/* Realm */}
          <div>
            <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Royaume</label>
            <select value={realmId} onChange={e => setRealmId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer" style={inputStyle}>
              <option value="">— Aucun —</option>
              {realms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>URL de l&apos;image</label>
            <div className="relative">
              <input
                type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
                placeholder="https://..."
              />
              <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-20" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={5} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y" style={inputStyle}
            />
          </div>

          {/* Comportement */}
          <div>
            <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Comportement</label>
            <textarea
              value={comportement} onChange={e => setComportement(e.target.value)}
              rows={4} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y" style={inputStyle}
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium" style={labelStyle}>Source</label>
            <input type="text" value={source} onChange={e => setSource(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{
              background: saving ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#f59e0b",
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}