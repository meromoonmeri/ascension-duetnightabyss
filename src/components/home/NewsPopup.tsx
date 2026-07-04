"use client";

import { useState, useEffect } from "react";
import { useNavigation } from "@/store/navigationStore";
import { useSession } from "next-auth/react";
import { X, ChevronRight } from "lucide-react";
import Image from "next/image";

const GOLD = "#C9A84C";

const SAMPLE_NEWS = [
  {
    id: "1",
    title: "Mise à jour du Codex des Artefacts",
    date: "30 Juin 2025",
    preview: "Le système d'artefacts a été entièrement revu. Consultez le nouveau codex pour découvrir les types, rangs et processus de création.",
  },
  {
    id: "2",
    title: "Ouverture des inscriptions",
    date: "28 Juin 2025",
    preview: "Ascension ouvre officiellement ses portes. Connectez-vous via Discord pour recevoir 1000 Éther en cadeau de bienvenue.",
  },
  {
    id: "3",
    title: "Les Huit Races révélées",
    date: "25 Juin 2025",
    preview: "Découvrez les huit races jouables d'Ascension, chacune avec son arbre de compétences unique et ses techniques raciales.",
  },
];

export default function NewsPopup() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { navigate } = useNavigation();
  const { data: session } = useSession();

  // Show the rabbit button after a delay
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Auto-show popup on first visit if connected
  useEffect(() => {
    if (!session || !visible) return;
    const shown = sessionStorage.getItem("ascension_news_popup_shown");
    if (!shown) {
      const t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("ascension_news_popup_shown", "1");
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [session, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Floating Rabbit Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed z-[90] rounded-full overflow-hidden transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        style={{
          bottom: "5rem",
          right: "1.5rem",
          width: "56px",
          height: "56px",
          border: `2px solid ${GOLD}66`,
          boxShadow: `0 0 20px ${GOLD}22, 0 4px 15px rgba(0,0,0,0.4)`,
          animation: "rabbitFloat 3s ease-in-out infinite",
        }}
        aria-label="Ouvrir les nouvelles"
      >
        <Image
          src="/news-rabbit.webp"
          alt="Nouvelles"
          fill
          className="object-cover rounded-full"
          sizes="56px"
        />
      </button>

      {/* Popup */}
      {open && (
        <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ animation: "fadeIn 0.2s ease-out" }} />

          {/* Popup card */}
          <div
            className="absolute z-10 w-[calc(100%-2rem)] max-w-[380px]"
            style={{
              bottom: "7.5rem",
              right: "1rem",
              animation: "popupIn 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arrow pointing down to rabbit */}
            <div
              className="absolute -bottom-2 right-6 w-4 h-4 rotate-45"
              style={{
                background: "linear-gradient(135deg, #14141E, #0E0E18)",
                borderRight: `1px solid ${GOLD}33`,
                borderBottom: `1px solid ${GOLD}33`,
              }}
            />

            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(20,20,30,0.98) 0%, rgba(14,14,24,0.99) 100%)",
                border: `1px solid ${GOLD}33`,
                boxShadow: `0 0 40px rgba(0,0,0,0.6), 0 0 20px ${GOLD}10`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${GOLD}15` }}>
                <div className="flex items-center gap-2">
                  <Image src="/news-rabbit.webp" alt="" width={24} height={24} className="rounded-full" />
                  <h3 className="font-display text-xs tracking-[0.12em] uppercase" style={{ color: GOLD }}>
                    Dernières Nouvelles
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full transition-colors hover:bg-white/10 cursor-pointer"
                >
                  <X size={14} style={{ color: "var(--text-tertiary)" }} />
                </button>
              </div>

              {/* News items */}
              <div className="p-3 space-y-2">
                {SAMPLE_NEWS.map((item, i) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg transition-colors duration-200"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      animation: `popupItemIn 0.3s ease-out ${i * 0.08}s both`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-display text-[0.65rem] tracking-[0.06em] truncate pr-2" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h4>
                    </div>
                    <p className="font-body text-[0.65rem] leading-relaxed mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                      {item.preview}
                    </p>
                    <span className="font-mono text-[0.5rem]" style={{ color: `${GOLD}88` }}>
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer button */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("news");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-display text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 hover:brightness-110 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}30, ${GOLD}15)`,
                    border: `1px solid ${GOLD}33`,
                    color: GOLD,
                  }}
                >
                  Voir la Boîte aux Lettres
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes rabbitFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes popupItemIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}