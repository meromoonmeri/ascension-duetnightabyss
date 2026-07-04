"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, AlertTriangle, ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */

const CHAPTERS = [
  { id: "imagerie", title: "Imagerie & Archivage", content: "Les Chambres Éthériques sont des salles capturant des images du monde réel et les stockant sous forme d'énergie cristallisée. Utilisées pour la surveillance, l'espionnage et l'archivage des connaissances. Les images capturées peuvent être revisualisées indéfiniment dans des cristaux de mémoire." },
  { id: "ferroviaire", title: "Transports Ferroviaires", content: "Locomotives à mana fonctionnant sur des rails de concentration éthérique. Le réseau ferroviaire relie les principales cités d'Aurelon, permettant un transport rapide de marchandises et de passagers. Les gares sont des nœuds de puissance où le mana est redirigé et redistribué." },
  { id: "aerien", title: "Transports Aériens et Verticaux", content: "Dirigeables à mana et plateformes de transport vertical alimentées par des réacteurs éthériques. Utilisés principalement par les forces militaires et les guildes les plus riches. Leur coût d'entretien les rend inaccessibles au grand public." },
  { id: "armement", title: "Armement Arcano-Industriel", content: "Fusils de Résonance canalisant l'EP de l'utilisateur, Revolvers Alchimiques tirant des projectiles enchantés, Canons à Mana pour la défense des citadelles. Chaque arme est unique, calibrée sur le flux de son propriétaire." },
  { id: "quotidien", title: "Technologies du Quotidien", content: "Éclairage éthérique (lanternes à mana), chauffage par cristaux thermiques, communication à distance via miroirs résonnants, conservation des aliments dans des coffres temporels. La technologie arcano-industrielle touche chaque aspect de la vie quotidienne dans les nations avancées." },
  { id: "industrie", title: "Industrie Lourde", content: "Usines à mana alimentant les grandes villes, forges arcaniques produisant armes et armures enchantées, mines de cristal alimentant le réseau énergétique. L'industrie lourde est le moteur économique des nations les plus puissantes." },
  { id: "interdites", title: "Technologies Interdites", content: "Réacteurs d'Âmes, Moteurs Temporels, Armes Antiques, Noyaux de Singularité — ces technologies sont classées comme les plus dangereuses. Leur utilisation est punie de mort par la Concorde Magique et l'Église Solaris.", isForbidden: true },
  { id: "glossaire", title: "Glossaire Technique", content: "", isGlossary: true },
];

const GLOSSARY = [
  { term: "Chambre Éthérique", definition: "Salle de captation et de stockage d'images éthériques." },
  { term: "Réacteur de Mana", definition: "Dispositif convertissant les magicules ambiantes en énergie utilisable à grande échelle." },
  { term: "Rail de Concentration", definition: "Infrastructure canalisant le flux de mana le long d'une voie ferrée." },
  { term: "Cristal de Mémoire", definition: "Support de stockage pour les images capturées par les Chambres Éthériques." },
  { term: "Fusil de Résonance", definition: "Arme à feu canalisant l'EP de l'utilisateur à travers le projectile." },
  { term: "Miroir Résonnant", definition: "Dispositif de communication à distance utilisant la résonance éthérique entre deux miroirs jumelés." },
  { term: "Coffre Temporel", definition: "Conteneur ralentissant le temps à l'intérieur pour préserver la fraîcheur des aliments." },
  { term: "Noyau de Singularité", definition: "Technologie interdite créant un point de densité infinie. Considéré comme une menace existentielle." },
  { term: "Forge Arcanique", definition: "Installation industrielle de production d'armes et armures enchantées par le mana." },
  { term: "Dirigeable à Mana", definition: "Véhicule aérien utilisant des sacs à mana pour assurer sa flottaison et sa propulsion." },
];

const FORBIDDEN_ITEMS = [
  { name: "Réacteur d'Âmes", reason: "Alimenté par l'énergie vitale d'êtres vivants. Chaque activation consomme des âmes, ce qui constitue le crime le plus grave selon la Concorde Magique." },
  { name: "Moteur Temporel", reason: "Manipule le flux temporel local. Les paradoxes engendrés peuvent déchirer la réalité elle-même. Seules trois unités existent, toutes scellées." },
  { name: "Armes Antiques", reason: "Armes d'une ère révolue dont la puissance dépasse tout ce que la magie moderne peut reproduire. Leur redoutable efficacité a conduit à leur interdiction unanime." },
  { name: "Noyau de Singularité", reason: "Crée un point de densité infinie capable d'effondrer l'espace-temps dans un rayon de plusieurs lieues. Considéré comme une menace existentielle pour Aurelon tout entier." },
];

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const GOLD = "#C9A84C";
const COPPER = "#B87333";
const RIVET = "#555";
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* ═══════════════════════════════════════════════
   INLINE SVG DECORATIONS
   ═══════════════════════════════════════════════ */

