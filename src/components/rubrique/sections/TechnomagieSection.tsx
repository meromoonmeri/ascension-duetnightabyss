"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { ChevronDown } from "lucide-react";

/* ─── DNA Design Tokens ─── */
const GOLD = "#E0DABB";
const GOLD_DARK = "#BAAE93";
const GOLD_BORDER = "rgba(224, 218, 187, 0.15)";
const GOLD_GLOW = "rgba(224, 218, 187, 0.1)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_ACTIVE = "rgba(255, 255, 255, 0.9)";
const TEXT_SECONDARY = "#C1B8A2";
const TEXT_TERTIARY = "#A4A4A4";
const TEXT_MUTED = "#A7A7A7";
const DANGER_COLOR = "rgba(239, 68, 68, 0.6)";

/* ─── Content Data ─── */
const CHAPTERS = [
  { id: "imagerie", title: "Imagerie & Archivage", icon: "📷", content: "Les Chambres Éthériques sont des salles capturant des images du monde réel et les stockant sous forme d'énergie cristallisée. Utilisées pour la surveillance, l'espionnage et l'archivage des connaissances. Les images capturées peuvent être revisualisées indéfiniment dans des cristaux de mémoire." },
  { id: "ferroviaire", title: "Transports Ferroviaires", icon: "🚂", content: "Locomotives à mana fonctionnant sur des rails de concentration éthérique. Le réseau ferroviaire relie les principales cités d'Aurelon, permettant un transport rapide de marchandises et de passagers. Les gares sont des nœuds de puissance où le mana est redirigé et redistribué." },
  { id: "aerien", title: "Transports Aériens et Verticaux", icon: "✈️", content: "Dirigeables à mana et plateformes de transport vertical alimentées par des réacteurs éthériques. Utilisés principalement par les forces militaires et les guildes les plus riches. Leur coût d'entretien les rend inaccessibles au grand public." },
  { id: "armement", title: "Armement Arcano-Industriel", icon: "⚔️", content: "Fusils de Résonance canalisant l'EP de l'utilisateur, Revolvers Alchimiques tirant des projectiles enchantés, Canons à Mana pour la défense des citadelles. Chaque arme est unique, calibrée sur le flux de son propriétaire." },
  { id: "quotidien", title: "Technologies du Quotidien", icon: "💡", content: "Éclairage éthérique (lanternes à mana), chauffage par cristaux thermiques, communication à distance via miroirs résonnants, conservation des aliments dans des coffres temporels. La technologie arcano-industrielle touche chaque aspect de la vie quotidienne dans les nations avancées." },
  { id: "industrie", title: "Industrie Lourde", icon: "🏭", content: "Usines à mana alimentant les grandes villes, forges arcaniques produisant armes et armures enchantées, mines de cristal alimentant le réseau énergétique. L'industrie lourde est le moteur économique des nations les plus puissantes." },
  { id: "interdites", title: "Technologies Interdites", icon: "⛔", content: "Réacteurs d'Âmes, Moteurs Temporels, Armes Antiques, Noyaux de Singularité — ces technologies sont classées comme les plus dangereuses. Leur utilisation est punie de mort par la Concorde Magique et l'Église Solaris.", isForbidden: true },
];

const FORBIDDEN_ITEMS = [
  { name: "Réacteur d'Âmes", reason: "Alimenté par l'énergie vitale d'êtres vivants. Chaque activation consomme des âmes, ce qui constitue le crime le plus grave selon la Concorde Magique." },
  { name: "Moteur Temporel", reason: "Manipule le flux temporel local. Les paradoxes engendrés peuvent déchirer la réalité elle-même. Seules trois unités existent, toutes scellées." },
  { name: "Armes Antiques", reason: "Armes d'une ère révolue dont la puissance dépasse tout ce que la magie moderne peut reproduire. Leur redoutable efficacité a conduit à leur interdiction unanime." },
  { name: "Noyau de Singularité", reason: "Crée un point de densité infinie capable d'effondrer l'espace-temps dans un rayon de plusieurs lieues. Considéré comme une menace existentielle pour Aurelon tout entier." },
];

