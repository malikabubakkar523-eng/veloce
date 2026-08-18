import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendDealEmail } from "@/lib/email";
import { broadcastContentUpdate } from "@/lib/sync";

export const dynamic = "force-dynamic";

// Helper to auto-generate coupon codes if none provided
function generateDealCouponCode(title: string, discountPercent?: number | null, fixedDiscount?: number | null): string {
  let keyword = "DEAL";
  const clean = (title || "").toUpperCase();
  if (clean.includes("RUN")) keyword = "RUN";
  else if (clean.includes("SNEAK")) keyword = "SNKR";
  else if (clean.includes("SPORT") || clean.includes("TRAIN") || clean.includes("GYM")) keyword = "SPORT";
  else if (clean.includes("BOOT")) keyword = "BOOT";
  else if (clean.includes("FORMAL") || clean.includes("LOAFER")) keyword = "FORMAL";
  else if (clean.includes("SUMMER")) keyword = "SUMMER";
  else if (clean.includes("WINTER")) keyword = "WINTER";
  else if (clean.includes("FLASH")) keyword = "FLASH";
  else if (clean.includes("VIP") || clean.includes("MEMBER")) keyword = "VIP";
  else {
    const words = clean.replace(/[^A-Z\s]/g, "").split(/\s+/).filter((w) => w && w !== "OFF" && w !== "PERCENT" && w !== "THE" && w !== "AND");
    if (words.length > 0) {
      keyword = words[0].slice(0, 5);
    }
  }

  const num = discountPercent ? String(discountPercent) : fixedDiscount ? String(fixedDiscount) : "20";
  return `VELOCE-${keyword}${num}`.toUpperCase();
}

