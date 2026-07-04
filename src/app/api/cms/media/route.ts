import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  GET — List recent media (for the media picker)                    */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type"); // "image" | "video" | "all"
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "30", 10);

    const where: Record<string, unknown> = {};
    if (type && type !== "all") {
      where.mimeType = { startsWith: type };
    }

    const media = await db.cmsMedia.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("[CMS Media] GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}