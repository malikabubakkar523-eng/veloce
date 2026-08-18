"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import { formatPrice, calculateDiscountPercentage, cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useToast } from "@/components/ui/ToastProvider";

// Dynamic import for QuickViewModal to reduce initial bundle size and DOM tree
const QuickViewModal = dynamic(
  () => import("@/components/storefront/QuickViewModal").then((mod) => mod.QuickViewModal),
  { ssr: false }
);

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    rating?: number;
    reviewCount?: number;
    description?: string;
    details?: string | null;
    isFeatured?: boolean;
    isNew?: boolean;
    brand?: { name: string } | null;
    category?: { name: string; slug: string } | null;
    images: { url: string; alt?: string | null; isPrimary?: boolean }[];
    sizes?: { size: string; stock: number }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const { toast } = useToast();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";
  const secondaryImage = product.images[1]?.url || primaryImage;

  const discount = product.salePrice
    ? calculateDiscountPercentage(product.price, product.salePrice)
    : 0;
  const inWishlist = isInWishlist(product.id);

  const totalStock = product.sizes
    ? product.sizes.reduce((acc, s) => acc + s.stock, 0)
    : 10;
  const isOutOfStock = totalStock <= 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand?.name,
      price: product.price,
      salePrice: product.salePrice,
      image: primaryImage,
      rating: product.rating,
    });
    toast({
      title: inWishlist ? "Removed from Wishlist" : "Saved to Wishlist",
      description: product.name,
      type: "info",
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.find((s) => s.stock > 0)?.size || "42";

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand?.name,
      price: product.price,
      salePrice: product.salePrice,
      image: primaryImage,
      size: defaultSize,
      quantity: 1,
      maxStock: 10,
    });

    toast({
      title: "Added to Bag",
      description: `${product.name} (EU ${defaultSize})`,
      type: "success",
    });
    openCart();
  };

  return (
    <>
      <div
        className="group relative flex flex-col bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 will-change-transform"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Container */}
        <div className="relative aspect-[4/3.6] w-full bg-zinc-50 dark:bg-zinc-950/60 overflow-hidden flex items-center justify-center p-3.5 sm:p-6">
          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1 sm:gap-1.5 items-start pointer-events-none">
            {discount > 0 && (
              <span className="bg-brand-500 text-white text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                NEW
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-zinc-500 text-white text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full transition-all duration-200 backdrop-blur-md active:scale-95",
              inWishlist
                ? "bg-brand-500 text-white shadow-md scale-110"
                : "bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-brand-500 hover:scale-110 shadow-sm"
            )}
          >
            <Heart className={cn("w-3.5 sm:w-4 h-3.5 sm:h-4", inWishlist && "fill-current")} />
          </button>

          {/* Product Images */}
          <Link href={`/product/${product.slug}`} className="relative w-full h-full block">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className={cn(
                "object-contain object-center transition-all duration-500 will-change-transform",
                isHovered && secondaryImage !== primaryImage
                  ? "opacity-0 scale-95"
                  : "opacity-100 group-hover:scale-105"
              )}
            />
            {secondaryImage !== primaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                className={cn(
                  "object-contain object-center transition-all duration-500 will-change-transform",
                  isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95"
                )}
              />
            )}
          </Link>

          {/* Hover Actions Bar (Quick View & Quick Add) */}
          <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex gap-1.5 sm:gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-950 text-white dark:bg-zinc-900/80 dark:hover:bg-zinc-800 backdrop-blur-md text-xs font-bold shadow-lg transition-all"
              title="Quick View"
            >
              <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </button>

            {!isOutOfStock && (
              <button
                onClick={handleQuickAdd}
                className="flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl bg-zinc-950/90 hover:bg-zinc-950 text-white dark:bg-white/90 dark:hover:bg-white dark:text-zinc-950 backdrop-blur-md text-[11px] sm:text-xs font-bold shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
              >
                <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>Quick Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between bg-white dark:bg-zinc-900/40">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between gap-1.5 text-xs">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold text-[9px] sm:text-[10px] truncate">
                {product.brand?.name || product.category?.name || "Bespoke Footwear"}
              </span>

              {product.rating && (
                <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold text-[10px] sm:text-[11px] shrink-0">
                  <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" />
                  <span>{product.rating.toFixed(1)}</span>
                  {product.reviewCount ? (
                    <span className="text-zinc-400 text-[9px] sm:text-[10px]">({product.reviewCount})</span>
                  ) : null}
                </div>
              )}
            </div>

            <Link
              href={`/product/${product.slug}`}
              className="block group-hover:text-brand-500 transition-colors"
            >
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
            {product.salePrice ? (
              <>
                <span className="text-xs sm:text-base font-bold text-zinc-950 dark:text-white">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-base font-bold text-zinc-950 dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal - Lazy Mounted Only When Open */}
      {quickViewOpen && (
        <QuickViewModal
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          product={product}
        />
      )}
    </>
  );
}
