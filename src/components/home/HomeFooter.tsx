"use client";

import { useNavigation, type PageType } from "@/store/navigationStore";

/* ─── Design Tokens ─── */
const BG = "#0A080E";

interface FooterLink {
  label: string;
  page: PageType;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "EXPLORER",
    links: [
      { label: "Races", page: "races" },
      { label: "Arts", page: "arts" },
      { label: "Bestiaire", page: "bestiary" },
      { label: "Artefacts", page: "artefacts" },
      { label: "Factions", page: "factions" },
    ],
  },
  {
    title: "LE MONDE",
    links: [
      { label: "Cosmologie", page: "cosmology" },
      { label: "Géographie", page: "geography" },
      { label: "Royaumes", page: "royaumes" },
      { label: "Grimoire", page: "grimoire" },
    ],
  },
  {
    title: "COMMUNAUTÉ",
    links: [
      { label: "News", page: "news" },
      { label: "Événements", page: "events" },
      { label: "Banque", page: "bank" },
      { label: "Boutique", page: "shop" },
    ],
  },
];

function FooterNavLink({ label, page }: FooterLink) {
  const { navigate } = useNavigation();
  return (
    <button
      onClick={() => navigate(page)}
      className="transition-colors duration-200 text-left"
      style={{
        fontSize: "0.72rem",
        fontWeight: 400,
        color: "#8B8070",
        letterSpacing: "0.04em",
        cursor: "pointer",
        background: "none",
        border: "none",
        padding: 0,
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#C8A45C";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#8B8070";
      }}
    >
      {label}
    </button>
  );
}

export default function HomeFooter() {
  const { navigate } = useNavigation();

  return (
    <footer
      className="gacha-reveal relative w-full"
      style={{
        backgroundColor: BG,
        fontFamily: "'Inter', sans-serif",
        borderTop: "1px solid rgba(200,164,92,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Top accent line */}
      <div
        className="mx-auto"
        style={{
          maxWidth: 120,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(200,164,92,0.5), transparent)",
          margin: "0 auto",
        }}
      />

      <div className="mx-auto max-w-[1440px] px-6 pt-12 pb-8 lg:px-10 lg:pt-16 lg:pb-10">
        {/* ─── MAIN GRID ─── */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {/* Col 1: Logo & description */}
          <div className="col-span-2 lg:col-span-1">
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#E8D5A0",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              ASCENSION
            </h3>
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 400,
                color: "#8B8070",
                lineHeight: 1.7,
                letterSpacing: "0.01em",
                maxWidth: 260,
              }}
            >
              L&apos;univers d&apos;Ascension est un monde de fantasy
              dark-rêvant où huit peuples luttent pour leur survie dans un
              système d&apos;énergie complexe et fascinant. Explorez les
              royaumes, maîtrisez les Arts, et forgez votre destin.
            </p>
          </div>

          {/* Col 2-4: Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "#C8A45C",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                {col.title}
              </h4>
              <ul
                className="flex flex-col gap-3"
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {col.links.map((link) => (
                  <li key={link.page}>
                    <FooterNavLink label={link.label} page={link.page} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── DIVIDER ─── */}
        <div
          className="my-8 lg:my-10"
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(200,164,92,0.15), transparent)",
          }}
        />

        {/* ─── BOTTOM BAR ─── */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span
            style={{
              fontSize: "0.55rem",
              fontWeight: 400,
              color: "#5A5040",
              letterSpacing: "0.08em",
            }}
          >
            © 2025 ASCENSION — KAKUSEI
          </span>

          {/* Legal links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {}}
              className="transition-colors duration-200"
              style={{
                fontSize: "0.55rem",
                fontWeight: 400,
                color: "#5A5040",
                letterSpacing: "0.05em",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#8B8070";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#5A5040";
              }}
            >
              Mentions légales
            </button>
            <button
              onClick={() => {}}
              className="transition-colors duration-200"
              style={{
                fontSize: "0.55rem",
                fontWeight: 400,
                color: "#5A5040",
                letterSpacing: "0.05em",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#8B8070";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#5A5040";
              }}
            >
              Politique de confidentialité
            </button>
          </div>

          {/* Social icons placeholder (Discord) */}
          <div className="flex items-center gap-3">
            {/* Discord SVG Icon */}
            <button
              onClick={() => {}}
              className="flex items-center justify-center transition-all duration-200"
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: "1px solid rgba(200,164,92,0.15)",
                background: "transparent",
                cursor: "pointer",
                color: "rgba(200,164,92,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(200,164,92,0.4)";
                e.currentTarget.style.color = "#C8A45C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(200,164,92,0.15)";
                e.currentTarget.style.color = "rgba(200,164,92,0.4)";
              }}
              aria-label="Discord"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}