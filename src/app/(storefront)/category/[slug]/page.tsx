import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  let category: any = null;
  try {
    category = await db.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: "ACTIVE" },
          include: {
            images: { orderBy: { order: "asc" } },
            category: true,
            brand: true,
            sizes: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("⚠️ CategoryPage query fallback:", error);
  }

  if (!category) {
    category = {
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
      slug,
      description: "Collection overview and handcrafted footwear catalog.",
      image: null,
      products: [],
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-zinc-900 dark:hover:text-white">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-900 dark:text-white font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 p-6 sm:p-14 border border-zinc-800 text-white flex flex-col justify-end min-h-[190px] sm:min-h-[220px]">
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="relative z-10 space-y-1.5 sm:space-y-2 max-w-xl">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-brand-500">
            COLLECTION OVERVIEW
          </span>
          <h1 className="text-2xl sm:text-5xl font-display font-black tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Available Models ({category.products.length})
          </p>
        </div>

        {category.products.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No shoes currently available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {category.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
