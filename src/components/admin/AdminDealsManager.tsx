"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Flame,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Bell,
  Mail,
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface DealItem {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  bannerImage: string | null;
  discountPercent: number | null;
  fixedDiscount: number | null;
  couponCode?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  isNotificationEnabled?: boolean;
}

interface DeliveryStats {
  totalTargeted: number;
  inAppSent: number;
  emailSent: number;
  emailFailed: number;
  totalLogs: number;
}

function generateCodeFromTitle(title: string, discountPercent: string, fixedDiscount: string): string {
  let keyword = "DEAL";
  const clean = (title || "").toUpperCase();
  if (clean.includes("RUN")) keyword = "RUN";
  else if (clean.includes("SNEAK")) keyword = "SNKR";
  else if (clean.includes("SPORT") || clean.includes("TRAIN") || clean.includes("GYM")) keyword = "SPORT";
  else if (clean.includes("BOOT")) keyword = "BOOT";
  else if (clean.includes("FORMAL") || clean.includes("LOAFER")) keyword = "FORMAL";
  else if (clean.includes("SUMMER")) keyword = "SUMMER";
  else if (clean.includes("WINTER")) keyword = "WINTER";
  else if (clean.includes("FLASH")) keyword = "FLASH";
  else if (clean.includes("VIP") || clean.includes("MEMBER")) keyword = "VIP";
  else {
    const words = clean.replace(/[^A-Z\s]/g, "").split(/\s+/).filter((w) => w && w !== "OFF" && w !== "PERCENT" && w !== "THE" && w !== "AND");
    if (words.length > 0) {
      keyword = words[0].slice(0, 5);
    }
  }

  const num = discountPercent ? discountPercent : fixedDiscount ? fixedDiscount : "20";
  return `VELOCE-${keyword}${num}`.toUpperCase();
}

