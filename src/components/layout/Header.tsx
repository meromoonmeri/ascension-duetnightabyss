"use client";

import { useState, useCallback } from "react";
import { useNavigation, type PageType } from "@/store/navigationStore";

/* ═══════════════════════════════════════════════════════════════
   DNA-STYLE HEADER — Horizontal Top Navigation Bar
   Faithful reproduction of Duet Night Abyss website header
   Logo positioned top-right, nav items horizontal at top-left
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
      geography: "geography",
      "geography-detail": "geography",
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
        position: "absolute",
        width: "100%",
        left: 0,
        top: 0,
        padding: "0 0 0 60px",
        zIndex: 100,
        background: "transparent",
      }}
    >
      {/* ═══ Logo — top-right ═══ */}
      <div
        onClick={() => handleNav("home")}
        style={{
          position: "absolute",
          right: "31px",
          top: "20px",
          width: "268px",
          height: "131px",
          zIndex: 5,
          cursor: "pointer",
        }}
        role="button"
        aria-label="ASCENSION — Retour à l'accueil"
        tabIndex={0}
      >
        <img
          src="/imgs/icon/white-logo-en.png"
          alt="ASCENSION Logo"
          style={{
            height: "130px",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* ═══ Main nav bar — horizontal, left side ═══ */}
      <div
        style={{
          position: "absolute",
          left: "60px",
          top: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: "64px",
          zIndex: 10,
        }}
      >
        {/* Left icons area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "64px",
            marginRight: "30px",
          }}
        >
          {/* User icon */}
          <img
            src="/imgs/icon/user-gold.png"
            alt="User"
            style={{
              height: "21px",
              width: "auto",
              marginRight: "35px",
              cursor: "pointer",
              opacity: 0.7,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.7";
            }}
          />

          {/* Music toggle */}
          <img
            src={musicOn ? "/imgs/icon/music-on-gold.png" : "/imgs/icon/music-off-gold.png"}
            alt={musicOn ? "Music On" : "Music Off"}
            onClick={() => setMusicOn(!musicOn)}
            style={{
              height: "26px",
              width: "auto",
              marginRight: "35px",
              cursor: "pointer",
              opacity: 0.7,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.7";
            }}
          />

          {/* Language/World icon */}
          <img
            src="/imgs/icon/world-gold.png"
            alt="Language"
            style={{
              height: "24px",
              width: "auto",
              cursor: "pointer",
              opacity: 0.7,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.7";
            }}
          />
        </div>

        {/* Horizontal Navigation Items */}
        <nav
          style={{
            display: "flex",
            flexDirection: "row",
            height: "64px",
            alignItems: "center",
          }}
          role="navigation"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.page.toLowerCase();

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
                  padding: "0 16px",
                  height: "64px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  transition: "color 0.2s ease",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
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
                <span
                  style={{
                    fontSize: "1rem",
                    letterSpacing: "0.1rem",
                    color: isActive ? "#baae93" : "rgba(255,255,255,0.5)",
                    fontWeight: isActive ? "bold" : "normal",
                    lineHeight: 1.3,
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: isActive ? "rgba(186,174,147,0.6)" : "rgba(255,255,255,0.25)",
                    letterSpacing: "0.05rem",
                    transition: "color 0.2s ease",
                    marginTop: "1px",
                  }}
                >
                  {item.sublabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}