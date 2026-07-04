"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigation } from "@/store/navigationStore";
import { COSMOLOGY_DATA, GEOGRAPHY_DATA } from "@/data/cosmology";
import { SectionSeparator, FourPointStar } from "@/components/shared/Ornaments";
import { ChevronRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DetailPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pageParams, navigate, goBack } = useNavigation();

  const id = pageParams.id;
  const title = pageParams.title;
  const type = pageParams.type; // "cosmology" or "geography"

  // Look up data
  const cosmologySection = COSMOLOGY_DATA.find((s) => s.id === id);
  const geographySection = GEOGRAPHY_DATA.find((s) => s.id === id);
  const section = type === "geography" ? geographySection : cosmologySection;

  const parentLabel = type === "geography" ? "Géographie" : "Cosmologie";
  const parentPage = type === "geography" ? ("geography" as const) : ("cosmology" as const);

  // GSAP animations
  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo(
        ".detail-header",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );

      // Content paragraphs
      gsap.utils.toArray<HTMLElement>(".detail-paragraph").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: 0.15 * i,
            ease: "power2.out",
          }
        );
      });

      // Sub-section blocks
      gsap.utils.toArray<HTMLElement>(".detail-subsection").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [id]);

  // Not found guard
  if (!section) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <FourPointStar size={48} className="opacity-20 mb-6" />
        <h1 className="font-display text-xl tracking-[0.1em] text-txt-tertiary mb-3">
          SECTION INTROUVABLE
        </h1>
        <p className="font-body text-sm text-txt-tertiary mb-8">
          Cette section n&apos;existe pas ou a été déplacée.
        </p>
        <button
          onClick={() => navigate(parentPage)}
          className="font-display text-xs tracking-[0.15em] uppercase border border-bdr-accent text-txt-accent hover:border-silver hover:text-silver px-6 py-2.5 rounded-sm transition-all duration-300"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="artbook-section">
      {/* ===== BREADCRUMB ===== */}
      <nav
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8"
        aria-label="Fil d'Ariane"
      >
        <ol className="flex items-center gap-1.5 font-body text-sm text-txt-tertiary">
          <li>
            <button
              onClick={() => navigate("home")}
              className="hover:text-silver transition-colors duration-200"
            >
              Accueil
            </button>
          </li>
          <li>
            <ChevronRight size={12} className="opacity-40" />
          </li>
          <li>
            <button
              onClick={() => navigate(parentPage)}
              className="hover:text-silver transition-colors duration-200"
            >
              {parentLabel}
            </button>
          </li>
          <li>
            <ChevronRight size={12} className="opacity-40" />
          </li>
          <li className="text-txt-accent truncate max-w-[200px] sm:max-w-none">
            {title || section.title}
          </li>
        </ol>
      </nav>

      {/* ===== PAGE HEADER ===== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
        <div className="relative">
          {/* Radial gradient backdrop */}
          <div
            className="absolute inset-0 pointer-events-none -inset-y-8"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, var(--ornament-glow) 0%, transparent 70%)",
            }}
          />

          <div className="detail-header relative z-10">
            {/* Back button */}
            <button
              onClick={goBack}
              className="font-display text-[0.65rem] tracking-[0.2em] uppercase text-txt-tertiary hover:text-silver transition-colors duration-200 mb-6 inline-flex items-center gap-2"
            >
              <ChevronRight size={14} className="rotate-180" />
              Retour
            </button>

            {/* Title block */}
            <div className="flex items-start gap-3 mb-3">
              <FourPointStar size={20} className="mt-2 flex-shrink-0 opacity-50" />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-[0.1em] text-engraved text-txt-primary leading-tight">
                  {section.title}
                </h1>
                <p className="font-body text-sm sm:text-base text-txt-tertiary italic mt-1">
                  {section.titleJp}
                </p>
                {"subtitle" in section && section.subtitle && (
                  <p className="font-body text-xs sm:text-sm text-txt-tertiary mt-2 opacity-70">
                    {section.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionSeparator className="!py-4" />
      </div>

      {/* ===== CONTENT ===== */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main content paragraphs */}
        <div className="space-y-5">
          {section.content.map((paragraph, i) => (
            <p
              key={i}
              className="detail-paragraph font-body text-base sm:text-lg text-txt-secondary leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Sub-sections */}
        {section.subSections && section.subSections.length > 0 && (
          <>
            <div className="my-10 sm:my-14">
              <SectionSeparator />
            </div>

            <div className="space-y-8">
              {section.subSections.map((sub, i) => (
                <div
                  key={i}
                  className="detail-subsection relative rounded-sm border border-bdr-primary bg-surface-card overflow-hidden"
                >
                  {/* Subtle top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--ornament-color), transparent)",
                    }}
                  />

                  <div className="p-5 sm:p-8">
                    {/* Sub-section header */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div
                        className="w-1 h-6 rounded-full"
                        style={{ background: "var(--silver-dark)" }}
                      />
                      <h2 className="font-display text-base sm:text-lg tracking-[0.08em] text-engraved text-txt-accent">
                        {sub.title}
                      </h2>
                    </div>

                    {/* Sub-section content */}
                    <div className="space-y-4 pl-3.5 border-l border-bdr-secondary">
                      {sub.content.map((para, j) => (
                        <p
                          key={j}
                          className="font-body text-sm sm:text-base text-txt-secondary leading-relaxed"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Bottom spacer */}
      <div className="h-16" />
    </div>
  );
}