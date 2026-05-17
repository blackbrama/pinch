import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  ArrowLeft,
  Bell,
  Camera,
  ChevronRight,
  Heart,
  History,
  Info,
  Leaf,
  Lock,
  RefreshCcw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const ADDITIVE_DATABASE = {
  e102: { name: "Tartrazine", risk: "high", concerns: ["allergen", "hyperactivity"] },
  e110: { name: "Sunset Yellow", risk: "high", concerns: ["allergen", "hyperactivity"] },
  e129: { name: "Allura Red", risk: "high", concerns: ["allergen", "hyperactivity"] },
  e250: { name: "Sodium nitrite", risk: "moderate", concerns: ["cancer concern"] },
  e251: { name: "Sodium nitrate", risk: "moderate", concerns: ["cancer concern"] },
  e320: { name: "BHA", risk: "high", concerns: ["carcinogenic concern"] },
  e321: { name: "BHT", risk: "high", concerns: ["carcinogenic concern"] },
  e621: { name: "Monosodium glutamate", risk: "moderate", concerns: ["sensitivity"] },
  e627: { name: "Disodium guanylate", risk: "moderate", concerns: ["sensitivity"] },
  e631: { name: "Disodium inosinate", risk: "moderate", concerns: ["sensitivity"] },
  e635: { name: "Disodium 5-ribonucleotide", risk: "moderate", concerns: ["sensitivity"] }
};

