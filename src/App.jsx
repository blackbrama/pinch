import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import Tesseract from "tesseract.js";
import {
  AlertTriangle,
  Apple,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Home,
  ImagePlus,
  Leaf,
  RefreshCcw,
  ScanBarcode,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Upload,
  X
} from "lucide-react";
import "./index.css";

const ADDITIVE_DATABASE = {
  e102: { name: "Tartrazine", risk: "high", reason: "Colour additive flagged by Pinch." },
  e110: { name: "Sunset Yellow", risk: "high", reason: "Colour additive flagged by Pinch." },
  e129: { name: "Allura Red", risk: "high", reason: "Colour additive flagged by Pinch." },
  e211: { name: "Sodium benzoate", risk: "moderate", reason: "Preservative some people prefer to avoid." },
  e250: { name: "Sodium nitrite", risk: "moderate", reason: "Preservative with usage concerns." },
  e320: { name: "BHA", risk: "high", reason: "Antioxidant flagged as high concern." },
  e321: { name: "BHT", risk: "high", reason: "Antioxidant flagged as high concern." },
  e322: { name: "Lecithins", risk: "low", reason: "Common emulsifier." },
  e330: { name: "Citric acid", risk: "low", reason: "Common acidity regulator." },
  e471: { name: "Mono and diglycerides", risk: "moderate", reason: "Texture and emulsifier additive." },
  e500: { name: "Sodium carbonates", risk: "low", reason: "Common raising agent." },
  e621: { name: "Monosodium glutamate", risk: "moderate", reason: "Flavour enhancer." }
};