// Background notification worker function
async function dispatchDealNotifications(dealId: string) {
  try {
    const deal = await db.deal.findUnique({ where: { id: dealId } });
    if (!deal || !deal.isNotificationEnabled) return;

    // Fetch active customers with their wishlist and preferences
    const customers = await db.user.findMany({
      where: { role: "CUSTOMER", status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        dealNotifs: true,
        promoEmails: true,
        preferredCategories: true,
        wishlist: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (customers.length === 0) return;

    // Check existing logs to prevent duplicate sends
    const existingLogs = await db.dealNotificationLog.findMany({
      where: { dealId },
    });

    const loggedInApp = new Set(
      existingLogs.filter((l) => l.channel === "IN_APP" && l.userId).map((l) => l.userId)
    );
    const loggedEmail = new Set(
      existingLogs.filter((l) => l.channel === "EMAIL" && l.status === "SENT" && l.userId).map((l) => l.userId)
    );

    // Filter customers who have favorited shoes or onboarding preferences relevant to this deal
    const dealText = `${deal.title} ${deal.subtitle || ""} ${deal.badge || ""}`.toLowerCase();
    const targetedCustomers = customers.filter((c) => {
      // Check wishlist categories
      const hasWishlistMatch = c.wishlist.some((w) => {
        const cat = (w.product?.category?.name || "").toLowerCase();
        const pName = (w.product?.name || "").toLowerCase();
        return dealText.includes(cat) || dealText.includes(pName);
      });

      // Check onboarding category preferences
      const hasPrefMatch = (c.preferredCategories || []).some((pref) =>
        dealText.includes(pref.toLowerCase())
      );

      // If user has matches or if deal is a general site-wide promotion
      return hasWishlistMatch || hasPrefMatch || c.wishlist.length > 0 || customers.length <= 10;
    });

    const finalCustomers = targetedCustomers.length > 0 ? targetedCustomers : customers;

    // 1. In-App Notifications
    const inAppCustomers = finalCustomers.filter(
      (c) => c.dealNotifs !== false && !loggedInApp.has(c.id)
    );

    if (inAppCustomers.length > 0) {
      await db.notification.createMany({
        data: inAppCustomers.map((c) => ({
          userId: c.id,
          title: `Deal Available: ${deal.title}`,
          message: "A new deal is available on a shoe you like.",
          type: "DEAL",
          dealId: deal.id,
          isRead: false,
        })),
      });

      await db.dealNotificationLog.createMany({
        data: inAppCustomers.map((c) => ({
          dealId: deal.id,
          userId: c.id,
          channel: "IN_APP",
          status: "SENT",
        })),
      });
    }

    // 2. Email Notifications (Resend)
    const emailCustomers = finalCustomers.filter(
      (c) => c.promoEmails !== false && !loggedEmail.has(c.id)
    );

    for (const customer of emailCustomers) {
      try {
        const result = await sendDealEmail({
          recipientEmail: customer.email,
          recipientName: customer.name,
          deal: {
            id: deal.id,
            title: deal.title,
            subtitle: deal.subtitle,
            badge: deal.badge,
            bannerImage: deal.bannerImage,
            discountPercent: deal.discountPercent,
            fixedDiscount: deal.fixedDiscount,
            endDate: deal.endDate,
          },
        });

        const status = result.success ? "SENT" : "FAILED";
        const errorMsg = result.error ? String(result.error) : null;

        await db.dealNotificationLog.create({
          data: {
            dealId: deal.id,
            userId: customer.id,
            channel: "EMAIL",
            status,
            error: errorMsg,
          },
        });

        await db.emailLog.create({
          data: {
            recipientEmail: customer.email,
            recipientName: customer.name,
            subject: `🔥 New Deal Available: ${deal.title}`,
            message: deal.subtitle || "A new deal is available on a shoe you like.",
            type: "PROMOTION",
            status: status === "SENT" ? "SENT" : "FAILED",
            resendId: result.id || null,
            error: errorMsg,
            sender: "VELOCE Atelier",
          },
        });
      } catch (err: any) {
        await db.dealNotificationLog.create({
          data: {
            dealId: deal.id,
            userId: customer.id,
            channel: "EMAIL",
            status: "FAILED",
            error: err?.message || "Delivery error",
          },
        });
      }
    }
  } catch (err) {
    console.error("Background deal notification error:", err);
  }
}

export async function GET() {
  try {
    const deals = await db.deal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, deals });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deals." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const {
      title,
      subtitle,
      badge,
      discountPercent,
      fixedDiscount,
      couponCode,
      startDate,
      endDate,
      isActive,
      isNotificationEnabled,
      bannerImage,
    } = await req.json();

    if (!title || !endDate) {
      return NextResponse.json({ error: "Title and end date are required." }, { status: 400 });
    }

    // Determine coupon code: use provided or auto-generate
    const finalCouponCode = (
      couponCode ||
      generateDealCouponCode(title, discountPercent, fixedDiscount)
    ).trim().toUpperCase();

    const deal = await db.deal.create({
      data: {
        title,
        subtitle: subtitle || "",
        badge: badge || "LIMITED OFFER",
        discountPercent: discountPercent !== undefined && discountPercent !== null ? Number(discountPercent) : 20,
        fixedDiscount: fixedDiscount !== undefined && fixedDiscount !== null ? Number(fixedDiscount) : null,
        couponCode: finalCouponCode,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isNotificationEnabled: Boolean(isNotificationEnabled),
        bannerImage:
          bannerImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      },
    });

    // Auto-create/upsert the corresponding coupon in the Coupon table so customers can apply it at checkout
    if (finalCouponCode) {
      try {
        await db.coupon.upsert({
          where: { code: finalCouponCode },
          update: {
            discountType: discountPercent ? "PERCENTAGE" : "FIXED",
            discountValue: Number(discountPercent || fixedDiscount || 20),
            expiresAt: new Date(endDate),
            isActive: Boolean(deal.isActive),
            description: `Promotional coupon for deal: ${deal.title}`,
          },
          create: {
            code: finalCouponCode,
            discountType: discountPercent ? "PERCENTAGE" : "FIXED",
            discountValue: Number(discountPercent || fixedDiscount || 20),
            expiresAt: new Date(endDate),
            isActive: Boolean(deal.isActive),
            description: `Promotional coupon for deal: ${deal.title}`,
          },
        });
      } catch (couponErr) {
        console.error("Failed to upsert deal coupon:", couponErr);
      }
    }

    broadcastContentUpdate("DEAL");

    // Trigger asynchronous notification dispatch if enabled
    if (deal.isNotificationEnabled) {
      dispatchDealNotifications(deal.id).catch((e) =>
        console.error("Async notification dispatch trigger failed:", e)
      );
    }

    return NextResponse.json({
      success: true,
      deal,
      message: deal.isNotificationEnabled
        ? "Deal published successfully. Notification delivery started."
        : "Deal published successfully.",
    });
  } catch (error) {
    console.error("Deal creation error", error);
    return NextResponse.json({ error: "Failed to create deal." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Deal ID required." }, { status: 400 });

    const body = await req.json();
    const {
      title,
      subtitle,
      badge,
      discountPercent,
      fixedDiscount,
      couponCode,
      startDate,
      endDate,
      isActive,
      isNotificationEnabled,
      bannerImage,
    } = body;

    const finalCouponCode = couponCode ? couponCode.trim().toUpperCase() : undefined;

    const updated = await db.deal.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(badge !== undefined && { badge }),
        ...(discountPercent !== undefined && { discountPercent: Number(discountPercent) }),
        ...(fixedDiscount !== undefined && { fixedDiscount: Number(fixedDiscount) }),
        ...(finalCouponCode !== undefined && { couponCode: finalCouponCode }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isNotificationEnabled !== undefined && { isNotificationEnabled: Boolean(isNotificationEnabled) }),
        ...(bannerImage !== undefined && { bannerImage }),
      },
    });

    // Update coupon table if code exists
    if (updated.couponCode) {
      try {
        await db.coupon.upsert({
          where: { code: updated.couponCode },
          update: {
            discountType: updated.discountPercent ? "PERCENTAGE" : "FIXED",
            discountValue: Number(updated.discountPercent || updated.fixedDiscount || 20),
            expiresAt: new Date(updated.endDate),
            isActive: Boolean(updated.isActive),
            description: `Promotional coupon for deal: ${updated.title}`,
          },
          create: {
            code: updated.couponCode,
            discountType: updated.discountPercent ? "PERCENTAGE" : "FIXED",
            discountValue: Number(updated.discountPercent || updated.fixedDiscount || 20),
            expiresAt: new Date(updated.endDate),
            isActive: Boolean(updated.isActive),
            description: `Promotional coupon for deal: ${updated.title}`,
          },
        });
      } catch (couponErr) {
        console.error("Failed to sync updated deal coupon:", couponErr);
      }
    }

    broadcastContentUpdate("DEAL");

    return NextResponse.json({ success: true, deal: updated });
  } catch (error) {
    console.error("Deal update error", error);
    return NextResponse.json({ error: "Failed to update deal." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Deal ID required." }, { status: 400 });

    const deal = await db.deal.findUnique({ where: { id } });
    if (deal?.couponCode) {
      try {
        await db.coupon.update({
          where: { code: deal.couponCode },
          data: { isActive: false },
        });
      } catch (e) {}
    }

    await db.deal.delete({ where: { id } });

    broadcastContentUpdate("DEAL");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete deal." }, { status: 500 });
  }
}
