import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  computeUserStyleVector,
  extractProductColors,
  ProductFeature,
} from "@/lib/ai/personalizationEngine";

export const dynamic = "force-dynamic";

/**
 * Scans all customers' favorited shoes and triggers notifications for:
 * 1. Price drops on favorited shoes.
 * 2. New shoes released that match their favorite style.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const isGlobalScan = session?.role === "ADMIN";

    // Target specific user or all users if admin
    const userQuery = !isGlobalScan && session?.id ? { id: session.id } : { status: "ACTIVE" };

    const users = await db.user.findMany({
      where: userQuery,
      include: {
        wishlist: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                images: true,
              },
            },
          },
        },
      },
    });

    const activeProducts = await db.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        brand: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let notificationsCreated = 0;

    for (const user of users) {
      if (!user.wishlist || user.wishlist.length === 0) continue;

      const favoritedProducts: ProductFeature[] = user.wishlist.map((w) => ({
        id: w.product.id,
        name: w.product.name,
        slug: w.product.slug,
        description: w.product.description,
        details: w.product.details,
        price: w.product.price,
        salePrice: w.product.salePrice,
        categoryId: w.product.categoryId,
        categoryName: w.product.category?.name || "Footwear",
        brandName: w.product.brand?.name || "VELOCE",
        images: w.product.images.map((img) => ({ url: img.url })),
      }));

      // 1. Check for Price Drops on Favorited Shoes
      for (const fav of favoritedProducts) {
        if (fav.salePrice && fav.salePrice < fav.price) {
          const discountPct = Math.round(((fav.price - fav.salePrice) / fav.price) * 100);
          const title = `🔥 Price Drop on Favorited "${fav.name}"`;
          const message = `Good news! "${fav.name}" is now on sale for Rs. ${fav.salePrice.toLocaleString()} (-${discountPct}% off). Grab it while sizes last!`;

          const exists = await db.notification.findFirst({
            where: {
              userId: user.id,
              productId: fav.id,
              type: "DEAL",
            },
          });

          if (!exists) {
            await db.notification.create({
              data: {
                userId: user.id,
                title,
                message,
                type: "DEAL",
                productId: fav.id,
              },
            }).catch(() => null);
            notificationsCreated++;
          }
        }
      }

      // 2. Check for New Drops Matching User's Learned Style
      const styleVector = computeUserStyleVector(favoritedProducts);
      if (styleVector) {
        const topCategory = Object.entries(styleVector.categoryAffinities).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topColor = Object.entries(styleVector.colorAffinities).sort((a, b) => b[1] - a[1])[0]?.[0];

        // Find new arrival shoes (isNew: true) that match the top category and color
        const newMatchingDrops = activeProducts.filter((p) => {
          if (!p.isNew) return false;
          if (styleVector.favoriteProductIds.includes(p.id)) return false;

          const pCat = (p.category?.name || "").toLowerCase();
          const pColors = extractProductColors({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            details: p.details,
            price: p.price,
            categoryId: p.categoryId,
            images: [],
          });

          const catMatch = topCategory ? pCat.includes(topCategory) : false;
          const colorMatch = topColor ? pColors.includes(topColor) : false;

          return catMatch || (catMatch && colorMatch);
        });

        for (const drop of newMatchingDrops.slice(0, 2)) {
          const title = `⚡ New Drop Matching Your Style: "${drop.name}"`;
          const message = `Based on your favorite ${topColor ? topColor.toUpperCase() + " " : ""}${topCategory ? topCategory.toUpperCase() : "performance"} shoes, we think you'll love the new "${drop.name}".`;

          const exists = await db.notification.findFirst({
            where: {
              userId: user.id,
              productId: drop.id,
              title,
            },
          });

          if (!exists) {
            await db.notification.create({
              data: {
                userId: user.id,
                title,
                message,
                type: "NEW_DROP",
                productId: drop.id,
              },
            }).catch(() => null);
            notificationsCreated++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `AI preference scan completed. Generated ${notificationsCreated} personalized alerts.`,
      notificationsCreated,
    });
  } catch (error) {
    console.error("AI Sync Notifications Error:", error);
    return NextResponse.json({ success: false, error: "Scan failed" }, { status: 500 });
  }
}
