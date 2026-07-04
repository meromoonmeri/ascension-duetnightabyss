"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigation } from "@/store/navigationStore";
import { TiltCard, ParticleCanvas, GlassPanel, StatBar, AnimatedText } from "@/components/premium";
import { FourPointStar } from "@/components/shared/Ornaments";
import type { PageType } from "@/store/navigationStore";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

interface CreatureSkill {
  name: string;
  description: string;
}
interface CreatureDrop {
  name: string;
  rarity: string;
  dropRate: string;
}
interface CreatureStats {
  pv: number;
  attaque: number;
  défense: number;
  vitesse: number;
  magie: number;
}
interface Creature {
  id: string;
  name: string;
  nameJp: string;
  classification: string;
  rarity: string;
  dangerLevel: string;
  element: string;
  habitat: string;
  behavior: string;
  description: string;
  lore: string;
  stats: CreatureStats;
  skills: CreatureSkill[];
  weaknesses: string[];
  resistances: string[];
  drops: CreatureDrop[];
  zones: string[];
  factionInteraction: string;
  relatedSpecies: string[];
}

const REGIONS = ["Valkyrheim", "Aurelon", "Grandbell", "Xianlun", "Akatsura", "Novarche", "Zaharan", "Shantara"];
const ELEMENT_COLORS: Record<string, string> = {
  Feu: "#FF6B35", Glace: "#4ECDC4", Foudre: "#FFD93D", Ténèbres: "#6B4226",
  Lumière: "#F5D76E", Vent: "#87CEEB", Terre: "#C19A6B", Eau: "#4A90D9",
  Arcane: "#9B59B6", Sang: "#8B0000", Néant: "#2C2C3A",
};
const DANGER_COLORS: Record<string, string> = {
  D: "#6B8E23", C: "#4A90D9", B: "#9B59B6", A: "#FF6B35", S: "#FFD93D", SS: "#FF4444", SSS: "#FF0000",
};

