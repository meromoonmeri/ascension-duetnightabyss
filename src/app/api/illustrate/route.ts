import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ═══════════════════════════════════════════════════════════════
//  Helper: pick N random items from an array
// ═══════════════════════════════════════════════════════════════

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

// ═══════════════════════════════════════════════════════════════
//  Helper: call Cloudflare Workers AI for image generation
// ═══════════════════════════════════════════════════════════════

async function generateWithCloudflareAI(
  prompt: string
): Promise<{ base64: string; width: number; height: number }> {
  const cfToken = process.env['CF_API_TOKEN'];
  const cfAccountId = process.env['CF_ACCOUNT_ID'];

  if (!cfToken || !cfAccountId) {
    throw new Error(
      "CF_API_TOKEN et CF_ACCOUNT_ID doivent être configurés comme variables d'environnement"
    );
  }

  // Use Cloudflare's text-to-image model
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/v1/text-to-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${prompt}, high quality, detailed, fantasy art`,
        image_size: "1024x1024",
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Cloudflare AI image gen error:", response.status, errText);
    throw new Error(`Cloudflare AI a retourné une erreur (${response.status})`);
  }

  // Cloudflare returns the image directly as binary
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const base64 = imageBuffer.toString("base64");

  return { base64, width: 1024, height: 1024 };
}

// ═══════════════════════════════════════════════════════════════
//  POST — Generate an illustration for a technique/item
// ═══════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      element,
      rank,
      style,
      rarity,
      description,
      customPrompt,
      size,
      category,
    } = body as {
      name: string;
      element?: string;
      rank?: string;
      style?: string;
      rarity?: string;
      description?: string;
      customPrompt?: string;
      size?: string;
      category?: string;
    };

    if (!name) {
      return NextResponse.json(
        { error: "Le champ `name` est requis" },
        { status: 400 }
      );
    }

    // ── 1. Fetch config for default size ─────────────────────
    let imageSize = size || "1024x1024";
    if (!size) {
      const sizeConfig = await db.siteConfig.findUnique({
        where: { key: "ai_illustration_size" },
      });
      if (sizeConfig?.value) imageSize = sizeConfig.value;
    }

    // ── 2. Fetch random PinterestKeywords for enrichment ─────
    const relevantCategories = [
      "style",
      "element",
      "vfx",
      "race",
      "composition",
      "mood",
      "reference",
      "weapon",
    ];

    // Auto-seed Pinterest keywords if the table is empty
    let allKeywords = await db.pinterestKeyword.findMany({
      where: {
        category: { in: relevantCategories },
        isActive: true,
      },
    });

    if (allKeywords.length === 0) {
      console.log("[ILLUSTRATE] No Pinterest keywords found, auto-seeding...");
      try {
        const { seedPinterestKeywords } = await import("./seed-pinterest");
        await seedPinterestKeywords();
        allKeywords = await db.pinterestKeyword.findMany({
          where: { category: { in: relevantCategories }, isActive: true },
        });
      } catch (seedErr) {
        console.error("[ILLUSTRATE] Auto-seed failed:", seedErr);
      }
    }

    // Weighted selection: prefer keywords matching element
    let selectedKeywords: string[] = [];
    const elementKws = element
      ? allKeywords.filter(
          (k) =>
            k.category === "element" &&
            k.keyword.toLowerCase().includes(element.toLowerCase())
        )
      : [];

    if (elementKws.length > 0) {
      selectedKeywords.push(
        ...pickRandom(elementKws, 3).map((k) => k.keyword)
      );
    }

    // Fill remaining slots with random keywords from other categories
    const remaining = allKeywords.filter(
      (k) => !selectedKeywords.includes(k.keyword)
    );
    const extraCount = 8 - selectedKeywords.length;
    if (extraCount > 0) {
      selectedKeywords.push(
        ...pickRandom(remaining, extraCount).map((k) => k.keyword)
      );
    }

    // ── 3. Build the enriched prompt ─────────────────────────
    let enrichedPrompt: string;

    if (customPrompt) {
      enrichedPrompt = customPrompt;
    } else {
      const parts: string[] = [];

      // Base: name, element, rank, fantasy art
      parts.push(name);
      if (element) parts.push(`${element} magic`);
      if (rank) parts.push(`rank ${rank} power`);
      if (style) parts.push(style);

      // Add selected Pinterest keywords (the core enrichment)
      if (selectedKeywords.length > 0) {
        parts.push(selectedKeywords.join(", "));
      }

      // Add quality and style anchors
      parts.push(
        "highly detailed, vibrant colors, dramatic lighting, epic composition, Manhwa Magic, Digital Painting, Concept Art"
      );

      // Add rarity if specified
      if (rarity) parts.push(`${rarity} rarity glow effect`);

      // Add description snippet if provided
      if (description) {
        const snippet =
          description.length > 150
            ? description.slice(0, 150) + "..."
            : description;
        parts.push(snippet);
      }

      enrichedPrompt = parts.join(", ");
    }

    // ── 4. Generate image via Cloudflare Workers AI ──────────
    const { base64, width, height } = await generateWithCloudflareAI(
      enrichedPrompt
    );

    if (!base64) {
      return NextResponse.json(
        { error: "Aucune image générée" },
        { status: 500 }
      );
    }

    // ── 5. Save image to /public/generated ───────────────────
    const generatedDir = path.join(process.cwd(), "public", "generated");
    await mkdir(generatedDir, { recursive: true });

    const safeName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 40);
    const filename = `${safeName}_${Date.now()}.png`;
    const filePath = path.join(generatedDir, filename);
    const buffer = Buffer.from(base64, "base64");

    await writeFile(filePath, buffer);

    // ── 6. Parse dimensions from size config ─────────────────
    const [widthStr, heightStr] = imageSize.split("x");
    const finalWidth = parseInt(widthStr, 10) || width;
    const finalHeight = parseInt(heightStr, 10) || height;

    // ── 7. Create GeneratedImage record ──────────────────────
    const imageRecord = await db.generatedImage.create({
      data: {
        prompt: enrichedPrompt,
        basePrompt: `${name}${element ? `, ${element}` : ""}${
          rank ? `, rank ${rank}`
        : ""}`,
        imageUrl: `/generated/${filename}`,
        width: finalWidth,
        height: finalHeight,
        fileSize: buffer.length,
        mimeType: "image/png",
        category: category ?? "technique",
        relatedId: name,
        keywords: JSON.stringify(selectedKeywords),
        model: "cloudflare-workers-ai",
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl: `/generated/${filename}`,
      prompt: enrichedPrompt,
      keywords: selectedKeywords,
      id: imageRecord.id,
    });
  } catch (error) {
    console.error("Illustrate POST error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la génération";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}