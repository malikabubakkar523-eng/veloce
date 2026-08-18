"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, Star, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/storefront/ProductCard";

interface StoredProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  image: string;
  brandName?: string;
  categoryName?: string;
  rating?: number;
}

export function RecentlyViewedSection({ currentProductId }: { currentProductId?: string }) {
  const [recentProducts, setRecentProducts] = useState<StoredProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("veloce_recently_viewed");
      if (stored) {
        const parsed: StoredProduct[] = JSON.parse(stored);
        const filtered = parsed.filter((p) => p.id !== currentProductId).slice(0, 4);
        setRecentProducts(filtered);
      }
    } catch (e) {}
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 dark:border-zinc-800/80 pt-12 mt-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-display font-black text-zinc-900 dark:text-white tracking-tight">
              Recently Viewed Footwear
            </h3>
            <p className="text-xs text-zinc-500">Silhouettes you browsed recently</p>
          </div>
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        {recentProducts.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="group flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-4 transition-all hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div className="relative aspect-square w-full rounded-xl bg-zinc-50 dark:bg-zinc-950/60 overflow-hidden mb-3 p-3 flex items-center justify-center">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 150px, 250px"
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider">
                {p.brandName || "VELOCE"}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                {p.name}
              </h4>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
                  {formatPrice(p.salePrice || p.price)}
                </span>
                {p.salePrice && (
                  <span className="text-[10px] text-zinc-400 line-through font-mono">
                    {formatPrice(p.price)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
