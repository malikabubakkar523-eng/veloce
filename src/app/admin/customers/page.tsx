import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Users, Mail, Eye, ChevronRight } from "lucide-react";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  let users: any[] = [];
  try {
    users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: { total: true },
        },
      },
    });
  } catch (error) {
    console.warn("⚠️ AdminCustomersPage fallback:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            USER DIRECTORY
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
            Registered Customers & Staff ({users.length})
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Click on any customer to view their full order history, login activity, and dispatch direct emails.
          </p>
        </div>

        <Link
          href="/admin/emails"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Mail className="w-4 h-4" />
          <span>Open Email Hub</span>
        </Link>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Contact</th>
                <th className="pb-3 font-semibold">Total Orders</th>
                <th className="pb-3 font-semibold">Lifetime Spend</th>
                <th className="pb-3 font-semibold">Registered</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.map((u: any) => {
                const totalOrders = u.orders?.length || 0;
                const lifetimeSpend = (u.orders || []).reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0);

                return (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5">
                      <Link
                        href={`/admin/customers/${u.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-bold text-white group-hover:text-brand-400 transition-colors">
                          {u.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-zinc-400 font-mono">
                      <p>{u.email}</p>
                      {u.phone && <p className="text-[10px] text-zinc-500">{u.phone}</p>}
                    </td>
                    <td className="py-3.5 text-zinc-300 font-mono">{totalOrders} orders</td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      {formatPrice(lifetimeSpend)}
                    </td>
                    <td className="py-3.5 text-zinc-400">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/customers/${u.id}`}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
