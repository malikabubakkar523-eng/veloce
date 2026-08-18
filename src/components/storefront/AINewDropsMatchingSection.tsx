"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Flame, ArrowRight, Brain } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendationItem {
  product: any;
  matchScore: number;
  matchReasons: string[];
  primaryReason: string;
}

export function AINewDropsMatchingSection({ initialData }: { initialData?: any }) {
  const { items: wishlistItems } = useWishlistStore();
  const [newDrops, setNewDrops] = useState<RecommendationItem[]>(
    initialData?.newDropsForYou || []
  );
  const [hasFavorites, setHasFavorites] = useState<boolean>(
    initialData?.hasFavorites || wishlistItems.length > 0
  );
  const [topCategory, setTopCategory] = useState<string | null>(
    initialData?.topPreferredCategory || null
  );

  const fetchNewDrops = useCallback(async () => {
    try {
      const productIds = wishlistItems.map((i) => i.productId);
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlistIds: productIds }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNewDrops(data.newDropsForYou || []);
          setHasFavorites(data.hasFavorites || productIds.length > 0);
          setTopCategory(data.topPreferredCategory);
        }
      }
    } catch (err) {
      console.error("AI new drops fetch error:", err);
    }
  }, [wishlistItems]);

  useEffect(() => {
    fetchNewDrops();

    const handleWishlistChange = () => {
      fetchNewDrops();
    };

    window.addEventListener("veloce:wishlist-changed", handleWishlistChange);
    return () => {
      window.removeEventListener("veloce:wishlist-changed", handleWishlistChange);
    };
  }, [fetchNewDrops]);

  if (newDrops.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW ARRIVALS AI CURATION</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight">
            {hasFavorites ? "New Shoes You Might Like" : "Fresh Drops From Innovation Lab"}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            {hasFavorites
              ? `Fresh SS26 releases matched specifically with your preferred silhouette aerodynamics.`
              : "Discover the latest velocity-engineered footwear fresh from our Italian workshop."}
          </p>
        </div>

        <Link
          href="/shop?sort=newest"
          className="text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 group"
        >
          <span>Explore All New Drops</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid of New Drop Matching Shoes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={newDrops.map((r) => r.product.id).join("-")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {newDrops.map((rec) => (
            <div key={rec.product.id} className="flex flex-col">
              <ProductCard
                product={rec.product}
                aiMatchScore={rec.matchScore}
                aiMatchReason={rec.primaryReason}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
