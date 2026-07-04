"use client";

/* ═══════════════════════════════════════════════════════════════
   DNA-STYLE FOOTER — Black Background
   Faithful reproduction of Duet Night Abyss footer
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
        background: "#000000",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        padding: "0",
        marginLeft: "200px",
      }}
      role="contentinfo"
    >
      {/* Top section: Social icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 0 20px",
          gap: "24px",
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

      {/* Separator line */}
      <div
        style={{
          width: "100%",
          height: "1px",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      {/* Bottom section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 40px 28px",
          gap: "16px",
        }}
      >
        {/* Legal links row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {LEGAL_LINKS.map((link, i) => (
            <div key={link.label} style={{ display: "flex", alignItems: "center" }}>
              <a
                href={link.href}
                style={{
                  fontSize: "1.2rem",
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  padding: "4px 12px",
                  transition: "color 0.2s ease",
                  letterSpacing: "0.02rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#e0dabb";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                }}
              >
                {link.label}
              </a>
              {i < LEGAL_LINKS.length - 1 && (
                <div
                  style={{
                    width: "1px",
                    height: "12px",
                    background: "rgba(255,255,255,0.3)",
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
          }}
        >
          <span
            className="font-worldtext"
            style={{
              fontSize: "1.4rem",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.15rem",
            }}
          >
            ASCENSION
          </span>
        </div>

        {/* Copyright */}
        <div
          style={{
            fontSize: "1.2rem",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            letterSpacing: "0.02rem",
          }}
        >
          Copyright © 2025 Ascension. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}