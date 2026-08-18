import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFiltersClient } from "@/components/shop/ShopFiltersClient";
import { ShopPageBanner } from "@/components/storefront/ShopPageBanner";
import { AIRecommendedSection } from "@/components/storefront/AIRecommendedSection";
import { Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    search?: string;
    category?: string;
    brand?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    deal?: string;
    featured?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search, category, brand, size, minPrice, maxPrice, sort = "featured", deal, featured } = searchParams;

  const where: any = {
    status: "ACTIVE",
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (brand) {
    where.brand = { slug: brand };
  }

  if (size) {
    where.sizes = {
      some: {
        size: size,
        stock: { gt: 0 },
      },
    };
  }

  if (deal === "true") {
    where.salePrice = { not: null, gt: 0 };
  }

  if (featured === "true") {
    where.isFeatured = true;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy: any = {};
  if (sort === "price-asc") orderBy.price = "asc";
  else if (sort === "price-desc") orderBy.price = "desc";
  else if (sort === "rating") orderBy.rating = "desc";
  else if (sort === "newest") orderBy.createdAt = "desc";
  else orderBy.isFeatured = "desc";

  let products: any[] = [];
  let categories: any[] = [];
  let brands: any[] = [];
  let shopBanner: any = null;

  try {
    const data = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
          brand: true,
          sizes: true,
        },
      }),
      db.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      db.brand.findMany({
        orderBy: { name: "asc" },
      }),
      db.shopBanner.findFirst({
        where: { id: "default" },
      }),
    ]);
    products = data[0];
    categories = data[1];
    brands = data[2];
    shopBanner = data[3];
  } catch (error) {
    console.warn("⚠️ ShopPage data query fallback:", error);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TOP CINEMATIC CAMPAIGN BANNER (Image or Video from Admin) */}
      <ShopPageBanner initialBanner={shopBanner} productCount={products.length} />

      {/* 2. MAIN CATALOG WITH FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-xs text-zinc-400 py-12 text-center">Loading filters...</div>}>
          <ShopFiltersClient
            categories={categories}
            brands={brands}
            productsCount={products.length}
            currentParams={searchParams}
          >
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">No footwear matched your filters</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your price range, clearing category filters, or searching for broader terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </ShopFiltersClient>
        </Suspense>
      </div>

      {/* 3. AI PERSONALIZED RECOMMENDATION SECTION */}
      <AIRecommendedSection />
    </div>
  );
}
