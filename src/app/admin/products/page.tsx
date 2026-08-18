import React from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Edit3, ExternalLink, Star } from "lucide-react";
import { AdminDeleteProductButton } from "@/components/admin/AdminDeleteProductButton";

export const revalidate = 0;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string };
}) {
  const { search, category, status } = searchParams;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }
  if (category) {
    where.categoryId = category;
  }
  if (status) {
    where.status = status;
  }

  let products: any[] = [];
  let categories: any[] = [];

  try {
    const [prods, cats] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
          brand: true,
          sizes: true,
        },
      }),
      db.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    products = prods || [];
    categories = cats || [];
  } catch (error) {
    console.warn("⚠️ AdminProductsPage fallback:", error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            PRODUCT MANAGEMENT
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
            Footwear Catalog ({products.length})
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage inventory, specs, and status with non-destructive preservation for past orders.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form method="GET" className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search shoes by name or SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          name="category"
          defaultValue={category || ""}
          className="px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={status || ""}
          className="px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
          <option value="DRAFT">Draft</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
        >
          Filter
        </button>
      </form>

      {/* Table Card */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">Footwear</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Price</th>
                <th className="pb-3 font-semibold">Total Stock</th>
                <th className="pb-3 font-semibold">Rating</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No footwear matched your search filter.
                  </td>
                </tr>
              ) : (
                products.map((p: any) => {
                  const totalStock = (p.sizes || []).reduce((sum: number, s: any) => sum + (Number(s?.stock) || 0), 0);
                  const img =
                    p.images[0]?.url ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-zinc-800 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                            <Image src={img} alt={p.name} fill sizes="48px" className="object-contain" />
                          </div>
                          <div>
                            <p className="font-bold text-white line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-zinc-300 font-medium">{p.category?.name}</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-white">
                        {p.salePrice ? (
                          <div className="flex items-center gap-1.5">
                            <span>{formatPrice(p.salePrice)}</span>
                            <span className="text-zinc-500 line-through text-[11px]">
                              {formatPrice(p.price)}
                            </span>
                          </div>
                        ) : (
                          formatPrice(p.price)
                        )}
                      </td>
                      <td className="py-3.5 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            totalStock <= 0
                              ? "bg-rose-500/10 text-rose-500"
                              : totalStock <= 10
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>
                      <td className="py-3.5 text-zinc-300">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <AdminDeleteProductButton productId={p.id} productName={p.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