const DEMO_PRODUCTS = [
  {
    name: "Nutella",
    category: "Sweet spreads",
    barcode: "3017620422003",
    fallback: {
      product_name: "Nutella Hazelnut Cocoa Spread",
      brands: "Ferrero",
      categories: "Sweet spreads",
      ingredients_text: "Sugar, palm oil, hazelnuts, milk powder, cocoa, lecithins, vanillin",
      additives_tags: ["en:e322"],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 539,
        sugars_100g: 56.3,
        "saturated-fat_100g": 10.6,
        salt_100g: 0.107,
        proteins_100g: 6.3,
        fiber_100g: 0
      },
      image_emoji: "🍫"
    }
  },
  {
    name: "Coca-Cola",
    category: "Soft drinks",
    barcode: "5449000000996",
    fallback: {
      product_name: "Coca-Cola Original Taste",
      brands: "Coca-Cola",
      categories: "Soft drinks",
      ingredients_text: "Carbonated water, sugar, colour caramel E150d, phosphoric acid, natural flavourings, caffeine",
      additives_tags: ["en:e150d"],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 42,
        sugars_100g: 10.6,
        "saturated-fat_100g": 0,
        salt_100g: 0,
        proteins_100g: 0,
        fiber_100g: 0
      },
      image_emoji: "🥤"
    }
  },
  {
    name: "Kinder Bueno",
    category: "Chocolate",
    barcode: "8000500037560",
    fallback: {
      product_name: "Kinder Bueno",
      brands: "Ferrero",
      categories: "Chocolate bar",
      ingredients_text: "Milk chocolate, sugar, palm oil, wheat flour, hazelnuts, skimmed milk powder, cocoa, soy lecithin",
      additives_tags: ["en:e322"],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 572,
        sugars_100g: 41.2,
        "saturated-fat_100g": 17.3,
        salt_100g: 0.272,
        proteins_100g: 8.6,
        fiber_100g: 2.2
      },
      image_emoji: "🍫"
    }
  },
  {
    name: "Greek Yogurt",
    category: "Dairy",
    barcode: "5201083348903",
    fallback: {
      product_name: "Greek Style Yogurt",
      brands: "MEVGAL",
      categories: "Dairy, Yogurt",
      ingredients_text: "Milk, yogurt cultures",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 97,
        sugars_100g: 3.8,
        "saturated-fat_100g": 4.2,
        salt_100g: 0.1,
        proteins_100g: 7.5,
        fiber_100g: 0
      },
      image_emoji: "🥣"
    }
  },
  {
    name: "Barilla Pasta",
    category: "Pasta",
    barcode: "8076800195057",
    fallback: {
      product_name: "Barilla Spaghetti",
      brands: "Barilla",
      categories: "Pasta",
      ingredients_text: "Durum wheat semolina, water",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 359,
        sugars_100g: 3.5,
        "saturated-fat_100g": 0.5,
        salt_100g: 0.013,
        proteins_100g: 12,
        fiber_100g: 3
      },
      image_emoji: "🍝"
    }
  },
  {
    name: "Oreo",
    category: "Biscuits",
    barcode: "7622210449283",
    fallback: {
      product_name: "Oreo Original Biscuits",
      brands: "Oreo",
      categories: "Biscuits, Snacks",
      ingredients_text: "Wheat flour, sugar, palm oil, cocoa powder, glucose-fructose syrup, raising agents, salt, emulsifier soy lecithin",
      additives_tags: ["en:e322", "en:e500"],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 480,
        sugars_100g: 38,
        "saturated-fat_100g": 5.2,
        salt_100g: 0.73,
        proteins_100g: 5,
        fiber_100g: 2.4
      },
      image_emoji: "🍪"
    }
  },
  {
    name: "Pringles",
    category: "Crisps",
    barcode: "5053990155358",
    fallback: {
      product_name: "Pringles Original",
      brands: "Pringles",
      categories: "Crisps, Snacks",
      ingredients_text: "Dehydrated potatoes, vegetable oils, rice flour, wheat starch, corn flour, emulsifier E471, salt",
      additives_tags: ["en:e471"],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 536,
        sugars_100g: 2,
        "saturated-fat_100g": 3.1,
        salt_100g: 1.3,
        proteins_100g: 4,
        fiber_100g: 3.4
      },
      image_emoji: "🥔"
    }
  },
  {
    name: "Red Bull",
    category: "Energy drink",
    barcode: "9002490100070",
    fallback: {
      product_name: "Red Bull Energy Drink",
      brands: "Red Bull",
      categories: "Energy drinks",
      ingredients_text: "Carbonated water, sugar, glucose, citric acid, taurine, sodium bicarbonate, caffeine, vitamins, colours",
      additives_tags: ["en:e150d"],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 45,
        sugars_100g: 11,
        "saturated-fat_100g": 0,
        salt_100g: 0.1,
        proteins_100g: 0,
        fiber_100g: 0
      },
      image_emoji: "⚡"
    }
  },
  {
    name: "Evian",
    category: "Water",
    barcode: "3068320114453",
    fallback: {
      product_name: "Evian Natural Mineral Water",
      brands: "Evian",
      categories: "Water",
      ingredients_text: "Natural mineral water",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 0,
        sugars_100g: 0,
        "saturated-fat_100g": 0,
        salt_100g: 0,
        proteins_100g: 0,
        fiber_100g: 0
      },
      image_emoji: "💧"
    }
  },
  {
    name: "Heinz Beans",
    category: "Tinned food",
    barcode: "5000157074613",
    fallback: {
      product_name: "Heinz Baked Beans",
      brands: "Heinz",
      categories: "Beans, Tinned food",
      ingredients_text: "Beans, tomatoes, water, sugar, spirit vinegar, modified cornflour, salt, spice extracts, herb extract",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 78,
        sugars_100g: 4.8,
        "saturated-fat_100g": 0.1,
        salt_100g: 0.6,
        proteins_100g: 4.7,
        fiber_100g: 3.7
      },
      image_emoji: "🫘"
    }
  },
  {
    name: "Corn Flakes",
    category: "Breakfast",
    barcode: "5053827207460",
    fallback: {
      product_name: "Corn Flakes",
      brands: "Kellogg's",
      categories: "Breakfast cereal",
      ingredients_text: "Maize, sugar, barley malt extract, salt, vitamins and minerals",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 378,
        sugars_100g: 8,
        "saturated-fat_100g": 0.2,
        salt_100g: 1.1,
        proteins_100g: 7,
        fiber_100g: 3
      },
      image_emoji: "🥣"
    }
  },
  {
    name: "Almond Milk",
    category: "Plant milk",
    barcode: "8428532230102",
    fallback: {
      product_name: "Unsweetened Almond Drink",
      brands: "Alpro",
      categories: "Plant-based drink",
      ingredients_text: "Water, almonds, calcium, sea salt, stabilisers, vitamins",
      additives_tags: ["en:e418"],
      labels_tags: ["en:vegan"],
      nutriments: {
        "energy-kcal_100g": 13,
        sugars_100g: 0,
        "saturated-fat_100g": 0.1,
        salt_100g: 0.13,
        proteins_100g: 0.4,
        fiber_100g: 0.2
      },
      image_emoji: "🥛"
    }
  },
  {
    name: "Ryvita",
    category: "Crackers",
    barcode: "5000168001189",
    fallback: {
      product_name: "Ryvita Original Rye Crispbread",
      brands: "Ryvita",
      categories: "Crackers, Crispbread",
      ingredients_text: "Wholegrain rye flour, rye flour, salt",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 342,
        sugars_100g: 2.5,
        "saturated-fat_100g": 0.2,
        salt_100g: 0.9,
        proteins_100g: 8.5,
        fiber_100g: 15.2
      },
      image_emoji: "🍘"
    }
  },
  {
    name: "Rice Cakes",
    category: "Snacks",
    barcode: "5411188123457",
    fallback: {
      product_name: "Plain Rice Cakes",
      brands: "Demo Pantry",
      categories: "Rice cakes, Snacks",
      ingredients_text: "Wholegrain rice, salt",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 387,
        sugars_100g: 0.5,
        "saturated-fat_100g": 0.4,
        salt_100g: 0.3,
        proteins_100g: 8,
        fiber_100g: 3.5
      },
      image_emoji: "🍚"
    }
  },
  {
    name: "Chicken Breast",
    category: "Protein",
    barcode: "2034567890123",
    fallback: {
      product_name: "Fresh Chicken Breast",
      brands: "Demo Fresh",
      categories: "Meat, Poultry",
      ingredients_text: "Chicken breast",
      additives_tags: [],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 110,
        sugars_100g: 0,
        "saturated-fat_100g": 0.6,
        salt_100g: 0.1,
        proteins_100g: 24,
        fiber_100g: 0
      },
      image_emoji: "🍗"
    }
  },
  {
    name: "Protein Bar",
    category: "Fitness",
    barcode: "5060123450012",
    fallback: {
      product_name: "Chocolate Protein Bar",
      brands: "Demo Sports",
      categories: "Protein bar",
      ingredients_text: "Milk protein, cocoa, sweetener, soy protein, palm oil, emulsifier",
      additives_tags: ["en:e322"],
      labels_tags: [],
      nutriments: {
        "energy-kcal_100g": 390,
        sugars_100g: 3,
        "saturated-fat_100g": 5,
        salt_100g: 0.8,
        proteins_100g: 32,
        fiber_100g: 7
      },
      image_emoji: "💪"
    }
  },
  {
    name: "Face Cream",
    category: "Beauty",
    barcode: "8433457777000",
    fallback: {
      product_name: "Daily Glow Face Cream",
      brands: "LumaSkin",
      categories: "Beauty, Cosmetics, Face cream",
      ingredients_text: "Aqua, glycerin, squalane, parfum, BHT, methylisothiazolinone",
      additives_tags: [],
      labels_tags: [],
      nutriments: {},
      image_emoji: "🧴"
    }
  },
  {
    name: "Body Lotion",
    category: "Personal care",
    barcode: "5353901234430",
    fallback: {
      product_name: "Barrier Calm Body Lotion",
      brands: "Plain Ritual",
      categories: "Beauty, Personal care, Body lotion",
      ingredients_text: "Aqua, glycerin, caprylic triglyceride, ceramide NP, phenoxyethanol",
      additives_tags: [],
      labels_tags: [],
      nutriments: {},
      image_emoji: "🧼"
    }
  }
];

