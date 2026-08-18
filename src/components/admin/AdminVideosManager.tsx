"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  Layers,
  ArrowRight,
  MoveUp,
  MoveDown,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface HomeVideoItem {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  videoUrl: string;
  posterUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  secondaryCtaText: string | null;
  secondaryCtaLink: string | null;
  specs: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminVideosManagerProps {
  initialVideos: HomeVideoItem[];
}

export function AdminVideosManager({ initialVideos }: AdminVideosManagerProps) {
  const { toast } = useToast();
  const [videos, setVideos] = useState<HomeVideoItem[]>(initialVideos);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HomeVideoItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("CINEMATIC FOOTWEAR ATELIER");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [ctaText, setCtaText] = useState("EXPLORE COLLECTION");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [secondaryCtaText, setSecondaryCtaText] = useState("View In Lookbook");
  const [secondaryCtaLink, setSecondaryCtaLink] = useState("/gallery");
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Live Video Preview modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingVideo(null);
    setTitle("");
    setSubtitle("Witness high-performance footwear engineered for relentless velocity. Every stride captured with Italian precision and carbon propulsion mechanics.");
    setBadge("CINEMATIC FOOTWEAR ATELIER");
    setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-athlete-getting-ready-to-run-on-the-track-42525-large.mp4");
    setPosterUrl("https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&q=85");
    setCtaText("EXPLORE COLLECTION");
    setCtaLink("/shop");
    setSecondaryCtaText("View In Lookbook");
    setSecondaryCtaLink("/gallery");
    setOrder(videos.length);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (v: HomeVideoItem) => {
    setEditingVideo(v);
    setTitle(v.title);
    setSubtitle(v.subtitle || "");
    setBadge(v.badge || "CINEMATIC FOOTWEAR ATELIER");
    setVideoUrl(v.videoUrl);
    setPosterUrl(v.posterUrl || "");
    setCtaText(v.ctaText || "EXPLORE COLLECTION");
    setCtaLink(v.ctaLink || "/shop");
    setSecondaryCtaText(v.secondaryCtaText || "View In Lookbook");
    setSecondaryCtaLink(v.secondaryCtaLink || "/gallery");
    setOrder(v.order);
    setIsActive(v.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      toast({ title: "Title and Video URL are required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      if (editingVideo) {
        // Update existing
        const res = await fetch(`/api/admin/videos/${editingVideo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subtitle,
            badge,
            videoUrl,
            posterUrl,
            ctaText,
            ctaLink,
            secondaryCtaText,
            secondaryCtaLink,
            order,
            isActive,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setVideos((prev) =>
            prev.map((item) => (item.id === editingVideo.id ? data.video : item))
          );
          toast({ title: "Video Updated", description: "Homepage video showcase updated successfully.", type: "success" });
          setIsModalOpen(false);
        } else {
          toast({ title: "Error", description: data.error || "Failed to update video.", type: "error" });
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subtitle,
            badge,
            videoUrl,
            posterUrl,
            ctaText,
            ctaLink,
            secondaryCtaText,
            secondaryCtaLink,
            order,
            isActive,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setVideos((prev) => [...prev, data.video]);
          toast({ title: "Video Added", description: "New homepage video created successfully.", type: "success" });
          setIsModalOpen(false);
        } else {
          toast({ title: "Error", description: data.error || "Failed to add video.", type: "error" });
        }
      }
    } catch (err) {
      toast({ title: "Network Error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (v: HomeVideoItem) => {
    const nextStatus = !v.isActive;
    try {
      const res = await fetch(`/api/admin/videos/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      if (res.ok) {
        setVideos((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, isActive: nextStatus } : item))
        );
        toast({
          title: nextStatus ? "Video Activated" : "Video Paused",
          description: nextStatus ? "Video is now visible on the homepage." : "Video is hidden from storefront.",
          type: "info",
        });
      }
    } catch (e) {
      toast({ title: "Failed to toggle status", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVideos((prev) => prev.filter((item) => item.id !== id));
        toast({ title: "Video Deleted", description: "Showcase video removed from homepage.", type: "success" });
        setDeleteConfirmId(null);
      } else {
        toast({ title: "Error deleting video", type: "error" });
      }
    } catch (e) {
      toast({ title: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>Storefront Motion Media</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
            Homepage Cinematic Videos Manager
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage, upload, edit, and reorder high-performance athletic video showcases displayed on the Veloce homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video Showcase</span>
        </button>
      </div>

      {/* Videos List Grid */}
      {videos.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-zinc-900/50 border border-zinc-800 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <Film className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Homepage Videos Configured</h3>
          <p className="text-xs text-zinc-400">
            Click &quot;Add New Video Showcase&quot; above to create your first dynamic cinematic video hero on the homepage.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Video</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {videos.map((v, index) => (
            <div
              key={v.id}
              className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700 shadow-xl"
            >
              {/* Media Preview Player */}
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden group">
                {v.posterUrl ? (
                  <Image
                    src={v.posterUrl}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    <Film className="w-12 h-12" />
                  </div>
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Play Button Trigger for Modal Preview */}
                <button
                  type="button"
                  onClick={() => setPreviewVideoUrl(v.videoUrl)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-zinc-950/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-brand-500/90 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                </button>

                {/* Top Badge & Status */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  {v.badge && (
                    <span className="px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-brand-400 text-[10px] font-bold tracking-wider uppercase border border-zinc-800">
                      {v.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(v);
                    }}
                    className={`pointer-events-auto px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors ${
                      v.isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${v.isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                    <span>{v.isActive ? "ACTIVE" : "PAUSED"}</span>
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono text-[10px] font-bold">
                      Order: #{v.order}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                      {v.title}
                    </h3>
                  </div>

                  {v.subtitle && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {v.subtitle}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span className="truncate max-w-[200px] text-zinc-500">
                      URL: {v.videoUrl}
                    </span>
                    <span className="text-brand-500 font-bold">
                      CTA: {v.ctaText || "Explore"} →
                    </span>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(v)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewVideoUrl(v.videoUrl)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(v.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-500" />
                <span>{editingVideo ? "Edit Homepage Video Showcase" : "Add New Homepage Video"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Showcase Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. THE ART OF VELOCE: MOTION & MASTERY"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Subtitle / Story Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Witness high-performance footwear engineered for relentless velocity..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category / Atelier Badge
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="CINEMATIC FOOTWEAR ATELIER"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Video Stream / MP4 URL *
                </label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://assets.mixkit.co/videos/preview/...mp4"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Poster Image Fallback URL
                </label>
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="EXPLORE COLLECTION"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/shop"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-zinc-200 cursor-pointer">
                  Activate Video on Storefront Immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingVideo ? "Update Video" : "Create Video"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 text-white shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Video Showcase?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove this video from the homepage? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            >
              ✕
            </button>
            <div className="relative aspect-video w-full bg-black">
              <video
                src={previewVideoUrl}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
