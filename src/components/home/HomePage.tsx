"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation, type PageType } from "@/store/navigationStore";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════════
   DNA-STYLE HOMEPAGE — Full-Screen Hero (100vh, no scroll)
   Faithful reproduction of Duet Night Abyss home page layout
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Navigation Button Items (replacing DNA download buttons) ─── */
interface NavBtnDef {
  label: string;
  page: PageType;
}

const NAV_BUTTONS: NavBtnDef[] = [
  { label: "COSMOLOGIE", page: "cosmology" },
  { label: "RACES", page: "races" },
  { label: "ARTS", page: "arts" },
  { label: "FACTIONS", page: "factions" },
  { label: "GÉOGRAPHIE", page: "geography" },
];

/* ─── Social links for left side ─── */
const SOCIAL_ICONS = [
  { icon: "/imgs/icon/share-discord.png", href: "https://discord.gg", label: "Discord" },
  { icon: "/imgs/icon/share-x.png", href: "https://x.com", label: "X" },
  { icon: "/imgs/icon/share-instagram.png", href: "https://instagram.com", label: "Instagram" },
  { icon: "/imgs/icon/share-youtube.png", href: "https://youtube.com", label: "YouTube" },
];

/* ─── Sample news data ─── */
const SAMPLE_NEWS = [
  { title: "Mise à jour 2.1 — Nouvelles Races", date: "2025-06-28" },
  { title: "Événement Solstice d'Été", date: "2025-06-20" },
  { title: "Guide du Grimoire : Système d'Énergie", date: "2025-06-15" },
  { title: "Nouveau Royaume : Aetheris", date: "2025-06-10" },
];

