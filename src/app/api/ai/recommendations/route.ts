import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  generatePersonalizedRecommendations,
  ProductFeature,
} from "@/lib/ai/personalizationEngine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const queryWishlistIds = searchParams.get("wishlistIds");
    const requestedWishlistIds = queryWishlistIds ? queryWishlistIds.split(",").filter(Boolean) : [];

    // 1. Fetch all active catalog products
    const rawProducts = await db.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        brand: true,
        sizes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const catalogProducts: ProductFeature[] = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      details: p.details,
      price: p.price,
      salePrice: p.salePrice,
      categoryId: p.categoryId,
      categoryName: p.category?.name || "Footwear",
      brandId: p.brandId,
      brandName: p.brand?.name || "VELOCE",
      images: p.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      rating: p.rating,
      reviewCount: p.reviewCount,
      sku: p.sku,
    }));

    // 2. Identify customer's favorited shoe IDs and onboarding category preferences
    let userFavoriteIds: string[] = [...requestedWishlistIds];
    let userPreferredCategories: string[] = [];

    if (session?.id) {
      const [dbWishlistItems, userData] = await Promise.all([
        db.wishlistItem.findMany({
          where: { userId: session.id },
          select: { productId: true },
        }),
        db.user.findUnique({
          where: { id: session.id },
          select: { preferredCategories: true },
        }),
      ]);

      const dbIds = dbWishlistItems.map((w) => w.productId);
      userFavoriteIds = Array.from(new Set([...userFavoriteIds, ...dbIds]));
      if (userData?.preferredCategories && Array.isArray(userData.preferredCategories)) {
        userPreferredCategories = userData.preferredCategories;
      }
    }

    const favoriteProducts = catalogProducts.filter((p) => userFavoriteIds.includes(p.id));

    // 3. Generate AI Personalized Recommendations (Fusing Onboarding + Favorites)
    const results = generatePersonalizedRecommendations(
      catalogProducts,
      favoriteProducts,
      userPreferredCategories,
      {
        limit: 8,
        newDropsLimit: 4,
      }
    );

    return NextResponse.json({
      success: true,
      hasFavorites: favoriteProducts.length > 0,
      favoritesCount: favoriteProducts.length,
      learnedStyleSummary: results.learnedStyleSummary,
      topPreferredCategory: results.topPreferredCategory,
      topPreferredColor: results.topPreferredColor,
      recommendedForYou: results.recommendedForYou,
      newDropsForYou: results.newDropsForYou,
    });
  } catch (error) {
    console.error("AI Recommendations API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate recommendations",
        recommendedForYou: [],
        newDropsForYou: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const { wishlistIds = [] } = body;

    // 1. Fetch active catalog products
    const rawProducts = await db.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        brand: true,
        sizes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const catalogProducts: ProductFeature[] = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      details: p.details,
      price: p.price,
      salePrice: p.salePrice,
      categoryId: p.categoryId,
      categoryName: p.category?.name || "Footwear",
      brandId: p.brandId,
      brandName: p.brand?.name || "VELOCE",
      images: p.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      rating: p.rating,
      reviewCount: p.reviewCount,
      sku: p.sku,
    }));

    // 2. Identify customer's favorited shoe IDs and onboarding preferences
    let userFavoriteIds: string[] = Array.isArray(wishlistIds) ? [...wishlistIds] : [];
    let userPreferredCategories: string[] = [];

    if (session?.id) {
      const [dbWishlistItems, userData] = await Promise.all([
        db.wishlistItem.findMany({
          where: { userId: session.id },
          select: { productId: true },
        }),
        db.user.findUnique({
          where: { id: session.id },
          select: { preferredCategories: true },
        }),
      ]);

      const dbIds = dbWishlistItems.map((w) => w.productId);
      userFavoriteIds = Array.from(new Set([...userFavoriteIds, ...dbIds]));
      if (userData?.preferredCategories && Array.isArray(userData.preferredCategories)) {
        userPreferredCategories = userData.preferredCategories;
      }
    }

    const favoriteProducts = catalogProducts.filter((p) => userFavoriteIds.includes(p.id));

    // 3. Generate AI Personalized Recommendations (Fusing Onboarding + Favorites)
    const results = generatePersonalizedRecommendations(
      catalogProducts,
      favoriteProducts,
      userPreferredCategories,
      {
        limit: 8,
        newDropsLimit: 4,
      }
    );

    return NextResponse.json({
      success: true,
      hasFavorites: favoriteProducts.length > 0,
      favoritesCount: favoriteProducts.length,
      learnedStyleSummary: results.learnedStyleSummary,
      topPreferredCategory: results.topPreferredCategory,
      topPreferredColor: results.topPreferredColor,
      recommendedForYou: results.recommendedForYou,
      newDropsForYou: results.newDropsForYou,
    });
  } catch (error) {
    console.error("AI Recommendations API Error (POST):", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate recommendations",
        recommendedForYou: [],
        newDropsForYou: [],
      },
      { status: 500 }
    );
  }
}
