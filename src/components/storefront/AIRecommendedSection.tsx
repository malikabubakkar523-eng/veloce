"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Brain, ArrowRight, Heart, Zap, RefreshCw } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendationItem {
  product: any;
  matchScore: number;
  matchReasons: string[];
  primaryReason: string;
}

export function AIRecommendedSection({ initialData }: { initialData?: any }) {
  const { items: wishlistItems, syncWithDatabase } = useWishlistStore();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    initialData?.recommendedForYou || []
  );
  const [learnedSummary, setLearnedSummary] = useState<string | null>(
    initialData?.learnedStyleSummary || null
  );
  const [topCategory, setTopCategory] = useState<string | null>(
    initialData?.topPreferredCategory || null
  );
  const [topColor, setTopColor] = useState<string | null>(
    initialData?.topPreferredColor || null
  );
  const [hasFavorites, setHasFavorites] = useState<boolean>(
    initialData?.hasFavorites || wishlistItems.length > 0
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch updated recommendations based on current wishlist
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const productIds = wishlistItems.map((i) => i.productId);
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlistIds: productIds }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecommendations(data.recommendedForYou || []);
          setLearnedSummary(data.learnedStyleSummary);
          setTopCategory(data.topPreferredCategory);
          setTopColor(data.topPreferredColor);
          setHasFavorites(data.hasFavorites || productIds.length > 0);
        }
      }
    } catch (err) {
      console.error("AI recommendations fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [wishlistItems]);

  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase]);

  // Listen to local & global wishlist change events for instant recalculation
  useEffect(() => {
    fetchRecommendations();

    const handleWishlistChange = () => {
      fetchRecommendations();
    };

    window.addEventListener("veloce:wishlist-changed", handleWishlistChange);
    return () => {
      window.removeEventListener("veloce:wishlist-changed", handleWishlistChange);
    };
  }, [fetchRecommendations]);

  if (recommendations.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-500/15 via-purple-500/15 to-blue-500/15 border border-brand-500/30 text-brand-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <Brain className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
            <span>AI-POWERED PERSONALIZATION</span>
            {loading && <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />}
          </div>

          <h2 className="text-xl sm:text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Recommended For You</span>
            {topCategory && (
              <span className="hidden md:inline-block text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Tailored for {topColor ? topColor.toUpperCase() + " " : ""}{topCategory.toUpperCase()}
              </span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            {hasFavorites ? (
              <span>
                {learnedSummary || "Our neural engine learned your taste from your favorited silhouettes."}
              </span>
            ) : (
              <span>
                Favorite <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" /> shoes to teach the AI your personalized style and unlock bespoke recommendations.
              </span>
            )}
          </p>
        </div>

        {/* Style Tag Badges */}
        {hasFavorites && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              {wishlistItems.length} silhouette{wishlistItems.length !== 1 ? "s" : ""} analyzed
            </span>
            <Link
              href="/wishlist"
              className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1 group"
            >
              <span>Manage Favorites</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Grid of Recommended Products */}
      <AnimatePresence mode="wait">
        <motion.div
          key={recommendations.map((r) => r.product.id).join("-")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {recommendations.map((rec) => (
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
