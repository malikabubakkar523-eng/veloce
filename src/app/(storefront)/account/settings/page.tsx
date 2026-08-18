import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountSettingsClient } from "@/components/storefront/AccountSettingsClient";

export const revalidate = 0;

export default async function AccountSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/account/settings");
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      preferredCategories: true,
      referralSource: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          PATRON SETTINGS
        </span>
        <h1 className="text-3xl font-display font-black text-white tracking-tight mt-1">
          Account Settings & Security
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal details, email credentials, security passphrases, and notification preferences.
        </p>
      </div>

      <AccountSettingsClient user={user} />
    </div>
  );
}