const DEMO_PRODUCTS = [
  {
    barcode: "3017620422003",
    name: "Nutella Hazelnut Cocoa Spread",
    shortName: "Nutella",
    brand: "Ferrero",
    kind: "food",
    category: "Sweet spreads",
    emoji: "🍫",
    ingredients: "Sugar, palm oil, hazelnuts, milk powder, cocoa, lecithins, vanillin",
    additives: ["e322"],
    labels: [],
    nutrition: { kcal: 539, sugar: 56.3, satFat: 10.6, salt: 0.11, protein: 6.3, fibre: 0 }
  },
  {
    barcode: "5449000000996",
    name: "Coca-Cola Original Taste",
    shortName: "Coca-Cola",
    brand: "Coca-Cola",
    kind: "food",
    category: "Soft drinks",
    emoji: "🥤",
    ingredients: "Carbonated water, sugar, colour caramel E150d, phosphoric acid, natural flavourings, caffeine",
    additives: ["e330"],
    labels: [],
    nutrition: { kcal: 42, sugar: 10.6, satFat: 0, salt: 0, protein: 0, fibre: 0 }
  },
  {
    barcode: "8000500037560",
    name: "Kinder Bueno",
    shortName: "Kinder Bueno",
    brand: "Ferrero",
    kind: "food",
    category: "Chocolate",
    emoji: "🍫",
    ingredients: "Milk chocolate, sugar, palm oil, wheat flour, hazelnuts, skimmed milk powder, cocoa, soy lecithin",
    additives: ["e322"],
    labels: [],
    nutrition: { kcal: 572, sugar: 41.2, satFat: 17.3, salt: 0.27, protein: 8.6, fibre: 2.2 }
  },
  {
    barcode: "5201083348903",
    name: "Greek Style Yogurt",
    shortName: "Greek Yogurt",
    brand: "MEVGAL",
    kind: "food",
    category: "Dairy",
    emoji: "🥣",
    ingredients: "Milk, yogurt cultures",
    additives: [],
    labels: [],
    nutrition: { kcal: 97, sugar: 3.8, satFat: 4.2, salt: 0.1, protein: 7.5, fibre: 0 }
  },
  {
    barcode: "8076800195057",
    name: "Barilla Spaghetti",
    shortName: "Barilla Pasta",
    brand: "Barilla",
    kind: "food",
    category: "Pasta",
    emoji: "🍝",
    ingredients: "Durum wheat semolina, water",
    additives: [],
    labels: [],
    nutrition: { kcal: 359, sugar: 3.5, satFat: 0.5, salt: 0.01, protein: 12, fibre: 3 }
  },
  {
    barcode: "7622210449283",
    name: "Oreo Original Biscuits",
    shortName: "Oreo",
    brand: "Oreo",
    kind: "food",
    category: "Biscuits",
    emoji: "🍪",
    ingredients: "Wheat flour, sugar, palm oil, cocoa powder, glucose-fructose syrup, raising agents, salt, soy lecithin",
    additives: ["e322", "e500"],
    labels: [],
    nutrition: { kcal: 480, sugar: 38, satFat: 5.2, salt: 0.73, protein: 5, fibre: 2.4 }
  },
  {
    barcode: "5053990155358",
    name: "Pringles Original",
    shortName: "Pringles",
    brand: "Pringles",
    kind: "food",
    category: "Crisps",
    emoji: "🥔",
    ingredients: "Dehydrated potatoes, vegetable oils, rice flour, wheat starch, corn flour, emulsifier E471, salt",
    additives: ["e471"],
    labels: [],
    nutrition: { kcal: 536, sugar: 2, satFat: 3.1, salt: 1.3, protein: 4, fibre: 3.4 }
  },
  {
    barcode: "9002490100070",
    name: "Red Bull Energy Drink",
    shortName: "Red Bull",
    brand: "Red Bull",
    kind: "food",
    category: "Energy drink",
    emoji: "⚡",
    ingredients: "Carbonated water, sugar, glucose, citric acid, taurine, sodium bicarbonate, caffeine, vitamins",
    additives: ["e330"],
    labels: [],
    nutrition: { kcal: 45, sugar: 11, satFat: 0, salt: 0.1, protein: 0, fibre: 0 }
  },
  {
    barcode: "3068320114453",
    name: "Evian Natural Mineral Water",
    shortName: "Evian",
    brand: "Evian",
    kind: "food",
    category: "Water",
    emoji: "💧",
    ingredients: "Natural mineral water",
    additives: [],
    labels: [],
    nutrition: { kcal: 0, sugar: 0, satFat: 0, salt: 0, protein: 0, fibre: 0 }
  },
  {
    barcode: "5000157074613",
    name: "Heinz Baked Beans",
    shortName: "Heinz Beans",
    brand: "Heinz",
    kind: "food",
    category: "Tinned food",
    emoji: "🫘",
    ingredients: "Beans, tomatoes, water, sugar, spirit vinegar, modified cornflour, salt, spice extracts",
    additives: [],
    labels: [],
    nutrition: { kcal: 78, sugar: 4.8, satFat: 0.1, salt: 0.6, protein: 4.7, fibre: 3.7 }
  },
  {
    barcode: "5000168001189",
    name: "Ryvita Original Rye Crispbread",
    shortName: "Ryvita",
    brand: "Ryvita",
    kind: "food",
    category: "Crackers",
    emoji: "🍘",
    ingredients: "Wholegrain rye flour, rye flour, salt",
    additives: [],
    labels: [],
    nutrition: { kcal: 342, sugar: 2.5, satFat: 0.2, salt: 0.9, protein: 8.5, fibre: 15.2 }
  },
  {
    barcode: "8428532230102",
    name: "Unsweetened Almond Drink",
    shortName: "Almond Milk",
    brand: "Alpro",
    kind: "food",
    category: "Plant milk",
    emoji: "🥛",
    ingredients: "Water, almonds, calcium, sea salt, stabilisers, vitamins",
    additives: ["e322"],
    labels: ["vegan"],
    nutrition: { kcal: 13, sugar: 0, satFat: 0.1, salt: 0.13, protein: 0.4, fibre: 0.2 }
  },
  {
    barcode: "5060123450012",
    name: "Chocolate Protein Bar",
    shortName: "Protein Bar",
    brand: "Demo Sports",
    kind: "food",
    category: "Fitness",
    emoji: "💪",
    ingredients: "Milk protein, cocoa, sweetener, soy protein, palm oil, emulsifier",
    additives: ["e322"],
    labels: [],
    nutrition: { kcal: 390, sugar: 3, satFat: 5, salt: 0.8, protein: 32, fibre: 7 }
  },
  {
    barcode: "2034567890123",
    name: "Fresh Chicken Breast",
    shortName: "Chicken Breast",
    brand: "Demo Fresh",
    kind: "food",
    category: "Protein",
    emoji: "🍗",
    ingredients: "Chicken breast",
    additives: [],
    labels: [],
    nutrition: { kcal: 110, sugar: 0, satFat: 0.6, salt: 0.1, protein: 24, fibre: 0 }
  },
  {
    barcode: "8433457777000",
    name: "Daily Glow Face Cream",
    shortName: "Face Cream",
    brand: "LumaSkin",
    kind: "cosmetic",
    category: "Beauty",
    emoji: "🧴",
    ingredients: "Aqua, glycerin, squalane, parfum, BHT, methylisothiazolinone",
    additives: [],
    labels: [],
    nutrition: {}
  },
  {
    barcode: "5353901234430",
    name: "Barrier Calm Body Lotion",
    shortName: "Body Lotion",
    brand: "Plain Ritual",
    kind: "cosmetic",
    category: "Personal care",
    emoji: "🧼",
    ingredients: "Aqua, glycerin, caprylic triglyceride, ceramide NP, phenoxyethanol",
    additives: [],
    labels: [],
    nutrition: {}
  },
  {
    barcode: "7350123456789",
    name: "Fragrance-Free Gentle Cleanser",
    shortName: "Gentle Cleanser",
    brand: "Soft Lab",
    kind: "cosmetic",
    category: "Skincare",
    emoji: "🫧",
    ingredients: "Aqua, glycerin, cocamidopropyl betaine, panthenol, sodium benzoate",
    additives: [],
    labels: [],
    nutrition: {}
  }
];

function toProduct(item) {
  return {
    code: item.barcode,
    barcode: item.barcode,
    product_name: item.name,
    demo_short_name: item.shortName,
    brands: item.brand,
    categories: item.category,
    product_type: item.kind,
    ingredients_text: item.ingredients,
    additives_tags: item.additives.map((code) => `en:${code}`),
    labels_tags: item.labels.map((label) => `en:${label}`),
    image_emoji: item.emoji,
    demo_source: true,
    confidence: "High",
    nutriments: {
      "energy-kcal_100g": item.nutrition.kcal,
      sugars_100g: item.nutrition.sugar,
      "saturated-fat_100g": item.nutrition.satFat,
      salt_100g: item.nutrition.salt,
      proteins_100g: item.nutrition.protein,
      fiber_100g: item.nutrition.fibre
    }
  };
}

function normalizeAdditive(tag) {
  return String(tag || "").toLowerCase().replace("en:", "").replace("additive:", "").trim();
}

function extractENumbers(text) {
  const matches = String(text || "").toLowerCase().match(/\be\s?-?\d{3,4}[a-z]?\b/g) || [];
  return [...new Set(matches.map((item) => item.replace(/\s|-/g, "")))];
}

