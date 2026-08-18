"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Flame,
  Maximize2,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

export function CinematicFootwearShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeSpec, setActiveSpec] = useState<number>(0);

  const videoUrl =
    "https://assets.mixkit.co/videos/preview/mixkit-athlete-getting-ready-to-run-on-the-track-42525-large.mp4";
  const posterUrl =
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&q=85";

  const specs = [
    {
      id: 0,
      badge: "CHASSIS",
      title: "Full-Length 3D Carbon Plate",
      desc: "Custom curved aerospace carbon fibre with continuous energy return and explosive toe-off leverage.",
      metric: "88.4%",
      metricLabel: "ENERGY RETURN",
    },
    {
      id: 1,
      badge: "CUSHIONING",
      title: "Supercritical Nitrogen Foam",
      desc: "Autoclave-expanded microcellular polymer delivering pillowy shock absorption and zero pack-out fatigue.",
      metric: "198g",
      metricLabel: "FEATHERLIGHT WEIGHT",
    },
    {
      id: 2,
      badge: "UPPER",
      title: "Engineered Aerodynamic Matrix",
      desc: "Laser-perforated monofilament mesh with zonal lockdown ribs for high-cadence cornering stability.",
      metric: "360°",
      metricLabel: "DYNAMIC AIRFLOW",
    },
  ];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl">
        {/* Main Video Presentation Screen */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] lg:aspect-[21/9] min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] overflow-hidden flex items-center">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* High-Contrast Gradient Vignettes for Perfect Text Legibility on all viewports */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 md:via-zinc-950/45 to-transparent pointer-events-none z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none z-[1]" />

          {/* Top Video Control Buttons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="p-2.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 text-white backdrop-blur-md border border-zinc-800 transition-all shadow-lg cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={toggleSound}
              aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
              className="p-2.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 text-white backdrop-blur-md border border-zinc-800 transition-all shadow-lg cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
            </button>
          </div>

          {/* Foreground Overlay Content */}
          <div className="relative z-10 max-w-xl p-6 sm:p-12 lg:p-16 space-y-4 text-white text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider border border-brand-500/30 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-brand-500" />
              <span>PROPULSION IN MOTION</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight leading-[1.1] text-white">
              ENGINEERED TO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                OUTPACE GRAVITY.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md">
              Every curve, seam, and carbon fibre strand is optimized inside our high-velocity biomechanical test chambers. Experience uninterrupted forward thrust.
            </p>

            {/* Interactive Specs Switcher Pills */}
            <div className="pt-2 flex flex-wrap gap-2">
              {specs.map((spec, idx) => (
                <button
                  key={spec.id}
                  onClick={() => setActiveSpec(idx)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                    activeSpec === idx
                      ? "bg-white text-zinc-950 border-white shadow-md scale-[1.02]"
                      : "bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                  }`}
                >
                  <span>{spec.title.split(" ")[0]} {spec.title.split(" ")[1]}</span>
                </button>
              ))}
            </div>

            {/* Active Spec Info Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/85 backdrop-blur-md border border-zinc-800 flex items-center justify-between gap-4 max-w-md">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-400">
                  {specs[activeSpec].badge} • {specs[activeSpec].title}
                </span>
                <p className="text-[11px] text-zinc-300 leading-snug mt-0.5 line-clamp-2">
                  {specs[activeSpec].desc}
                </p>
              </div>

              <div className="text-right shrink-0 border-l border-zinc-800 pl-3">
                <span className="text-sm sm:text-base font-black font-mono text-white block">
                  {specs[activeSpec].metric}
                </span>
                <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-mono">
                  {specs[activeSpec].metricLabel}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop?category=running"
                className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>EXPLORE MARATHON RACERS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/gallery"
                className="px-5 py-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 backdrop-blur-md flex items-center gap-1.5 transition-colors"
              >
                <span>View Full Lookbook</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
