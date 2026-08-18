import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const videoCount = await db.homeVideo.count();
    if (videoCount === 0) {
      await db.homeVideo.create({
        data: {
          title: "ENGINEERED TO OUTPACE GRAVITY.",
          subtitle: "Every curve, seam, and carbon fibre strand is optimized inside our high-velocity biomechanical test chambers. Experience uninterrupted forward thrust.",
          badge: "PROPULSION IN MOTION",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-athlete-getting-ready-to-run-on-the-track-42525-large.mp4",
          posterUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&q=85",
          ctaText: "EXPLORE MARATHON RACERS",
          ctaLink: "/shop?category=running",
          secondaryCtaText: "View Full Lookbook",
          secondaryCtaLink: "/gallery",
          order: 0,
          isActive: true,
        },
      });
    }

    const [userCount, productCount, categoryCount, orderCount, totalVideos] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.category.count(),
      db.order.count(),
      db.homeVideo.count(),
    ]);

    return NextResponse.json({
      success: true,
      status: "HEALTHY",
      message: "Database connection active and persistent.",
      statistics: {
        users: userCount,
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        videos: totalVideos,
      },
    });
  } catch (error: any) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        error: error.message || "Failed to reach persistent PostgreSQL database.",
      },
      { status: 500 }
    );
  }
}
