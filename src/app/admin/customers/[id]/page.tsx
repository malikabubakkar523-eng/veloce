import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminCustomerDirectEmailModal } from "@/components/admin/AdminCustomerDirectEmailModal";
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Monitor,
  Package,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let user: any = null;
  try {
    user = await db.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        addresses: true,
      },
    });
  } catch (error) {
    console.warn("⚠️ AdminCustomerDetailPage fallback:", error);
  }

  if (!user) {
    notFound();
  }

  const totalSpent = (user.orders || []).reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0);

  // Fetch emails sent to this customer
  const emails = await db.emailLog.findMany({
    where: { recipientEmail: user.email },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <Link
            href="/admin/customers"
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customer Directory
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
            CUSTOMER PROFILE
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-0.5">
            {user.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <AdminCustomerDirectEmailModal
            customerName={user.name}
            customerEmail={user.email}
          />
        </div>
      </div>

      {/* Customer Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-zinc-500">Lifetime Spend</p>
          <p className="text-xl font-bold font-mono text-white">{formatPrice(totalSpent)}</p>
        </div>
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-zinc-500">Total Orders</p>
          <p className="text-xl font-bold font-mono text-white">{user.orders.length} placed</p>
        </div>
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-zinc-500">Account Status</p>
          <p className="text-sm font-bold text-emerald-400 uppercase font-mono">{user.status}</p>
        </div>
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-zinc-500">Member Since</p>
          <p className="text-xs font-semibold text-zinc-300">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* Order History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-brand-500" />
          <span>Full Order History ({user.orders.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">Order ID</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {user.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                user.orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-white">{o.orderNumber}</td>
                    <td className="py-3.5 text-zinc-400">{formatDate(o.createdAt)}</td>
                    <td className="py-3.5 text-zinc-300">{o.items?.length || 0} pair(s)</td>
                    <td className="py-3.5 font-mono font-bold text-white">{formatPrice(o.total)}</td>
                    <td className="py-3.5 text-zinc-400 font-mono text-[10px]">{o.paymentMethod}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-[11px] font-semibold text-brand-500 hover:text-brand-400"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Logs & Email History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Logs */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Login & Security Activity</span>
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
            {user.activities.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No activity recorded yet.</p>
            ) : (
              user.activities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{act.action}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {act.device || "Desktop"} • {act.ipAddress || "127.0.0.1"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        act.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {act.status}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1">{formatDate(act.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email Communication History */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-500" />
            <span>Emails Sent via Resend</span>
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
            {emails.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No emails sent to this customer.</p>
            ) : (
              emails.map((em) => (
                <div
                  key={em.id}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white truncate max-w-[220px]">{em.subject}</p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                      {em.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono">{formatDate(em.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