function SmallGearIcon({ size = 16, color = GOLD, className = "" }: { size?: number; color?: string; className?: string }) {
  const r = size / 2;
  const teeth = 8;
  const toothAngle = (2 * Math.PI) / teeth;
  let pathD = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * toothAngle;
    const hw = toothAngle * 0.3;
    const inner = r * 0.55;
    const outer = r * 0.85;
    const cmd = i === 0 ? "M" : "L";
    pathD += `${cmd} ${r + inner * Math.cos(a - hw)} ${r + inner * Math.sin(a - hw)} `;
    pathD += `L ${r + outer * Math.cos(a - hw * 0.5)} ${r + outer * Math.sin(a - hw * 0.5)} `;
    pathD += `A ${outer} ${outer} 0 0 1 ${r + outer * Math.cos(a + hw * 0.5)} ${r + outer * Math.sin(a + hw * 0.5)} `;
    pathD += `L ${r + inner * Math.cos(a + hw)} ${r + inner * Math.sin(a + hw)} `;
  }
  pathD += "Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className={className} aria-hidden="true">
      <path d={pathD} fill={color} opacity="0.4" />
      <circle cx={r} cy={r} r={r * 0.22} fill="#0A0A0F" />
    </svg>
  );
}

function RivetDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${className}`}
      style={{ background: RIVET, boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.4)" }}
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════════
   FILM GRAIN OVERLAY
   ═══════════════════════════════════════════════ */

function FilmGrain() {
  const grainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !grainRef.current) return;

    let frame = 0;
    const interval = setInterval(() => {
      if (grainRef.current) {
        grainRef.current.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
      }
      frame++;
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={grainRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden="true"
      style={{
        opacity: 0.045,
        backgroundImage: NOISE_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════
   CINEMATIC HERO
   ═══════════════════════════════════════════════ */

function CinematicHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power3.out" }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.1"
        );

      // Parallax on scroll
      gsap.to(titleRef.current, {
        y: -60,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(subRef.current, {
        y: -40,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.03) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Japanese watermark */}
      <span
        className="absolute select-none pointer-events-none"
        style={{
          fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
          fontSize: "clamp(120px, 20vw, 300px)",
          color: "rgba(201,168,76,0.04)",
          lineHeight: 1,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        技術
      </span>

      {/* Title */}
      <h1
        ref={titleRef}
        className="relative z-10 font-display text-center select-none"
        style={{
          fontSize: "clamp(2.5rem, 8vw, 6rem)",
          letterSpacing: "0.3em",
          color: "#E8E4E0",
          textShadow: "0 0 60px rgba(201,168,76,0.15), 0 2px 0 rgba(0,0,0,0.8)",
          lineHeight: 1.1,
          opacity: 0,
        }}
      >
        TECHNOLOGIE
      </h1>

      {/* Gold line */}
      <div
        ref={lineRef}
        className="relative z-10 mt-6 h-px w-48 sm:w-72"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          transformOrigin: "center",
          opacity: 0.6,
        }}
      />

      {/* Subtitle */}
      <p
        ref={subRef}
        className="relative z-10 mt-5 font-body text-center tracking-[0.15em] uppercase"
        style={{
          fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
          color: `${GOLD}`,
          opacity: 0.7,
        }}
      >
        Encyclopédie Arcano-Technique d&apos;Aurelon
      </p>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 0 }}
      >
        <span
          className="block w-px h-10"
          style={{
            background: `linear-gradient(to bottom, ${GOLD}, transparent)`,
            opacity: 0.5,
          }}
        />
        <ChevronDown size={14} style={{ color: GOLD, opacity: 0.4 }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   STICKY SIDE NAVIGATION
   ═══════════════════════════════════════════════ */

function SideNavigation({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <nav
      aria-label="Chapitres"
      className="fixed z-50 hidden lg:block"
      style={{ left: 32, top: "50%", transform: "translateY(-50%)" }}
    >
      <ul className="flex flex-col items-start gap-0" role="list">
        {CHAPTERS.map((ch) => {
          const isActive = activeId === ch.id;
          const isHovered = hoveredId === ch.id;
          const showLabel = isHovered || isActive;

          return (
            <li key={ch.id} role="listitem" className="relative">
              <button
                onClick={() => onSelect(ch.id)}
                onMouseEnter={() => setHoveredId(ch.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group flex items-center gap-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/50 rounded-sm"
                aria-current={isActive ? "true" : undefined}
                aria-label={ch.title}
              >
                {/* Dot indicator */}
                <span
                  className="block rounded-full transition-all duration-500"
                  style={{
                    width: isActive ? 10 : 6,
                    height: isActive ? 10 : 6,
                    background: isActive ? GOLD : "rgba(255,255,255,0.15)",
                    boxShadow: isActive ? `0 0 8px rgba(201,168,76,0.5)` : "none",
                  }}
                />

                {/* Label */}
                <span
                  className="font-display whitespace-nowrap transition-all duration-300"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    color: isActive ? GOLD : "rgba(255,255,255,0.5)",
                    opacity: showLabel ? 1 : 0,
                    transform: showLabel ? "translateX(0)" : "translateX(-4px)",
                    pointerEvents: "none",
                  }}
                >
                  {ch.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ═══════════════════════════════════════════════
   MOBILE TOP NAVIGATION BAR
   ═══════════════════════════════════════════════ */

function MobileTopNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active item
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(`[data-nav-id="${activeId}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  return (
    <div
      className="lg:hidden sticky top-0 z-50 overflow-hidden"
      style={{
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
      }}
    >
      <div
        ref={scrollRef}
        className="flex gap-1 px-3 py-2.5 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CHAPTERS.map((ch) => {
          const isActive = activeId === ch.id;
          return (
            <button
              key={ch.id}
              data-nav-id={ch.id}
              onClick={() => onSelect(ch.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-sm transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/50"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                fontFamily: "var(--font-display, 'Cinzel', serif)",
                color: isActive ? "#000" : "rgba(255,255,255,0.5)",
                background: isActive ? GOLD : "transparent",
                border: isActive ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {ch.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CHAPTER SECTION
   ═══════════════════════════════════════════════ */

function ChapterSection({
  chapter,
  index,
  sectionsRef,
}: {
  chapter: (typeof CHAPTERS)[number];
  index: number;
  sectionsRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  // Merge refs
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (el) sectionsRef.current.set(chapter.id, el);
    },
    [chapter.id, sectionsRef]
  );

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Number watermark parallax
      if (numberRef.current) {
        gsap.fromTo(
          numberRef.current,
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Content reveal
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const chapterNum = String(index + 1).padStart(2, "0");
  const isForbidden = chapter.isForbidden;

  return (
    <section
      ref={setRef}
      id={chapter.id}
      className="relative min-h-[70vh] flex items-center scroll-mt-16 lg:scroll-mt-8"
      style={{
        background: isForbidden
          ? "linear-gradient(180deg, rgba(127,29,29,0.06) 0%, transparent 40%, transparent 60%, rgba(127,29,29,0.04) 100%)"
          : undefined,
      }}
    >
      {/* Chapter number watermark */}
      <span
        ref={numberRef}
        className="absolute select-none pointer-events-none font-display"
        style={{
          fontSize: "clamp(8rem, 18vw, 16rem)",
          fontWeight: 700,
          color: isForbidden ? "rgba(220,38,38,0.03)" : "rgba(201,168,76,0.03)",
          lineHeight: 1,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        {chapterNum}
      </span>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-3xl mx-auto px-6 sm:px-10 lg:pl-44 lg:pr-10 py-24"
      >
        {/* Chapter number + title row */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span
              className="font-display text-sm tracking-[0.2em]"
              style={{ color: isForbidden ? "#DC2626" : GOLD, opacity: 0.6 }}
            >
              {chapterNum}
            </span>
            <RivetDot />
          </div>

          <h2
            className="font-display tracking-[0.12em] uppercase"
            style={{
              fontSize: "clamp(1.3rem, 3vw, 2rem)",
              color: isForbidden ? "#FCA5A5" : "#E8E4E0",
              lineHeight: 1.2,
            }}
          >
            {chapter.title}
          </h2>

          {/* Gold separator line */}
          <div className="mt-5 flex items-center gap-3">
            <SmallGearIcon size={12} color={isForbidden ? "#DC2626" : GOLD} />
            <div
              className="h-px flex-1"
              style={{
                background: isForbidden
                  ? "linear-gradient(90deg, rgba(220,38,38,0.5), transparent)"
                  : `linear-gradient(90deg, ${GOLD}, transparent)`,
                opacity: 0.6,
              }}
            />
          </div>
        </div>

        {/* Content text */}
        <p
          className="font-body leading-[1.85] text-base sm:text-lg"
          style={{ color: "rgba(224,220,216,0.7)" }}
        >
          {chapter.content}
        </p>

        {/* Forbidden items */}
        {isForbidden && (
          <div className="mt-10">
            {/* Warning banner */}
            <div
              className="flex items-center gap-3 mb-6 py-3 px-4 rounded-sm"
              style={{
                border: "1px solid rgba(220,38,38,0.2)",
                background: "rgba(127,29,29,0.08)",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#DC2626", flexShrink: 0 }} />
              <span
                className="font-display text-xs tracking-[0.15em] uppercase"
                style={{ color: "#FCA5A5" }}
              >
                Classement : DANGER EXISTENTIEL
              </span>
            </div>

            {/* Forbidden cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {FORBIDDEN_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="relative p-5 rounded-sm transition-all duration-300"
                  style={{
                    border: "1px solid rgba(220,38,38,0.25)",
                    background: "linear-gradient(135deg, rgba(127,29,29,0.06) 0%, transparent 100%)",
                  }}
                >
                  {/* Corner accents */}
                  <div
                    className="absolute top-0 left-0 w-2 h-2 border-t border-l rounded-tl-sm"
                    style={{ borderColor: "rgba(220,38,38,0.4)" }}
                  />
                  <div
                    className="absolute top-0 right-0 w-2 h-2 border-t border-r rounded-tr-sm"
                    style={{ borderColor: "rgba(220,38,38,0.4)" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-2 h-2 border-b border-l rounded-bl-sm"
                    style={{ borderColor: "rgba(220,38,38,0.4)" }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-2 h-2 border-b border-r rounded-br-sm"
                    style={{ borderColor: "rgba(220,38,38,0.4)" }}
                  />

                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={12} style={{ color: "#EF4444", flexShrink: 0 }} />
                    <h3
                      className="font-display text-xs tracking-[0.1em] uppercase"
                      style={{ color: "#FCA5A5" }}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <p
                    className="font-body text-sm leading-relaxed"
                    style={{ color: "rgba(224,220,216,0.55)" }}
                  >
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>

            {/* Warning footer */}
            <div className="mt-8 pt-5 text-center" style={{ borderTop: "1px solid rgba(220,38,38,0.15)" }}>
              <p
                className="font-display text-xs tracking-[0.2em] uppercase"
                style={{
                  color: "rgba(220,38,38,0.6)",
                  textShadow: "0 0 12px rgba(239,68,68,0.2)",
                }}
              >
                ⚠ Utilisation punie de mort par la Concorde Magique et l&apos;Église Solaris ⚠
              </p>
            </div>
          </div>
        )}

        {/* Decorative gear (non-forbidden) */}
        {!isForbidden && (
          <div className="absolute top-8 right-8 lg:right-12 opacity-[0.06] pointer-events-none" aria-hidden="true">
            <SmallGearIcon size={40} color={GOLD} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   GLOSSARY SECTION
   ═══════════════════════════════════════════════ */

function GlossarySectionComponent({
  sectionsRef,
}: {
  sectionsRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
}) {
  const [search, setSearch] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (el) sectionsRef.current.set("glossaire", el);
    },
    [sectionsRef]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return GLOSSARY;
    const q = search.toLowerCase();
    return GLOSSARY.filter(
      (g) =>
        g.term.toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (numberRef.current) {
        gsap.fromTo(
          numberRef.current,
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={setRef}
      id="glossaire"
      className="relative min-h-[70vh] scroll-mt-16 lg:scroll-mt-8"
    >
      {/* Chapter number watermark */}
      <span
        ref={numberRef}
        className="absolute select-none pointer-events-none font-display"
        style={{
          fontSize: "clamp(8rem, 18vw, 16rem)",
          fontWeight: 700,
          color: "rgba(201,168,76,0.03)",
          lineHeight: 1,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        08
      </span>

      <div ref={contentRef} className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 lg:pl-44 lg:pr-10 py-24">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span
              className="font-display text-sm tracking-[0.2em]"
              style={{ color: GOLD, opacity: 0.6 }}
            >
              08
            </span>
            <RivetDot />
          </div>
          <h2
            className="font-display tracking-[0.12em] uppercase"
            style={{
              fontSize: "clamp(1.3rem, 3vw, 2rem)",
              color: "#E8E4E0",
              lineHeight: 1.2,
            }}
          >
            Glossaire Technique
          </h2>
          <div className="mt-5 flex items-center gap-3">
            <SmallGearIcon size={12} color={GOLD} />
            <div
              className="h-px flex-1"
              style={{
                background: `linear-gradient(90deg, ${GOLD}, transparent)`,
                opacity: 0.6,
              }}
            />
          </div>
        </div>

        {/* Search input */}
        <div className="relative mb-8 max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer les termes..."
            className="w-full pl-11 pr-4 py-3 text-sm font-body tracking-wide rounded-sm outline-none transition-all duration-300 focus:ring-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E8E4E0",
              caretColor: GOLD,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = `${GOLD}33`;
              e.target.style.boxShadow = `0 0 12px rgba(201,168,76,0.08)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
            aria-label="Rechercher dans le glossaire"
          />
        </div>

        {/* Glossary grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GLOSSARY.map((g) => {
            const visible = filtered.includes(g);
            return (
              <div
                key={g.term}
                className="p-5 rounded-sm transition-all duration-500"
                style={{
                  background: visible ? "rgba(255,255,255,0.02)" : "transparent",
                  border: `1px solid ${visible ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)"}`,
                  opacity: visible ? 1 : 0.1,
                  transform: visible ? "translateY(0)" : "translateY(4px)",
                }}
              >
                <h3
                  className="font-display text-xs tracking-[0.08em] uppercase mb-3"
                  style={{ color: visible ? GOLD : "rgba(255,255,255,0.15)" }}
                >
                  {g.term}
                </h3>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: visible ? "rgba(224,220,216,0.6)" : "rgba(224,220,216,0.08)" }}
                >
                  {g.definition}
                </p>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <SmallGearIcon size={32} color={RIVET} className="mx-auto mb-4 opacity-30" />
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
              Aucun terme ne correspond à votre recherche.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   DIVIDER
   ═══════════════════════════════════════════════ */

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-2 px-6" aria-hidden="true">
      <div
        className="h-px w-full max-w-3xl lg:ml-44"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent)",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function TechnologiePage() {
  const [activeSection, setActiveSection] = useState("imagerie");
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll tracking via IntersectionObserver
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    const timer = setTimeout(() => {
      sectionsRef.current.forEach((el) => observer.observe(el));
    }, 200);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const handleNavSelect = useCallback((id: string) => {
    const el = sectionsRef.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Build chapter index (skip glossary for the chapter sections loop)
  const contentChapters = CHAPTERS.filter((ch) => !ch.isGlossary);
  const glossaryChapter = CHAPTERS.find((ch) => ch.isGlossary)!;

  return (
    <div
      ref={mainRef}
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#000",
        "--sp-copper": COPPER,
        "--sp-brass": GOLD,
        "--sp-rivet": RIVET,
      } as React.CSSProperties}
    >
      {/* Film grain overlay */}
      <FilmGrain />

      {/* Cinematic Hero */}
      <CinematicHero />

      {/* Mobile Top Nav */}
      <MobileTopNav activeId={activeSection} onSelect={handleNavSelect} />

      {/* Desktop Side Nav */}
      <SideNavigation activeId={activeSection} onSelect={handleNavSelect} />

      {/* Chapter sections */}
      <main>
        {contentChapters.map((chapter, index) => (
          <div key={chapter.id}>
            {index > 0 && <SectionDivider />}
            <ChapterSection
              chapter={chapter}
              index={index}
              sectionsRef={sectionsRef}
            />
          </div>
        ))}

        <SectionDivider />
        <GlossarySectionComponent sectionsRef={sectionsRef} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-20 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div
            className="h-px w-16 sm:w-24"
            style={{
              background: `linear-gradient(90deg, transparent, ${GOLD}20)`,
            }}
          />
          <SmallGearIcon size={14} color={GOLD} />
          <div
            className="h-px w-16 sm:w-24"
            style={{
              background: `linear-gradient(270deg, transparent, ${GOLD}20)`,
            }}
          />
        </div>
        <p
          className="font-body text-xs tracking-[0.15em] uppercase"
          style={{ color: "rgba(255,255,255,0.12)" }}
        >
          Fin de l&apos;Encyclopédie Arcano-Technique
        </p>
      </footer>
    </div>
  );
}