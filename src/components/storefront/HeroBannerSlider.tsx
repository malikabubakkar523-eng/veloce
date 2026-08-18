"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Feather,
  Shield,
} from "lucide-react";
import { HeroShoeBackground } from "./HeroShoeBackground";

import { useLiveSync } from "@/lib/useLiveSync";

export interface HeroSlideData {
  id: string;
  heading: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType?: string | null; // "image" | "video"
  ctaText: string | null;
  ctaLink: string | null;
}

export function HeroBannerSlider({ slides: initialSlides }: { slides: HeroSlideData[] }) {
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Live Sync Subscription: instantly updates hero slides when admin changes them in another browser
  useLiveSync("HERO", async () => {
    try {
      const res = await fetch("/api/content/hero", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.banners) {
          setSlides(data.banners);
          setCurrentIndex((prev) => (data.banners.length > 0 ? prev % data.banners.length : 0));
        }
      }
    } catch (e) {
      // ignore
    }
  });

  const hasCustomSlides = slides && slides.length > 0;

  // Autoplay timer (6.5s) with pause on hover
  useEffect(() => {
    if (!hasCustomSlides || slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [hasCustomSlides, slides.length, isPaused]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && slides.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe && slides.length > 1) {
      setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // If no database-configured custom slides, fallback cleanly to existing cinematic shoe background
  if (!hasCustomSlides) {
    return (
      <section className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[600px] xl:min-h-[640px] flex items-center pt-2 sm:pt-10 pb-12 sm:pb-20 overflow-hidden bg-zinc-950 text-white select-none">
        <HeroShoeBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-6 text-left -mt-10 sm:mt-0">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-zinc-900/90 text-brand-400 text-[11px] sm:text-xs font-bold border border-zinc-800 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" style={{ animationDuration: "6s" }} />
              <span>SPRING / SUMMER 2026 ARCHIVE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-[1.08]">
              ENGINEERED <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                PROPULSION.
              </span>{" "}
              <br />
              TAILORED FORM.
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-zinc-300 sm:text-zinc-400 max-w-lg leading-relaxed">
              Step into the apex of international footwear. Supercritical nitrogen foam fused with aerospace-grade carbon fibre plates, handcrafted with Italian precision.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 max-w-xs sm:max-w-none">
              <Link
                href="/shop"
                className="px-7 py-3.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold shadow-2xl shadow-white/10 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                <span>SHOP THE COLLECTION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];
  const isVideoSlide = (currentSlide.mediaType === "video" || !!currentSlide.videoUrl) && !!currentSlide.videoUrl;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[600px] xl:min-h-[640px] flex items-center pt-2 sm:pt-10 pb-12 sm:pb-20 overflow-hidden bg-zinc-950 text-white select-none"
    >
      {/* Background Slides with AnimatePresence */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {isVideoSlide ? (
              <video
                key={currentSlide.videoUrl || ""}
                src={currentSlide.videoUrl || ""}
                poster={currentSlide.imageUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.heading}
                fill
                priority
                sizes="100vw"
                className="object-cover object-bottom sm:object-center"
              />
            )}
            {/* Cinematic High-Contrast Gradient Layering (Mobile-optimized) */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 sm:via-zinc-950/80 md:via-zinc-950/60 lg:via-zinc-950/40 to-zinc-950/30 sm:to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-zinc-950/90 via-zinc-950/50 to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Foreground Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-6 text-left -mt-10 sm:mt-0"
          >
            {/* Badge */}
            {currentSlide.badge && (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-zinc-900/90 text-brand-400 text-[11px] sm:text-xs font-bold border border-zinc-800 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" style={{ animationDuration: "6s" }} />
                <span>{currentSlide.badge}</span>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-[1.08] whitespace-pre-line">
              {currentSlide.heading}
            </h1>

            {/* Subtitle */}
            {currentSlide.subtitle && (
              <p className="text-xs sm:text-sm lg:text-base text-zinc-300 sm:text-zinc-400 max-w-lg leading-relaxed">
                {currentSlide.subtitle}
              </p>
            )}

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 max-w-xs sm:max-w-none">
              <Link
                href={currentSlide.ctaLink || "/shop"}
                className="px-7 py-3.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold shadow-2xl shadow-white/10 hover:scale-105 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{currentSlide.ctaText || "SHOP THE COLLECTION"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls (if multiple slides active) */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-zinc-800 shadow-xl">
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            aria-label="Previous Slide"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5 px-1.5">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-brand-500"
                    : "w-2 bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
            aria-label="Next Slide"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
