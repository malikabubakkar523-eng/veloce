import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ success: true, items: [] });
    }

    const items = await db.wishlistItem.findMany({
      where: { userId: session.id },
      include: {
        product: {
          include: {
            images: { orderBy: { order: "asc" } },
            brand: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      items: items.map((w) => ({
        productId: w.productId,
        name: w.product.name,
        slug: w.product.slug,
        brandName: w.product.brand?.name || "VELOCE",
        price: w.product.price,
        salePrice: w.product.salePrice,
        image: w.product.images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
        rating: w.product.rating,
      })),
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ success: true, message: "Guest mode (stored locally)" });
    }

    const body = await req.json();
    const { productId, action } = body; // action: 'add' | 'remove' | 'sync'

    if (!productId && action !== "sync") {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    if (action === "sync" && Array.isArray(body.productIds)) {
      // Batch sync items from client to DB
      for (const pId of body.productIds) {
        await db.wishlistItem.upsert({
          where: {
            userId_productId: {
              userId: session.id,
              productId: pId,
            },
          },
          update: {},
          create: {
            userId: session.id,
            productId: pId,
          },
        }).catch(() => null);
      }
      return NextResponse.json({ success: true, message: "Wishlist synchronized" });
    }

    if (action === "remove") {
      await db.wishlistItem.deleteMany({
        where: {
          userId: session.id,
          productId,
        },
      });
      return NextResponse.json({ success: true, message: "Removed from favorites" });
    }

    // Default: Add to wishlist
    await db.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: session.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: session.id,
        productId,
      },
    });

    // Check if the newly favorited shoe is on sale and send an instant price-drop notice if relevant
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (product?.salePrice && product.salePrice < product.price) {
      const discountPct = Math.round(((product.price - product.salePrice) / product.price) * 100);
      const notifTitle = `⚡ Deal Alert on Favorited Shoe`;
      const notifMsg = `Great choice! "${product.name}" is currently on sale at ${discountPct}% off (Rs. ${product.salePrice.toLocaleString()}).`;

      const existingNotif = await db.notification.findFirst({
        where: {
          userId: session.id,
          productId: product.id,
          title: notifTitle,
        },
      });

      if (!existingNotif) {
        await db.notification.create({
          data: {
            userId: session.id,
            title: notifTitle,
            message: notifMsg,
            type: "DEAL",
            productId: product.id,
          },
        }).catch(() => null);
      }
    }

    return NextResponse.json({ success: true, message: "Added to favorites" });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}