const GLOSSARY = [
  { term: "Chambre Éthérique", def: "Salle de captation et de stockage d'images éthériques." },
  { term: "Réacteur de Mana", def: "Dispositif convertissant les magicules ambiantes en énergie utilisable à grande échelle." },
  { term: "Rail de Concentration", def: "Infrastructure canalisant le flux de mana le long d'une voie ferrée." },
  { term: "Cristal de Mémoire", def: "Support de stockage pour les images capturées par les Chambres Éthériques." },
  { term: "Fusil de Résonance", def: "Arme à feu canalisant l'EP de l'utilisateur à travers le projectile." },
  { term: "Miroir Résonnant", def: "Dispositif de communication à distance utilisant la résonance éthérique entre deux miroirs jumelés." },
  { term: "Coffre Temporel", def: "Conteneur ralentissant le temps à l'intérieur pour préserver la fraîcheur des aliments." },
  { term: "Noyau de Singularité", def: "Technologie interdite créant un point de densité infinie. Considéré comme une menace existentielle." },
  { term: "Forge Arcanique", def: "Installation industrielle de production d'armes et armures enchantées par le mana." },
  { term: "Dirigeable à Mana", def: "Véhicule aérien utilisant des sacs à mana pour assurer sa flottaison et sa propulsion." },
];

/* ─── Particle Tree Types ─── */
interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  phase: number;
  speed: number;
  amplitude: number;
}

/* ─── Particle Tree Generator ─── */
function generateTree(
  x: number,
  y: number,
  angle: number,
  length: number,
  depth: number,
  particles: Array<{ x: number; y: number; size: number; opacity: number }>
) {
  if (depth <= 0 || length < 2) return;
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  const steps = 3 + Math.floor(Math.random() * 3);
  const stepSize = 1 / steps;
  for (let i = 0; i <= steps; i++) {
    const t = Math.min(i * stepSize + (Math.random() - 0.5) * 0.08, 1);
    particles.push({
      x: x + (endX - x) * t + (Math.random() - 0.5) * 3,
      y: y + (endY - y) * t + (Math.random() - 0.5) * 3,
      size: 0.8 + Math.random() * 1.5,
      opacity: 0.5 + Math.random() * 0.4,
    });
  }
  const branches = 2 + (Math.random() > 0.6 ? 1 : 0);
  for (let i = 0; i < branches; i++) {
    const newAngle = angle + (Math.random() - 0.5) * 1.0;
    const newLength = length * (0.6 + Math.random() * 0.15);
    generateTree(endX, endY, newAngle, newLength, depth - 1, particles);
  }
}

/* ─── Connection threshold based on canvas size ─── */
function getConnectionThreshold(w: number, h: number) {
  const diag = Math.sqrt(w * w + h * h);
  return diag * 0.035;
}

