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
 * Builds a multi-dimensional AI style preference vector from a customer's favorited shoes.
 */
export function computeUserStyleVector(favoriteProducts: ProductFeature[]): UserStyleVector | null {
  if (!favoriteProducts || favoriteProducts.length === 0) {
    return null;
  }

  const categoryCounts: Record<string, number> = {};
  const colorCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};
  let totalPrice = 0;

  for (const p of favoriteProducts) {
    totalPrice += p.price || 0;

    // Category weighting
    const cat = (p.categoryName || p.categoryId || "unknown").toLowerCase();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Brand weighting
    if (p.brandName) {
      const b = p.brandName.toLowerCase();
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    }

    // Color weighting
    const colors = extractProductColors(p);
    for (const c of colors) {
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    }

    // Technical keyword weighting
    const kws = extractProductKeywords(p);
    for (const kw of kws) {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    }
  }

  const count = favoriteProducts.length;

  // Normalize affinities between 0 and 1
  const categoryAffinities: Record<string, number> = {};
  for (const [cat, num] of Object.entries(categoryCounts)) {
    categoryAffinities[cat] = num / count;
  }

  const colorAffinities: Record<string, number> = {};
  const totalColors = Object.values(colorCounts).reduce((a, b) => a + b, 0) || 1;
  for (const [col, num] of Object.entries(colorCounts)) {
    colorAffinities[col] = num / totalColors;
  }

  const brandAffinities: Record<string, number> = {};
  for (const [b, num] of Object.entries(brandCounts)) {
    brandAffinities[b] = num / count;
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
    avgPricePreference: totalPrice / count,
    favoriteProductIds: favoriteProducts.map((p) => p.id),
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
  // If the product is already in the user's wishlist, exclude or score specially
  const isAlreadyFavorited = userVector.favoriteProductIds.includes(product.id);

  let score = 0;
  const reasons: string[] = [];

  // 1. Category Match (Max 40 points)
  const productCat = (product.categoryName || product.categoryId || "").toLowerCase();
  const catAffinity = userVector.categoryAffinities[productCat] || 0;
  if (catAffinity > 0) {
    const catScore = Math.round(catAffinity * 40);
    score += catScore;
    reasons.push(`Matches your love for ${product.categoryName || productCat} footwear`);
  }

  // 2. Color Aesthetics Match (Max 30 points)
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
    const colorScore = Math.round(highestColorAffinity * 30);
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

  // Base relevance boost for high-rated / popular shoes if some baseline similarity exists
  if (score > 15) {
    if (product.rating && product.rating >= 4.8) {
      score += 5;
    }
    if (product.isNew) {
      score += 5;
    }
  }

  // Bound score between 65% and 99% for relevant items to give intuitive confidence metrics
  let finalScore = 0;
  if (score >= 20) {
    finalScore = Math.min(99, Math.max(72, Math.round(65 + (score / 100) * 34)));
  } else if (score > 0) {
    finalScore = Math.min(74, Math.max(55, Math.round(50 + score)));
  } else {
    finalScore = 40; // baseline generic
  }

  // Select the single most impactful primary reason
  let primaryReason = reasons[0] || "Curated based on trending styles";
  if (matchedColor && catAffinity > 0) {
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

  const userVector = computeUserStyleVector(favoriteProducts);

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
