import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FavoriteShoesOnboardingClient } from "@/components/auth/FavoriteShoesOnboardingClient";

export const metadata: Metadata = {
  title: "Personalize Your Style | VELOCE",
  description: "Select your favorite shoe categories to calibrate your neural style recommendations.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OnboardingPage() {
  const session = await getSession();

  // If user is not logged in, redirect to login
  if (!session?.id) {
    redirect("/login?callbackUrl=/onboarding");
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      isOnboarded: true,
      preferredCategories: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // If already onboarded or skipped, send directly to homepage
  if (user.isOnboarded) {
    redirect("/");
  }

  return <FavoriteShoesOnboardingClient userName={user.name} />;
}
