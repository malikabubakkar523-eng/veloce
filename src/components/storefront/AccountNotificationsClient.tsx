"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Package,
  Flame,
  Sparkles,
  CheckCheck,
  ArrowRight,
  ShieldAlert,
  Clock,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  orderId?: string | null;
  dealId?: string | null;
  productId?: string | null;
  createdAt: string | Date;
}

interface AccountNotificationsClientProps {
  initialNotifications: NotificationItem[];
}

export function AccountNotificationsClient({
  initialNotifications,
}: AccountNotificationsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "ORDER" | "DEAL">("ALL");
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "ORDER") return n.type === "ORDER";
    if (filter === "DEAL") return n.type === "DEAL" || n.type === "PROMOTION";
    return true;
  });

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast({ title: "All notifications marked as read", type: "success" });
        router.refresh();
      }
    } catch (e) {
      toast({ title: "Failed to update", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      // ignore
    }
  };

  const getIcon = (type: string, title: string) => {
    if (title.toLowerCase().includes("cancel")) {
      return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    }
    switch (type) {
      case "ORDER":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "DEAL":
        return <Flame className="w-4 h-4 text-amber-500" />;
      case "PROMOTION":
        return <Sparkles className="w-4 h-4 text-brand-500" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === "ALL"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("UNREAD")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === "UNREAD"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ORDER")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === "ORDER"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            Orders Only
          </button>
          <button
            type="button"
            onClick={() => setFilter("DEAL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === "DEAL"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            Promotions & Drops
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <button
            type="button"
            disabled={loading}
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">No Notifications</h3>
          <p className="text-xs text-zinc-500">
            {filter === "UNREAD"
              ? "You're all caught up! No unread notifications right now."
              : "When admin updates your order status or new deals drop, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const targetHref = n.orderId
              ? `/account/orders/${n.orderId}`
              : n.productId
              ? `/product/${n.productId}`
              : n.type === "DEAL" || n.dealId
              ? "/shop"
              : undefined;

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) handleMarkOneRead(n.id);
                }}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !n.isRead
                    ? "bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/30 shadow-xs"
                    : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                    {getIcon(n.type, n.title)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[9px] font-bold uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {targetHref && (
                  <Link
                    href={targetHref}
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1.5 shrink-0 hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <span>{n.productId ? "View Shoe" : n.type === "DEAL" ? "Explore Deal" : "Track Order"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
