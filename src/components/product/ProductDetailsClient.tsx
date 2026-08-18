"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSizeSelector } from "@/components/product/ProductSizeSelector";
import { ProductReviews } from "@/components/product/ProductReviews";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Star,
  Check,
  CheckCircle2,
} from "lucide-react";

interface ProductDetailsClientProps {
  product: any;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.find((s: any) => s.stock > 0)?.size || product.sizes?.[0]?.size || "42"
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants?.[0]?.colorName || "Standard"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.salePrice ? calculateDiscountPercentage(product.price, product.salePrice) : 0;
  const inWishlist = isInWishlist(product.id);

  const primaryImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80";
  const currentSizeObj = product.sizes?.find((s: any) => s.size === selectedSize);
  const currentStock = currentSizeObj ? currentSizeObj.stock : 0;
  const isOutOfStock = currentStock <= 0;

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("veloce_recently_viewed");
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((p: any) => p.id !== product.id);
      list.unshift({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        image: primaryImage,
        brandName: product.brand?.name,
        rating: product.rating,
      });
      localStorage.setItem("veloce_recently_viewed", JSON.stringify(list.slice(0, 8)));
    } catch (e) {}
  }, [product.id, primaryImage]);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast({
        title: "Size Sold Out",
        description: "Please select another size in stock.",
        type: "error",
      });
      return;
    }

    setIsAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand?.name,
      price: product.price,
      salePrice: product.salePrice,
      image: primaryImage,
      size: selectedSize,
      color: selectedColor,
      quantity,
      maxStock: currentStock,
    });

    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "Added to Bag!",
        description: `${product.name} (EU ${selectedSize})`,
        type: "success",
      });
    }, 250);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlist = () => {
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

  return (
    <div className="space-y-16">
      {/* Upper Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images || []} productName={product.name} />
        </div>

        {/* Right Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {product.brand?.name || "Veloce Atelier"}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating?.toFixed(1) || "5.0"}</span>
                <span className="text-zinc-400 text-[11px]">({product.reviews?.length || product.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs font-mono text-zinc-400">SKU: {product.sku}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
            {product.salePrice ? (
              <>
                <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white font-mono">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-sm font-semibold text-zinc-400 line-through font-mono">
                  {formatPrice(product.price)}
                </span>
                <span className="ml-auto text-xs font-bold uppercase tracking-wider bg-brand-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                  Save {discount}%
                </span>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white font-mono">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Color Selection if multiple variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Colorway: <span className="text-zinc-500 font-normal">{selectedColor}</span>
              </span>
              <div className="flex items-center gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id || v.colorName}
                    onClick={() => setSelectedColor(v.colorName)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedColor === v.colorName
                        ? "border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span>{v.colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector Matrix */}
          <ProductSizeSelector
            sizes={product.sizes || []}
            selectedSize={selectedSize}
            onSelectSize={(s) => setSelectedSize(s)}
          />

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold font-mono text-zinc-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlist}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                  inWishlist
                    ? "bg-brand-500 text-white border-brand-500 shadow-md"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Main CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isOutOfStock || isAdding}
                onClick={handleAddToCart}
                className="py-4 px-6 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdding ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Bag"}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>Instant Checkout</span>
              </button>
            </div>
          </div>

          {/* Description & Specifications */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Product Overview
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {product.description}
            </p>

            {product.details && (
              <div className="pt-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Technical Specifications
                </h4>
                <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                  {product.details.split("\n").map((line: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-brand-500" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-brand-500 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-zinc-900 dark:text-white">Free Express Delivery</p>
                <p className="text-[10px] text-zinc-400">On all orders over Rs. 5,000</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-zinc-900 dark:text-white">30-Day Returns</p>
                <p className="text-[10px] text-zinc-400">Complimentary return labels</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl sm:text-2xl font-display font-black text-zinc-900 dark:text-white mb-6">
          Verified Owner Reviews & Fit Feedback
        </h2>
        <ProductReviews
          productId={product.id}
          initialReviews={product.reviews || []}
          averageRating={product.rating || 5}
          reviewCount={product.reviews?.length || product.reviewCount || 0}
        />
      </section>
    </div>
  );
}
