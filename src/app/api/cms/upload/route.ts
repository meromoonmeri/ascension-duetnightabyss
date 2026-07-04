import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ADMIN_DISCORD_ID = "722146261381415043";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
  ) {
    return null;
  }
  return session;
}

/* ------------------------------------------------------------------ */
/*  GET — List uploaded media (recent first)                          */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const media = await db.cmsMedia.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ media });
  } catch (error) {
    console.error("[CMS Upload] GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Upload a file (image, video, gif)                          */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const alt = formData.get("alt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
      "video/mp4", "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // 50MB max
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    // Save to public/uploads/cms
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cms");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/cms/${safeName}`;

    // Save to DB
    const media = await db.cmsMedia.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        alt: alt || null,
      },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("[CMS Upload] POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}