export default function HomePage() {
  const { navigate } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [newsOpen, setNewsOpen] = useState(false);

  /* ─── GSAP entrance animations ─── */
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Set all animated elements to invisible initially
      gsap.set(".dna-hero-anim", { opacity: 0, y: 15 });

      const tl = gsap.timeline({ delay: 0.2 });

      tl.to(".dna-hero-anim", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.12,
      });
    }, container);

    return () => ctx.revert();
  }, []);

  const handleNav = useCallback(
    (page: PageType) => {
      navigate(page);
    },
    [navigate]
  );

  return (
    <div
      ref={containerRef}
      className="dna-screen dno-scroll"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#000000",
      }}
    >
      {/* ═══ Layer 1: Background Image ═══ */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      >
        <img
          src="/imgs/home/pc/bg.webp"
          alt=""
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* ═══ Layer 2: Top gradient overlay ═══ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "25vh",
          backgroundImage: "url('/imgs/bg/pc/bg-top.png')",
          backgroundSize: "100% 100%",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Layer 3: Bottom gradient overlay ═══ */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "80vh",
          backgroundImage: "url('/imgs/home/pc/bg-bottom.png')",
          backgroundSize: "100% 100%",
          zIndex: 1,
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Layer 4: Slogan area (centered) ═══ */}
      <div
        className="dna-hero-anim"
        style={{
          position: "absolute",
          width: "1200px",
          maxWidth: "90%",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "20vh",
          zIndex: 2,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {/* Slogan image or text */}
        <img
          src="/imgs/home/pc/slogan-en.webp"
          alt="ASCENSION"
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "auto",
            objectFit: "contain",
            margin: "0 auto",
            display: "block",
            opacity: 0.85,
          }}
        />
      </div>

      {/* ═══ Layer 5: Home Title ═══ */}
      <div
        className="dna-hero-anim font-worldtext"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "19vh",
          zIndex: 2,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: "2.9rem",
            color: "#e0dabb",
            letterSpacing: "0.1rem",
            fontWeight: "normal",
          }}
        >
          ASCENSION
        </span>
        {/* Star decoration */}
        <img
          src="/imgs/icon/title-star.png"
          alt=""
          aria-hidden="true"
          style={{
            width: "16px",
            height: "16px",
            objectFit: "contain",
          }}
        />
        <span
          style={{
            fontSize: "1.6rem",
            color: "#c1b8a2",
            letterSpacing: "0.08rem",
            fontWeight: "normal",
          }}
        >
          ENCYCLOPÉDIE DE L&apos;UNIVERS
        </span>
      </div>

      {/* ═══ Layer 6: Play Button ═══ */}
      <div
        className="dna-hero-anim"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "52vh",
          zIndex: 5,
          width: "86px",
          height: "86px",
          cursor: "pointer",
          backgroundImage: "url('/imgs/icon/play.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        role="button"
        aria-label="Play trailer"
        tabIndex={0}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundImage = "url('/imgs/icon/play-hover.png')";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundImage = "url('/imgs/icon/play.png')";
        }}
      />

      {/* ═══ Layer 7: Navigation Buttons (bottom center) ═══ */}
      <div
        className="dna-hero-anim"
        style={{
          position: "absolute",
          minWidth: "740px",
          maxWidth: "90%",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "5vh",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {NAV_BUTTONS.map((btn) => (
          <button
            key={btn.page}
            onClick={() => handleNav(btn.page)}
            className="font-worldtext"
            style={{
              height: "44px",
              minWidth: "130px",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              outline: "none",
              cursor: "pointer",
              fontSize: "1.3rem",
              color: "#e0dabb",
              letterSpacing: "0.1rem",
              backgroundImage: "url('/imgs/home/pc/btn.png')",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundImage = "url('/imgs/home/pc/btn-hover.png')";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundImage = "url('/imgs/home/pc/btn.png')";
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ═══ Layer 8: Left Side Social / Discover ═══ */}
      <div
        className="dna-hero-anim"
        style={{
          position: "absolute",
          bottom: "5vh",
          left: "230px",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          className="font-gloock"
          style={{
            fontSize: "1.0rem",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.15rem",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            cursor: "default",
          }}
        >
          DÉCOUVRIR L&apos;UNIVERS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          {SOCIAL_ICONS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              style={{
                display: "block",
                width: "18px",
                height: "18px",
                opacity: 0.4,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.4";
              }}
            >
              <img
                src={s.icon}
                alt={s.label}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </a>
          ))}
        </div>
      </div>

      {/* ═══ Layer 9: News Panel (right side, expandable) ═══ */}
      <div
        className="dna-hero-anim"
        style={{
          position: "absolute",
          right: 0,
          top: "27vh",
          zIndex: 3,
        }}
      >
        {/* NEWS vertical trigger button */}
        <button
          onClick={() => setNewsOpen(!newsOpen)}
          className="font-worldtext"
          style={{
            background: "none",
            border: "none",
            outline: "none",
            cursor: "pointer",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            fontSize: "1.4rem",
            color: newsOpen ? "#baae93" : "rgba(255,255,255,0.5)",
            letterSpacing: "0.15rem",
            padding: "16px 12px",
            transition: "color 0.2s ease",
          }}
          aria-label="Toggle news panel"
          aria-expanded={newsOpen}
        >
          NEWS
        </button>

        {/* Expandable news list */}
        {newsOpen && (
          <div
            className="dna-slide-in"
            style={{
              position: "absolute",
              right: "0px",
              top: "60px",
              width: "280px",
              backgroundImage: "url('/imgs/home/pc/bg-side.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              padding: "24px 20px",
              zIndex: 4,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {SAMPLE_NEWS.map((news, i) => (
                <button
                  key={i}
                  onClick={() => handleNav("news")}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                    width: "100%",
                  }}
                >
                  <div
                    className="font-worldtext"
                    style={{
                      fontSize: "1.2rem",
                      color: "#cab99b",
                      lineHeight: 1.4,
                      marginBottom: "4px",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#e0dabb";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#cab99b";
                    }}
                  >
                    {news.title}
                  </div>
                  <div
                    style={{
                      fontSize: "1.0rem",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    {news.date}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}