function CreatureCard({ creature, onSelect }: { creature: Creature; onSelect: () => void }) {
  const elemColor = ELEMENT_COLORS[creature.element] || "#9B59B6";
  const dangerColor = DANGER_COLORS[creature.dangerLevel] || "#6B8E23";
  const rarityGlow: Record<string, string> = {
    common: "rgba(128,128,136,0.15)", rare: "rgba(74,144,217,0.25)",
    epic: "rgba(155,89,182,0.3)", legendary: "rgba(212,175,55,0.4)", mythic: "rgba(78,205,196,0.45)",
  };

  return (
    <TiltCard glowColor={rarityGlow[creature.rarity] || rarityGlow.common} onClick={onSelect} className="min-h-[320px]">
      <div className="p-5 flex flex-col h-full">
        {/* Top badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono-custom text-[0.55rem] px-2 py-0.5 rounded" style={{ color: elemColor, border: `1px solid ${elemColor}44`, background: `${elemColor}11` }}>{creature.element}</span>
          <span className="font-mono-custom text-[0.55rem] px-2 py-0.5 rounded font-bold" style={{ color: dangerColor, border: `1px solid ${dangerColor}44`, background: `${dangerColor}11`, textShadow: `0 0 6px ${dangerColor}66` }}>{creature.dangerLevel}</span>
        </div>

        {/* Classification + Name */}
        <div className="flex-1">
          <p className="font-mono-custom text-[0.6rem] text-[var(--text-tertiary)] mb-1 tracking-wider uppercase">{creature.classification}</p>
          <h3 className="font-display text-base tracking-[0.08em] mb-0.5" style={{ color: 'var(--text-primary)' }}>{creature.name}</h3>
          <p className="font-body text-xs text-[var(--text-tertiary)] italic mb-2">{creature.nameJp}</p>
          <div className="w-12 h-px mb-3" style={{ background: `linear-gradient(90deg, ${elemColor}88, transparent)` }} />
          <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">{creature.description}</p>
        </div>

        {/* Bottom: Rarity + Element indicator */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="font-mono-custom text-[0.5rem] tracking-[0.15em] uppercase" style={{ color: rarityGlow[creature.rarity]?.replace('0.15', '0.7') || '#808088' }}>{creature.rarity}</span>
          <span className="font-mono-custom text-[0.5rem] text-[var(--text-tertiary)]">{creature.habitat.split(' ')[0]}</span>
        </div>
      </div>
    </TiltCard>
  );
}

function CreatureDetail({ creature, onClose }: { creature: Creature; onClose: () => void }) {
  const elemColor = ELEMENT_COLORS[creature.element] || "#9B59B6";
  const dangerColor = DANGER_COLORS[creature.dangerLevel] || "#6B8E23";

  return (
    <GlassPanel glowColor={`${elemColor}33`} className="mb-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left */}
        <div className="lg:w-1/3 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-xl flex items-center justify-center mb-4 float-animation" style={{ background: `${elemColor}11`, border: `2px solid ${elemColor}44`, boxShadow: `0 0 30px ${elemColor}33` }}>
            <span className="font-display text-xs tracking-[0.1em] uppercase" style={{ color: elemColor }}>{creature.dangerLevel}</span>
          </div>
          <h2 className="font-display text-xl tracking-[0.1em] mb-1" style={{ color: elemColor }}>{creature.name}</h2>
          <p className="font-body text-sm text-[var(--text-tertiary)] italic mb-1">{creature.nameJp}</p>
          <p className="font-mono-custom text-[0.6rem] tracking-wider uppercase text-[var(--text-tertiary)] mb-4">{creature.classification}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="font-mono-custom text-[0.55rem] px-2 py-0.5 rounded" style={{ color: elemColor, border: `1px solid ${elemColor}44` }}>{creature.element}</span>
            <span className="font-mono-custom text-[0.55rem] px-2 py-0.5 rounded font-bold" style={{ color: dangerColor, border: `1px solid ${dangerColor}44` }}>Niveau {creature.dangerLevel}</span>
          </div>
          <button onClick={onClose} className="mt-4 font-display text-[0.6rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] hover:text-[var(--ancient-gold)] transition-colors">← Retour</button>
        </div>

        {/* Right */}
        <div className="lg:w-2/3 space-y-6">
          <div><h3 className="font-display text-xs tracking-[0.15em] uppercase text-[var(--ancient-gold)] mb-2">📖 Description</h3><AnimatedText text={creature.description} glow speed={15} className="font-body text-sm text-[var(--text-secondary)] leading-relaxed" /></div>
          <div><h3 className="font-display text-xs tracking-[0.15em] uppercase text-[var(--ancient-gold)] mb-2">📜 Lore</h3><AnimatedText text={creature.lore} speed={18} className="font-body text-sm text-[var(--text-secondary)] leading-relaxed" /></div>
          <div><h3 className="font-display text-xs tracking-[0.15em] uppercase text-[var(--ancient-gold)] mb-2">📊 Statistiques</h3><div className="space-y-2">{Object.entries(creature.stats).map(([key, val]) => <StatBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val as number} max={1000} color={elemColor} />)}</div></div>
          <div><h3 className="font-display text-xs tracking-[0.15em] uppercase text-[var(--ancient-gold)] mb-2">⚡ Compétences</h3><div className="space-y-2">{creature.skills.map(s => (<div key={s.name} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${elemColor}22` }}><p className="font-display text-xs mb-1" style={{ color: elemColor }}>{s.name}</p><p className="font-body text-xs text-[var(--text-tertiary)]">{s.description}</p></div>))}</div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><h3 className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-1">Comportement</h3><p className="font-body text-xs text-[var(--text-secondary)]">{creature.behavior}</p></div>
            <div><h3 className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-1">Habitat</h3><p className="font-body text-xs text-[var(--text-secondary)]">{creature.habitat}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><h3 className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-1">Faiblesses</h3><div className="flex flex-wrap gap-1">{creature.weaknesses.map(w => <span key={w} className="font-body text-[0.65rem] px-2 py-0.5 rounded" style={{ color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.05)' }}>{w}</span>)}</div></div>
            <div><h3 className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-1">Résistances</h3><div className="flex flex-wrap gap-1">{creature.resistances.map(r => <span key={r} className="font-body text-[0.65rem] px-2 py-0.5 rounded" style={{ color: elemColor, border: `1px solid ${elemColor}33`, background: `${elemColor}08` }}>{r}</span>)}</div></div>
          </div>
          {creature.factionInteraction && <div><h3 className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-1">Factions</h3><p className="font-body text-xs text-[var(--text-secondary)]">{creature.factionInteraction}</p></div>}
          {creature.drops.length > 0 && <div><h3 className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-1">Butin</h3><div className="space-y-1">{creature.drops.map(d => (<div key={d.name} className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}><span className="font-body text-xs text-[var(--text-secondary)]">{d.name}</span><span className="font-mono-custom text-[0.55rem] text-[var(--text-tertiary)]">{d.dropRate}</span></div>))}</div></div>}
          {creature.zones.length > 0 && <div><h3 className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-1">Zones d'apparition</h3><div className="flex flex-wrap gap-1">{creature.zones.map(z => <span key={z} className="font-body text-[0.65rem] px-2 py-0.5 rounded" style={{ border: '1px solid var(--border-accent)', color: 'var(--text-secondary)' }}>{z}</span>)}</div></div>}
        </div>
      </div>
    </GlassPanel>
  );
}

export default function BestiaryPage() {
  const { navigate } = useNavigation();
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [selected, setSelected] = useState<Creature | null>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('');
  const [generating, setGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setGenerating(true);
    try {
      const res = await fetch('/api/bestiary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: region || undefined, count: 6 }),
      });
      const data = await res.json();
      if (data.success) {
        setCreatures(prev => [...data.creatures, ...prev]);
      }
    } catch (err) {
      console.error('[BESTIARY]', err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, [region]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.beast-scroll-reveal').forEach(el => {
        gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [creatures, selected]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <ParticleCanvas className="opacity-30" density={25} colors={["rgba(255,107,107,0.4)", "rgba(78,205,196,0.3)", "rgba(155,89,182,0.3)"]} />

      <section className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="beast-scroll-reveal">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-[0.15em] mb-4" style={{ color: 'var(--magical-cyan)', textShadow: '0 0 30px rgba(78,205,196,0.3), 0 0 60px rgba(78,205,196,0.1)' }}>BESTIAIRE VIVANT</h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--magical-cyan))' }} />
            <FourPointStar />
            <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, var(--magical-cyan), transparent)' }} />
          </div>
          <p className="font-body text-lg text-[var(--text-secondary)] italic">Un Codex alimenté par l'Intelligence Artificielle — chaque créature est unique</p>
        </div>

        {/* Controls */}
        <div className="beast-scroll-reveal flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="font-body text-sm px-4 py-2.5 rounded-lg bg-transparent border border-[var(--border-accent)] text-[var(--text-secondary)] focus:border-[var(--magical-cyan)] focus:outline-none transition-colors"
          >
            <option value="">Toutes les régions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            onClick={generate}
            disabled={generating}
            className="font-display text-[0.65rem] tracking-[0.18em] uppercase px-8 py-2.5 rounded-lg border transition-all duration-300 disabled:opacity-50"
            style={{
              color: 'var(--magical-cyan)',
              borderColor: 'var(--magical-cyan)',
              background: generating ? 'rgba(78,205,196,0.08)' : 'transparent',
              boxShadow: generating ? '0 0 20px rgba(78,205,196,0.2)' : 'none',
            }}
          >
            {generating ? 'INVOCATION EN COURS...' : 'INVOKER DES CRÉATURES'}
          </button>
        </div>
      </section>

      {/* Grid */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mb-3" style={{ borderColor: 'var(--magical-cyan)', borderTopColor: 'transparent' }} />
            <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--text-tertiary)]">L'IA explore le monde d'Ascension...</p>
          </div>
        ) : creatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-body text-4xl mb-4 opacity-20">🐉</p>
            <p className="font-body text-sm text-[var(--text-tertiary)] mb-2">Le Bestiaire est vide</p>
            <p className="font-body text-xs text-[var(--text-tertiary)]">Cliquez sur le bouton ci-dessus pour invoquer des créatures</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatures.map(c => (
              <div key={c.id} className="beast-scroll-reveal">
                <CreatureCard creature={c} onSelect={() => setSelected(c)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"><CreatureDetail creature={selected} onClose={() => setSelected(null)} /></div>}
      <div className="h-20" />
    </div>
  );
}