function getName(product) {
  return product.demo_short_name || product.product_name || product.product_name_en || product.generic_name || "Unknown product";
}

function getFullName(product) {
  return product.product_name || product.product_name_en || product.generic_name || "Unknown product";
}

function getBrand(product) {
  return product.brands || "Unknown brand";
}

function getEmoji(product) {
  return product.image_emoji || "🛒";
}

function getIngredients(product) {
  return String(product.ingredients_text || product.ingredients_text_en || "").toLowerCase();
}

function getKind(product) {
  const text = [
    product.product_type || "",
    product.categories || "",
    ...(product.categories_tags || []),
    product.ingredients_text || ""
  ]
    .join(" ")
    .toLowerCase();

  if (
    text.includes("aqua") ||
    text.includes("parfum") ||
    text.includes("fragrance") ||
    text.includes("glycerin") ||
    text.includes("cosmetic") ||
    text.includes("beauty") ||
    text.includes("personal care") ||
    text.includes("skincare") ||
    text.includes("hygiene")
  ) {
    return "cosmetic";
  }

  return "food";
}

function getKcal(product) {
  const n = product.nutriments || {};
  if (n["energy-kcal_100g"]) return Number(n["energy-kcal_100g"]);
  if (n.energy_kcal_100g) return Number(n.energy_kcal_100g);
  if (n.energy_100g) return Number(n.energy_100g) / 4.184;
  return 0;
}

function getSugar(product) {
  return Number(product.nutriments?.sugars_100g || 0);
}

function getSatFat(product) {
  return Number(product.nutriments?.["saturated-fat_100g"] || product.nutriments?.saturated_fat_100g || 0);
}

function getSalt(product) {
  const n = product.nutriments || {};
  if (n.salt_100g) return Number(n.salt_100g);
  if (n.sodium_100g) return Number(n.sodium_100g) * 2.5;
  return 0;
}

function getProtein(product) {
  return Number(product.nutriments?.proteins_100g || product.nutriments?.protein_100g || 0);
}

function getFibre(product) {
  return Number(product.nutriments?.fiber_100g || product.nutriments?.fibre_100g || 0);
}

function scoreFood(product) {
  let nutrition = 60;
  let additives = 30;
  let organic = 0;
  let cap = 100;

  const warnings = [];
  const positives = [];

  const kcal = getKcal(product);
  const sugar = getSugar(product);
  const satFat = getSatFat(product);
  const salt = getSalt(product);
  const protein = getProtein(product);
  const fibre = getFibre(product);
  const ingredientText = getIngredients(product);

  if (kcal > 500) {
    nutrition -= 8;
    warnings.push("Very high calories");
  } else if (kcal > 350) {
    nutrition -= 5;
  }

  if (sugar > 20) {
    nutrition -= 12;
    warnings.push("Very high sugar");
  } else if (sugar > 12) {
    nutrition -= 8;
    warnings.push("High sugar");
  } else if (sugar <= 3) {
    positives.push("Low sugar");
  }

  if (ingredientText.includes("sugar") && product.confidence === "Medium") {
    warnings.push("Sugar detected in ingredients");
  }

  if (ingredientText.includes("palm oil")) {
    warnings.push("Contains palm oil");
    nutrition -= 3;
  }

  if (satFat > 6) {
    nutrition -= 8;
    warnings.push("Very high saturated fat");
  } else if (satFat > 3) {
    nutrition -= 5;
    warnings.push("High saturated fat");
  }

  if (salt > 1.5) {
    nutrition -= 10;
    warnings.push("Very high salt");
  } else if (salt > 1) {
    nutrition -= 6;
    warnings.push("High salt");
  }

  if (fibre > 5) {
    nutrition += 8;
    positives.push("Excellent fibre");
  } else if (fibre > 3) {
    nutrition += 5;
    positives.push("Good fibre");
  }

  if (protein > 12) {
    nutrition += 8;
    positives.push("Excellent protein");
  } else if (protein > 6) {
    nutrition += 5;
    positives.push("Good protein");
  }

  const additiveTags = [
    ...(product.additives_tags || []),
    ...extractENumbers(product.ingredients_text || "").map((code) => `en:${code}`)
  ];

  if (additiveTags.length === 0) {
    positives.push("No additives detected");
  }

  [...new Set(additiveTags)].forEach((tag) => {
    const key = normalizeAdditive(tag);
    const additive = ADDITIVE_DATABASE[key];

    if (!additive) {
      additives -= 3;
      warnings.push(`Unclassified additive: ${key.toUpperCase()}`);
      return;
    }

    if (additive.risk === "high") {
      cap = Math.min(cap, 49);
      additives -= 15;
      warnings.push(`High-risk additive: ${additive.name}`);
    }

    if (additive.risk === "moderate") {
      additives -= 8;
      warnings.push(`Moderate-risk additive: ${additive.name}`);
    }

    if (additive.risk === "low") {
      additives -= 3;
    }
  });

  const labels = [...(product.labels_tags || []), product.labels || ""].join(" ").toLowerCase();

  if (labels.includes("organic")) {
    organic = 10;
    positives.push("Certified organic");
  }

  if (product.confidence === "Medium") {
    nutrition = Math.min(nutrition, 45);
    warnings.push("Provisional score based on ingredient text only");
  }

  nutrition = Math.max(0, Math.min(60, nutrition));
  additives = Math.max(0, Math.min(30, additives));

  const total = Math.min(cap, Math.max(0, Math.min(100, Math.round(nutrition + additives + organic))));

  if (warnings.length === 0) {
    positives.push("No major concerns detected from available data");
  }

  return {
    score: total,
    parts: { nutrition: Math.round(nutrition), additives: Math.round(additives), organic },
    warnings,
    positives
  };
}