function normaliseFallbackProduct(item) {
  return {
    ...item.fallback,
    barcode: item.barcode,
    code: item.barcode,
    product_name: item.fallback.product_name || item.name,
    brands: item.fallback.brands || "Demo product",
    categories: item.fallback.categories || item.category,
    source: "Demo fallback"
  };
}

function normaliseAdditiveTag(tag) {
  return String(tag || "")
    .toLowerCase()
    .replace("en:", "")
    .replace("additive:", "")
    .trim();
}

function getProductName(product) {
  return product.product_name || product.product_name_en || product.generic_name || "Unknown product";
}

function getProductBrand(product) {
  return product.brands || "Unknown brand";
}

function getProductEmoji(product) {
  return product.image_emoji || "🛒";
}

function getIngredientText(product) {
  return String(
    product.ingredients_text ||
      product.ingredients_text_en ||
      product.ingredients_text_with_allergens ||
      ""
  ).toLowerCase();
}

function getEnergyKcal(product) {
  const nutriments = product.nutriments || {};
  const directKcal =
    nutriments["energy-kcal_100g"] ||
    nutriments.energy_kcal_100g ||
    nutriments.energy_kcal ||
    0;

  if (directKcal) return Number(directKcal);

  const energyKj = nutriments.energy_100g || 0;
  if (energyKj) return Number(energyKj) / 4.184;

  return 0;
}

function getSalt(product) {
  const nutriments = product.nutriments || {};
  if (nutriments.salt_100g) return Number(nutriments.salt_100g);
  if (nutriments.sodium_100g) return Number(nutriments.sodium_100g) * 2.5;
  return 0;
}

function getProductKind(product) {
  const categoryText = [
    product.product_type || "",
    product.categories || "",
    ...(product.categories_tags || [])
  ]
    .join(" ")
    .toLowerCase();

  if (
    categoryText.includes("beauty") ||
    categoryText.includes("cosmetic") ||
    categoryText.includes("personal care") ||
    categoryText.includes("hygiene")
  ) {
    return "cosmetic";
  }

  return "food";
}

function calculateFoodScore(product) {
  const details = {
    nutrition: 0,
    additives: 0,
    organic: 0,
    warnings: [],
    positives: []
  };

  const nutriments = product.nutriments || {};
  let nutritionScore = 60;

  const energyKcal = getEnergyKcal(product);
  const sugars = Number(nutriments.sugars_100g || 0);
  const saturatedFat = Number(
    nutriments["saturated-fat_100g"] ||
      nutriments.saturated_fat_100g ||
      0
  );
  const salt = getSalt(product);
  const fibre = Number(nutriments.fiber_100g || nutriments.fibre_100g || 0);
  const protein = Number(nutriments.proteins_100g || nutriments.protein_100g || 0);

  if (energyKcal > 500) {
    nutritionScore -= 8;
    details.warnings.push("Very high calories");
  } else if (energyKcal > 350) {
    nutritionScore -= 5;
  }

  if (sugars > 20) {
    nutritionScore -= 12;
    details.warnings.push("Very high sugar");
  } else if (sugars > 12) {
    nutritionScore -= 8;
    details.warnings.push("High sugar");
  } else if (sugars > 0 && sugars <= 3) {
    details.positives.push("Low sugar");
  }

  if (saturatedFat > 6) {
    nutritionScore -= 8;
    details.warnings.push("Very high saturated fat");
  } else if (saturatedFat > 3) {
    nutritionScore -= 5;
    details.warnings.push("High saturated fat");
  }

  if (salt > 1.5) {
    nutritionScore -= 10;
    details.warnings.push("Very high salt");
  } else if (salt > 1) {
    nutritionScore -= 6;
    details.warnings.push("High salt");
  }

  if (fibre > 5) {
    nutritionScore += 8;
    details.positives.push("Excellent fibre");
  } else if (fibre > 3) {
    nutritionScore += 5;
    details.positives.push("Good fibre");
  }

  if (protein > 12) {
    nutritionScore += 8;
    details.positives.push("Excellent protein");
  } else if (protein > 6) {
    nutritionScore += 5;
    details.positives.push("Good protein");
  }

  nutritionScore = Math.max(0, Math.min(60, nutritionScore));
  details.nutrition = Math.round(nutritionScore);

  let additivesScore = 30;
  let hasHighRiskAdditive = false;
  const additiveTags = product.additives_tags || [];

  if (additiveTags.length > 0) {
    additiveTags.forEach((tag) => {
      const key = normaliseAdditiveTag(tag);
      const additive = ADDITIVE_DATABASE[key];

      if (additive?.risk === "high") {
        hasHighRiskAdditive = true;
        details.warnings.push(`High-risk additive: ${additive.name}`);
      }

      if (additive?.risk === "moderate") {
        details.warnings.push(`Moderate-risk additive: ${additive.name}`);
      }
    });

    if (hasHighRiskAdditive) {
      additivesScore = 0;
    } else if (additiveTags.length > 5) {
      additivesScore -= 10;
      details.warnings.push("Multiple additives");
    } else {
      additivesScore -= 5;
      details.warnings.push("Contains additives");
    }
  } else {
    details.positives.push("No additives listed");
  }

  additivesScore = Math.max(0, Math.min(30, additivesScore));
  details.additives = additivesScore;

  let organicScore = 0;
  const labelsText = [...(product.labels_tags || []), product.labels || ""]
    .join(" ")
    .toLowerCase();

  if (labelsText.includes("organic")) {
    organicScore = 10;
    details.positives.push("Certified organic");
  }

  details.organic = organicScore;

  let total = details.nutrition + details.additives + details.organic;

  if (hasHighRiskAdditive) total = Math.min(total, 49);

  total = Math.max(0, Math.min(100, total));

  if (details.warnings.length === 0) {
    details.positives.push("No major concerns detected from available data");
  }

  return { score: Math.round(total), details };
}

