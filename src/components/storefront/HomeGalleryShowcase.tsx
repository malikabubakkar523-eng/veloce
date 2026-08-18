"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ArrowRight,
  Sparkles,
  Tag,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Baby,
  Heart,
  X,
  Share2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryLookbookItem, CURATED_GALLERY_ITEMS } from "@/lib/galleryData";
import { useToast } from "@/components/ui/ToastProvider";

interface CategorySection {
  id: "MEN" | "WOMEN" | "KIDS";
  title: string;
  subtitle: string;
  icon: any;
  badge: string;
  color: string;
  items: GalleryLookbookItem[];
}

export function HomeGalleryShowcase({ items }: { items?: any[] }) {
  const sourceItems: GalleryLookbookItem[] =
    items && items.length > 0 ? (items as any) : CURATED_GALLERY_ITEMS;

  const [selectedItem, setSelectedItem] = useState<GalleryLookbookItem | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const menItems = sourceItems.filter((i) => i.category.toUpperCase() === "MEN");
  const womenItems = sourceItems.filter((i) => i.category.toUpperCase() === "WOMEN");
  const kidsItems = sourceItems.filter((i) => i.category.toUpperCase() === "KIDS");

  const categories: CategorySection[] = [
    {
      id: "MEN",
      title: "Men's Atelier & High-Performance",
      subtitle: "Tokyo underground runners, Berlin marathon racers & handcrafted Tuscan leathers",
      icon: User,
      badge: "MEN'S SILHOUETTES",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      items: menItems,
    },
    {
      id: "WOMEN",
      title: "Women's Runway & Studio Luxe",
      subtitle: "Paris Fashion Week editorials, Milan stagers & high-cadence tempo striders",
      icon: Sparkles,
      badge: "WOMEN'S RUNWAY",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      items: womenItems,
    },
    {
      id: "KIDS",
      title: "Kids & Youth Athletes",
      subtitle: "Ergonomic arch support, responsive playground bounce & mini mountain explorers",
      icon: Baby,
      badge: "KIDS & JUNIOR",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      items: kidsItems,
    },
  ];

  const toggleLike = (e: React.MouseEvent, item: GalleryLookbookItem) => {
    e.stopPropagation();
    const newLiked = !likedMap[item.id];
    setLikedMap((prev) => ({ ...prev, [item.id]: newLiked }));
    toast({
      title: newLiked ? "Added to Liked Looks ❤️" : "Removed from Liked Looks",
      description: item.title,
      type: newLiked ? "success" : "info",
    });
  };

  const shareLook = async (e: React.MouseEvent, item: GalleryLookbookItem) => {
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/gallery?look=${item.id}` : "";
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2500);
        toast({
          title: "Look Link Copied! 🔗",
          description: "Direct lookbook link copied to clipboard.",
          type: "success",
        });
      }
    } catch {
      // fallback
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[11px] font-bold uppercase tracking-widest mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>SS26 LOOKBOOK & RUNWAY SPOTLIGHT</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-zinc-900 dark:text-white tracking-tight">
            Style & Performance Gallery
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Curated styling and high-motion footwear showcases organized by Men&apos;s, Women&apos;s, and Kids silhouettes. Swipe horizontally to explore each category.
          </p>
        </div>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:scale-105 transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <span>View All in Gallery</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Category Rows (Men, Women, Kids in separate horizontal scrolling rails) */}
      <div className="space-y-10 sm:space-y-12">
        {categories.map((category) => (
          <CategoryRail
            key={category.id}
            category={category}
            likedMap={likedMap}
            toggleLike={toggleLike}
            onSelect={(item) => setSelectedItem(item)}
          />
        ))}
      </div>

      {/* Footer Explore All Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              Looking for more style inspiration?
            </h4>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Browse our complete SS26 Editorial Runway Lookbook with high-res zoom & direct shoe styling.
            </p>
          </div>
        </div>

        <Link
          href="/gallery"
          className="px-6 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:scale-105 transition-all flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span>Open Full Gallery</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* High-Resolution Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col md:flex-row overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-950/80 text-white flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors border border-zinc-800 shadow-xl cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Media Preview Container */}
              <div className="relative flex-1 min-h-[260px] sm:min-h-[380px] md:min-h-[480px] bg-zinc-950 flex items-center justify-center p-4">
                {(selectedItem as any).videoUrl ? (
                  <video
                    src={(selectedItem as any).videoUrl}
                    poster={selectedItem.imageUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full max-h-[460px] object-contain rounded-xl"
                  />
                ) : (
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-contain p-2"
                  />
                )}
              </div>

              {/* Details Column */}
              <div className="w-full md:w-80 lg:w-96 p-5 sm:p-6 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-brand-500/30">
                      {selectedItem.category === "KIDS"
                        ? "KIDS & YOUTH"
                        : selectedItem.category === "WOMEN"
                        ? "WOMEN"
                        : "MEN"}
                    </span>
                    {selectedItem.location && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {selectedItem.location}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-display text-white">
                    {selectedItem.title}
                  </h3>

                  {selectedItem.shoeModel && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono border border-zinc-700">
                      <Tag className="w-3 h-3 text-brand-400" />
                      <span>{selectedItem.shoeModel}</span>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    {selectedItem.description}
                  </p>

                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedItem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center gap-2.5">
                  <Link
                    href={selectedItem.link || "/shop"}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                  >
                    <span>Shop Silhouette</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={(e) => toggleLike(e, selectedItem)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      likedMap[selectedItem.id]
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                    }`}
                    title="Like Look"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedMap[selectedItem.id] ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                  </button>

                  <button
                    onClick={(e) => shareLook(e, selectedItem)}
                    className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    title="Share Look"
                  >
                    {copiedId === selectedItem.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CategoryRail({
  category,
  likedMap,
  toggleLike,
  onSelect,
}: {
  category: CategorySection;
  likedMap: Record<string, boolean>;
  toggleLike: (e: React.MouseEvent, item: GalleryLookbookItem) => void;
  onSelect: (item: GalleryLookbookItem) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = category.icon;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Category Rail Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className={`p-1.5 rounded-lg border ${category.color} shrink-0`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-display">
                {category.title}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                {category.items.length} Looks
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 hidden xs:block">
              {category.subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Scroll Arrows (Desktop) & View All Link */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <button
              onClick={scrollLeft}
              aria-label={`Scroll ${category.title} Left`}
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollRight}
              aria-label={`Scroll ${category.title} Right`}
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href={`/gallery?cat=${category.id}`}
            className="text-[11px] font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scrollable Rail (Compact cards on mobile, touch pan, snap) */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar snap-x snap-mandatory touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {category.items.map((item, index) => {
          const isLiked = !!likedMap[item.id];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
              onClick={() => onSelect(item)}
              className="group relative flex-none w-[190px] xs:w-[215px] sm:w-[245px] md:w-[270px] aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer snap-start select-none"
            >
              {/* Media Layer */}
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 215px, 270px"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                />
              )}

              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/25 opacity-85 group-hover:opacity-90 transition-opacity" />

              {/* Top Tags & Action */}
              <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
                <span className="px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-brand-400 text-[9px] font-bold uppercase tracking-wider border border-zinc-800 shadow-sm">
                  {item.category === "KIDS"
                    ? "KIDS"
                    : item.category === "WOMEN"
                    ? "WOMEN"
                    : "MEN"}
                </span>

                <button
                  onClick={(e) => toggleLike(e, item)}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-sm ${
                    isLiked
                      ? "bg-rose-500 text-white scale-110"
                      : "bg-zinc-950/70 text-zinc-300 hover:text-white hover:bg-zinc-900"
                  }`}
                  aria-label="Like look"
                >
                  <Heart className={`w-3 h-3 ${isLiked ? "fill-white" : ""}`} />
                </button>
              </div>

              {/* Quick View Hover Indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-lg">
                  <Eye className="w-3 h-3" />
                  <span>High-Res</span>
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-10 space-y-1">
                {item.shoeModel && (
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[9px] font-mono border border-brand-500/30 truncate max-w-full">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{item.shoeModel}</span>
                  </div>
                )}

                <h4 className="text-xs sm:text-sm font-bold font-display text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] font-semibold text-zinc-300 flex items-center gap-0.5 group-hover:text-white transition-colors">
                    <span>Lookbook</span>
                    <ArrowRight className="w-2.5 h-2.5 text-brand-400 group-hover:translate-x-0.5 transition-transform" />
                  </span>

                  {item.likes && (
                    <span className="text-[9px] font-mono text-zinc-400 flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                      {item.likes}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

