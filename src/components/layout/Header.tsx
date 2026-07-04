"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useNavigation, type PageType } from "@/store/navigationStore";

/* ═══════════════════════════════════════════════════════════════
   DNA-STYLE HEADER — Vertical Side Navigation
   Faithful reproduction of Duet Night Abyss website navigation
   ═══════════════════════════════════════════════════════════════ */

interface NavItem {
  label: string;
  sublabel: string;
  page: PageType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "ACCUEIL", sublabel: "Home", page: "home" },
  { label: "RACES", sublabel: "Races", page: "races" },
  { label: "COSMOLOGIE", sublabel: "Cosmology", page: "cosmology" },
  { label: "GÉOGRAPHIE", sublabel: "Geography", page: "geography" },
  { label: "ARTS", sublabel: "Arts", page: "arts" },
  { label: "FACTIONS", sublabel: "Factions", page: "factions" },
  { label: "UNIVERS", sublabel: "Worldview", page: "royaumes" },
  { label: "NEWS", sublabel: "News", page: "news" },
];

export default function Header() {
  const { currentPage, navigate } = useNavigation();
  const [musicOn, setMusicOn] = useState(true);

  const handleNav = useCallback(
    (page: PageType) => {
      navigate(page);
    },
    [navigate]
  );

  // Map current page to active nav item
  const getActivePage = (): string => {
    const map: Record<string, string> = {
      home: "home",
      races: "races",
      "race-detail": "races",
      "race-technique": "races",
      cosmology: "cosmology",
      "cosmology-detail": "cosmology",
      geography: "géographie",
      "geography-detail": "géographie",
      arts: "arts",
      "art-detail": "arts",
      technique: "arts",
      factions: "factions",
      "faction-detail": "factions",
      royaumes: "univers",
      grimoire: "univers",
      artefacts: "univers",
      technomagie: "univers",
      bestiary: "univers",
      "bestiary-detail": "univers",
      skilltree: "univers",
      scaling: "univers",
      news: "news",
      community: "news",
      events: "news",
      quests: "news",
      bank: "univers",
      shop: "univers",
      profile: "home",
      bot: "home",
      admin: "home",
      cms: "home",
    };
    return map[currentPage] || "home";
  };

  const activePage = getActivePage();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "200px",
        height: "100vh",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          position: "relative",
          height: "90px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        {/* DNA uses white-logo-en.png — for Ascension we use text */}
        <div
          className="font-worldtext"
          style={{
            fontSize: "1.8rem",
            color: "#ffffff",
            letterSpacing: "0.2rem",
            fontWeight: "normal",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={() => handleNav("home")}
        >
          ASCENSION
        </div>
      </div>

      {/* Icon controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "8px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* User icon */}
        <div style={{ width: "20px", height: "20px", cursor: "pointer", opacity: 0.7 }}>
          <img
            src="/imgs/icon/user-gold.png"
            alt="User"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Music toggle */}
        <div
          style={{ width: "20px", height: "20px", cursor: "pointer", opacity: 0.7 }}
          onClick={() => setMusicOn(!musicOn)}
        >
          <img
            src={musicOn ? "/imgs/icon/music-on-gold.png" : "/imgs/icon/music-off-gold.png"}
            alt="Music"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Language/World icon */}
        <div style={{ width: "20px", height: "20px", cursor: "pointer", opacity: 0.7 }}>
          <img
            src="/imgs/icon/world-gold.png"
            alt="Language"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Vertical Navigation Menu */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px 0",
          gap: "14px",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            activePage === item.page.toLowerCase() ||
            (item.page === "home" && activePage === "home");
          const itemKey = item.page.toLowerCase();

          return (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className="font-worldtext"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: "pointer",
                padding: "6px 20px",
                textAlign: "left",
                width: "100%",
                transition: "color 0.2s ease",
              }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                style={{
                  fontSize: "1.4rem",
                  letterSpacing: "0.1rem",
                  color: isActive ? "#baae93" : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? "bold" : "normal",
                  transition: "color 0.2s ease",
                  lineHeight: 1.3,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                  }
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: isActive ? "rgba(186,174,147,0.6)" : "rgba(255,255,255,0.25)",
                  letterSpacing: "0.05rem",
                  marginTop: "2px",
                  transition: "color 0.2s ease",
                }}
              >
                {item.sublabel}
              </div>
            </button>
          );
        })}
      </nav>
    </header>
  );
}