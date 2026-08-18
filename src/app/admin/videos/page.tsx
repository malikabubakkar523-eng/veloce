import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminVideosManager } from "@/components/admin/AdminVideosManager";

export const metadata: Metadata = {
  title: "Cinematic Videos Manager | VELOCE Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminVideosPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/videos");
  }

  const rawVideos = await db.homeVideo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const videos = rawVideos.map((v) => ({
    id: v.id,
    title: v.title,
    subtitle: v.subtitle,
    badge: v.badge,
    videoUrl: v.videoUrl,
    posterUrl: v.posterUrl,
    ctaText: v.ctaText,
    ctaLink: v.ctaLink,
    secondaryCtaText: v.secondaryCtaText,
    secondaryCtaLink: v.secondaryCtaLink,
    specs: v.specs,
    order: v.order,
    isActive: v.isActive,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  return <AdminVideosManager initialVideos={videos} />;
}
