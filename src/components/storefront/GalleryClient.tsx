"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Eye,
  X,
  ArrowRight,
  Tag,
  Camera,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Search,
  Maximize2,
  Check,
  Compass,
  Flame,
  User,
  Users,
  Baby,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveSync } from "@/lib/useLiveSync";
import { useToast } from "@/components/ui/ToastProvider";

export interface GalleryItemType {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType?: string | null;
  description: string | null;
  shoeModel: string | null;
  link?: string | null;
  order: number;
  tags?: string[];
  photographer?: string;
  location?: string;
  likes?: number;
}

export function GalleryClient({ initialItems }: { initialItems: GalleryItemType[] }) {
  const [items, setItems] = useState<GalleryItemType[]>(initialItems || []);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toast } = useToast();

  // Load liked items from localStorage
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem("veloce_gallery_likes");
      if (savedLikes) {
        setLikedMap(JSON.parse(savedLikes));
      }
    } catch {
      // ignore
    }

    // Initialize counts
    const initialCounts: Record<string, number> = {};
    items.forEach((item) => {
      initialCounts[item.id] = item.likes || Math.floor(Math.random() * 200 + 150);
    });
    setLikesCountMap(initialCounts);
  }, [items]);

  // Live Sync Subscription: auto refresh gallery list on admin updates
  useLiveSync("GALLERY", async () => {
    try {
      const res = await fetch("/api/content/gallery", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
      }
    } catch {
      // ignore
    }
  });

  const categories = [
    { label: "All Curations", value: "ALL", icon: Sparkles, count: items.length },
    {
      label: "Men's Collection",
      value: "MEN",
      icon: User,
      count: items.filter((i) => i.category.toUpperCase() === "MEN").length,
    },
    {
      label: "Women's Runway",
      value: "WOMEN",
      icon: Sparkles,
      count: items.filter((i) => i.category.toUpperCase() === "WOMEN").length,
    },
    {
      label: "Kids & Youth",
      value: "KIDS",
      icon: Baby,
      count: items.filter((i) => i.category.toUpperCase() === "KIDS").length,
    },
    {
      label: "Editorial & Track",
      value: "EDITORIAL",
      icon: Camera,
      count: items.filter(
        (i) => i.category.toUpperCase() === "EDITORIAL" || i.category.toUpperCase() === "STREETWEAR"
      ).length,
    },
  ];

  const filteredItems = items.filter((item) => {
    const itemCat = item.category.toUpperCase();
    const matchesCategory =
      activeCategory === "ALL" ||
      itemCat === activeCategory ||
      (activeCategory === "EDITORIAL" && (itemCat === "EDITORIAL" || itemCat === "STREETWEAR"));

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.shoeModel && item.shoeModel.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  const selectedItem = selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;

  const handleNextItem = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex === null || filteredItems.length === 0) return;
    setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
  };

  const handlePrevItem = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex === null || filteredItems.length === 0) return;
    setSelectedItemIndex((selectedItemIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItemIndex === null) return;
      if (e.key === "Escape") setSelectedItemIndex(null);
      if (e.key === "ArrowRight") handleNextItem();
      if (e.key === "ArrowLeft") handlePrevItem();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItemIndex, filteredItems.length]);

  const toggleLike = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const isCurrentlyLiked = !!likedMap[itemId];
    const newLiked = !isCurrentlyLiked;
    const updatedMap = { ...likedMap, [itemId]: newLiked };
    setLikedMap(updatedMap);

    try {
      localStorage.setItem("veloce_gallery_likes", JSON.stringify(updatedMap));
    } catch {
      // ignore
    }

    setLikesCountMap((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 200) + (newLiked ? 1 : -1),
    }));

    toast({
      title: newLiked ? "Added to Liked Looks ❤️" : "Removed from Liked Looks",
      description: newLiked ? "Saved in your style curation." : "Lookbook item unliked.",
      type: newLiked ? "success" : "info",
    });
  };

  const shareLook = async (e: React.MouseEvent, item: GalleryItemType) => {
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
    <div className="space-y-8 sm:space-y-10">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills (Touch-friendly & Horizontal Scrolling on Mobile) */}
        <div className="flex items-center justify-start gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-lg scale-[1.02] border border-transparent"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-500" : "text-zinc-400"}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-900"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search within Lookbook */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search looks, shoes, styles..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Responsive Lookbook Grid (2-column compact on mobile) */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Camera className="w-10 h-10 text-zinc-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            No lookbook items found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try switching categories or clearing your search term to view all curated styles.
          </p>
          <button
            onClick={() => {
              setActiveCategory("ALL");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredItems.map((item, index) => {
            const isLiked = !!likedMap[item.id];
            const likesCount = likesCountMap[item.id] || 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
                onClick={() => setSelectedItemIndex(index)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 aspect-[4/5] cursor-pointer shadow-md hover:shadow-2xl border border-zinc-200/80 dark:border-zinc-800/90 transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] select-none"
              >
                {/* Gallery Image / Video with Smooth Presentation */}
                {(item.mediaType === "video" || !!item.videoUrl) && !!item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    poster={item.imageUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                  />
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                  />
                )}

                {/* Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/20 opacity-85 group-hover:opacity-90 transition-opacity" />

                {/* Top Action Pills */}
                <div className="absolute top-2 sm:top-3 inset-x-2 sm:inset-x-3 z-10 flex items-center justify-between pointer-events-none">
                  {/* Category Tag */}
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-brand-400 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider border border-zinc-800/80 shadow-md">
                    {item.category === "KIDS"
                      ? "KIDS"
                      : item.category === "WOMEN"
                      ? "WOMEN"
                      : item.category === "MEN"
                      ? "MEN"
                      : item.category}
                  </span>

                  {/* Top Right: Heart / Like & Share */}
                  <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
                    <button
                      onClick={(e) => toggleLike(e, item.id)}
                      title={isLiked ? "Unlike" : "Like look"}
                      className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                        isLiked
                          ? "bg-rose-500 text-white scale-110"
                          : "bg-zinc-950/70 text-zinc-300 hover:text-white hover:bg-zinc-900"
                      }`}
                      aria-label="Like Look"
                    >
                      <Heart className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${isLiked ? "fill-white" : ""}`} />
                    </button>

                    <button
                      onClick={(e) => shareLook(e, item)}
                      title="Copy Look Link"
                      className="p-1.5 sm:p-2 rounded-full bg-zinc-950/70 text-zinc-300 hover:text-white hover:bg-zinc-900 backdrop-blur-md transition-all shadow-md hidden xs:flex"
                      aria-label="Share Look"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Expand Trigger (Center on Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/25 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>View High-Res</span>
                  </div>
                </div>

                {/* Bottom Content Card */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 z-10 space-y-1 sm:space-y-1.5">
                  {item.shoeModel && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[8.5px] sm:text-[9.5px] font-mono border border-brand-500/30 truncate max-w-full">
                      <Tag className="w-2 sm:w-2.5 h-2 sm:h-2.5 shrink-0" />
                      <span className="truncate">{item.shoeModel}</span>
                    </div>
                  )}

                  <h3 className="text-xs sm:text-base font-bold font-display text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-300 flex items-center gap-0.5 sm:gap-1 group-hover:text-white transition-colors">
                      <span>Explore</span>
                      <ArrowRight className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-brand-400 group-hover:translate-x-1 transition-transform" />
                    </span>

                    <span className="text-[9px] sm:text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Heart className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-rose-500 fill-rose-500" />
                      {likesCount}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Fullscreen High-Resolution Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div
            onClick={() => setSelectedItemIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-zinc-950/95 backdrop-blur-2xl animate-fadeIn"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[92vh] bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col lg:flex-row overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItemIndex(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 rounded-full bg-zinc-950/80 text-white flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors border border-zinc-800 shadow-xl"
                aria-label="Close lookbook view"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Prev / Next Floating Navigation Buttons */}
              <button
                onClick={handlePrevItem}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-zinc-950/80 text-white hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center border border-zinc-800 shadow-xl"
                aria-label="Previous Look"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextItem}
                className="absolute right-3 lg:right-[380px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-zinc-950/80 text-white hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center border border-zinc-800 shadow-xl"
                aria-label="Next Look"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image / Video Display Container */}
              <div className="relative flex-1 min-h-[340px] sm:min-h-[460px] lg:min-h-full bg-zinc-950 flex items-center justify-center p-4 sm:p-8">
                {(selectedItem.mediaType === "video" || !!selectedItem.videoUrl) && !!selectedItem.videoUrl ? (
                  <video
                    key={selectedItem.videoUrl}
                    src={selectedItem.videoUrl}
                    poster={selectedItem.imageUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-h-[70vh] w-auto rounded-2xl object-contain"
                  />
                ) : (
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-contain"
                    priority
                  />
                )}
              </div>

              {/* Detail Sidebar */}
              <div className="w-full lg:w-96 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 text-white shrink-0">
                <div className="space-y-4">
                  {/* Category Pill & Likes */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-brand-500/30">
                      {selectedItem.category === "KIDS"
                        ? "KIDS & YOUTH ARCHIVE"
                        : `${selectedItem.category} LOOKBOOK ARCHIVE`}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleLike(e, selectedItem.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                          likedMap[selectedItem.id]
                            ? "bg-rose-500 text-white"
                            : "bg-zinc-800 text-zinc-300 hover:text-white"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            likedMap[selectedItem.id] ? "fill-white" : ""
                          }`}
                        />
                        <span>{likesCountMap[selectedItem.id] || 0}</span>
                      </button>

                      <button
                        onClick={(e) => shareLook(e, selectedItem)}
                        className="p-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                        title="Share look link"
                      >
                        {copiedId === selectedItem.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {selectedItem.title}
                  </h2>

                  {selectedItem.description && (
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  )}

                  {/* Featured Footwear Specs Card */}
                  {selectedItem.shoeModel && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                          FEATURED FOOTWEAR MODEL
                        </span>
                        <Tag className="w-3 h-3 text-brand-400" />
                      </div>
                      <p className="text-sm font-bold text-white">{selectedItem.shoeModel}</p>
                    </div>
                  )}

                  {/* Additional Metadata if available */}
                  {(selectedItem.location || selectedItem.photographer) && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
                      {selectedItem.location && (
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Location</span>
                          <span className="text-zinc-200">{selectedItem.location}</span>
                        </div>
                      )}
                      {selectedItem.photographer && (
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Photography</span>
                          <span className="text-zinc-200">{selectedItem.photographer}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom CTA to shop this look */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <Link
                    href={selectedItem.link || "/shop"}
                    onClick={() => setSelectedItemIndex(null)}
                    className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
                  >
                    <span>
                      {selectedItem.link ? "Shop This Silhouette" : "Explore Featured Shoes"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <span>Look {selectedItemIndex !== null ? selectedItemIndex + 1 : 1} of {filteredItems.length}</span>
                    <span className="text-zinc-500 font-mono">Use ← → to navigate</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
