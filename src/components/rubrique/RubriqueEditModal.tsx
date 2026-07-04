"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2, Image as ImageIcon, Film } from "lucide-react";
import type { FicheItem } from "./RubriqueFiche";

/* ─── DNA Design Tokens ─── */
const GOLD = "#c9b89a";
const GOLD_BORDER = "rgba(201, 184, 154, 0.2)";
const GOLD_BORDER_HOVER = "rgba(201, 184, 154, 0.5)";
const GOLD_GLOW = "rgba(201, 184, 154, 0.15)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_TERTIARY = "#858585";

interface RubriqueEditModalProps {
  item: FicheItem;
  accentColor: string;
  onClose: () => void;
  onSave: (id: string, data: Record<string, string>) => Promise<void>;
}

export default function RubriqueEditModal({ item, accentColor, onClose, onSave }: RubriqueEditModalProps) {
  const gold = accentColor || GOLD;
  const [form, setForm] = useState<Record<string, string>>({
    name: item.name,
    nameJp: item.nameJp || "",
    subtitle: item.subtitle || "",
    rank: item.rank || "",
    description: item.description || "",
    vueEnsemble: item.vueEnsemble || "",
    imageUrl: item.imageUrl || "",
    backgroundImage: item.backgroundImage || "",
    gifUrl: item.gifUrl || "",
    metadata: item.metadata || "",
    category: item.category,
    parentSlug: item.parentSlug || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(item.id, form);
      onClose();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const fields: { key: string; label: string; icon?: React.ReactNode; textarea?: boolean }[] = [
    { key: "name", label: "Nom" },
    { key: "nameJp", label: "Nom (Japonais)" },
    { key: "subtitle", label: "Sous-titre" },
    { key: "rank", label: "Rang" },
    { key: "category", label: "Catégorie" },
    { key: "parentSlug", label: "Parent Slug" },
    { key: "description", label: "Description", textarea: true },
    { key: "vueEnsemble", label: "Vue d'ensemble", textarea: true },
    { key: "metadata", label: "Métadonnées (JSON)", textarea: true },
    { key: "imageUrl", label: "Image URL", icon: <ImageIcon size={14} /> },
    { key: "backgroundImage", label: "Image de fond", icon: <ImageIcon size={14} /> },
    { key: "gifUrl", label: "GIF URL", icon: <Film size={14} /> },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: "#0a0a0a", border: `1px solid ${GOLD_BORDER}` }}
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className="text-base font-bold tracking-wider uppercase"
              style={{ color: gold, fontFamily: "'WorldText', serif" }}
            >
              Éditer l'élément
            </h3>
            <p className="text-xs mt-0.5" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
              {item.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: TEXT_TERTIARY }}
            className="cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label
                className="block text-[11px] tracking-wider uppercase mb-1.5 font-medium"
                style={{ color: TEXT_TERTIARY }}
              >
                {field.icon && <span className="inline mr-1.5">{field.icon}</span>}
                {field.label}
              </label>
              {field.textarea ? (
                <textarea
                  value={form[field.key] || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={field.key === "metadata" ? 6 : 4}
                  className="w-full px-3 py-2.5 rounded text-sm outline-none resize-y"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: `1px solid ${GOLD_BORDER}`,
                    color: TEXT_PRIMARY,
                    fontFamily: field.key === "metadata" ? "monospace" : "'Gloock', serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = GOLD_BORDER_HOVER;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = GOLD_BORDER;
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={form[field.key] || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded text-sm outline-none"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: `1px solid ${GOLD_BORDER}`,
                    color: TEXT_PRIMARY,
                    fontFamily: "'Gloock', serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = GOLD_BORDER_HOVER;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = GOLD_BORDER;
                  }}
                />
              )}
              {/* Image preview */}
              {(field.key === "imageUrl" || field.key === "backgroundImage" || field.key === "gifUrl") &&
                form[field.key] && (
                  <div
                    className="mt-2 rounded overflow-hidden h-20"
                    style={{ border: `1px solid ${GOLD_BORDER}` }}
                  >
                    <img
                      src={form[field.key]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-3 mt-6 pt-4"
          style={{ borderTop: `1px solid ${GOLD_BORDER}` }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded text-sm cursor-pointer"
            style={{ color: TEXT_TERTIARY }}
          >
            Annuler
          </button>
          {/* DNA-style gold outlined button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold cursor-pointer transition-all"
            style={{
              background: "transparent",
              border: `1px solid ${gold}`,
              color: gold,
              fontFamily: "'WorldText', serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = gold;
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = gold;
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}