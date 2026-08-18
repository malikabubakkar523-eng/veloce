export interface ProductFeature {
  id: string;
  name: string;
  slug: string;
  description?: string;
  details?: string | null;
  price: number;
  salePrice?: number | null;
  categoryId: string;
  categoryName?: string;
  brandId?: string | null;
  brandName?: string | null;
  images: { url: string; isPrimary?: boolean }[];
  isNew?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  sku?: string;
}

export interface UserStyleVector {
  categoryAffinities: Record<string, number>; // e.g. { 'running': 0.6, 'sneakers': 0.4 }
  colorAffinities: Record<string, number>; // e.g. { 'black': 0.8, 'white': 0.2 }
  brandAffinities: Record<string, number>;
  avgPricePreference: number;
  favoriteProductIds: string[];
  topKeywords: string[];
}

export interface RecommendationMatch {
  product: ProductFeature;
  matchScore: number; // 0 to 100
  matchReasons: string[];
  primaryReason: string;
  isNewDropMatch?: boolean;
}

// Color keywords extracted from shoe titles, variants, and descriptions
const RECOGNIZED_COLORS = [
  "black",
  "white",
  "grey",
  "gray",
  "volt",
  "neon",
  "red",
  "blue",
  "green",
  "orange",
  "yellow",
  "pink",
  "purple",
  "brown",
  "tan",
  "gold",
  "silver",
  "carbon",
  "olive",
];

const TECHNICAL_KEYWORDS = [
  "carbon",
  "plate",
  "nitrogen",
  "foam",
  "marathon",
  "speed",
  "racing",
  "trail",
  "cushion",
  "leather",
  "handcrafted",
  "goodyear",
  "storm",
  "waterproof",
  "lightweight",
  "tempo",
  "propulsion",
  "aerodynamic",
];

/**
 * Extracts normalized color keywords from a product's name, description, and details.
 */
export function extractProductColors(product: ProductFeature): string[] {
  const text = `${product.name} ${product.description || ""} ${product.details || ""}`.toLowerCase();
  const detected = new Set<string>();

  for (const color of RECOGNIZED_COLORS) {
    // Check for exact word boundary
    const regex = new RegExp(`\\b${color}\\b`, "i");
    if (regex.test(text)) {
      detected.add(color);
    }
  }

  // Fallback defaults based on typical styles if none found
  if (detected.size === 0) {
    if (text.includes("dark") || text.includes("stealth") || text.includes("noir")) {
      detected.add("black");
    } else if (text.includes("bright") || text.includes("clean")) {
      detected.add("white");
    }
  }

  return Array.from(detected);
}

/**
 * Extracts performance and style keywords from a product.
 */
export function extractProductKeywords(product: ProductFeature): string[] {
  const text = `${product.name} ${product.description || ""} ${product.details || ""}`.toLowerCase();
  const detected = new Set<string>();

  for (const kw of TECHNICAL_KEYWORDS) {
    if (text.includes(kw)) {
      detected.add(kw);
    }
  }

  return Array.from(detected);
}

/**
 * Maps onboarding category keys to category names, database slugs, and keywords.
 */
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  running: ["running", "road racer", "marathon", "tempo", "supercritical", "carbon plate", "racer", "speed"],
  sneakers: ["sneakers", "sneaker", "streetwear", "lifestyle", "low-top", "high-top", "air", "retro"],
  sports: ["sports", "training & gym", "training", "basketball", "gym", "court", "athletic", "workout", "cross-trainer"],
  lifestyle: ["lifestyle", "casual & loafers", "casual", "sneakers", "everyday", "urban", "comfort", "retro"],
  formal: ["formal", "casual & loafers", "formal & loafers", "loafers", "blake welt", "leather", "dress", "oxford", "tread"],
  boots: ["boots", "rugged", "chelsea", "combat", "storm welt", "goodyear", "waterproof", "leather boot"],
};

/**
 * Returns matching affinity keys for a given product based on its category, name, and details.
 */
export function getProductCategoryAffinities(product: ProductFeature): string[] {
  const text = `${product.name} ${product.categoryName || ""} ${product.categoryId || ""} ${product.description || ""} ${product.details || ""}`.toLowerCase();
  const matched = new Set<string>();

  for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const syn of synonyms) {
      if (text.includes(syn)) {
        matched.add(key);
        break;
      }
    }
  }

  // Fallback to exact category name if nothing matched
  if (matched.size === 0 && product.categoryName) {
    matched.add(product.categoryName.toLowerCase());
  }

  return Array.from(matched);
}

/**
 * Builds a multi-dimensional AI style preference vector from a customer's favorited shoes and onboarding preferences.
 */