export function AdminDealsManager({ initialDeals }: { initialDeals: DealItem[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [deals, setDeals] = useState<DealItem[]>(initialDeals);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("FLASH SALE");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [fixedDiscount, setFixedDiscount] = useState("");
  const [couponCode, setCouponCode] = useState("VELOCE-RUN20");
  const [manualCodeEdited, setManualCodeEdited] = useState(false);
  const [bannerImage, setBannerImage] = useState(
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80"
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  // Copied code feedback tracking
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Delivery Modal State
  const [activeStatsDeal, setActiveStatsDeal] = useState<DealItem | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Auto update coupon code whenever title or discount changes if not manually modified
  useEffect(() => {
    if (!manualCodeEdited) {
      const generated = generateCodeFromTitle(title, discountPercent, fixedDiscount);
      setCouponCode(generated);
    }
  }, [title, discountPercent, fixedDiscount, manualCodeEdited]);

  const handleCopyCode = (code: string, id: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    toast({
      title: "Coupon Code Copied!",
      description: `Copied "${code}" to clipboard.`,
      type: "success",
    });
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be under 5MB.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBannerImage(data.url);
        toast({ title: "Deal Banner Uploaded", type: "success" });
      } else {
        toast({ title: "Upload Failed", description: data.error, type: "error" });
      }
    } catch (e) {
      toast({ title: "Upload Error", type: "error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !endDate) {
      toast({ title: "Required Fields Missing", description: "Title and Expiry Date are required.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          badge,
          discountPercent: discountPercent ? Number(discountPercent) : null,
          fixedDiscount: fixedDiscount ? Number(fixedDiscount) : null,
          couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
          bannerImage,
          startDate,
          endDate,
          isActive,
          isNotificationEnabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.deal) {
        setDeals([data.deal, ...deals]);
        setTitle("");
        setSubtitle("");
        setManualCodeEdited(false);
        setIsCreating(false);
        toast({
          title: "Deal Published & Code Generated",
          description: `Coupon code "${data.deal.couponCode || couponCode}" is now live and can be applied at checkout.`,
          type: "success",
        });
        router.refresh();
      } else {
        toast({ title: "Failed to publish deal", description: data.error, type: "error" });
      }
    } catch (err) {
      toast({ title: "Network Error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (deal: DealItem) => {
    try {
      const nextStatus = !deal.isActive;
      const res = await fetch(`/api/admin/deals?id=${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      if (res.ok) {
        setDeals(deals.map((d) => (d.id === deal.id ? { ...d, isActive: nextStatus } : d)));
        toast({
          title: nextStatus ? "Deal Activated" : "Deal Paused",
          type: "info",
        });
        router.refresh();
      }
    } catch (err) {
      toast({ title: "Error updating status", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this promotional deal?")) return;

    try {
      const res = await fetch(`/api/admin/deals?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeals(deals.filter((d) => d.id !== id));
        toast({ title: "Deal Removed", type: "info" });
        router.refresh();
      }
    } catch (err) {
      toast({ title: "Error", type: "error" });
    }
  };

  const openDeliveryStats = async (deal: DealItem) => {
    setActiveStatsDeal(deal);
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/admin/deals/${deal.id}/stats`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDeliveryStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTriggerNotify = async (dealId: string) => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/admin/deals/${dealId}/notify`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Personalized Notifications Dispatched",
          description: `In-App: ${data.stats.inAppSent} | Email Sent: ${data.stats.emailSent}`,
          type: "success",
        });
        // Refresh stats
        const statsRes = await fetch(`/api/admin/deals/${dealId}/stats`);
        const statsData = await statsRes.json();
        if (statsRes.ok) setDeliveryStats(statsData.stats);
      } else {
        toast({ title: "Dispatch Failed", description: data.error, type: "error" });
      }
    } catch (e) {
      toast({ title: "Error triggering notification", type: "error" });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            if (!isCreating) {
              setManualCodeEdited(false);
              const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
              setEndDate(defaultEnd);
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Launch New Deal Campaign</span>
        </button>
      </div>

      {/* Creation Modal / Inline Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl animate-scaleIn text-white"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-500" />
                <span>Configure Promotional Deal Campaign</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatically generates a promotional coupon code for checkout and dispatches notifications.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Deal Banner Image Visual
            </label>
            <div className="space-y-3">
              {bannerImage && (
                <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                  <Image src={bannerImage} alt="Banner Preview" fill className="object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-brand-500" />
                  <span>{uploading ? "Uploading..." : "Upload Banner Image"}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileUpload}
                />
                <input
                  type="url"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Campaign Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Campaign Title * (e.g., 20% OFF Running Shoes)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 20% OFF Running Shoes"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Badge / Tagline
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. LIMITED FLASH DEAL"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* AUTOMATIC PROMOTIONAL COUPON CODE GENERATOR */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-brand-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-500" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Automatic Promotional Coupon Code
                </label>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Connected to Checkout Discount
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setManualCodeEdited(true);
                  }}
                  placeholder="VELOCE-RUN20"
                  className="w-full pl-4 pr-10 py-2.5 text-sm font-mono font-black tracking-wider rounded-xl border border-zinc-800 bg-zinc-900 text-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setManualCodeEdited(false);
                  const generated = generateCodeFromTitle(title, discountPercent, fixedDiscount);
                  setCouponCode(generated);
                  toast({ title: "New Code Generated", description: generated, type: "info" });
                }}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                title="Regenerate code"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyCode(couponCode, "form")}
                className="px-4 py-2.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Copy generated code"
              >
                {copiedCodeId === "form" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              When customers apply this code during checkout, the discount will automatically be calculated and deducted from their total.
            </p>
          </div>

          {/* Discounts & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="20"
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Fixed Discount (PKR / Rs.) Optional
              </label>
              <input
                type="number"
                value={fixedDiscount}
                onChange={(e) => setFixedDiscount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Expiry Date & Time (Countdown End) *
              </label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Subtitle / Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Short Description & Offer Terms
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Get 20% OFF selected high-performance footwear. Handcrafted in Tuscany with nitrogen foam."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Status & Notification Options Box */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-white cursor-pointer">
                  Campaign Active Status (Live on website)
                </label>
              </div>

              <span
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {isActive ? "ACTIVE" : "PAUSED"}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
              <input
                type="checkbox"
                id="isNotifCheck"
                checked={isNotificationEnabled}
                onChange={(e) => setIsNotificationEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500 cursor-pointer"
              />
              <label htmlFor="isNotifCheck" className="text-xs font-bold text-white cursor-pointer flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-brand-500" />
                <span>Notify Target Customers (In-App Alerts & Luxury Resend Deal Emails)</span>
              </label>
            </div>
            <p className="text-[11px] text-zinc-400 pl-7">
              When published, this deal will target customers who favorited relevant shoes or categories and dispatch personalized notifications.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? "Publishing..." : "Publish & Generate Deal Code"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal) => {
          const isExpired = new Date(deal.endDate) < new Date();
          const effectiveCode = deal.couponCode || generateCodeFromTitle(deal.title, String(deal.discountPercent || ""), String(deal.fixedDiscount || ""));

          return (
            <div
              key={deal.id}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 relative overflow-hidden flex flex-col justify-between text-white"
            >
              {deal.bannerImage && (
                <div className="relative aspect-[21/9] rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800/80">
                  <Image src={deal.bannerImage} alt={deal.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500 text-white shadow-md">
                      {deal.badge || "DEAL"}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono border ${
                        !deal.isActive
                          ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                          : isExpired
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {!deal.isActive ? "PAUSED" : isExpired ? "EXPIRED" : "LIVE NOW"}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white">{deal.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(deal)}
                      className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        deal.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                      }`}
                      title={deal.isActive ? "Pause Deal" : "Activate Deal"}
                    >
                      {deal.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(deal.id)}
                      className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                      title="Remove Deal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {deal.subtitle && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {deal.subtitle}
                  </p>
                )}
              </div>

              {/* AUTOMATIC PROMOTIONAL COUPON CODE BADGE & COPY */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-[9px] uppercase font-bold text-zinc-500 leading-tight">
                      Generated Coupon Code
                    </p>
                    <p className="font-mono text-xs font-bold text-brand-400 tracking-wider truncate">
                      {effectiveCode}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(effectiveCode, deal.id)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedCodeId === deal.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Deal Specs & Expiry */}
              <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Savings</p>
                  <p className="font-mono font-bold text-white">
                    {deal.discountPercent
                      ? `${deal.discountPercent}% OFF`
                      : deal.fixedDiscount
                      ? `Rs. ${deal.fixedDiscount} OFF`
                      : "SPECIAL"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Expires</p>
                  <p className="font-mono text-zinc-300">{formatDate(deal.endDate)}</p>
                </div>
              </div>

              {/* Notification & Delivery Status Footer */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => openDeliveryStats(deal)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-500" />
                  <span>Delivery Status</span>
                </button>

                <button
                  onClick={() => handleTriggerNotify(deal.id)}
                  disabled={retrying}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Dispatch in-app notifications and emails to eligible customers"
                >
                  <Send className="w-3 h-3" />
                  <span>Trigger Notifications</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deals.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
          <Flame className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">No promotional deals currently active</p>
          <p className="text-xs text-zinc-400">Click &quot;+ Launch New Deal Campaign&quot; to publish a flash sale.</p>
        </div>
      )}

      {/* Delivery Stats Modal */}
      {activeStatsDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-500" />
                  <span>Campaign Notification Delivery Audit</span>
                </h3>
                <p className="text-xs text-zinc-400 truncate max-w-xs mt-0.5">
                  {activeStatsDeal.title}
                </p>
              </div>
              <button
                onClick={() => setActiveStatsDeal(null)}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-xs font-semibold text-zinc-400">Loading delivery metrics...</p>
              </div>
            ) : deliveryStats ? (
              <div className="space-y-4">
                {/* 3 Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Targeted Users</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {deliveryStats.totalTargeted}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">In-App Created</p>
                    <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      {deliveryStats.inAppSent}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Emails Dispatched</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {deliveryStats.emailSent}
                    </p>
                  </div>
                </div>

                {deliveryStats.emailFailed > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs text-rose-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{deliveryStats.emailFailed} emails failed or simulation notice.</span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>De-duplication Safe Guard:</span>
                    <span className="text-emerald-400 font-bold">Active (Zero Duplicate Sends)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Targeting Preferences Honored:</span>
                    <span className="text-emerald-400 font-bold">Active (Wishlist & Preferences)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => handleTriggerNotify(activeStatsDeal.id)}
                    disabled={retrying}
                    className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {retrying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{retrying ? "Dispatching..." : "Retry / Dispatch Unsent"}</span>
                  </button>

                  <button
                    onClick={() => setActiveStatsDeal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
