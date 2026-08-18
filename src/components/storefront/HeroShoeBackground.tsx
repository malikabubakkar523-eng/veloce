"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Feather, Shield, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroShoe {
  id: string;
  name: string;
  image: string;
  alt: string;
  chip1: { title: string; desc: string; icon: any; color: string };
  chip2: { title: string; desc: string; icon: any; color: string };
  chip3: { text: string };
  glowColor: string;
}

const HERO_SHOES: HeroShoe[] = [
  {
    id: "zoomx-black",
    name: "VELOCE ZOOM-X CARBON",
    image: "/images/hero-zoomx-shoe.png",
    alt: "VELOCE Nike ZoomX Carbon Propulsion Hero",
    chip1: {
      title: "PROPULSION",
      desc: "Full Carbon Plate",
      icon: Zap,
      color: "bg-brand-500/20 text-brand-400",
    },
    chip2: {
      title: "FEATHERWEIGHT",
      desc: "198g Superlight Chassis",
      icon: Feather,
      color: "bg-emerald-500/20 text-emerald-400",
    },
    chip3: {
      text: "ZoomX Nitrogen Foam",
    },
    glowColor: "from-brand-600/25 via-rose-500/15 to-transparent",
  },
  {
    id: "airmax-green",
    name: "VELOCE AIR-MAX HYPER-GREEN",
    image: "/images/hero-green-shoe.png",
    alt: "VELOCE Air Max Hyper-Green Performance Runner",
    chip1: {
      title: "VIS-AIR CHAMBER",
      desc: "Neon Cushioning Pods",
      icon: Sparkles,
      color: "bg-emerald-500/20 text-emerald-400",
    },
    chip2: {
      title: "DYNAMIC MESH",
      desc: "High-Breathability Chassis",
      icon: Shield,
      color: "bg-lime-500/20 text-lime-400",
    },
    chip3: {
      text: "Hyper-Responsive Air Unit",
    },
    glowColor: "from-emerald-500/25 via-lime-500/15 to-transparent",
  },
];

export function HeroShoeBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll / cycle shoes smoothly every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SHOES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const currentShoe = HERO_SHOES[currentIndex];
  const Chip1Icon = currentShoe.chip1.icon;
  const Chip2Icon = currentShoe.chip2.icon;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Dynamic Ambient Background Glows */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${currentShoe.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute top-1/3 right-[5%] lg:right-[15%] -translate-y-1/2 w-[350px] sm:w-[550px] lg:w-[700px] h-[350px] sm:h-[550px] lg:h-[700px] rounded-full bg-gradient-to-tr ${currentShoe.glowColor} blur-[130px] animate-pulse`}
          style={{ animationDuration: "5s" }}
        />
      </AnimatePresence>

      <div className="absolute top-1/4 right-[25%] w-[300px] lg:w-[450px] h-[300px] lg:h-[450px] rounded-full bg-brand-500/10 blur-[100px]" />

      {/* Orbital Halo Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="hidden sm:block absolute right-[2%] lg:right-[8%] xl:right-[12%] top-1/3 -translate-y-1/2 w-[500px] lg:w-[680px] xl:w-[800px] h-[500px] lg:h-[680px] xl:h-[800px] rounded-full border border-dashed border-zinc-800/60 pointer-events-none opacity-40"
      />

      {/* Balanced Floating Shoe Container: lowered on mobile, perfectly scaled on PC */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-end">
        <div className="absolute -right-2 sm:right-2 md:right-8 lg:right-4 xl:right-8 top-[62%] sm:top-[50%] md:top-[44%] lg:top-[46%] xl:top-[48%] -translate-y-1/2 w-[270px] xs:w-[320px] sm:w-[420px] md:w-[500px] lg:w-[560px] xl:w-[640px] h-[210px] xs:h-[250px] sm:h-[330px] md:h-[390px] lg:h-[430px] xl:h-[490px] z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShoe.id}
              initial={{ opacity: 0, x: 70, scale: 0.92 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                y: [0, -16, 0],
                rotate: [-14, -10, -14],
              }}
              exit={{ opacity: 0, x: -70, scale: 0.92 }}
              transition={{
                opacity: { duration: 0.65, ease: "easeOut" },
                x: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.65, ease: "easeOut" },
                y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative w-full h-full filter drop-shadow-[0_35px_50px_rgba(0,0,0,0.85)] dark:drop-shadow-[0_45px_70px_rgba(0,0,0,0.95)]"
            >
              {/* Shoe Image */}
              <Image
                src={currentShoe.image}
                alt={currentShoe.alt}
                fill
                priority
                sizes="(max-width: 640px) 420px, (max-width: 1024px) 680px, 920px"
                className="object-contain transform hover:scale-105 transition-transform duration-700 pointer-events-auto"
              />

              {/* Floating Spec Chip 1 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="hidden lg:flex absolute top-8 left-4 xl:left-8 z-20 px-3.5 py-2 rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/90 shadow-2xl items-center gap-2.5 pointer-events-auto"
              >
                <div className={`w-7 h-7 rounded-xl ${currentShoe.chip1.color} flex items-center justify-center`}>
                  <Chip1Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">{currentShoe.chip1.title}</p>
                  <p className="text-xs font-bold text-white">{currentShoe.chip1.desc}</p>
                </div>
              </motion.div>

              {/* Floating Spec Chip 2 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="hidden lg:flex absolute bottom-12 right-6 xl:right-14 z-20 px-3.5 py-2 rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/90 shadow-2xl items-center gap-2.5 pointer-events-auto"
              >
                <div className={`w-7 h-7 rounded-xl ${currentShoe.chip2.color} flex items-center justify-center`}>
                  <Chip2Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">{currentShoe.chip2.title}</p>
                  <p className="text-xs font-bold text-white">{currentShoe.chip2.desc}</p>
                </div>
              </motion.div>

              {/* Floating Spec Chip 3 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="hidden xl:flex absolute -bottom-4 left-24 z-20 px-3.5 py-1.5 rounded-full bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/90 shadow-xl items-center gap-2 pointer-events-auto"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-[11px] font-semibold text-zinc-200">{currentShoe.chip3.text}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Interactive Slide Controls & Indicators */}
          <div className="absolute -bottom-6 xs:-bottom-8 sm:bottom-0 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-8 z-30 flex items-center gap-2 pointer-events-auto bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800/80 shadow-lg">
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? HERO_SHOES.length - 1 : prev - 1))
              }
              aria-label="Previous Shoe"
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-1">
              {HERO_SHOES.map((shoe, idx) => (
                <button
                  key={shoe.id}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 bg-brand-500"
                      : "w-2 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % HERO_SHOES.length)}
              aria-label="Next Shoe"
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Seamless Ambient Dark Vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 md:via-zinc-950/65 lg:via-zinc-950/35 to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-[1]" />
    </div>
  );
}
