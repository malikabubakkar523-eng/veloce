import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendDealEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = params;
    const deal = await db.deal.findUnique({
      where: { id },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found." }, { status: 404 });
    }

    // Fetch active customers
    const customers = await db.user.findMany({
      where: {
        role: "CUSTOMER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        dealNotifs: true,
        promoEmails: true,
      },
    });

    if (customers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active customers to notify.",
        stats: { targeted: 0, inAppSent: 0, emailSent: 0, emailFailed: 0 },
      });
    }

    // Fetch existing logs for this deal to prevent duplicate sends
    const existingLogs = await db.dealNotificationLog.findMany({
      where: { dealId: id },
    });

    const loggedInAppUserIds = new Set(
      existingLogs.filter((l) => l.channel === "IN_APP" && l.userId).map((l) => l.userId)
    );
    const loggedEmailUserIds = new Set(
      existingLogs.filter((l) => l.channel === "EMAIL" && l.status === "SENT" && l.userId).map((l) => l.userId)
    );

    let inAppSent = 0;
    let emailSent = 0;
    let emailFailed = 0;

    // 1. IN-APP NOTIFICATIONS (Safe & De-duplicated)
    const inAppCustomersToNotify = customers.filter(
      (c) => c.dealNotifs !== false && !loggedInAppUserIds.has(c.id)
    );

    if (inAppCustomersToNotify.length > 0) {
      // Create in-app notifications
      await db.notification.createMany({
        data: inAppCustomersToNotify.map((c) => ({
          userId: c.id,
          title: `Deal Available: ${deal.title}`,
          message: "A new deal is available on a shoe you like.",
          type: "DEAL",
          dealId: deal.id,
          isRead: false,
        })),
      });

      // Record in DealNotificationLog
      await db.dealNotificationLog.createMany({
        data: inAppCustomersToNotify.map((c) => ({
          dealId: deal.id,
          userId: c.id,
          channel: "IN_APP",
          status: "SENT",
        })),
      });

      inAppSent = inAppCustomersToNotify.length;
    }

    // 2. EMAIL NOTIFICATIONS (Dispatched Asynchronously / Server-Side)
    const emailCustomersToNotify = customers.filter(
      (c) => c.promoEmails !== false && !loggedEmailUserIds.has(c.id)
    );

    for (const customer of emailCustomersToNotify) {
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

        if (result.success) {
          emailSent++;
        } else {
          emailFailed++;
        }

        // Log to DealNotificationLog
        await db.dealNotificationLog.create({
          data: {
            dealId: deal.id,
            userId: customer.id,
            channel: "EMAIL",
            status,
            error: errorMsg,
          },
        });

        // Also log to general EmailLog table
        await db.emailLog.create({
          data: {
            recipientEmail: customer.email,
            recipientName: customer.name,
            subject: `🔥 New VELOCE Drop: ${deal.title}`,
            message: deal.subtitle || "Promotional Deal Campaign",
            type: "PROMOTION",
            status: status === "SENT" ? "SENT" : "FAILED",
            resendId: result.id || null,
            error: errorMsg,
            sender: "VELOCE Atelier",
          },
        });
      } catch (err: any) {
        emailFailed++;
        await db.dealNotificationLog.create({
          data: {
            dealId: deal.id,
            userId: customer.id,
            channel: "EMAIL",
            status: "FAILED",
            error: err?.message || "Send error",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Deal notifications dispatched successfully.",
      stats: {
        targeted: customers.length,
        inAppSent,
        emailSent,
        emailFailed,
      },
    });
  } catch (error: any) {
    console.error("Deal notification dispatch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch notifications." },
      { status: 500 }
    );
  }
}
