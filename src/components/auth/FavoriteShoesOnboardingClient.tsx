"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  ArrowRight,
  Brain,
  Zap,
  Footprints,
  Compass,
  Award,
  Layers,
  Flame,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface ShoeCategoryOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
}

const SHOE_CATEGORIES: ShoeCategoryOption[] = [
  {
    id: "sneakers",
    label: "Sneakers",
    icon: Flame,
    tagline: "Streetwear & Low-Tops",
    description: "High-heat street silhouettes, retro classics, and luxury low-tops.",
  },
  {
    id: "running",
    label: "Running",
    icon: Zap,
    tagline: "Carbon Plate & Speed",
    description: "Marathon carbon-plated road racers and supercritical tempo trainers.",
  },
  {
    id: "sports",
    label: "Sports",
    icon: Footprints,
    tagline: "Court & Cross-Training",
    description: "Court agility, basketball high-tops, and gym training stability.",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: Compass,
    tagline: "Everyday Distinction",
    description: "Effortless casual elegance, minimal sneakers, and daily comfort.",
  },
  {
    id: "boots",
    label: "Boots",
    icon: Layers,
    tagline: "Rugged & Weather-Sealed",
    description: "Goodyear storm-welted leather boots and weather-resistant utility.",
  },
  {
    id: "formal",
    label: "Formal",
    icon: Award,
    tagline: "Atelier Leather & Loafers",
    description: "Handcrafted Blake-welted dress shoes, penny loafers, and oxfords.",
  },
];

interface FavoriteShoesOnboardingClientProps {
  userName: string;
}

export function FavoriteShoesOnboardingClient({ userName }: FavoriteShoesOnboardingClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(["running", "sneakers"]);
  const [submitting, setSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleSavePreferences = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "No shoe category selected",
        description: "Please pick at least one style or click 'Skip for now'.",
        type: "info",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/account/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCategories: selectedCategories,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        toast({
          title: "Style Profile Initialized!",
          description: "Your personalized storefront recommendations are ready.",
          type: "success",
        });

        // Trigger local AI event update so recommendation feeds recalculate
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("veloce:wishlist-changed", { detail: { productIds: [] } })
          );
        }

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      } else {
        toast({
          title: "Could not save preferences",
          description: "An unexpected error occurred. Please try again.",
          type: "error",
        });
        setSubmitting(false);
      }
    } catch (err) {
      toast({ title: "Network Error", type: "error" });
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      // Mark onboarding as completed without forcing preferred categories
      await fetch("/api/account/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCategories: [],
          isOnboarded: true,
        }),
      });

      toast({
        title: "Welcome to VELOCE",
        description: "You can update your shoe preferences anytime in Account Settings.",
        type: "info",
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      // Even if network fails, proceed to homepage
      router.push("/");
      router.refresh();
    }
  };

  const firstName = userName ? userName.split(" ")[0] : "Patron";

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl p-6 sm:p-12 relative overflow-hidden text-zinc-900 dark:text-white transition-all">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {isSuccess ? (
          /* Success Calibration Transition */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center space-y-5"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-display font-black text-zinc-900 dark:text-white tracking-tight">
                AI Style Profile Calibrated
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Tailoring your bespoke &quot;Recommended For You&quot; catalog with{" "}
                <span className="text-zinc-900 dark:text-white font-bold">
                  {selectedCategories.map((c) => c.toUpperCase()).join(" & ")}
                </span>{" "}
                silhouettes.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400 pt-4">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              <span>Entering VELOCE Storefront...</span>
            </div>
          </motion.div>
        ) : (
          /* Main Onboarding Setup Form */
          <div className="space-y-8 sm:space-y-10 relative z-10">
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-500 text-[11px] font-bold uppercase tracking-wider border border-brand-500/20 shadow-xs">
                <Brain className="w-3.5 h-3.5" />
                <span>AI PERSONALIZATION SETUP</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                What type of shoes do you love?
              </h1>

              <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
                Tell us your favorites so we can personalize your Veloce experience, {firstName}.
              </p>

              {/* Selection Counter Pill */}
              <div className="pt-1">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                  {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected (select one or multiple)
                </span>
              </div>
            </div>

            {/* 6 Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {SHOE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer relative group ${
                      isSelected
                        ? "bg-brand-500/10 dark:bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-400 shadow-lg shadow-brand-500/10 scale-[1.02] ring-1 ring-brand-500/30"
                        : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/80 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-brand-500 text-white shadow-sm"
                            : "border border-zinc-300 dark:border-zinc-700 bg-transparent group-hover:border-zinc-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                          {cat.label}
                        </h3>
                      </div>
                      <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                        {cat.tagline}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 sm:pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              {/* Skip Button */}
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSkipping || submitting}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSkipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Skipping...</span>
                  </>
                ) : (
                  <span>Skip for now</span>
                )}
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={submitting || isSkipping}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs sm:text-sm font-bold shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Personalizing Recommendations...</span>
                  </>
                ) : (
                  <>
                    <span>Personalize My Veloce Experience</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
