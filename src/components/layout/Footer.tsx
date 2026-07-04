"use client";

/* ═══════════════════════════════════════════════════════════════
   DNA-STYLE FOOTER — Full-Width, 287px Height
   Faithful reproduction of Duet Night Abyss footer
   - Top row: 48px, centered social icons, border-bottom
   - Bottom: centered 530px content, links with line separators, logos, copyright
   ═══════════════════════════════════════════════════════════════ */

const SOCIAL_ICONS = [
  { icon: "/imgs/icon/share-facebook.png", href: "#", label: "Facebook" },
  { icon: "/imgs/icon/share-x.png", href: "#", label: "X" },
  { icon: "/imgs/icon/share-instagram.png", href: "#", label: "Instagram" },
  { icon: "/imgs/icon/share-youtube.png", href: "#", label: "YouTube" },
  { icon: "/imgs/icon/share-discord.png", href: "https://discord.gg/svAvDbBx36", label: "Discord" },
  { icon: "/imgs/icon/share-tiktok.png", href: "#", label: "TikTok" },
];

const LEGAL_LINKS = [
  { label: "Mentions Légales", href: "#" },
  { label: "Politique de Confidentialité", href: "#" },
  { label: "À Propos", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        bottom: 0,
        width: "100%",
        background: "#000000",
        zIndex: 10,
        height: "287px",
        display: "flex",
        flexDirection: "column",
      }}
      role="contentinfo"
    >
      {/* ═══ Top section: Social icons row ═══
          Official: 1920x48px, centered, border-bottom 1px solid rgba(255,255,255,0.15)
          Each icon ~21px height, opacity 0.5, hover 0.8
      */}
      <div
        className="top-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "48px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}
      >
        {SOCIAL_ICONS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target={s.href.startsWith("http") ? "_blank" : undefined}
            rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={s.label}
            style={{
              display: "block",
              height: "21px",
              width: "auto",
              opacity: 0.5,
              transition: "opacity 0.2s ease",
              margin: "0 12px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.5";
            }}
          >
            <img
              src={s.icon}
              alt={s.label}
              style={{ height: "100%", width: "auto", objectFit: "contain" }}
            />
          </a>
        ))}
      </div>

      {/* ═══ Bottom section ═══
          Official: centered 530px wrapper, padding 31px 0
          - Agreement links row: 440px, 1.2rem, white, separated by thin lines
          - Company logos row
          - Copyright: 1.2rem, rgba(255,255,255,0.7), margin-top 33px
      */}
      <div
        className="bottom"
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          flex: 1,
        }}
      >
        <div
          style={{
            width: "530px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "31px 0",
          }}
        >
          {/* Agreement links row — 440px, spaced with line separators */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "440px",
              fontSize: "1.2rem",
              color: "#ffffff",
              alignItems: "center",
            }}
          >
            {LEGAL_LINKS.map((link, i) => (
              <div key={link.label} style={{ display: "flex", alignItems: "center" }}>
                <a
                  href={link.href}
                  style={{
                    fontSize: "1.2rem",
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    letterSpacing: "0.02rem",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#e0dabb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                  }}
                >
                  {link.label}
                </a>
                {i < LEGAL_LINKS.length - 1 && (
                  <div
                    style={{
                      width: "2px",
                      height: "14px",
                      background: "rgba(255,255,255,0.3)",
                      transform: "scaleX(0.5)",
                      marginLeft: "8px",
                      marginRight: "8px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Company logos / branding row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            <img
              src="/imgs/icon/white-logo-en.png"
              alt="ASCENSION"
              style={{
                height: "30px",
                width: "auto",
                objectFit: "contain",
                opacity: 0.4,
              }}
            />
          </div>

          {/* Copyright */}
          <div
            style={{
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              letterSpacing: "0.02rem",
              marginTop: "33px",
            }}
          >
            Copyright © 2025 Ascension. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}