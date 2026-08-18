import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videos = await db.homeVideo.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error("Admin GET Videos Error:", error);
    return NextResponse.json({ error: "Failed to fetch homepage videos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      badge,
      videoUrl,
      posterUrl,
      ctaText,
      ctaLink,
      secondaryCtaText,
      secondaryCtaLink,
      specs,
      order = 0,
      isActive = true,
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and Video URL are required fields" },
        { status: 400 }
      );
    }

    const newVideo = await db.homeVideo.create({
      data: {
        title: String(title).trim(),
        subtitle: subtitle ? String(subtitle).trim() : null,
        badge: badge ? String(badge).trim() : "CINEMATIC FOOTWEAR ATELIER",
        videoUrl: String(videoUrl).trim(),
        posterUrl: posterUrl ? String(posterUrl).trim() : null,
        ctaText: ctaText ? String(ctaText).trim() : "EXPLORE COLLECTION",
        ctaLink: ctaLink ? String(ctaLink).trim() : "/shop",
        secondaryCtaText: secondaryCtaText ? String(secondaryCtaText).trim() : "View In Lookbook",
        secondaryCtaLink: secondaryCtaLink ? String(secondaryCtaLink).trim() : "/gallery",
        specs: typeof specs === "string" ? specs : JSON.stringify(specs || []),
        order: Number(order) || 0,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, video: newVideo }, { status: 201 });
  } catch (error) {
    console.error("Admin POST Video Error:", error);
    return NextResponse.json({ error: "Failed to create homepage video" }, { status: 500 });
  }
}