function scoreCosmetic(product) {
  const ingredients = getIngredients(product);
  const warnings = [];
  const positives = [];

  let score = 90;

  const highRisk = ["bht", "formaldehyde", "triclosan", "phthalate", "paraben"];
  const moderateRisk = ["parfum", "fragrance", "methylisothiazolinone", "phenoxyethanol", "sodium benzoate"];

  highRisk.forEach((term) => {
    if (ingredients.includes(term)) {
      score = Math.min(score, 24);
      warnings.push(`High concern ingredient: ${term}`);
    }
  });

  moderateRisk.forEach((term) => {
    if (ingredients.includes(term)) {
      score = Math.min(score, 49);
      warnings.push(`Moderate concern ingredient: ${term}`);
    }
  });

  if (product.confidence === "Medium") {
    warnings.push("Provisional score based on scanned ingredient text only");
  }

  if (warnings.length === 0) {
    positives.push("No high-risk cosmetic ingredients detected");
  }

  return {
    score,
    parts: { nutrition: 0, additives: 0, organic: 0 },
    warnings,
    positives
  };
}

function scoreProduct(rawProduct, barcodeOverride) {
  const barcode = barcodeOverride || rawProduct.code || rawProduct.barcode || "ingredient-scan";
  const kind = getKind(rawProduct);
  const scored = kind === "cosmetic" ? scoreCosmetic(rawProduct) : scoreFood(rawProduct);

  return {
    ...rawProduct,
    barcode,
    productKind: kind,
    score: scored.score,
    scoreParts: scored.parts,
    warnings: scored.warnings,
    positives: scored.positives,
    scannedAt: new Date().toLocaleDateString()
  };
}

function createIngredientProduct(text) {
  const trimmed = String(text || "").trim();

  return scoreProduct({
    code: `ingredients-${Date.now()}`,
    barcode: `ingredients-${Date.now()}`,
    product_name: "Scanned Ingredients",
    demo_short_name: "Ingredient Scan",
    brands: "Photo OCR",
    categories: getKind({ ingredients_text: trimmed }) === "cosmetic" ? "Cosmetic / hygiene label" : "Food label",
    product_type: getKind({ ingredients_text: trimmed }),
    ingredients_text: trimmed,
    additives_tags: extractENumbers(trimmed).map((code) => `en:${code}`),
    labels_tags: [],
    image_emoji: "📸",
    demo_source: false,
    confidence: "Medium",
    nutriments: {}
  });
}

function getScoreMeta(score) {
  if (score >= 80) return { label: "Excellent", tone: "excellent", color: "#00a66a" };
  if (score >= 60) return { label: "Good", tone: "good", color: "#7dbb35" };
  if (score >= 40) return { label: "Average", tone: "average", color: "#f5a623" };
  if (score >= 20) return { label: "Poor", tone: "poor", color: "#ff6b47" };
  return { label: "Very Poor", tone: "bad", color: "#d9344a" };
}

function getRecommendations(product) {
  const demoProducts = DEMO_PRODUCTS.map(toProduct).map((item) => scoreProduct(item, item.barcode));

  if (!product) {
    return demoProducts.sort((a, b) => b.score - a.score).slice(0, 8);
  }

  const sameKind = demoProducts
    .filter((item) => item.barcode !== product.barcode)
    .filter((item) => item.productKind === product.productKind)
    .filter((item) => item.score > product.score)
    .sort((a, b) => b.score - a.score);

  const anyBetter = demoProducts
    .filter((item) => item.barcode !== product.barcode)
    .filter((item) => item.score > product.score)
    .sort((a, b) => b.score - a.score);

  return [...sameKind, ...anyBetter]
    .filter((item, index, array) => array.findIndex((x) => x.barcode === item.barcode) === index)
    .slice(0, 8);
}

