"use client";

import { useEffect, useRef } from "react";
import { useNavigation } from "@/store/navigationStore";
import { SectionSeparator, FourPointStar } from "@/components/shared/Ornaments";
import { MessageCircle, Calendar, Scroll, Newspaper, Users, Hash, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const QUICK_LINKS = [
  {
    label: "Événements",
    description: "Plonge dans des aventures épiques avec la communauté",
    page: "events" as const,
    icon: <Calendar size={24} />,
    color: "#C9A84C",
  },
  {
    label: "Quêtes",
    description: "Complète des quêtes quotidiennes pour gagner de l'Éther",
    page: "quests" as const,
    icon: <Scroll size={24} />,
    color: "#7B68EE",
  },
  {
    label: "News",
    description: "Reste informé des dernières nouvelles du serveur",
    page: "news" as const,
    icon: <Newspaper size={24} />,
    color: "#4FC3F7",
  },
];

const SERVER_STATS = [
  { icon: <Users size={20} />, label: "Membres", value: "150+" },
  { icon: <Hash size={20} />, label: "Salons", value: "40+" },
  { icon: <MessageCircle size={20} />, label: "En ligne", value: "Actif" },
];

export default function CommunityPage() {
  const { navigate } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".community-hero-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        ".community-hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.2 }
      );
      gsap.fromTo(
        ".community-stat-card",
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.4,
        }
      );
      gsap.fromTo(
        ".community-quick-link",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".community-links-section",
            start: "top 80%",
          },
        }
      );
      gsap.fromTo(
        ".community-discord-section",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".community-discord-section",
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FourPointStar size={12} color="var(--ancient-gold)" />
            <span
              className="font-body text-xs tracking-[0.25em] uppercase"
              style={{ color: "var(--text-tertiary)" }}
            >
              Hub communautaire
            </span>
            <FourPointStar size={12} color="var(--ancient-gold)" />
          </div>

          <h1
            className="community-hero-title font-display text-4xl md:text-5xl lg:text-6xl tracking-wide mb-4"
            style={{ color: "var(--ancient-gold)" }}
          >
            Communauté
          </h1>

          <p
            className="community-hero-subtitle font-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Rejoins l&apos;aventure collective d&apos;Ascension. Explore le serveur Discord,
            participe aux événements, et forge ton destin parmi les autres aventuriers.
          </p>
        </div>
      </section>

      <SectionSeparator className="mb-12" />

      {/* Server Stats */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SERVER_STATS.map((stat) => (
            <div
              key={stat.label}
              className="community-stat-card rounded-lg p-5 text-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div
                className="flex justify-center mb-3"
                style={{ color: "var(--ancient-gold)" }}
              >
                {stat.icon}
              </div>
              <div
                className="font-display text-xl tracking-wider mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {stat.value}
              </div>
              <div
                className="font-body text-xs tracking-[0.15em] uppercase"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="community-links-section max-w-4xl mx-auto px-4 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <FourPointStar size={10} color="var(--ancient-gold)" />
          <h2
            className="font-display text-lg tracking-[0.12em] uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Explorer
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className="community-quick-link group text-left rounded-lg p-6 transition-all duration-300"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${link.color}33`;
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-primary)";
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-elevated)";
              }}
            >
              <div className="mb-4" style={{ color: link.color }}>
                {link.icon}
              </div>
              <h3
                className="font-display text-sm tracking-[0.1em] uppercase mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {link.label}
              </h3>
              <p
                className="font-body text-sm leading-relaxed mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {link.description}
              </p>
              <div
                className="flex items-center gap-1 text-xs font-body tracking-wider uppercase transition-all duration-300"
                style={{ color: "var(--text-tertiary)" }}
              >
                <span className="group-hover:text-[var(--ancient-gold)] transition-colors">
                  Accéder
                </span>
                <ArrowRight
                  size={12}
                  className="group-hover:translate-x-1 group-hover:text-[var(--ancient-gold)] transition-all"
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Discord Widget */}
      <section className="community-discord-section max-w-4xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <FourPointStar size={10} color="var(--ancient-gold)" />
          <h2
            className="font-display text-lg tracking-[0.12em] uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Serveur Discord
          </h2>
        </div>

        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--border-primary)",
            background: "var(--bg-elevated)",
          }}
        >
          <iframe
            src="https://discord.com/widget?id=1363662449860468884&theme=dark"
            width="100%"
            height="400"
            allowTransparency
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            style={{ border: "none" }}
            title="Discord Widget"
          />
        </div>

        <p
          className="font-body text-sm text-center mt-6 max-w-lg mx-auto"
          style={{ color: "var(--text-tertiary)" }}
        >
          Rejoins notre communauté Discord pour participer au roleplay, discuter
          avec les autres membres, et suivre les événements en temps réel.
        </p>
      </section>
    </div>
  );
}