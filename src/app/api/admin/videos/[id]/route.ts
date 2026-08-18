import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await db.homeVideo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const updated = await db.homeVideo.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: String(body.title).trim() }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle ? String(body.subtitle).trim() : null }),
        ...(body.badge !== undefined && { badge: body.badge ? String(body.badge).trim() : null }),
        ...(body.videoUrl !== undefined && { videoUrl: String(body.videoUrl).trim() }),
        ...(body.posterUrl !== undefined && { posterUrl: body.posterUrl ? String(body.posterUrl).trim() : null }),
        ...(body.ctaText !== undefined && { ctaText: body.ctaText ? String(body.ctaText).trim() : null }),
        ...(body.ctaLink !== undefined && { ctaLink: body.ctaLink ? String(body.ctaLink).trim() : null }),
        ...(body.secondaryCtaText !== undefined && { secondaryCtaText: body.secondaryCtaText ? String(body.secondaryCtaText).trim() : null }),
        ...(body.secondaryCtaLink !== undefined && { secondaryCtaLink: body.secondaryCtaLink ? String(body.secondaryCtaLink).trim() : null }),
        ...(body.specs !== undefined && { specs: typeof body.specs === "string" ? body.specs : JSON.stringify(body.specs || []) }),
        ...(body.order !== undefined && { order: Number(body.order) }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
    });

    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.error("Admin PATCH Video Error:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await db.homeVideo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await db.homeVideo.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    console.error("Admin DELETE Video Error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
