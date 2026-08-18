import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES } from "@/lib/utils";
import { AdminOrderStatusUpdater } from "@/components/admin/AdminOrderStatusUpdater";
import { ArrowLeft, Package, User, MapPin, CreditCard } from "lucide-react";

export const revalidate = 0;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let order: any = null;
  try {
    order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
  } catch (error) {
    console.warn("⚠️ AdminOrderDetailPage fallback:", error);
  }

  if (!order) {
    notFound();
  }

  let address: any = {};
  try {
    address = JSON.parse(order.shippingAddress);
  } catch (e) {
    address = { street: order.shippingAddress };
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            ORDER DETAILS
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items & Customer Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Items */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ordered Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {(order.items || []).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-900 p-1 shrink-0 flex items-center justify-center">
                    {item.productImage && (
                      <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-contain" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                    <p className="text-[11px] text-zinc-500">EU {item.size} • Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold font-mono text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-4 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-brand-400">
                  <span>Discount</span>
                  <span className="font-mono">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono text-white">{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-mono text-white">{formatPrice(order.tax)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm text-white">
                <span>Total Amount</span>
                <span className="font-mono">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer & Shipping Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Customer</p>
                <p className="font-bold text-white">{order.customerName}</p>
                <p className="text-zinc-400">{order.customerEmail}</p>
                {order.customerPhone && <p className="text-zinc-400">{order.customerPhone}</p>}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Destination</p>
                <p className="text-zinc-300">{address.street}</p>
                <p className="text-zinc-300">{address.city}, {address.state} {address.postalCode}</p>
                <p className="text-zinc-300">{address.country || "US"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Updater Form */}
        <div className="lg:col-span-5 space-y-6">
          <AdminOrderStatusUpdater
            orderId={order.id}
            currentStatus={order.orderStatus}
            currentPaymentStatus={order.paymentStatus}
            currentTrackingNumber={order.trackingNumber}
            currentNotes={order.notes}
          />
        </div>
      </div>
    </div>
  );
}
