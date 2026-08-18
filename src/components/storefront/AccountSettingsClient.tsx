"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { User, Lock, Bell, Check, Shield, Camera, Mail, Sparkles, Brain } from "lucide-react";

interface AccountSettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    preferredCategories?: string[];
    referralSource?: string | null;
  };
}

const SETTINGS_SHOE_TYPES = [
  { id: "sneakers", label: "Sneakers" },
  { id: "running", label: "Running" },
  { id: "sports", label: "Sports" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "formal", label: "Formal" },
  { id: "boots", label: "Boots" },
];

const SETTINGS_REFERRAL_OPTIONS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "Google",
  "YouTube",
  "Friend / Family",
  "Advertisement",
  "Other",
];

export function AccountSettingsClient({ user }: AccountSettingsClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "ai_preferences">("profile");

  // Profile info state
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // AI Preferences state
  const [preferredCategories, setPreferredCategories] = useState<string[]>(
    user.preferredCategories && user.preferredCategories.length > 0 ? user.preferredCategories : ["running", "sneakers"]
  );
  const [referralSource, setReferralSource] = useState<string>(user.referralSource || "Instagram");
  const [savingAiPrefs, setSavingAiPrefs] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications state
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [dealNotifs, setDealNotifs] = useState(true);
  const [promoEmails, setPromoEmails] = useState(true);
  const [savingNotifs, setSavingNotifs] = useState(false);

  React.useEffect(() => {
    fetch("/api/account/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences) {
          setOrderNotifs(data.preferences.orderNotifs);
          setDealNotifs(data.preferences.dealNotifs);
          setPromoEmails(data.preferences.promoEmails);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleAiCategory = (id: string) => {
    if (preferredCategories.includes(id)) {
      if (preferredCategories.length === 1) {
        toast({ title: "Please keep at least 1 preference selected", type: "info" });
        return;
      }
      setPreferredCategories(preferredCategories.filter((c) => c !== id));
    } else {
      setPreferredCategories([...preferredCategories, id]);
    }
  };

  const handleSaveAiPreferences = async () => {
    setSavingAiPrefs(true);
    try {
      const res = await fetch("/api/account/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCategories, referralSource }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "AI Preferences Updated",
          description: "Your personalized recommendations will now prioritize these silhouettes.",
          type: "success",
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("veloce:wishlist-changed", { detail: { productIds: [] } }));
        }
      } else {
        toast({ title: "Error", description: "Failed to save AI preferences.", type: "error" });
      }
    } catch (e) {
      toast({ title: "Network Error", type: "error" });
    } finally {
      setSavingAiPrefs(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNotifs, dealNotifs, promoEmails }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Preferences Saved", description: "Your notification settings have been updated.", type: "success" });
      } else {
        toast({ title: "Error", description: "Failed to save preferences.", type: "error" });
      }
    } catch (e) {
      toast({ title: "Network Error", type: "error" });
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatar }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Profile Updated", description: "Your details have been saved.", type: "success" });
      } else {
        toast({ title: "Error", description: data.error || "Failed to update profile.", type: "error" });
      }
    } catch (err) {
      toast({ title: "Network error", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      const res = await fetch("/api/account/change-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Email Changed Successfully", description: `Updated to ${data.email}`, type: "success" });
        setNewEmail("");
        setEmailPassword("");
      } else {
        toast({ title: "Failed to update email", description: data.error, type: "error" });
      }
    } catch (err) {
      toast({ title: "Network error", type: "error" });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Passwords do not match", type: "error" });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Password Changed Successfully", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast({ title: "Password update failed", description: data.error, type: "error" });
      }
    } catch (err) {
      toast({ title: "Network error", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Settings Navigation Tabs */}
      <div className="space-y-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "profile"
              ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
              : "bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/60"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Avatar</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "security"
              ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
              : "bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/60"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "notifications"
              ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
              : "bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/60"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_preferences")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "ai_preferences"
              ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
              : "bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/60"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>AI Style Preferences</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="lg:col-span-3 space-y-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Profile Avatar & Details */}
            <form
              onSubmit={handleUpdateProfile}
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Public Patron Profile
              </h3>

              {/* Avatar Preview */}
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt={name} fill className="object-cover" />
                  ) : (
                    <span>{name.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Profile Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => {
                      setAvatar(e.target.value);
                      setAvatarPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Paste an image URL or leave empty to use initial letters.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Contact Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {savingProfile ? "Saving Details..." : "Save Profile Details"}
              </button>
            </form>

            {/* Change Email Form */}
            <form
              onSubmit={handleUpdateEmail}
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Update Account Email
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Current Email: <span className="text-white font-mono font-bold">{user.email}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new-email@domain.com"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Confirm with Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingEmail}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {savingEmail ? "Verifying & Updating..." : "Change Email Address"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <form
            onSubmit={handleUpdatePassword}
            className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6"
          >
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Change Password
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Ensure your account is using a long, secure passphrase.
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {savingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        {activeTab === "notifications" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Notification Preferences
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Customize which alerts and Resend emails you receive.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-zinc-800">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-bold text-white">Order Status & Tracking Updates</p>
                  <p className="text-[11px] text-zinc-400">
                    Receive live Resend emails and in-app notifications on courier milestones.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={orderNotifs}
                  onChange={(e) => setOrderNotifs(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-xs font-bold text-white">Private VIP Drops & Flash Deals</p>
                  <p className="text-[11px] text-zinc-400">
                    Get first allocation priority on limited carbon propulsion drops.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={dealNotifs}
                  onChange={(e) => setDealNotifs(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-xs font-bold text-white">Editorial Newsletter & Atelier Stories</p>
                  <p className="text-[11px] text-zinc-400">
                    Monthly publications on Tuscan leathercraft and performance shoe engineering.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={promoEmails}
                  onChange={(e) => setPromoEmails(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={savingNotifs}
              onClick={handleSaveNotifications}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {savingNotifs ? "Saving Preferences..." : "Save Notification Preferences"}
            </button>
          </div>
        )}

        {activeTab === "ai_preferences" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 text-white">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Style Calibration</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Footwear & Style Preferences
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Customize your shoe preferences to tune the neural recommendation engine on the homepage.
              </p>
            </div>

            {/* Category Preferences */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">
                What type of shoes do you like? (Multi-select)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SETTINGS_SHOE_TYPES.map((shoe) => {
                  const isSelected = preferredCategories.includes(shoe.id);
                  return (
                    <button
                      key={shoe.id}
                      type="button"
                      onClick={() => handleToggleAiCategory(shoe.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <span>{shoe.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Referral Source */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <label className="block text-xs font-semibold text-zinc-300">
                How did you hear about Veloce?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SETTINGS_REFERRAL_OPTIONS.map((opt) => {
                  const isSelected = referralSource === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setReferralSource(opt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={savingAiPrefs}
                onClick={handleSaveAiPreferences}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {savingAiPrefs ? "Updating Recommendations..." : "Save AI Style Preferences"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
