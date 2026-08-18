import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const videos = await db.homeVideo.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error("Public GET Videos Error:", error);
    return NextResponse.json({ error: "Failed to fetch active videos" }, { status: 500 });
  }
}