/* ─── Particle Tree Canvas Component ─── */
function ParticleTreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const raw: Array<{ x: number; y: number; size: number; opacity: number }> = [];
    generateTree(w * 0.5, h * 0.92, -Math.PI / 2, h * 0.2, 7, raw);

    particlesRef.current = raw.map((p) => ({
      ...p,
      baseX: p.x,
      baseY: p.y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
      amplitude: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    initParticles();

    const handleResize = () => {
      initParticles();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = () => canvas.width / dpr;
    const h = () => canvas.height / dpr;

    const animate = (time: number) => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      const particles = particlesRef.current;
      if (particles.length === 0) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const t = time * 0.001;

      // Update particle positions
      if (!reducedMotionRef.current) {
        for (const p of particles) {
          p.x = p.baseX + Math.sin(t * p.speed + p.phase) * p.amplitude;
          p.y = p.baseY + Math.cos(t * p.speed * 0.7 + p.phase) * p.amplitude * 0.5;
        }
      }

      // Subtle base glow
      const baseGlow = ctx.createRadialGradient(
        cw * 0.5, ch * 0.92, 0,
        cw * 0.5, ch * 0.92, ch * 0.35
      );
      baseGlow.addColorStop(0, "rgba(200, 220, 120, 0.04)");
      baseGlow.addColorStop(0.5, "rgba(180, 200, 100, 0.015)");
      baseGlow.addColorStop(1, "rgba(180, 200, 100, 0)");
      ctx.fillStyle = baseGlow;
      ctx.fillRect(0, 0, cw, ch);

      // Draw connections
      const threshold = getConnectionThreshold(cw, ch);
      const thresholdSq = threshold * threshold;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < thresholdSq) {
            const dist = Math.sqrt(distSq);
            const alpha = 0.1 + 0.1 * (1 - dist / threshold);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        const r = p.size;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity.toFixed(2)})`;
        ctx.fill();

        // Glow
        if (r > 1.2) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
          glow.addColorStop(0, `rgba(255, 255, 255, ${(p.opacity * 0.25).toFixed(3)})`);
          glow.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}

/* ─── Main Component ─── */
export default function TechnomagieSection() {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const toggleChapter = (id: string) => {
    setExpandedChapter((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full">
      {/* ─── Hero Section ─── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: "#000000" }}
        aria-label="Technomagie Hero"
      >
        <div className="flex flex-col md:flex-row w-full" style={{ minHeight: "340px" }}>
          {/* Left side: Title + Labels */}
          <div className="relative flex flex-col justify-center px-6 md:px-10 py-8 md:py-0 md:w-[40%] z-10">
            {/* Color bar - vertical on far left */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] flex flex-col">
              <div className="flex-1 bg-pink-400" />
              <div className="flex-1 bg-emerald-400" />
              <div className="flex-1 bg-yellow-300" />
              <div className="flex-1 bg-sky-400" />
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl tracking-wide mb-6"
              style={{ fontFamily: "'Gloock', serif", color: TEXT_PRIMARY }}
            >
              TECHNOMAGIE
            </h1>

            <div className="flex flex-col gap-2">
              {["EXPLORE", "LORE", "UNIVERS"].map((label) => (
                <span
                  key={label}
                  className="text-xs tracking-[0.18em] uppercase"
                  style={{
                    fontFamily: "'WorldText', sans-serif",
                    color: TEXT_TERTIARY,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right side: Particle Tree Canvas */}
          <div className="relative md:w-[60%] w-full" style={{ minHeight: "280px" }}>
            <ParticleTreeCanvas />
          </div>
        </div>
      </section>

      {/* ─── Chapter List ─── */}
      <section className="w-full py-8 px-6 md:px-10" aria-label="Chapters">
        <div className="max-w-3xl">
          {CHAPTERS.map((chapter, idx) => {
            const isActive = expandedChapter === chapter.id;
            const isDanger = "isForbidden" in chapter && chapter.isForbidden;

            return (
              <div key={chapter.id}>
                {/* Chapter row */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex items-center justify-between w-full py-4 text-left cursor-pointer"
                  style={{
                    borderBottom: isActive
                      ? `1px solid ${isDanger ? DANGER_COLOR : GOLD}`
                      : "1px solid transparent",
                    transition: "border-color 0.2s ease",
                  }}
                  aria-expanded={isActive}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base" role="img" aria-label={chapter.title}>
                      {chapter.icon}
                    </span>
                    <span
                      className="text-sm md:text-base"
                      style={{
                        fontFamily: "'Gloock', serif",
                        color: isActive
                          ? isDanger
                            ? DANGER_COLOR
                            : GOLD
                          : TEXT_TERTIARY,
                        transition: "color 0.2s ease",
                      }}
                    >
                      {chapter.title}
                    </span>
                  </div>
                  <div
                    style={{
                      transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: isActive ? (isDanger ? DANGER_COLOR : GOLD) : TEXT_MUTED,
                    }}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {/* Expanded content */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isActive ? "1fr" : "0fr",
                    opacity: 1,
                    transition: "grid-template-rows 0.25s ease-in-out, opacity 0.25s ease-in-out",
                  }}
                >
                  <div className="overflow-hidden">
                      <div className="pb-6 pl-9">
                        <p
                          className="text-sm leading-relaxed"
                          style={{
                            fontFamily: "'Gloock', serif",
                            color: TEXT_SECONDARY,
                          }}
                        >
                          {chapter.content}
                        </p>

                        {/* Forbidden items sub-list */}
                        {isDanger && (
                          <div className="mt-5 space-y-4">
                            {FORBIDDEN_ITEMS.map((item) => (
                              <div key={item.name} className="pl-3" style={{ borderLeft: `2px solid ${DANGER_COLOR}` }}>
                                <p
                                  className="text-sm font-bold mb-1"
                                  style={{
                                    fontFamily: "'Gloock', serif",
                                    color: DANGER_COLOR,
                                  }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="text-xs leading-relaxed"
                                  style={{
                                    fontFamily: "'Gloock', serif",
                                    color: TEXT_TERTIARY,
                                  }}
                                >
                                  {item.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                {/* Separator between chapters */}
                {idx < CHAPTERS.length - 1 && (
                  <div
                    className="w-full h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(224,218,187,0.15), transparent)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Glossary Section ─── */}
      <section className="w-full pb-10 px-6 md:px-10" aria-label="Glossary">
        {/* Gold separator line */}
        <div
          className="w-full h-px mb-8"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(224,218,187,0.3), transparent)",
          }}
        />

        <h2
          className="text-lg md:text-xl mb-6"
          style={{
            fontFamily: "'Gloock', serif",
            color: GOLD,
          }}
        >
          Glossaire Technique
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl">
          {GLOSSARY.map((item) => (
            <div key={item.term} className="flex flex-col gap-1">
              <span
                className="text-sm"
                style={{
                  fontFamily: "'Gloock', serif",
                  color: TEXT_ACTIVE,
                }}
              >
                {item.term}
              </span>
              <span
                className="text-xs leading-relaxed"
                style={{
                  fontFamily: "'Gloock', serif",
                  color: TEXT_TERTIARY,
                }}
              >
                {item.def}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}