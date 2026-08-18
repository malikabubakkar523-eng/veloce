"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Package, Flame, Sparkles, CheckCheck, ExternalLink, ShieldAlert } from "lucide-react";
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
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);
  const initialLoadRef = useRef<boolean>(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const incomingNotifs: NotificationItem[] = data.notifications || [];
        const incomingUnread: number = data.unreadCount || 0;

        // If new notifications arrived while browsing, pop a live toast!
        if (!initialLoadRef.current && incomingUnread > prevCountRef.current && incomingNotifs.length > 0) {
          const newest = incomingNotifs[0];
          if (newest && !newest.isRead) {
            toast({
              title: newest.title,
              description: newest.message,
              type: newest.title.includes("Cancelled") ? "error" : "info",
              duration: 5000,
            });
          }
        }

        initialLoadRef.current = false;
        prevCountRef.current = incomingUnread;
        setNotifications(incomingNotifs);
        setUnreadCount(incomingUnread);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Real-time polling every 12 seconds for responsive website updates
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      prevCountRef.current = 0;
    } catch (e) {
      // ignore
    }
  };

  const handleMarkOneRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      prevCountRef.current = newCount;
    } catch (e) {
      // ignore
    }
  };

  const getIcon = (type: string, title: string) => {
    if (title.toLowerCase().includes("cancel")) {
      return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
    }
    switch (type) {
      case "ORDER":
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
      case "DEAL":
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case "PROMOTION":
        return <Sparkles className="w-3.5 h-3.5 text-brand-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle notifications dropdown"
        aria-expanded={isOpen}
        className="relative p-1.5 sm:p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer select-none"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 animate-scaleIn select-none">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-400 space-y-1">
                <Bell className="w-6 h-6 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">No notifications yet</p>
                <p className="text-[11px] text-zinc-500">Order updates and alerts will appear here</p>
              </div>
            ) : (
              notifications.map((n) => {
                const targetHref = n.orderId
                  ? `/account/orders/${n.orderId}`
                  : n.productId
                  ? `/product/${n.productId}`
                  : n.type === "DEAL" || n.dealId
                  ? "/shop"
                  : undefined;

                const content = (
                  <div
                    key={n.id}
                    onClick={(e) => {
                      if (!n.isRead) handleMarkOneRead(n.id, e);
                      if (targetHref) setIsOpen(false);
                    }}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                      !n.isRead ? "bg-brand-500/5 dark:bg-brand-500/10" : ""
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5 shadow-xs">
                      {getIcon(n.type, n.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 shadow-xs" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {formatDate(n.createdAt)}
                        </span>
                        {targetHref && (
                          <span className="text-[10px] text-brand-500 font-bold hover:underline flex items-center gap-0.5">
                            {n.productId ? "View Shoe" : n.type === "DEAL" ? "Shop Deal" : "Track Order"} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (targetHref) {
                  return (
                    <Link key={n.id} href={targetHref} className="block">
                      {content}
                    </Link>
                  );
                }

                return content;
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
            <Link
              href="/account/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>View All Notifications Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
