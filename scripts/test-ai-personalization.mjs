import {
  computeUserStyleVector,
  scoreProductSimilarity,
  generatePersonalizedRecommendations,
  extractProductColors,
  extractProductKeywords,
} from "../src/lib/ai/personalizationEngine.js";

console.log("🧪 Testing AI Personalization & Style Learning Engine...");

// Sample Footwear Catalog
const catalog = [
  {
    id: "shoe-1",
    name: "Nike Alphafly 3 Triple Black",
    description: "Sub-2 hour marathon racer with dual carbon plates and supercritical nitrogen foam.",
    details: "Black aerodynamic monofilament matrix, zoom air pods.",
    price: 45000,
    salePrice: 38000,
    categoryId: "running",
    categoryName: "Running",
    brandName: "Nike",
    images: [{ url: "https://example.com/alphafly.png", isPrimary: true }],
    isNew: false,
    isFeatured: true,
    rating: 4.9,
  },
  {
    id: "shoe-2",
    name: "VELOCE Carbon Strider Noir",
    description: "Full carbon plate racing shoe in matte black and stealth carbon accents.",
    details: "Supercritical foam, lightweight tempo turnover.",
    price: 36000,
    salePrice: null,
    categoryId: "running",
    categoryName: "Running",
    brandName: "VELOCE",
    images: [{ url: "https://example.com/strider.png", isPrimary: true }],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
  },
  {
    id: "shoe-3",
    name: "Adidas Adizero Adios Pro 3 Black",
    description: "Energy rods carbon marathon racer in core black.",
    details: "Lightstrike pro cushioning for distance road racing.",
    price: 42000,
    salePrice: null,
    categoryId: "running",
    categoryName: "Running",
    brandName: "Adidas",
    images: [{ url: "https://example.com/adios.png", isPrimary: true }],
    isNew: false,
    isFeatured: false,
    rating: 4.7,
  },
  {
    id: "shoe-4",
    name: "Florence Tuscan Chelsea Boot Brown",
    description: "Handcrafted Goodyear storm welted calfskin boot in cognac brown leather.",
    details: "Vibram lug outsole, Italian vegetable tanned leather.",
    price: 48000,
    salePrice: null,
    categoryId: "boots",
    categoryName: "Boots",
    brandName: "VELOCE Atelier",
    images: [{ url: "https://example.com/boot.png", isPrimary: true }],
    isNew: false,
    isFeatured: false,
    rating: 4.9,
  },
  {
    id: "shoe-5",
    name: "VELOCE Neo-Pulse Racer Black & Volt",
    description: "Brand new SS26 marathon speed shoe in stealth black with volt nitrogen foam.",
    details: "Full carbon propulsion chassis for elite 10k to 42k pacing.",
    price: 41000,
    salePrice: 34500,
    categoryId: "running",
    categoryName: "Running",
    brandName: "VELOCE",
    images: [{ url: "https://example.com/neopulse.png", isPrimary: true }],
    isNew: true,
    isFeatured: true,
    rating: 5.0,
  },
];

// Customer favorites 2 black running shoes (e.g. shoe-1 and shoe-3)
const userFavorites = [catalog[0], catalog[2]];

// 1. Test Style Vector Generation
const userVector = computeUserStyleVector(userFavorites);
console.log("\n📊 Computed User Style Vector:");
console.log(" - Category Affinities:", userVector.categoryAffinities);
console.log(" - Color Affinities:", userVector.colorAffinities);
console.log(" - Top Keywords:", userVector.topKeywords);

if (userVector.categoryAffinities["running"] !== 1) {
  throw new Error("❌ Expected running category affinity to be 100%");
}
if (!userVector.colorAffinities["black"]) {
  throw new Error("❌ Expected black color affinity to be prominent");
}
console.log("✅ User Style Vector correctly identified 100% Running + Black color aesthetic!");

// 2. Test Recommendation Generation
const recs = generatePersonalizedRecommendations(catalog, userFavorites);
console.log("\n🎯 Generated Recommendations:");
console.log(" - Summary:", recs.learnedStyleSummary);
console.log(" - Recommended For You count:", recs.recommendedForYou.length);

for (const rec of recs.recommendedForYou) {
  console.log(`   👟 ${rec.product.name} -> Score: ${rec.matchScore}% | Reason: ${rec.primaryReason}`);
}

const topMatch = recs.recommendedForYou[0];
if (!topMatch || topMatch.matchScore < 85) {
  throw new Error("❌ Expected top matching black running shoe to have matchScore >= 85%");
}
console.log(`✅ Top recommendation matched with ${topMatch.matchScore}% score!`);

// 3. Test New Drops Matching
console.log("\n🔥 New Drops Matching User Style:");
for (const drop of recs.newDropsForYou) {
  console.log(`   ✨ ${drop.product.name} -> Score: ${drop.matchScore}%`);
}

if (recs.newDropsForYou.length === 0) {
  throw new Error("❌ Expected newly dropped black running shoe to appear in new drops");
}
console.log("✅ New drops correctly filtered for user's favorite style!");

console.log("\n🎉 ALL AI PERSONALIZATION TESTS PASSED SUCCESSFULLY!");