function findDemo(query) {
  const q = String(query || "").trim().toLowerCase();

  if (!q) return null;

  return DEMO_PRODUCTS.find((item) => {
    return (
      item.barcode === q ||
      item.name.toLowerCase().includes(q) ||
      item.shortName.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });
}

function toggleArray(object, key, value) {
  const exists = object[key].includes(value);

  return {
    ...object,
    [key]: exists ? object[key].filter((item) => item !== value) : [...object[key], value]
  };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [query, setQuery] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [compare, setCompare] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [scannerStatus, setScannerStatus] = useState("Camera is optional. Manual search is reliable.");
  const [scannerKey, setScannerKey] = useState(0);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState({
    avoid: ["palm oil", "parfum", "bht"],
    allergens: ["milk", "peanuts", "gluten"]
  });

  const videoRef = useRef(null);
  const ingredientInputRef = useRef(null);
  const scannerIngredientInputRef = useRef(null);
  const lockRef = useRef(false);

  const recommendations = useMemo(() => getRecommendations(currentProduct), [currentProduct]);
  const isFavorite = currentProduct && favorites.some((item) => item.barcode === currentProduct.barcode);

  function enrichAlerts(product) {
    const ingredients = getIngredients(product);
    const alerts = [];

    preferences.avoid.forEach((item) => {
      if (ingredients.includes(item.toLowerCase())) {
        alerts.push(`Contains avoided ingredient: ${item}`);
      }
    });

    preferences.allergens.forEach((item) => {
      if (ingredients.includes(item.toLowerCase())) {
        alerts.push(`Potential allergen: ${item}`);
      }
    });

    return { ...product, alerts };
  }

  function openProduct(product) {
    const enriched = enrichAlerts(product);
    setCurrentProduct(enriched);
    setTab("overview");
    setHistory((prev) => [enriched, ...prev.filter((item) => item.barcode !== enriched.barcode)].slice(0, 30));
    setScreen("result");
  }

  async function searchProduct(input, fallbackItem = null) {
    const value = String(input || "").trim();

    if (!value) {
      setError("Enter a barcode or choose a demo product.");
      return;
    }

    setLoading(true);
    setError("");

    const localMatch = fallbackItem || findDemo(value);

    if (localMatch && !/^\d+$/.test(value)) {
      openProduct(scoreProduct(toProduct(localMatch), localMatch.barcode));
      setLoading(false);
      return;
    }

    const barcode = localMatch?.barcode || value;

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data?.status === 1 && data?.product) {
        const product = scoreProduct({ ...data.product, confidence: "High" }, barcode);
        openProduct(product);
      } else if (localMatch) {
        openProduct(scoreProduct(toProduct(localMatch), localMatch.barcode));
      } else {
        throw new Error("Product not found");
      }
    } catch {
      if (localMatch) {
        openProduct(scoreProduct(toProduct(localMatch), localMatch.barcode));
      } else {
        setError("Product not found. Try a demo product or scan ingredients.");
      }
    } finally {
      setLoading(false);
      lockRef.current = false;
    }
  }

  async function handleIngredientImage(file) {
    if (!file) return;

    setError("");
    setOcrLoading(true);
    setOcrText("");

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (message) => {
          if (message.status === "recognizing text") {
            const percent = Math.round((message.progress || 0) * 100);
            setOcrText(`Reading label... ${percent}%`);
          }
        }
      });

      const text = result?.data?.text || "";

      if (!text.trim()) {
        throw new Error("No text found");
      }

      setOcrText(text);
      openProduct(createIngredientProduct(text));
    } catch {
      setError("Could not read the ingredient photo. Try a clearer, closer picture with good light.");
    } finally {
      setOcrLoading(false);
    }
  }

  useEffect(() => {
    if (screen !== "scanner") return undefined;

    let controls;
    let cancelled = false;

    async function startScanner() {
      setScannerStatus("Opening camera. If it does not read, use manual search or scan ingredients.");
      setError("");
      lockRef.current = false;

      try {
        if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
          setScannerStatus("Camera not available. Use manual search or scan ingredients.");
          return;
        }

        const reader = new BrowserMultiFormatReader();
        let deviceId;

        try {
          const devices = await BrowserMultiFormatReader.listVideoInputDevices();
          const back = devices.find((d) => String(d.label).toLowerCase().includes("back")) || devices[devices.length - 1];
          deviceId = back?.deviceId;
        } catch {
          deviceId = undefined;
        }

        controls = await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, scanError, scannerControls) => {
          if (cancelled || lockRef.current) return;

          if (result) {
            const barcode = result.getText();

            if (barcode) {
              lockRef.current = true;
              setScannerStatus(`Found ${barcode}`);
              scannerControls?.stop();
              searchProduct(barcode);
            }
          }
        });

        setScannerStatus("Point at barcode. Hold steady for 2 seconds.");
      } catch {
        setScannerStatus("Camera scanner could not start. Use manual search or scan ingredients.");
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      lockRef.current = false;
      controls?.stop?.();

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [screen, scannerKey]);

  function toggleFavorite(product) {
    if (!product) return;

    setFavorites((prev) => {
      const exists = prev.some((item) => item.barcode === product.barcode);

      if (exists) return prev.filter((item) => item.barcode !== product.barcode);

      return [product, ...prev];
    });
  }

  function addCompare(product) {
    if (!product) return;

    setCompare((prev) => {
      if (prev.some((item) => item.barcode === product.barcode)) return prev;

      return [product, ...prev].slice(0, 3);
    });

    setScreen("compare");
  }

  return (
    <div className="app-shell">
      {screen !== "scanner" && (
        <header className="topbar">
          <div>
            <p className="eyebrow">Pinch</p>
            <h1>{screenTitle(screen)}</h1>
          </div>

          <button className="icon-btn" onClick={() => setScreen("settings")} aria-label="Settings">
            <SlidersHorizontal size={20} />
          </button>
        </header>
      )}

      {screen === "home" && (
        <main className="page">
          <section className="hero-card">
            <div className="logo-bubble">P</div>
            <h2>Scan smarter. Shop prettier.</h2>
            <p>Barcode not reading? No drama. Search manually or snap the ingredient label.</p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => setScreen("search")}>
                <Search size={20} />
                Enter manually
              </button>

              <button className="secondary-btn" onClick={() => setScreen("scanner")}>
                <ScanBarcode size={20} />
                Take picture of barcode
              </button>

              <button className="tertiary-btn" onClick={() => ingredientInputRef.current?.click()}>
                <ImagePlus size={20} />
                Take picture of ingredients
              </button>

              <input
                ref={ingredientInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(event) => handleIngredientImage(event.target.files?.[0])}
              />
            </div>

            {ocrLoading && <div className="mini-loading">{ocrText || "Reading label..."}</div>}
            {error && <div className="error-box">{error}</div>}
          </section>

          <section className="choice-grid">
            <ChoiceCard
              icon={<ScanBarcode />}
              title="Take picture of barcode"
              text="Try the live scanner. Best with good light and a flat barcode."
              onClick={() => setScreen("scanner")}
            />
            <ChoiceCard
              icon={<Search />}
              title="Enter manually"
              text="Type the barcode or search by name. Most reliable for MVP."
              onClick={() => setScreen("search")}
            />
            <ChoiceCard
              icon={<ImagePlus />}
              title="Picture of ingredients"
              text="OCR reads the label and creates a provisional analysis."
              onClick={() => ingredientInputRef.current?.click()}
            />
          </section>

          <section className="story-strip">
            {[
              ["Food", "🍝"],
              ["Beauty", "🧴"],
              ["Snacks", "🍪"],
              ["Drinks", "🥤"],
              ["Protein", "💪"],
              ["Avoid", "⚠️"]
            ].map(([label, emoji]) => (
              <button key={label} className="story-pill" onClick={() => setScreen("search")}>
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </section>

          <section className="feature-grid">
            <FeatureCard icon={<Apple />} title="Food analysis" text="Nutrition, additives, labels, sugar, salt, protein, and fibre." />
            <FeatureCard icon={<ShieldCheck />} title="Cosmetic analysis" text="Ingredient concerns, fragrance, irritants, and safer choices." />
            <FeatureCard icon={<Sparkles />} title="Recommendations" text="Better alternatives when a product scores poorly." />
            <FeatureCard icon={<Clock />} title="History" text="Colour-coded products you already scanned." />
          </section>

          <SectionHeader title="Popular products" action="See all" onAction={() => setScreen("search")} />

          <div className="product-carousel">
            {DEMO_PRODUCTS.slice(0, 8).map((item) => {
              const product = scoreProduct(toProduct(item), item.barcode);
              return <ProductMini key={item.barcode} product={product} onClick={() => openProduct(product)} />;
            })}
          </div>

          {history.length > 0 && (
            <>
              <SectionHeader title="Recently scanned" action="History" onAction={() => setScreen("history")} />

              <div className="list-stack">
                {history.slice(0, 3).map((item) => (
                  <ProductRow key={item.barcode} product={item} onClick={() => openProduct(item)} />
                ))}
              </div>
            </>
          )}
        </main>
      )}

      {screen === "search" && (
        <main className="page">
          <BackButton onClick={() => setScreen("home")} />

          <section className="search-card">
            <h2>Enter manually</h2>
            <p>Type a barcode, product name, or choose one below. This is the most reliable flow for now.</p>

            <form
              className="search-form"
              onSubmit={(event) => {
                event.preventDefault();
                searchProduct(query);
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try 5201083348903, Nutella, yogurt..."
                inputMode="search"
              />

              <button disabled={loading}>{loading ? "Searching..." : "Search"}</button>
            </form>

            <div className="inline-options">
              <button onClick={() => setScreen("scanner")}>
                <ScanBarcode size={18} />
                Barcode photo
              </button>
              <button onClick={() => ingredientInputRef.current?.click()}>
                <ImagePlus size={18} />
                Ingredients photo
              </button>
            </div>

            {ocrLoading && <div className="mini-loading">{ocrText || "Reading label..."}</div>}
            {error && <div className="error-box">{error}</div>}
          </section>

          <div className="filter-cloud">
            {["All", "Food", "Beauty", "Drinks", "Snacks", "Protein", "Low sugar"].map((item) => (
              <button key={item}>{item}</button>
            ))}
          </div>

          <div className="grid-products">
            {DEMO_PRODUCTS.map((item) => {
              const product = scoreProduct(toProduct(item), item.barcode);

              return (
                <ProductTile
                  key={item.barcode}
                  product={product}
                  onClick={() => searchProduct(item.barcode, item)}
                />
              );
            })}
          </div>

          <input
            ref={ingredientInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(event) => handleIngredientImage(event.target.files?.[0])}
          />
        </main>
      )}

      {screen === "scanner" && (
        <main className="scanner-page">
          <div className="scanner-video-wrap">
            <video ref={videoRef} autoPlay playsInline muted className="scanner-video" />

            <div className="scanner-frame" />

            <button className="scanner-close" onClick={() => setScreen("home")}>
              <X size={22} />
            </button>

            <div className="scanner-caption">
              <h2>Take picture of barcode</h2>
              <p>{scannerStatus}</p>
            </div>
          </div>

          <section className="scanner-panel">
            <div className="scanner-choice-row">
              <button onClick={() => setScannerKey((key) => key + 1)}>
                <RefreshCcw size={18} />
                Restart barcode
              </button>

              <button onClick={() => scannerIngredientInputRef.current?.click()}>
                <ImagePlus size={18} />
                Ingredients
              </button>
            </div>

            <form
              className="search-form dark"
              onSubmit={(event) => {
                event.preventDefault();
                searchProduct(query);
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Or enter barcode manually..."
                inputMode="numeric"
              />

              <button disabled={loading || !query.trim()}>{loading ? "Searching..." : "Search"}</button>
            </form>

            {ocrLoading && <div className="scanner-loading">{ocrText || "Reading label..."}</div>}
            {error && <div className="scanner-error">{error}</div>}

            <div className="scanner-products">
              {DEMO_PRODUCTS.slice(0, 8).map((item) => (
                <button key={item.barcode} onClick={() => searchProduct(item.barcode, item)}>
                  <span>{item.emoji}</span>
                  {item.shortName}
                </button>
              ))}
            </div>

            <input
              ref={scannerIngredientInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(event) => handleIngredientImage(event.target.files?.[0])}
            />
          </section>
        </main>
      )}

      {screen === "result" && currentProduct && (
        <main className="page result-page">
          <BackButton onClick={() => setScreen("home")} />

          <section className={`result-hero ${getScoreMeta(currentProduct.score).tone}`}>
            <div className="product-image-card">
              {currentProduct.image_url ? (
                <img src={currentProduct.image_url} alt={getName(currentProduct)} />
              ) : (
                <span>{getEmoji(currentProduct)}</span>
              )}
            </div>

            <div className="score-orb" style={{ backgroundColor: getScoreMeta(currentProduct.score).color }}>
              <strong>{currentProduct.score}</strong>
              <small>/100</small>
            </div>

            <p className="brand">{getBrand(currentProduct)}</p>
            <h2>{getFullName(currentProduct)}</h2>
            <p className="score-label">
              {getScoreMeta(currentProduct.score).label} · {currentProduct.productKind === "food" ? "Food analysis" : "Cosmetic analysis"}
            </p>

            {currentProduct.confidence === "Medium" && (
              <div className="confidence-pill">Provisional result · Ingredient scan only</div>
            )}
          </section>

          {currentProduct.alerts?.length > 0 && (
            <section className="alert-card">
              <AlertTriangle size={20} />

              <div>
                <h3>Your alerts</h3>
                {currentProduct.alerts.map((item) => (
                  <p key={item}>• {item}</p>
                ))}
              </div>
            </section>
          )}

          <nav className="tabs">
            {["overview", "nutrition", "ingredients", "alternatives"].map((item) => (
              <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
                {item}
              </button>
            ))}
          </nav>

          {tab === "overview" && (
            <section className="content-card">
              <h3>Why this score?</h3>

              <p className="muted">
                Pinch evaluates the product using available label data. Barcode results are stronger. Ingredient photos create a provisional result.
              </p>

              {currentProduct.productKind === "food" && (
                <div className="score-breakdown">
                  <Breakdown label="Nutrition" value={currentProduct.scoreParts.nutrition} max={60} />
                  <Breakdown label="Additives" value={currentProduct.scoreParts.additives} max={30} />
                  <Breakdown label="Labels" value={currentProduct.scoreParts.organic} max={10} />
                </div>
              )}

              <SignalList title="What hurt the score" items={currentProduct.warnings} type="bad" />
              <SignalList title="What helped the score" items={currentProduct.positives} type="good" />
            </section>
          )}

          {tab === "nutrition" && (
            <section className="content-card">
              <h3>Nutrition per 100g</h3>

              {currentProduct.productKind === "food" && currentProduct.confidence !== "Medium" ? (
                <div className="metric-grid">
                  <Metric label="Calories" value={`${Math.round(getKcal(currentProduct))} kcal`} />
                  <Metric label="Sugar" value={`${getSugar(currentProduct).toFixed(1)}g`} />
                  <Metric label="Sat fat" value={`${getSatFat(currentProduct).toFixed(1)}g`} />
                  <Metric label="Salt" value={`${getSalt(currentProduct).toFixed(2)}g`} />
                  <Metric label="Protein" value={`${getProtein(currentProduct).toFixed(1)}g`} />
                  <Metric label="Fibre" value={`${getFibre(currentProduct).toFixed(1)}g`} />
                </div>
              ) : (
                <p className="muted">Nutrition needs a barcode result or a nutrition table scan. This result is based on ingredients only.</p>
              )}
            </section>
          )}

          {tab === "ingredients" && (
            <section className="content-card">
              <h3>Ingredients</h3>

              <p className="ingredient-text">{currentProduct.ingredients_text || "No ingredient list available."}</p>

              <h3 className="spaced">Additives</h3>

              {(currentProduct.additives_tags || []).length > 0 ? (
                <div className="additive-list">
                  {currentProduct.additives_tags.map((tag) => {
                    const key = normalizeAdditive(tag);
                    const additive = ADDITIVE_DATABASE[key];

                    return (
                      <div key={tag} className={`additive ${additive?.risk || "unknown"}`}>
                        <strong>
                          {key.toUpperCase()} {additive ? `· ${additive.name}` : ""}
                        </strong>

                        <span>{additive?.reason || "Not classified in prototype database."}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">No additives listed in available data.</p>
              )}
            </section>
          )}

          {tab === "alternatives" && (
            <section className="content-card">
              <h3>Healthier alternatives</h3>

              <p className="muted">Independent recommendations based on higher scores and similar product type.</p>

              {recommendations.length > 0 ? (
                <div className="list-stack">
                  {recommendations.map((item) => (
                    <ProductRow key={item.barcode} product={item} onClick={() => openProduct(item)} />
                  ))}
                </div>
              ) : (
                <p className="muted">No better demo alternatives available yet.</p>
              )}
            </section>
          )}

          <section className="action-bar">
            <button onClick={() => toggleFavorite(currentProduct)} className={isFavorite ? "saved" : ""}>
              <Heart size={19} />
              {isFavorite ? "Saved" : "Save"}
            </button>

            <button onClick={() => addCompare(currentProduct)}>
              <Star size={19} />
              Compare
            </button>

            <button onClick={() => setScreen("recommendations")}>
              <Sparkles size={19} />
              Recs
            </button>
          </section>
        </main>
      )}

      {screen === "history" && (
        <main className="page">
          <BackButton onClick={() => setScreen("home")} />

          <section className="content-card intro">
            <h2>History</h2>
            <p>Pinch remembers scanned products with easy colour-coded scores.</p>
          </section>

          {history.length === 0 ? (
            <EmptyState text="No scans yet." />
          ) : (
            <div className="list-stack">
              {history.map((item) => (
                <ProductRow key={item.barcode} product={item} onClick={() => openProduct(item)} />
              ))}
            </div>
          )}
        </main>
      )}

      {screen === "recommendations" && (
        <main className="page">
          <BackButton onClick={() => setScreen("home")} />

          <section className="content-card intro">
            <h2>Recommendations</h2>
            <p>Better alternatives based on higher scores, not paid placement.</p>
          </section>

          <div className="grid-products">
            {getRecommendations(currentProduct).map((item) => (
              <ProductTile key={item.barcode} product={item} onClick={() => openProduct(item)} />
            ))}
          </div>
        </main>
      )}

      {screen === "settings" && (
        <main className="page">
          <BackButton onClick={() => setScreen("home")} />

          <section className="content-card intro">
            <h2>Personal alerts</h2>
            <p>Pinch separates general product score from what matters personally to you.</p>
          </section>

          <PreferenceEditor
            title="Avoid ingredients"
            values={["palm oil", "parfum", "bht", "sugar", "gluten"]}
            selected={preferences.avoid}
            onToggle={(value) => setPreferences((prev) => toggleArray(prev, "avoid", value))}
          />

          <PreferenceEditor
            title="Allergens"
            values={["milk", "peanuts", "gluten", "soy", "eggs", "tree nuts"]}
            selected={preferences.allergens}
            onToggle={(value) => setPreferences((prev) => toggleArray(prev, "allergens", value))}
          />
        </main>
      )}

      {screen === "compare" && (
        <main className="page">
          <BackButton onClick={() => setScreen("home")} />

          <section className="content-card intro">
            <h2>Compare</h2>
            <p>Choose up to 3 products and compare scores side by side.</p>
          </section>

          {compare.length === 0 ? (
            <EmptyState text="No products added to compare yet." />
          ) : (
            <div className="compare-grid">
              {compare.map((item) => (
                <ProductTile key={item.barcode} product={item} onClick={() => openProduct(item)} />
              ))}
            </div>
          )}
        </main>
      )}

      {screen !== "scanner" && <BottomNav screen={screen} setScreen={setScreen} />}
    </div>
  );
}

function screenTitle(screen) {
  const titles = {
    home: "Good choices, fast",
    search: "Find a product",
    result: "Product result",
    history: "Your shelf memory",
    recommendations: "Better alternatives",
    settings: "Personal alerts",
    compare: "Compare"
  };

  return titles[screen] || "Pinch";
}

function BackButton({ onClick }) {
  return (
    <button className="back-btn" onClick={onClick}>
      <ChevronLeft size={20} />
      Back
    </button>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  );
}

function ChoiceCard({ icon, title, text, onClick }) {
  return (
    <button className="choice-card" onClick={onClick}>
      <div className="choice-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </button>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ProductMini({ product, onClick }) {
  const meta = getScoreMeta(product.score);

  return (
    <button className="mini-card" onClick={onClick}>
      <span className="mini-emoji">{getEmoji(product)}</span>
      <strong>{getName(product)}</strong>
      <small>{getBrand(product)}</small>
      <span className={`mini-score ${meta.tone}`}>{product.score}</span>
    </button>
  );
}

function ProductTile({ product, onClick }) {
  const meta = getScoreMeta(product.score);

  return (
    <button className="product-tile" onClick={onClick}>
      <span className="tile-emoji">{getEmoji(product)}</span>

      <div>
        <strong>{getName(product)}</strong>
        <small>{getBrand(product)}</small>
      </div>

      <span className={`tile-score ${meta.tone}`}>{product.score}</span>
    </button>
  );
}

function ProductRow({ product, onClick }) {
  const meta = getScoreMeta(product.score);

  return (
    <button className="product-row" onClick={onClick}>
      <div className="row-emoji">{getEmoji(product)}</div>

      <div className="row-info">
        <strong>{getName(product)}</strong>
        <small>
          {getBrand(product)} · {meta.label}
        </small>
      </div>

      <span className={`row-score ${meta.tone}`}>{product.score}</span>
      <ChevronRight size={16} />
    </button>
  );
}

function Breakdown({ label, value, max }) {
  const width = max ? `${Math.round((value / max) * 100)}%` : "0%";

  return (
    <div className="breakdown">
      <div>
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>

      <div className="break-track">
        <div style={{ width }} />
      </div>
    </div>
  );
}

function SignalList({ title, items, type }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`signal-list ${type}`}>
      <h4>{title}</h4>

      {items.map((item) => (
        <p key={item}>• {item}</p>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PreferenceEditor({ title, values, selected, onToggle }) {
  return (
    <section className="content-card">
      <h3>{title}</h3>

      <div className="preference-cloud">
        {values.map((value) => (
          <button key={value} className={selected.includes(value) ? "selected" : ""} onClick={() => onToggle(value)}>
            {value}
          </button>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <section className="empty-state">
      <Sparkles size={28} />
      <p>{text}</p>
    </section>
  );
}

function BottomNav({ screen, setScreen }) {
  const items = [
    ["home", Home, "Home"],
    ["search", Search, "Search"],
    ["history", Clock, "History"],
    ["recommendations", Leaf, "Recs"],
    ["settings", SlidersHorizontal, "Alerts"]
  ];

  return (
    <nav className="bottom-nav">
      {items.map(([id, Icon, label]) => (
        <button key={id} className={screen === id ? "active" : ""} onClick={() => setScreen(id)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