function calculateCosmeticScore(product) {
  const details = {
    warnings: [],
    positives: []
  };

  let score = 100;
  const ingredientText = getIngredientText(product);

  const highRiskTerms = ["paraben", "phthalate", "triclosan", "formaldehyde", "bht"];
  const moderateRiskTerms = ["parfum", "fragrance", "methylisothiazolinone", "phenoxyethanol"];

  const hasHighRisk = highRiskTerms.some((term) => ingredientText.includes(term));
  const hasModerateRisk = moderateRiskTerms.some((term) => ingredientText.includes(term));

  if (hasHighRisk) {
    score = Math.min(score, 24);
    details.warnings.push("Contains high-risk cosmetic ingredients in this prototype model");
  } else if (hasModerateRisk) {
    score = Math.min(score, 49);
    details.warnings.push("Contains moderate-risk cosmetic ingredients or fragrance concerns");
  } else {
    details.positives.push("No high-risk cosmetic ingredients detected from available data");
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), details };
}

function scoreProduct(product) {
  const kind = getProductKind(product);
  const scoring = kind === "cosmetic" ? calculateCosmeticScore(product) : calculateFoodScore(product);

  return {
    ...product,
    productKind: kind,
    score: scoring.score,
    details: scoring.details
  };
}

function getScoreInfo(score) {
  if (score >= 80) {
    return { label: "Excellent", color: "#10b981", bg: "bg-emerald-50", border: "border-emerald-300" };
  }

  if (score >= 60) {
    return { label: "Good", color: "#84cc16", bg: "bg-lime-50", border: "border-lime-300" };
  }

  if (score >= 40) {
    return { label: "Average", color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-300" };
  }

  if (score >= 20) {
    return { label: "Poor", color: "#ef4444", bg: "bg-red-50", border: "border-red-300" };
  }

  return { label: "Very Poor", color: "#7c2d12", bg: "bg-red-100", border: "border-red-400" };
}

function getRecommendations(currentProduct, limit = 4) {
  if (!currentProduct) return [];

  const demoScoredProducts = DEMO_PRODUCTS.map((item) =>
    scoreProduct(normaliseFallbackProduct(item))
  );

  const sameKind = demoScoredProducts
    .filter((product) => product.barcode !== currentProduct.barcode)
    .filter((product) => product.productKind === currentProduct.productKind)
    .filter((product) => product.score > currentProduct.score)
    .sort((a, b) => b.score - a.score);

  const anyBetter = demoScoredProducts
    .filter((product) => product.barcode !== currentProduct.barcode)
    .filter((product) => product.score > currentProduct.score)
    .sort((a, b) => b.score - a.score);

  return [...sameKind, ...anyBetter]
    .filter((product, index, array) => array.findIndex((item) => item.barcode === product.barcode) === index)
    .slice(0, limit);
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("Idle");
  const [scannerRestartKey, setScannerRestartKey] = useState(0);
  const [error, setError] = useState("");
  const [userPreferences, setUserPreferences] = useState({
    allergens: ["gluten", "peanuts", "milk"],
    dietary: ["vegetarian"],
    avoidIngredients: ["palm oil"]
  });

  const videoRef = useRef(null);
  const scanLockRef = useRef(false);

  function checkUserAlerts(product) {
    const alerts = [];
    const ingredientText = getIngredientText(product);

    userPreferences.allergens.forEach((allergen) => {
      if (ingredientText.includes(allergen.toLowerCase())) {
        alerts.push({ type: "allergen", message: `Contains ${allergen}`, severity: "high" });
      }
    });

    userPreferences.avoidIngredients.forEach((ingredient) => {
      if (ingredientText.includes(ingredient.toLowerCase())) {
        alerts.push({ type: "ingredient", message: `Contains ${ingredient}`, severity: "medium" });
      }
    });

    return alerts;
  }

  async function openProduct(product, barcode) {
    const scored = scoreProduct(product);
    const userAlerts = checkUserAlerts(product);

    const productWithScore = {
      ...scored,
      barcode,
      userAlerts,
      scannedAt: new Date().toLocaleDateString()
    };

    setCurrentProduct(productWithScore);

    setProducts((previousProducts) => [
      productWithScore,
      ...previousProducts.filter((item) => item.barcode !== barcode)
    ]);

    setScreen("result");
  }

  async function fetchProduct(barcode, fallbackProduct = null) {
    const cleanBarcode = String(barcode || "").trim();

    if (!cleanBarcode) {
      setError("Enter a barcode first.");
      return;
    }

    setLoading(true);
    setError("");
    setScannerStatus(`Searching ${cleanBarcode}...`);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`
      );

      if (!response.ok) throw new Error("Product not found");

      const data = await response.json();

      if (!data || data.status !== 1 || !data.product) {
        throw new Error("Product not found");
      }

      await openProduct(data.product, cleanBarcode);
    } catch {
      if (fallbackProduct) {
        await openProduct(fallbackProduct, cleanBarcode);
      } else {
        setError("Product not found. Check the barcode and try again.");
        setScannerStatus("Product not found");
      }
    } finally {
      setLoading(false);
      scanLockRef.current = false;
    }
  }

  useEffect(() => {
    if (screen !== "scanner") return undefined;

    let controls;
    let cancelled = false;

    async function startScanner() {
      setError("");
      setCameraActive(false);
      setScannerStatus("Opening camera...");
      scanLockRef.current = false;

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera is not available in this browser. Use manual barcode entry.");
          setScannerStatus("Manual entry only");
          return;
        }

        if (!videoRef.current) {
          setError("Camera preview is not ready. Use manual barcode entry.");
          setScannerStatus("Manual entry only");
          return;
        }

        const codeReader = new BrowserMultiFormatReader();

        let selectedDeviceId;

        try {
          const devices = await BrowserMultiFormatReader.listVideoInputDevices();
          const backCamera =
            devices.find((device) => String(device.label || "").toLowerCase().includes("back")) ||
            devices.find((device) => String(device.label || "").toLowerCase().includes("rear")) ||
            devices[devices.length - 1];

          selectedDeviceId = backCamera?.deviceId;
        } catch {
          selectedDeviceId = undefined;
        }

        setScannerStatus("Scanning... hold barcode steady");

        controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, scanError, scannerControls) => {
            if (cancelled || scanLockRef.current) return;

            if (result) {
              const barcode = result.getText();

              if (barcode) {
                scanLockRef.current = true;
                setScannerStatus(`Barcode found: ${barcode}`);

                if (scannerControls) scannerControls.stop();

                fetchProduct(barcode);
              }
            }
          }
        );

        if (!cancelled) setCameraActive(true);
      } catch {
        setError("Scanner could not start. Use manual barcode entry instead.");
        setScannerStatus("Manual entry only");
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      scanLockRef.current = false;

      if (controls) controls.stop();

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }

      setCameraActive(false);
    };
  }, [screen, scannerRestartKey]);

  function toggleFavorite(product) {
    const isAlreadySaved = favorites.some((item) => item.barcode === product.barcode);

    if (isAlreadySaved) {
      setFavorites(favorites.filter((item) => item.barcode !== product.barcode));
    } else {
      setFavorites([...favorites, product]);
    }
  }

  function addToComparison(product) {
    setComparisonProducts((previousProducts) => {
      const alreadyAdded = previousProducts.some((item) => item.barcode === product.barcode);
      if (alreadyAdded) return previousProducts;
      return [...previousProducts, product].slice(0, 3);
    });
  }

  function togglePreference(group, value) {
    setUserPreferences((previous) => {
      const currentValues = previous[group];
      const hasValue = currentValues.includes(value);

      return {
        ...previous,
        [group]: hasValue
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value]
      };
    });
  }

  const isFavorited =
    currentProduct &&
    favorites.some((item) => item.barcode === currentProduct.barcode);

  const recommendations = getRecommendations(currentProduct, 4);

  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-4xl font-bold text-white shadow-lg">
                P
              </div>
            </div>

            <h1 className="mb-1 text-4xl font-bold text-gray-900">Pinch</h1>
            <p className="text-lg text-gray-600">Scan. Understand. Choose better.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <FeatureCard
              icon={<Camera className="h-5 w-5" />}
              title="Scan labels"
              text="Scan food, hygiene, and cosmetic products."
            />
            <FeatureCard
              icon={<Info className="h-5 w-5" />}
              title="Food analysis"
              text="Detailed data sheets explain food scores."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Cosmetic analysis"
              text="Understand ingredient risks in personal care."
            />
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Recommendations"
              text="Find healthier similar alternatives."
            />
          </div>

          <div className="mb-8 space-y-3">
            <button
              onClick={() => {
                setError("");
                setSearchBarcode("");
                setScreen("scanner");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg"
            >
              <Camera className="h-6 w-6" />
              Scan Barcode
            </button>

            <button
              onClick={() => {
                setError("");
                setSearchBarcode("");
                setScreen("search");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-emerald-600 bg-white py-4 text-lg font-bold text-emerald-600"
            >
              <Search className="h-6 w-6" />
              Manual Search
            </button>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setScreen("history")}
                className="rounded-xl bg-white p-3 text-center font-bold text-gray-700 shadow"
              >
                <History className="mx-auto mb-1 h-5 w-5" />
                History
              </button>

              <button
                onClick={() => setScreen("recommendations")}
                className="rounded-xl bg-white p-3 text-center font-bold text-gray-700 shadow"
              >
                <Leaf className="mx-auto mb-1 h-5 w-5" />
                Recs
              </button>

              <button
                onClick={() => setScreen("settings")}
                className="rounded-xl bg-white p-3 text-center font-bold text-gray-700 shadow"
              >
                <Bell className="mx-auto mb-1 h-5 w-5" />
                Alerts
              </button>
            </div>
          </div>

          {products.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                Recently Scanned
              </h2>

              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                  <ProductRow
                    key={product.barcode}
                    product={product}
                    onClick={() => {
                      setCurrentProduct(product);
                      setScreen("result");
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 rounded-xl bg-white p-4 text-center text-xs leading-5 text-gray-500 shadow-sm">
            Pinch provides product information only. Always check labels yourself,
            especially for allergies or medical needs.
          </p>
        </div>
      </div>
    );
  }

  if (screen === "scanner") {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <div className="relative flex-1 bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-64 rounded-lg border-4 border-emerald-400 opacity-70" />
          </div>

          <div className="absolute left-4 right-4 bottom-4 rounded-xl bg-black/70 p-3 text-center text-white">
            <p className="font-bold">
              {cameraActive ? "Point at barcode" : "Opening camera..."}
            </p>
            <p className="text-sm text-white/80">{scannerStatus}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-800 bg-gray-900 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              fetchProduct(searchBarcode);
            }}
            className="space-y-3"
          >
            <input
              type="text"
              inputMode="numeric"
              enterKeyHint="search"
              placeholder="Or enter barcode..."
              value={searchBarcode}
              onChange={(event) => setSearchBarcode(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
            />

            <button
              type="submit"
              disabled={loading || !searchBarcode.trim()}
              className="w-full rounded-lg bg-emerald-600 py-3 font-bold text-white disabled:bg-gray-700 disabled:text-gray-400"
            >
              {loading ? "Searching..." : "Search Barcode"}
            </button>
          </form>

          <button
            onClick={() => setScannerRestartKey((key) => key + 1)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-bold text-white"
          >
            <RefreshCcw className="h-5 w-5" />
            Restart Camera Scanner
          </button>

          <DemoProductGrid fetchProduct={fetchProduct} />

          {error && (
            <div className="rounded-lg bg-red-900/60 p-3 text-center text-sm font-semibold text-red-100">
              {error}
            </div>
          )}

          <button
            onClick={() => setScreen("home")}
            className="w-full rounded-lg bg-gray-800 py-3 font-semibold text-white"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (screen === "search") {
    return (
      <StandardScreen title="Search Product" onBack={() => setScreen("home")}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            fetchProduct(searchBarcode);
          }}
          className="mb-6"
        >
          <input
            type="text"
            inputMode="numeric"
            enterKeyHint="search"
            placeholder="Enter barcode..."
            value={searchBarcode}
            onChange={(event) => setSearchBarcode(event.target.value)}
            className="mb-4 w-full rounded-xl border-2 border-emerald-300 px-4 py-3 text-lg focus:border-emerald-600 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !searchBarcode.trim()}
            className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            {loading ? "Searching..." : "Search Barcode"}
          </button>
        </form>

        <div className="mb-6 rounded-xl bg-white p-4 shadow">
          <h2 className="mb-3 font-bold text-gray-900">Try a demo product</h2>
          <DemoProductGrid fetchProduct={fetchProduct} light />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
      </StandardScreen>
    );
  }

  if (screen === "result" && currentProduct) {
    const scoreInfo = getScoreInfo(currentProduct.score);

    return (
      <StandardScreen title="" onBack={() => setScreen("home")}>
        {currentProduct.image_url ? (
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
            <img
              src={currentProduct.image_url}
              alt={getProductName(currentProduct)}
              className="h-64 w-full object-contain"
            />
          </div>
        ) : (
          <div className="mb-6 flex h-40 items-center justify-center rounded-2xl bg-white text-6xl shadow-lg">
            {getProductEmoji(currentProduct)}
          </div>
        )}

        <div className="mb-6">
          <p className="mb-1 text-sm text-gray-500">{getProductBrand(currentProduct)}</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {getProductName(currentProduct)}
          </h1>
          <p className="mt-2 text-sm font-semibold capitalize text-gray-500">
            {currentProduct.productKind} analysis
          </p>
        </div>

        {currentProduct.userAlerts?.length > 0 && (
          <div className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 p-4">
            <p className="mb-2 font-bold text-red-700">⚠️ Your Alerts</p>
            {currentProduct.userAlerts.map((alert, index) => (
              <p key={`${alert.message}-${index}`} className="text-sm text-red-700">
                • {alert.message}
              </p>
            ))}
          </div>
        )}

        <div
          className={`mb-6 rounded-3xl border-4 ${scoreInfo.border} ${scoreInfo.bg} p-8 text-center shadow-lg`}
        >
          <p className="mb-2 font-semibold text-gray-600">Health Score</p>
          <div
            className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full text-5xl font-bold text-white shadow-xl"
            style={{ backgroundColor: scoreInfo.color }}
          >
            {currentProduct.score}
          </div>
          <p className="text-2xl font-bold" style={{ color: scoreInfo.color }}>
            {scoreInfo.label}
          </p>
        </div>

        <AnalysisSheet product={currentProduct} />

        {currentProduct.score < 60 && recommendations.length > 0 && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Healthier alternatives</h3>
                <p className="text-sm text-gray-500">
                  Independent recommendations based on better scores.
                </p>
              </div>
              <button
                onClick={() => setScreen("recommendations")}
                className="text-sm font-bold text-emerald-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((product) => (
                <ProductRow
                  key={product.barcode}
                  product={product}
                  onClick={() => {
                    openProduct(product, product.barcode);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pb-6">
          <button
            onClick={() => toggleFavorite(currentProduct)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 font-semibold ${
              isFavorited
                ? "border border-red-300 bg-red-100 text-red-700"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
            Save
          </button>

          <button
            onClick={() => {
              addToComparison(currentProduct);
              setScreen("comparison");
            }}
            className="rounded-xl bg-purple-600 py-3 font-bold text-white"
          >
            Compare
          </button>

          <button
            onClick={() => setScreen("details")}
            className="rounded-xl bg-emerald-600 py-3 font-bold text-white"
          >
            Details
          </button>
        </div>
      </StandardScreen>
    );
  }

  if (screen === "details" && currentProduct) {
    return (
      <StandardScreen title="Detailed data sheet" onBack={() => setScreen("result")}>
        <AnalysisSheet product={currentProduct} expanded />

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs leading-5 text-blue-700">
            <strong>Disclaimer:</strong> Pinch provides product information based
            on available label data and prototype scoring rules. It is not medical
            advice and does not replace a doctor, dietitian, pharmacist, or the
            official product label.
          </p>
        </div>
      </StandardScreen>
    );
  }

  if (screen === "recommendations") {
    const recommendedProducts = currentProduct
      ? getRecommendations(currentProduct, 12)
      : DEMO_PRODUCTS.map((item) => scoreProduct(normaliseFallbackProduct(item)))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

    return (
      <StandardScreen title="Recommendations" onBack={() => setScreen("home")}>
        <div className="mb-4 rounded-xl bg-white p-4 shadow">
          <h2 className="mb-1 font-bold text-gray-900">
            Get recommendations for healthier alternatives
          </h2>
          <p className="text-sm leading-6 text-gray-600">
            When a scanned product scores poorly, Pinch suggests similar or better
            products with stronger health scores. Recommendations are independent,
            not paid placements.
          </p>
        </div>

        <div className="space-y-3">
          {recommendedProducts.map((product) => (
            <ProductRow
              key={product.barcode}
              product={product}
              onClick={() => openProduct(product, product.barcode)}
            />
          ))}
        </div>
      </StandardScreen>
    );
  }

  if (screen === "settings") {
    const allergens = ["gluten", "peanuts", "milk", "eggs", "fish", "soy", "tree nuts"];
    const dietary = ["vegetarian", "vegan", "kosher", "halal"];
    const avoidIngredients = ["palm oil", "artificial sweeteners", "GMO", "parfum", "BHT"];

    return (
      <StandardScreen title="Settings & Alerts" onBack={() => setScreen("home")}>
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="mb-2 text-xl font-bold">Go Premium</h3>
              <p className="text-sm">Offline mode · Export data · Family profiles</p>
            </div>
            <Lock className="h-8 w-8" />
          </div>
        </div>

        <PreferenceCard
          title="Your Allergens"
          values={allergens}
          activeValues={userPreferences.allergens}
          onToggle={(value) => togglePreference("allergens", value)}
          activeClass="bg-red-100 text-red-700 border-red-300"
        />

        <PreferenceCard
          title="Dietary Preferences"
          values={dietary}
          activeValues={userPreferences.dietary}
          onToggle={(value) => togglePreference("dietary", value)}
          activeClass="bg-green-100 text-green-700 border-green-300"
        />

        <PreferenceCard
          title="Ingredients to Avoid"
          values={avoidIngredients}
          activeValues={userPreferences.avoidIngredients}
          onToggle={(value) => togglePreference("avoidIngredients", value)}
          activeClass="bg-amber-100 text-amber-700 border-amber-300"
        />
      </StandardScreen>
    );
  }

  if (screen === "history") {
    return (
      <StandardScreen title="History" onBack={() => setScreen("home")}>
        <div className="mb-4 rounded-xl bg-white p-4 shadow">
          <h2 className="mb-1 font-bold text-gray-900">Your scanned products</h2>
          <p className="text-sm leading-6 text-gray-600">
            Pinch displays the products you have already scanned. The colour code
            helps you quickly understand the product’s impact.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow">
            <p className="text-gray-500">No scans yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <ProductRow
                key={product.barcode}
                product={product}
                onClick={() => {
                  setCurrentProduct(product);
                  setScreen("result");
                }}
              />
            ))}
          </div>
        )}
      </StandardScreen>
    );
  }

  if (screen === "favorites") {
    return (
      <ProductListScreen
        title="Favorites"
        emptyText="No favorites yet"
        products={favorites}
        onBack={() => setScreen("home")}
        onSelect={(product) => {
          setCurrentProduct(product);
          setScreen("result");
        }}
      />
    );
  }

  if (screen === "comparison") {
    const bestProduct = comparisonProducts.reduce((best, product) => {
      if (!best) return product;
      return product.score > best.score ? product : best;
    }, null);

    return (
      <StandardScreen title="Compare Products" onBack={() => setScreen("home")}>
        <p className="mb-6 text-gray-600">Add up to 3 products from the result screen.</p>

        {comparisonProducts.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow">
            <p className="text-gray-500">No products selected</p>
            <button
              onClick={() => setScreen("history")}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white"
            >
              Choose from history
            </button>
          </div>
        ) : (
          <>
            {bestProduct && (
              <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">Best choice so far</p>
                <p className="text-sm text-emerald-800">
                  {getProductName(bestProduct)} has the highest score in this comparison.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {comparisonProducts.map((product) => {
                const scoreInfo = getScoreInfo(product.score);

                return (
                  <div key={product.barcode} className="rounded-xl bg-white p-4 shadow">
                    <div className="mb-3 flex h-24 w-full items-center justify-center rounded bg-emerald-50 text-3xl">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={getProductName(product)}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        getProductEmoji(product)
                      )}
                    </div>

                    <p className="mb-2 text-xs text-gray-500">{getProductBrand(product)}</p>
                    <p className="mb-3 line-clamp-2 text-sm font-semibold text-gray-900">
                      {getProductName(product)}
                    </p>

                    <div
                      className="flex h-12 w-full items-center justify-center rounded-lg text-2xl font-bold text-white"
                      style={{ backgroundColor: scoreInfo.color }}
                    >
                      {product.score}
                    </div>

                    <button
                      onClick={() =>
                        setComparisonProducts((previous) =>
                          previous.filter((item) => item.barcode !== product.barcode)
                        )
                      }
                      className="mt-3 w-full rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </StandardScreen>
    );
  }

  return null;
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-bold text-gray-900">{title}</h3>
      <p className="text-xs leading-5 text-gray-500">{text}</p>
    </div>
  );
}

function StandardScreen({ title, onBack, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="mx-auto max-w-lg px-4 py-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 font-semibold text-emerald-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        {title && <h1 className="mb-6 text-3xl font-bold text-gray-900">{title}</h1>}

        {children}
      </div>
    </div>
  );
}

function DemoProductGrid({ fetchProduct, light = false }) {
  return (
    <div className={`${light ? "" : "max-h-72 overflow-y-auto rounded-xl border border-gray-800 p-2"}`}>
      {!light && (
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-gray-400">
          Demo product list
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {DEMO_PRODUCTS.map((item) => (
          <button
            key={item.barcode}
            onClick={() => fetchProduct(item.barcode, normaliseFallbackProduct(item))}
            className={`rounded-lg px-2 py-3 text-left text-xs font-semibold ${
              light ? "bg-emerald-50 text-emerald-900" : "bg-gray-800 text-white"
            }`}
          >
            <span className="block text-sm">{item.name}</span>
            <span className={light ? "block text-emerald-700" : "block text-gray-400"}>
              {item.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AnalysisSheet({ product, expanded = false }) {
  const isFood = product.productKind === "food";
  const nutriments = product.nutriments || {};
  const additiveTags = product.additives_tags || [];

  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow">
      <h3 className="mb-2 font-bold text-gray-900">
        {isFood ? "Food analysis" : "Cosmetic analysis"}
      </h3>

      <p className="mb-4 text-sm leading-6 text-gray-600">
        {isFood
          ? "Pinch analyzes food items and provides a detailed data sheet explaining how each product was evaluated."
          : "Pinch analyzes hygiene and cosmetic products to help you understand ingredients, concerns, and the final score."}
      </p>

      {isFood ? (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
            <ScorePart label="Nutrition" value={`${product.details.nutrition}/60`} tone="emerald" />
            <ScorePart label="Additives" value={`${product.details.additives}/30`} tone="amber" />
            <ScorePart label="Organic" value={`${product.details.organic}/10`} tone="blue" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailMetric label="Energy" value={`${Math.round(getEnergyKcal(product)) || 0} kcal`} tone="orange" />
            <DetailMetric label="Sugar" value={`${Number(nutriments.sugars_100g || 0).toFixed(1)}g`} tone="red" />
            <DetailMetric
              label="Saturated Fat"
              value={`${Number(nutriments["saturated-fat_100g"] || nutriments.saturated_fat_100g || 0).toFixed(1)}g`}
              tone="amber"
            />
            <DetailMetric label="Salt" value={`${getSalt(product).toFixed(2)}g`} tone="blue" />
            <DetailMetric label="Fibre" value={`${Number(nutriments.fiber_100g || nutriments.fibre_100g || 0).toFixed(1)}g`} tone="green" />
            <DetailMetric label="Protein" value={`${Number(nutriments.proteins_100g || nutriments.protein_100g || 0).toFixed(1)}g`} tone="emerald" />
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">Ingredient safety model</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Cosmetic scoring is based on ingredient concerns such as fragrance,
              allergens, irritants, preservatives, and prototype high-risk terms.
            </p>
          </div>
        </div>
      )}

      {expanded && (
        <>
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <h4 className="mb-2 font-bold text-gray-900">Ingredients</h4>
            <p className="text-sm leading-6 text-gray-700">
              {product.ingredients_text ||
                product.ingredients_text_en ||
                "No ingredient list available."}
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <h4 className="mb-2 font-bold text-gray-900">Additives</h4>
            {additiveTags.length > 0 ? (
              <div className="space-y-2">
                {additiveTags.map((tag) => {
                  const key = normaliseAdditiveTag(tag);
                  const additive = ADDITIVE_DATABASE[key];

                  return (
                    <div key={tag} className="rounded-lg bg-white p-3 text-sm">
                      <p className="font-bold text-gray-900">
                        {key.toUpperCase()} {additive ? `· ${additive.name}` : ""}
                      </p>
                      <p className="text-gray-600">
                        Risk: {additive?.risk || "not classified in prototype database"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No additives listed in available data.</p>
            )}
          </div>
        </>
      )}

      {product.details?.warnings?.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h4 className="mb-2 font-bold text-amber-900">Concerns</h4>
          {product.details.warnings.map((warning, index) => (
            <p key={`${warning}-${index}`} className="text-sm text-amber-800">
              • {warning}
            </p>
          ))}
        </div>
      )}

      {product.details?.positives?.length > 0 && (
        <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4">
          <h4 className="mb-2 font-bold text-green-900">Positives</h4>
          {product.details.positives.map((positive, index) => (
            <p key={`${positive}-${index}`} className="text-sm text-green-800">
              • {positive}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ScorePart({ label, value, tone }) {
  const toneMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700"
  };

  return (
    <div className={`rounded-lg p-3 ${toneMap[tone]}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function DetailMetric({ label, value, tone }) {
  const toneMap = {
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    emerald: "bg-emerald-50 text-emerald-700"
  };

  return (
    <div className={`rounded-lg p-3 ${toneMap[tone] || "bg-gray-50 text-gray-700"}`}>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function ProductRow({ product, onClick }) {
  const scoreInfo = getScoreInfo(product.score);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow"
    >
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={getProductName(product)}
          className="h-14 w-14 rounded object-contain bg-white"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded bg-emerald-50 text-2xl">
          {getProductEmoji(product)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 font-semibold text-gray-900">{getProductName(product)}</p>
        <p className="text-xs text-gray-500">{getProductBrand(product)}</p>
      </div>

      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: scoreInfo.color }}
      >
        {product.score}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
    </button>
  );
}

function PreferenceCard({ title, values, activeValues, onToggle, activeClass }) {
  return (
    <div className="mb-4 rounded-xl bg-white p-5 shadow">
      <h3 className="mb-3 font-bold text-gray-900">{title}</h3>

      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const isActive = activeValues.includes(value);

          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold capitalize ${
                isActive
                  ? activeClass
                  : "border-gray-200 bg-gray-50 text-gray-600"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductListScreen({ title, emptyText, products, onBack, onSelect }) {
  return (
    <StandardScreen title={title} onBack={onBack}>
      {products.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center shadow">
          <p className="text-gray-500">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductRow
              key={product.barcode}
              product={product}
              onClick={() => onSelect(product)}
            />
          ))}
        </div>
      )}
    </StandardScreen>
  );
}
