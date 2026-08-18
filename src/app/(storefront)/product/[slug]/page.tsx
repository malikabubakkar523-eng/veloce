import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductDetailsClient } from "@/components/product/ProductDetailsClient";
import { ProductCard } from "@/components/storefront/ProductCard";
import { RecentlyViewedSection } from "@/components/product/RecentlyViewedSection";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await db.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        brand: true,
        sizes: { orderBy: { size: "asc" } },
        variants: true,
        reviews: { orderBy: { createdAt: "desc" } },
      },
    });

    if (product) {
      relatedProducts = await db.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: "ACTIVE",
        },
        take: 4,
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
          brand: true,
          sizes: true,
        },
      });
    }
  } catch (error) {
    console.warn("⚠️ ProductPage query fallback:", error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white">Home</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href="/shop" className="hover:text-zinc-900 dark:hover:text-white">Shop</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        {product.category && (
          <>
            <Link
              href={`/category/${product.category.slug}`}
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
          </>
        )}
        <span className="text-zinc-900 dark:text-white font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Component */}
      <ProductDetailsClient product={product} />

      {/* Related Shoes Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
              EXPLORE SIMILAR SILHOUETTES
            </span>
            <h2 className="text-2xl font-display font-black text-zinc-900 dark:text-white tracking-tight mt-1">
              You May Also Admire
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Footwear Carousel */}
      <RecentlyViewedSection currentProductId={product.id} />
    </div>
  );
}
