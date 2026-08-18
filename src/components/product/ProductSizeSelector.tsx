"use client";

import React, { useState } from "react";
import { AlertCircle, Ruler, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";

interface SizeItem {
  size: string;
  stock: number;
}

interface ProductSizeSelectorProps {
  sizes: SizeItem[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export function ProductSizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
}: ProductSizeSelectorProps) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const currentSelectedStock = sizes.find((s) => s.size === selectedSize)?.stock ?? 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Select Size (EU)
          </span>
          {selectedSize && (
            <span className="text-xs font-bold text-brand-500">
              {selectedSize}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSizeGuideOpen(true)}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Ruler className="w-3.5 h-3.5 text-brand-500" />
          <span>Size Guide & Fit</span>
        </button>
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Sizes Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {sizes.map((s) => {
          const isSelected = selectedSize === s.size;
          const isOutOfStock = s.stock <= 0;
          const isLowStock = s.stock > 0 && s.stock <= 4;

          return (
            <button
              key={s.size}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectSize(s.size)}
              className={cn(
                "relative py-3 rounded-2xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border",
                isSelected
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-lg scale-105"
                  : isOutOfStock
                  ? "bg-zinc-100/60 dark:bg-zinc-900/40 text-zinc-400 border-dashed border-zinc-200 dark:border-zinc-800 cursor-not-allowed line-through opacity-50"
                  : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:scale-102"
              )}
            >
              <span>{s.size}</span>

              {isLowStock && !isSelected && (
                <span className="absolute -top-1.5 -right-1 bg-amber-500 text-zinc-950 text-[9px] font-black px-1 rounded-full leading-tight">
                  {s.stock}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stock message feedback */}
      {selectedSize && (
        <div className="pt-1">
          {currentSelectedStock > 0 && currentSelectedStock <= 4 ? (
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Hurry, only {currentSelectedStock} pairs remaining in size {selectedSize}!
            </p>
          ) : currentSelectedStock > 4 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" />
              In stock and ready to ship within 24 hours.
            </p>
          ) : (
            <p className="text-xs text-rose-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Size {selectedSize} is currently sold out.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
