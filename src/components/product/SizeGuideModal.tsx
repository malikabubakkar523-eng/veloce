"use client";

import React, { useState } from "react";
import { X, Ruler, Sparkles, Check, Info, Footprints, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
}

const SIZE_CHART = [
  { eu: "39", usMen: "6.5", usWomen: "8.0", uk: "6.0", cm: "24.5", inches: "9.6" },
  { eu: "40", usMen: "7.0", usWomen: "8.5", uk: "6.5", cm: "25.0", inches: "9.8" },
  { eu: "41", usMen: "8.0", usWomen: "9.5", uk: "7.5", cm: "26.0", inches: "10.2" },
  { eu: "42", usMen: "8.5", usWomen: "10.0", uk: "8.0", cm: "26.5", inches: "10.4" },
  { eu: "43", usMen: "9.5", usWomen: "11.0", uk: "9.0", cm: "27.5", inches: "10.8" },
  { eu: "44", usMen: "10.0", usWomen: "11.5", uk: "9.5", cm: "28.0", inches: "11.0" },
  { eu: "45", usMen: "11.0", usWomen: "12.5", uk: "10.5", cm: "29.0", inches: "11.4" },
  { eu: "46", usMen: "12.0", usWomen: "13.5", uk: "11.5", cm: "30.0", inches: "11.8" },
];

export function SizeGuideModal({ isOpen, onClose, categoryName = "Footwear" }: SizeGuideModalProps) {
  const [activeUnit, setActiveUnit] = useState<"EU" | "US_MEN" | "US_WOMEN" | "UK" | "CM">("EU");
  const [fitPreference, setFitPreference] = useState<"snug" | "true" | "relaxed">("true");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 z-10 overflow-hidden text-zinc-900 dark:text-white"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </button>

            {/* Header */}
            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-[11px] font-bold uppercase tracking-wider">
                <Ruler className="w-3.5 h-3.5" />
                <span>ATELIER SIZING & FIT ADVISOR</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight">
                Veloce Precision Shoe Size Guide
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All Veloce shoes are crafted to international luxury standards. Use our measurement converter for an exact anatomical fit.
              </p>
            </div>

            {/* Fit Advice Banner */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Fit Recommendation: Runs True to Size</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    If between sizes, we advise sizing up by 0.5 for wide feet or thick running socks.
                  </p>
                </div>
              </div>

              {/* Fit pill toggle */}
              <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setFitPreference("snug")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    fitPreference === "snug"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Race Snug
                </button>
                <button
                  type="button"
                  onClick={() => setFitPreference("true")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    fitPreference === "true"
                      ? "bg-brand-500 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  True Standard
                </button>
                <button
                  type="button"
                  onClick={() => setFitPreference("relaxed")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    fitPreference === "relaxed"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Comfort Wide
                </button>
              </div>
            </div>

            {/* Size Table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="py-3 px-4">EU</th>
                    <th className="py-3 px-4">US Men</th>
                    <th className="py-3 px-4">US Women</th>
                    <th className="py-3 px-4">UK</th>
                    <th className="py-3 px-4">Foot Length (CM)</th>
                    <th className="py-3 px-4">Inches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
                  {SIZE_CHART.map((row) => (
                    <tr
                      key={row.eu}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-brand-500">{row.eu}</td>
                      <td className="py-2.5 px-4 text-zinc-800 dark:text-zinc-200">{row.usMen}</td>
                      <td className="py-2.5 px-4 text-zinc-800 dark:text-zinc-200">{row.usWomen}</td>
                      <td className="py-2.5 px-4 text-zinc-800 dark:text-zinc-200">{row.uk}</td>
                      <td className="py-2.5 px-4 text-zinc-800 dark:text-zinc-200 font-bold">{row.cm} cm</td>
                      <td className="py-2.5 px-4 text-zinc-400">{row.inches}&quot;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Measuring instructions */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 leading-relaxed">
              <span className="font-bold text-zinc-900 dark:text-white block">How to Measure Your Foot Length:</span>
              <p>
                1. Place a blank sheet of paper on a hard floor against a wall. <br />
                2. Stand upright with your heel touching the wall and mark the longest point of your toe with a pencil. <br />
                3. Measure the distance in centimeters from the wall edge to the marked line and match with the table above.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
