"use client";

import React, { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface UserOnboardingModalProps {
  userName: string;
  onComplete?: () => void;
}

const SHOE_TYPES = [
  { id: "sneakers", label: "Sneakers", icon: Flame, desc: "High-heat street & luxury silhouettes" },
  { id: "running", label: "Running", icon: Zap, desc: "Marathon carbon plates & tempo speed" },
  { id: "sports", label: "Sports", icon: Footprints, desc: "Court agility & gym training" },
  { id: "lifestyle", label: "Lifestyle", icon: Compass, desc: "Daily refined comfort & retro chic" },
  { id: "formal", label: "Formal", icon: Award, desc: "Handcrafted Blake welted leather & loafers" },
  { id: "boots", label: "Boots", icon: Layers, desc: "Goodyear storm-welted rugged luxury" },
];

const REFERRAL_OPTIONS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "Google",
  "YouTube",
  "Friend / Family",
  "Advertisement",
  "Other",
];

export function UserOnboardingModal({ userName, onComplete }: UserOnboardingModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedShoes, setSelectedShoes] = useState<string[]>(["running", "sneakers"]);
  const [referralSource, setReferralSource] = useState<string>("Instagram");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleShoeType = (id: string) => {
    if (selectedShoes.includes(id)) {
      if (selectedShoes.length === 1) {
        toast({ title: "Please keep at least 1 preference selected", type: "info" });
        return;
      }
      setSelectedShoes(selectedShoes.filter((s) => s !== id));
    } else {
      setSelectedShoes([...selectedShoes, id]);
    }
  };

  const handleNextStep = () => {
    if (selectedShoes.length === 0) {
      toast({ title: "Please select at least one shoe type", type: "error" });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/account/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCategories: selectedShoes,
          referralSource,
        }),
      });

      if (res.ok) {
        setStep(3); // Success animation step
        toast({
          title: "AI Profile Initialized!",
          description: "Your personalized storefront recommendations are ready.",
          type: "success",
        });

        // Trigger local AI event update so recommendation feeds reload
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("veloce:wishlist-changed", { detail: { productIds: [] } }));
        }

        setTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            router.push("/");
            router.refresh();
          }
        }, 1500);
      } else {
        toast({ title: "Could not save preferences", type: "error" });
        setIsSubmitting(false);
      }
    } catch (e) {
      toast({ title: "Network error", type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-10 overflow-hidden text-zinc-900 dark:text-white">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-[11px] font-bold uppercase tracking-wider border border-brand-500/20">
            <Brain className="w-3.5 h-3.5" />
            <span>AI STYLE INITIALIZATION</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight">
            Welcome to VELOCE, {userName.split(" ")[0]}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Let our neural engine calibrate your personalized footwear curation.
          </p>

          {/* Progress Indicator */}
          {step !== 3 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === 1 ? "w-8 bg-brand-500" : "w-2 bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === 2 ? "w-8 bg-brand-500" : "w-2 bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            </div>
          )}
        </div>

        {/* Step 1: Shoe Preference (Multi-select) */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                What type of shoes do you like?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Select one or multiple footwear categories you love:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SHOE_TYPES.map((shoe) => {
                const Icon = shoe.icon;
                const isSelected = selectedShoes.includes(shoe.id);
                return (
                  <button
                    key={shoe.id}
                    type="button"
                    onClick={() => toggleShoeType(shoe.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer relative group ${
                      isSelected
                        ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 shadow-md shadow-brand-500/10 scale-[1.02]"
                        : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-brand-500 text-white"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{shoe.label}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {shoe.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer mt-4"
            >
              <span>Next: Community Referral</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Referral Source (Single-select) */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                How did you hear about Veloce?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Help us understand how you discovered our atelier:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {REFERRAL_OPTIONS.map((option) => {
                const isSelected = referralSource === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setReferralSource(option)}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20"
                        : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calibrating AI Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup & Enter Store</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success Animation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Personalized Recommendations Ready!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Redirecting you to the storefront with your bespoke {selectedShoes.join(" & ")} recommendations.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
