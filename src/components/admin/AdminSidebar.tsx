"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Flame,
  Tag,
  Users,
  Mail,
  Camera,
  Layers,
  Activity,
  Settings,
  Store,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user: any;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes },
    { label: "Hero Banners", href: "/admin/hero", icon: Layers },
    { label: "Cinematic Videos", href: "/admin/videos", icon: Film },
    { label: "Shop Banner", href: "/admin/shop-banner", icon: Store },
    { label: "Lookbook Gallery", href: "/admin/gallery", icon: Camera },
    { label: "Deals & Offers", href: "/admin/deals", icon: Flame },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Email Hub", href: "/admin/emails", icon: Mail },
    { label: "Activity Logs", href: "/admin/activity", icon: Activity },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between bg-zinc-900 border-r border-zinc-800 transition-all duration-300 z-30 shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top Brand */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
            <div className="relative w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 p-1.5 shadow-md">
              <Image
                src="/images/veloce-logo-icon.svg"
                alt="VELOCE"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="relative h-7 w-32">
                  <Image
                    src="/images/veloce-logo.svg"
                    alt="VELOCE"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Control Center
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-zinc-400 group-hover:text-white")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Storefront & User preview */}
      <div className="p-3 border-t border-zinc-800 space-y-2">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors",
            collapsed && "justify-center"
          )}
          title="Return to Storefront"
        >
          <Store className="w-4 h-4 shrink-0 text-brand-500" />
          {!collapsed && <span>View Storefront</span>}
        </Link>

        {!collapsed && (
          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-400 font-mono truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
