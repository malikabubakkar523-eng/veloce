import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, RotateCcw, CreditCard, Instagram, Twitter, Youtube, Facebook, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-24 lg:pb-16 border-t border-zinc-900">
      {/* Brand value pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-zinc-800/80">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-zinc-900 text-brand-500 border border-zinc-800 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Complimentary Express</h4>
              <p className="text-xs text-zinc-500 mt-1">Free nationwide shipping on qualifying orders over Rs. 5,000.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-zinc-900 text-brand-500 border border-zinc-800 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Verified Authentic</h4>
              <p className="text-xs text-zinc-500 mt-1">Hand-inspected by certified master horologists & cobblers.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-zinc-900 text-brand-500 border border-zinc-800 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-zinc-500 mt-1">30-day effortless returns with prepaid courier labels.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-zinc-900 text-brand-500 border border-zinc-800 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Encrypted Payments</h4>
              <p className="text-xs text-zinc-500 mt-1">Bank-grade 256-bit SSL encryption & flexible payment options.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 sm:h-12 w-44 sm:w-56 flex items-center transition-transform group-hover:scale-105">
                <Image
                  src="/images/veloce-logo.svg"
                  alt="VELOCE"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400 mt-4 max-w-sm">
              Engineered footwear and haute-streetwear for those who relentlessly push forward. Handcrafted luxury meets next-generation carbon propulsion.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/category/sneakers" className="hover:text-white transition-colors">Lifestyle Sneakers</Link></li>
              <li><Link href="/category/running" className="hover:text-white transition-colors">Carbon Road Racers</Link></li>
              <li><Link href="/category/basketball" className="hover:text-white transition-colors">High-Top Basketball</Link></li>
              <li><Link href="/category/boots" className="hover:text-white transition-colors">Tuscan Leather Boots</Link></li>
              <li><Link href="/category/casual" className="hover:text-white transition-colors">Italian Loafers</Link></li>
              <li><Link href="/shop?deal=true" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors flex items-center gap-1">Deals & Offers <ArrowUpRight className="w-3 h-3" /></Link></li>
            </ul>
          </div>

          {/* Client Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link href="/account/profile" className="hover:text-white transition-colors">Account Dashboard</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Information</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide & Fit Advice</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Concierge</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-4">Maison & Atelier</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Our Heritage</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability & Ethics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carbon Innovation Lab</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flagship Stores</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press & Media</a></li>
              <li><Link href="/admin" className="text-zinc-600 hover:text-zinc-400 transition-colors">Staff Portal</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© 2026 VELOCE Footwear Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono text-zinc-400">VISA</span>
          <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono text-zinc-400">MASTERCARD</span>
          <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono text-zinc-400">AMEX</span>
          <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono text-zinc-400">APPLE PAY</span>
          <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono text-zinc-400">COD</span>
        </div>
      </div>
    </footer>
  );
}
