import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ShadingType,
} from "docx";
import type { ArtTechnique } from "@/data/arts";

// FlashStep technique → .docx with grimoire aesthetic (dark-gold style)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { technique, artName, artColor } = body as {
      technique: ArtTechnique;
      artName: string;
      artColor: string;
    };

    if (!technique || !artName) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const accentColor = artColor || "2A2A35";
    const accentHex = `FF${accentColor.replace("#", "")}`;

    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: "000000" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "000000" },
      left: { style: BorderStyle.NONE, size: 0, color: "000000" },
      right: { style: BorderStyle.NONE, size: 0, color: "000000" },
    };

    const thinBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "D4AF37" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "D4AF37" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "D4AF37" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "D4AF37" },
    };

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Cormorant Garamond", size: 22, color: "E8E4E0" },
            paragraph: { spacing: { line: 312 } },
          },
          heading1: {
            run: { font: "Cinzel", size: 44, color: "D4AF37", bold: true },
            paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 120 } },
          },
          heading2: {
            run: { font: "Cinzel", size: 28, color: "D4AF37" },
            paragraph: { spacing: { before: 240, after: 120 } },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
              background: {
                color: "0A0A0F",
              },
            },
          },
          children: [
            // Title block
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({ text: technique.nameFr.toUpperCase(), font: "Cinzel", size: 44, color: "D4AF37", bold: true }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [
                new TextRun({ text: technique.nameJp, font: "Cinzel", size: 28, color: "C0B8A8", italics: true }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 60 },
              children: [
                new TextRun({ text: technique.subtitle, font: "Cormorant Garamond", size: 22, color: "B0AAA0", italics: true }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({ text: `${artName} — Rang ${technique.rank} — ${technique.style}`, font: "Cinzel", size: 20, color: "D4AF37" }),
              ],
            }),

            // Gold separator line
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: "D4AF37", space: 1 },
              },
              children: [],
            }),

            // Data Table
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: "FICHE TECHNIQUE", font: "Cinzel", size: 28, color: "D4AF37" })],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "D4AF37" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "D4AF37" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "2A2A35" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "000000" },
                left: { style: BorderStyle.NONE, size: 0, color: "000000" },
                right: { style: BorderStyle.NONE, size: 0, color: "000000" },
              },
              rows: [
                ...([
                  ["Classification", technique.classification],
                  ["Nature", technique.nature],
                  ["Vecteur", technique.vecteur],
                  ["Portée", technique.portee],
                  ["Technique parente", technique.techniqueParente],
                  ["Technique dérivée", technique.techniqueDerivee],
                ] as const).map(
                  ([label, value]) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          width: { size: 30, type: WidthType.PERCENTAGE },
                          borders: noBorder,
                          shading: { type: ShadingType.CLEAR, color: "14141E" },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: label, font: "Cinzel", size: 20, color: "D4AF37", bold: true })],
                            }),
                          ],
                        }),
                        new TableCell({
                          width: { size: 70, type: WidthType.PERCENTAGE },
                          borders: noBorder,
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: value, font: "Cormorant Garamond", size: 22, color: "E8E4E0" })],
                            }),
                          ],
                        }),
                      ],
                    })
                ),
              ],
            }),

            // Spacer
            new Paragraph({ spacing: { before: 300, after: 200 }, children: [] }),

            // Vue d'ensemble
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: "VUE D'ENSEMBLE", font: "Cinzel", size: 28, color: "D4AF37" })],
            }),
            new Paragraph({
              spacing: { after: 200, line: 312 },
              children: [
                new TextRun({ text: technique.vueEnsemble, font: "Cormorant Garamond", size: 22, color: "E8E4E0" }),
              ],
            }),

            // Effets
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: "EFFETS", font: "Cinzel", size: 28, color: "D4AF37" })],
            }),
            ...technique.effets.map(
              (effet) =>
                new Paragraph({
                  spacing: { after: 80, line: 312 },
                  indent: { left: 360 },
                  children: [
                    new TextRun({ text: "\u25CB ", font: "Cormorant Garamond", size: 22, color: "D4AF37" }),
                    new TextRun({ text: effet, font: "Cormorant Garamond", size: 22, color: "E8E4E0" }),
                  ],
                })
            ),

            // Fonctionnement
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300 },
              children: [new TextRun({ text: "FONCTIONNEMENT", font: "Cinzel", size: 28, color: "D4AF37" })],
            }),
            ...technique.fonctionnement.map(
              (etape, i) =>
                new Paragraph({
                  spacing: { after: 80, line: 312 },
                  indent: { left: 360 },
                  children: [
                    new TextRun({ text: `${String.fromCharCode(0x2460 + i)} `, font: "Cormorant Garamond", size: 22, color: "D4AF37", bold: true }),
                    new TextRun({ text: etape, font: "Cormorant Garamond", size: 22, color: "E8E4E0" }),
                  ],
                })
            ),

            // Faiblesses
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300 },
              children: [new TextRun({ text: "FAIBLESSES", font: "Cinzel", size: 28, color: "DC2626" })],
            }),
            ...technique.faiblesses.map(
              (faiblesse) =>
                new Paragraph({
                  spacing: { after: 80, line: 312 },
                  indent: { left: 360 },
                  children: [
                    new TextRun({ text: "\u2715 ", font: "Cormorant Garamond", size: 22, color: "DC2626" }),
                    new TextRun({ text: faiblesse, font: "Cormorant Garamond", size: 22, color: "B0AAA0" }),
                  ],
                })
            ),

            // Footer
            new Paragraph({ spacing: { before: 600 }, children: [] }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "D4AF37", space: 1 },
              },
              children: [
                new TextRun({ text: "ASCENSION ノミステリ RP — Archives de l'Énergie Potentielle", font: "Cinzel", size: 16, color: "706B63" }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(technique.nameFr.replace(/\s+/g, "_"))}_${technique.rank}.docx"`,
      },
    });
  } catch (error) {
    console.error("Download technique error:", error);
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}