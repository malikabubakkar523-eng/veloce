import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItemType {
  productId: string;
  name: string;
  slug: string;
  brandName?: string;
  price: number;
  salePrice?: number | null;
  image: string;
  rating?: number;
}

interface WishlistStore {
  items: WishlistItemType[];
  addItem: (item: WishlistItemType) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: WishlistItemType) => void;
  clearWishlist: () => void;
  syncWithDatabase: () => Promise<void>;
}

// Helper to notify active AI recommendation feeds that preferences changed
function notifyWishlistChanged(items: WishlistItemType[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("veloce:wishlist-changed", {
        detail: { productIds: items.map((i) => i.productId), count: items.length },
      })
    );
  }
}

// Helper to sync single item mutation with backend
function syncItemBackend(productId: string, action: "add" | "remove") {
  if (typeof window !== "undefined") {
    fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, action }),
    }).catch(() => null);
  }
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().items.some((i) => i.productId === item.productId)) {
          const newItems = [...get().items, item];
          set({ items: newItems });
          notifyWishlistChanged(newItems);
          syncItemBackend(item.productId, "add");
        }
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((i) => i.productId !== productId);
        set({ items: newItems });
        notifyWishlistChanged(newItems);
        syncItemBackend(productId, "remove");
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      clearWishlist: () => {
        set({ items: [] });
        notifyWishlistChanged([]);
      },

      syncWithDatabase: async () => {
        try {
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.items) && data.items.length > 0) {
              // Merge remote and local items
              const localMap = new Map(get().items.map((i) => [i.productId, i]));
              for (const remoteItem of data.items) {
                localMap.set(remoteItem.productId, remoteItem);
              }
              const merged = Array.from(localMap.values());
              set({ items: merged });
              notifyWishlistChanged(merged);
            } else if (get().items.length > 0) {
              // Push local items to DB if DB is empty
              fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "sync",
                  productIds: get().items.map((i) => i.productId),
                }),
              }).catch(() => null);
            }
          }
        } catch (e) {
          // ignore offline/network errors
        }
      },
    }),
    {
      name: "veloce-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
