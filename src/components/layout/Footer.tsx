"use client";

import { MessageCircle } from "lucide-react";

const DISCORD_URL = "https://discord.gg/svAvDbBx36";

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        background: "rgba(11, 17, 32, 0.9)",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4"
      >
        {/* Left — Brand */}
        <div className="flex items-center gap-2 ba-font">
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: "rgba(255, 255, 255, 0.3)",
              textTransform: "uppercase",
            }}
          >
            ASCENSION
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              color: "rgba(255, 255, 255, 0.18)",
            }}
          >
            ノミステリ RP
          </span>
        </div>

        {/* Right — Discord + Year */}
        <div className="flex items-center gap-5">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ba-font flex items-center gap-2 transition-colors duration-200"
            style={{
              fontSize: "0.7rem",
              color: "rgba(255, 255, 255, 0.35)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)";
            }}
          >
            <MessageCircle size={14} />
            <span className="hidden sm:inline">Discord</span>
          </a>
          <span
            className="ba-font"
            style={{
              fontSize: "0.65rem",
              color: "rgba(255, 255, 255, 0.2)",
            }}
          >
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}