export function computeUserStyleVector(
  favoriteProducts: ProductFeature[],
  preferredCategories?: string[]
): UserStyleVector | null {
  const hasFavorites = favoriteProducts && favoriteProducts.length > 0;
  const hasOnboarding = preferredCategories && preferredCategories.length > 0;

  if (!hasFavorites && !hasOnboarding) {
    return null;
  }

  const categoryCounts: Record<string, number> = {};
  const colorCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};
  let totalPrice = 0;

  // 1. Process Favorited Shoes (Dynamic ongoing learning)
  if (hasFavorites) {
    for (const p of favoriteProducts) {
      totalPrice += p.price || 0;

      // Extract all matched affinity categories for the favorited shoe
      const matchedCats = getProductCategoryAffinities(p);
      for (const cat of matchedCats) {
        // High weight for explicit user favorites
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 3;
      }

      // Exact raw category name
      const rawCat = (p.categoryName || p.categoryId || "unknown").toLowerCase();
      categoryCounts[rawCat] = (categoryCounts[rawCat] || 0) + 2;

      // Brand weighting
      if (p.brandName) {
        const b = p.brandName.toLowerCase();
        brandCounts[b] = (brandCounts[b] || 0) + 2;
      }

      // Color weighting
      const colors = extractProductColors(p);
      for (const c of colors) {
        colorCounts[c] = (colorCounts[c] || 0) + 1.5;
      }

      // Technical keyword weighting
      const kws = extractProductKeywords(p);
      for (const kw of kws) {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      }
    }
  }

  // 2. Process Onboarding Preferred Categories (Inject strong baseline foundation)
  if (hasOnboarding && preferredCategories) {
    for (const rawCat of preferredCategories) {
      const cat = rawCat.toLowerCase();
      // Onboarding preference gives a solid baseline weight
      categoryCounts[cat] = (categoryCounts[cat] || 0) + (hasFavorites ? 2.5 : 4);

      // Also boost associated synonym tags
      const synonyms = CATEGORY_SYNONYMS[cat] || [];
      for (const syn of synonyms.slice(0, 2)) {
        categoryCounts[syn] = (categoryCounts[syn] || 0) + (hasFavorites ? 1 : 2);
      }
    }
  }

  const count = (favoriteProducts?.length || 0) * 2 + (preferredCategories?.length || 0) * 2;

  // Normalize affinities between 0 and 1
  const categoryAffinities: Record<string, number> = {};
  const totalCatSum = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
  for (const [cat, num] of Object.entries(categoryCounts)) {
    categoryAffinities[cat] = num / totalCatSum;
  }

  const colorAffinities: Record<string, number> = {};
  const totalColors = Object.values(colorCounts).reduce((a, b) => a + b, 0) || 1;
  for (const [col, num] of Object.entries(colorCounts)) {
    colorAffinities[col] = num / totalColors;
  }

  const brandAffinities: Record<string, number> = {};
  for (const [b, num] of Object.entries(brandCounts)) {
    brandAffinities[b] = num / Math.max(1, count);
  }

  // Extract top keywords sorted by frequency
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([kw]) => kw);

  return {
    categoryAffinities,
    colorAffinities,
    brandAffinities,
    avgPricePreference: totalPrice / Math.max(1, favoriteProducts?.length || 1),
    favoriteProductIds: (favoriteProducts || []).map((p) => p.id),
    topKeywords,
  };
}

/**
 * Computes the AI similarity match score between a customer's preference vector and a target product.
 * Returns a score between 0 and 100 with explainable rationale bullets.
 */
export function scoreProductSimilarity(
  product: ProductFeature,
  userVector: UserStyleVector
): { matchScore: number; matchReasons: string[]; primaryReason: string } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category & Style Match (Max 45 points)
  const matchedCats = getProductCategoryAffinities(product);
  const rawCat = (product.categoryName || product.categoryId || "").toLowerCase();
  if (!matchedCats.includes(rawCat) && rawCat) {
    matchedCats.push(rawCat);
  }

  let highestCatAffinity = 0;
  let matchedCatName = product.categoryName || "footwear";

  for (const c of matchedCats) {
    const aff = userVector.categoryAffinities[c] || 0;
    if (aff > highestCatAffinity) {
      highestCatAffinity = aff;
      matchedCatName = c.charAt(0).toUpperCase() + c.slice(1);
    }
  }

  if (highestCatAffinity > 0) {
    const catScore = Math.min(45, Math.round(highestCatAffinity * 55) + 15);
    score += catScore;
    reasons.push(`Matches your preference for ${product.categoryName || matchedCatName} footwear`);
  }

  // 2. Color Aesthetics Match (Max 25 points)
  const productColors = extractProductColors(product);
  let highestColorAffinity = 0;
  let matchedColor = "";
  for (const color of productColors) {
    const aff = userVector.colorAffinities[color] || 0;
    if (aff > highestColorAffinity) {
      highestColorAffinity = aff;
      matchedColor = color;
    }
  }

  if (highestColorAffinity > 0) {
    const colorScore = Math.min(25, Math.round(highestColorAffinity * 30));
    score += colorScore;
    reasons.push(`Aesthetic match: ${matchedColor.toUpperCase()} tone palette`);
  }

  // 3. Technical & Style Keyword Match (Max 20 points)
  const productKeywords = extractProductKeywords(product);
  const matchedKeywords = productKeywords.filter((kw) => userVector.topKeywords.includes(kw));
  if (matchedKeywords.length > 0) {
    const kwScore = Math.min(20, matchedKeywords.length * 10);
    score += kwScore;
    const kwList = matchedKeywords.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" & ");
    reasons.push(`Engineered with ${kwList} specifications you prefer`);
  }

  // 4. Brand Match (Max 10 points)
  if (product.brandName) {
    const bAff = userVector.brandAffinities[product.brandName.toLowerCase()] || 0;
    if (bAff > 0) {
      score += Math.round(bAff * 10);
      reasons.push(`${product.brandName} brand affinity`);
    }
  }

  // Base relevance boost for high-rated / popular / new shoes if some baseline similarity exists
  if (score > 15) {
    if (product.rating && product.rating >= 4.8) {
      score += 5;
    }
    if (product.isNew) {
      score += 5;
    }
    if (product.isFeatured) {
      score += 3;
    }
  }

  // Calibrate final score smoothly
  let finalScore = 0;
  if (score >= 25) {
    finalScore = Math.min(99, Math.max(78, Math.round(68 + (score / 100) * 32)));
  } else if (score > 0) {
    finalScore = Math.min(76, Math.max(55, Math.round(50 + score)));
  } else {
    finalScore = 45; // baseline
  }

  // Select the single most impactful primary reason
  let primaryReason = reasons[0] || "Curated based on your style profile";
  if (matchedColor && highestCatAffinity > 0) {
    primaryReason = `Matches your preference for ${matchedColor.toUpperCase()} ${product.categoryName || "performance"} silhouettes`;
  } else if (reasons.length > 0) {
    primaryReason = reasons[0];
  }

  return {
    matchScore: finalScore,
    matchReasons: reasons.length > 0 ? reasons : ["Curated recommendation"],
    primaryReason,
  };
}

