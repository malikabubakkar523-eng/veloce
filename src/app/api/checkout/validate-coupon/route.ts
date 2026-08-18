import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    let coupon = await db.coupon.findUnique({
      where: { code: cleanCode },
    });

    // If not found in Coupon table, check if it is an active Deal couponCode
    if (!coupon) {
      const activeDeal = await db.deal.findFirst({
        where: {
          couponCode: cleanCode,
          isActive: true,
          endDate: { gt: new Date() },
        },
      });

      if (activeDeal) {
        coupon = {
          id: activeDeal.id,
          code: activeDeal.couponCode || cleanCode,
          description: activeDeal.title,
          discountType: activeDeal.discountPercent ? "PERCENTAGE" : "FIXED",
          discountValue: activeDeal.discountPercent || activeDeal.fixedDiscount || 20,
          minOrderAmount: null,
          maxDiscount: null,
          usageLimit: null,
          usedCount: 0,
          expiresAt: activeDeal.endDate,
          isActive: activeDeal.isActive,
          createdAt: activeDeal.createdAt,
          updatedAt: activeDeal.updatedAt,
        };
      }
    }

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or inactive coupon code." }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon usage limit has been reached." }, { status: 400 });
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount for this coupon is ${formatPrice(coupon.minOrderAmount)}.` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("Coupon validation error", error);
    return NextResponse.json({ error: "Failed to validate coupon." }, { status: 500 });
  }
}
