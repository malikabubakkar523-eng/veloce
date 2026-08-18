"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
    avatar?: string | null;
  } | null;
  onOpenSearch?: () => void;
}

export function Navbar({ user, onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartItemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Sneakers", href: "/category/sneakers" },
    { name: "Running", href: "/category/running" },
    { name: "Gallery", href: "/gallery" },
    { name: "Deals", href: "/shop?deal=true", badge: "40% OFF" },
    { name: "New Arrivals", href: "/shop?sort=newest" },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-zinc-950 text-zinc-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 border-b border-zinc-800 flex items-center justify-between z-40 relative overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 mx-auto truncate text-center">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0 animate-pulse" />
          <span className="font-medium tracking-wide truncate">
            Complimentary Nationwide Express Shipping over Rs. 5,000 &nbsp;•&nbsp; Code:{" "}
            <strong className="text-white font-mono">VELOCE20</strong>
          </span>
        </div>
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[11px] font-semibold hover:bg-brand-500/30 transition-colors border border-brand-500/30 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled
            ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-xs border-b border-zinc-200/80 dark:border-zinc-800/80 py-1.5 sm:py-3"
            : "bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 py-2 sm:py-3.5"
        )}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between w-full">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 group shrink-0 py-0.5" aria-label="VELOCE Home">
            <div className="relative h-9 xs:h-10 sm:h-11 md:h-12 w-36 xs:w-44 sm:w-52 md:w-60 flex items-center transition-transform duration-300 group-hover:scale-[1.03]">
              {/* Dark mode logo */}
              <Image
                src="/images/veloce-logo.svg"
                alt="VELOCE"
                fill
                priority
                sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 240px"
                className="object-contain object-left hidden dark:block drop-shadow-sm"
              />
              {/* Light mode logo */}
              <Image
                src="/images/veloce-logo-dark.svg"
                alt="VELOCE"
                fill
                priority
                sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 240px"
                className="object-contain object-left block dark:hidden drop-shadow-sm"
              />
            </div>
          </Link>

          {/* Center (Desktop Only): Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  className={cn(
                    "relative px-3 py-1.5 text-xs xl:text-sm font-medium transition-colors rounded-full flex items-center gap-1.5",
                    isActive
                      ? "text-zinc-950 dark:text-white font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                  )}
                >
                  {link.name}
                  {link.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/15 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full border border-brand-500/20">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-zinc-950 dark:bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions Container (Search, Notification, Theme, Bag, Profile) */}
          <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 shrink-0">
            {/* 1. Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="w-10 h-10 sm:w-auto sm:px-3 sm:py-1.5 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs flex items-center justify-center gap-1.5 shrink-0"
              aria-label="Search shoes"
            >
              <Search className="w-[22px] h-[22px] sm:w-4 sm:h-4 stroke-[1.8]" />
              <span className="hidden sm:inline text-zinc-400 font-medium">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                ⌘K
              </kbd>
            </button>

            {/* 2. Notification Bell Dropdown */}
            <NotificationDropdown />

            {/* 3. Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* 4. Desktop-Only Wishlist Button (Mobile is in bottom nav) */}
            <Link
              href="/wishlist"
              className="hidden lg:flex relative w-10 h-10 items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-[22px] h-[22px] stroke-[1.8]" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* 5. Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-[22px] h-[22px] sm:w-5 sm:h-5 stroke-[1.8]" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* 6. Profile Icon (22–24px Icon Size with 44×44px Touch Target) */}
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/account/profile"}
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
                aria-label={`Account profile for ${user.name}`}
                title={`Account: ${user.name}`}
              >
                <div className="relative w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs overflow-hidden ring-2 ring-brand-500/40 shadow-xs">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  ) : (
                    <span className="font-display font-black text-xs">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
                aria-label="Sign In / Profile"
                title="Sign In / Profile"
              >
                <UserIcon className="w-[22px] h-[22px] sm:w-[23px] sm:h-[23px] stroke-[1.8]" />
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