/**
 * Generates personalized recommendation sets for a customer.
 */
export function generatePersonalizedRecommendations(
  catalogProducts: ProductFeature[],
  favoriteProducts: ProductFeature[],
  preferredCategories?: string[],
  options?: { limit?: number; newDropsLimit?: number }
): {
  recommendedForYou: RecommendationMatch[];
  newDropsForYou: RecommendationMatch[];
  learnedStyleSummary: string | null;
  topPreferredCategory: string | null;
  topPreferredColor: string | null;
} {
  const limit = options?.limit || 8;
  const newDropsLimit = options?.newDropsLimit || 4;

  const userVector = computeUserStyleVector(favoriteProducts, preferredCategories);

  // If user has no favorites yet, return curated trending/featured items
  if (!userVector) {
    const genericRecommendations: RecommendationMatch[] = catalogProducts
      .filter((p) => p.isFeatured || (p.rating && p.rating >= 4.8))
      .slice(0, limit)
      .map((p) => ({
        product: p,
        matchScore: 85,
        matchReasons: ["Trending Atelier Silhouette", "Verified High-Performance"],
        primaryReason: "Top rated across our global community",
      }));

    const genericNewDrops: RecommendationMatch[] = catalogProducts
      .filter((p) => p.isNew)
      .slice(0, newDropsLimit)
      .map((p) => ({
        product: p,
        matchScore: 88,
        matchReasons: ["Just Released SS26 Drop"],
        primaryReason: "Fresh drop from the Innovation Lab",
        isNewDropMatch: true,
      }));

    return {
      recommendedForYou: genericRecommendations,
      newDropsForYou: genericNewDrops,
      learnedStyleSummary: null,
      topPreferredCategory: null,
      topPreferredColor: null,
    };
  }

  // Find top preferred category and color
  const topCategory = Object.entries(userVector.categoryAffinities).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topColor = Object.entries(userVector.colorAffinities).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Build human-friendly learned style summary
  let learnedStyleSummary = "";
  if (topColor && topCategory) {
    learnedStyleSummary = `Learned Preference: ${topColor.toUpperCase()} ${topCategory.toUpperCase()} Footwear`;
  } else if (topCategory) {
    learnedStyleSummary = `Learned Preference: ${topCategory.toUpperCase()} Footwear`;
  } else {
    learnedStyleSummary = "Learned from your wishlisted silhouettes";
  }

  // Filter out products already in favorites to avoid recommending what they already wishlisted
  const unFavoritedCatalog = catalogProducts.filter(
    (p) => !userVector.favoriteProductIds.includes(p.id)
  );

  // Score all available catalog products
  const scoredProducts: RecommendationMatch[] = unFavoritedCatalog.map((product) => {
    const { matchScore, matchReasons, primaryReason } = scoreProductSimilarity(product, userVector);
    return {
      product,
      matchScore,
      matchReasons,
      primaryReason,
      isNewDropMatch: !!product.isNew,
    };
  });

  // Sort by match score descending
  scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

  // Recommended For You (Top N matches)
  const recommendedForYou = scoredProducts.slice(0, limit);

  // New Drops Matching Your Style (New shoes sorted by style match score)
  const newDropsForYou = scoredProducts
    .filter((match) => match.product.isNew && match.matchScore >= 65)
    .slice(0, newDropsLimit);

  return {
    recommendedForYou,
    newDropsForYou,
    learnedStyleSummary,
    topPreferredCategory: topCategory,
    topPreferredColor: topColor,
  };
}
