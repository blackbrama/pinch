import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Camera,
  Heart,
  Lock,
  Scale,
  Search
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

const DEMO_BARCODES = [
  {
    name: "Nutella",
    barcode: "3017620422003"
  },
  {
    name: "Coca-Cola",
    barcode: "5449000000996"
  },
  {
    name: "Kinder Bueno",
    barcode: "8000500037560"
  }
];

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

function getIngredientText(product) {
  return String(product.ingredients_text || product.ingredients_text_en || "").toLowerCase();
}

function getEnergyKcal(product) {
  const nutriments = product.nutriments || {};
  return Number(
    nutriments["energy-kcal_100g"] ||
      nutriments.energy_kcal_100g ||
      nutriments.energy_100g / 4.184 ||
      0
  );
}

function getSalt(product) {
  const nutriments = product.nutriments || {};
  return Number(nutriments.salt_100g || nutriments.sodium_100g * 2.5 || 0);
}

function calculateFoodScore(product) {
  const details = {
    nutrition: 0,
    additives: 0,
    organic: 0,
    reasons: [],
    warnings: [],
    positives: []
  };

  const nutriments = product.nutriments || {};
  let nutritionScore = 60;

  const energyKcal = getEnergyKcal(product);
  const sugars = Number(nutriments.sugars_100g || 0);
  const saturatedFat = Number(nutriments["saturated-fat_100g"] || nutriments.saturated_fat_100g || 0);
  const salt = getSalt(product);
  const fiber = Number(nutriments.fiber_100g || nutriments.fibre_100g || 0);
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

  if (fiber > 5) {
    nutritionScore += 8;
    details.positives.push("Excellent fibre");
  } else if (fiber > 3) {
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
  const labelsText = [
    ...(product.labels_tags || []),
    product.labels || ""
  ]
    .join(" ")
    .toLowerCase();

  if (labelsText.includes("organic")) {
    organicScore = 10;
    details.positives.push("Certified organic");
  }

  details.organic = organicScore;

  let total = details.nutrition + details.additives + details.organic;

  if (hasHighRiskAdditive) {
    total = Math.min(total, 49);
  }

  total = Math.max(0, Math.min(100, total));

  if (details.warnings.length === 0) {
    details.positives.push("No major concerns detected from available data");
  }

  return {
    score: Math.round(total),
    details
  };
}

function calculateCosmeticScore(product) {
  const details = {
    warnings: [],
    positives: []
  };

  let score = 100;
  const ingredientText = getIngredientText(product);
  const highRiskTerms = ["paraben", "phthalate", "triclosan", "formaldehyde", "bht"];
  const moderateRiskTerms = ["parfum", "fragrance", "methylisothiazolinone"];

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

  if (product.ecoscore_grade && ["a", "b"].includes(String(product.ecoscore_grade).toLowerCase())) {
    score += 5;
    details.positives.push("Good eco-score");
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    details
  };
}

function getScoreInfo(score) {
  if (score >= 80) {
    return {
      label: "Excellent",
      color: "#10b981",
      bg: "bg-emerald-50",
      border: "border-emerald-300"
    };
  }

  if (score >= 60) {
    return {
      label: "Good",
      color: "#84cc16",
      bg: "bg-lime-50",
      border: "border-lime-300"
    };
  }

  if (score >= 40) {
    return {
      label: "Average",
      color: "#f59e0b",
      bg: "bg-amber-50",
      border: "border-amber-300"
    };
  }

  if (score >= 20) {
    return {
      label: "Poor",
      color: "#ef4444",
      bg: "bg-red-50",
      border: "border-red-300"
    };
  }

  return {
    label: "Very Poor",
    color: "#7c2d12",
    bg: "bg-red-100",
    border: "border-red-400"
  };
}

function App() {
  const [screen, setScreen] = useState("home");
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const [userPreferences, setUserPreferences] = useState({
    allergens: ["gluten", "peanuts", "milk"],
    dietary: ["vegetarian"],
    avoidIngredients: ["palm oil"],
    isPremium: false
  });

  const videoRef = useRef(null);
  const scanLockRef = useRef(false);

  function checkUserAlerts(product) {
    const alerts = [];
    const ingredientText = getIngredientText(product);

    userPreferences.allergens.forEach((allergen) => {
      if (ingredientText.includes(allergen.toLowerCase())) {
        alerts.push({
          type: "allergen",
          message: `Contains ${allergen}`,
          severity: "high"
        });
      }
    });

    userPreferences.avoidIngredients.forEach((ingredient) => {
      if (ingredientText.includes(ingredient.toLowerCase())) {
        alerts.push({
          type: "ingredient",
          message: `Contains ${ingredient}`,
          severity: "medium"
        });
      }
    });

    return alerts;
  }

  async function fetchProduct(barcode) {
    const cleanBarcode = String(barcode || "").trim();

    if (!cleanBarcode) {
      setError("Enter a barcode first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();

      if (!data || data.status !== 1 || !data.product) {
        throw new Error("Product not found");
      }

      const product = data.product;
      const categories = String(product.categories || product.categories_tags || "").toLowerCase();
      const isCosmetic =
        product.product_type === "beauty" ||
        categories.includes("beauty") ||
        categories.includes("cosmetic");

      const scoring = isCosmetic ? calculateCosmeticScore(product) : calculateFoodScore(product);
      const userAlerts = checkUserAlerts(product);

      const productWithScore = {
        ...product,
        barcode: cleanBarcode,
        score: scoring.score,
        details: scoring.details,
        userAlerts,
        productKind: isCosmetic ? "cosmetic" : "food",
        scannedAt: new Date().toLocaleDateString()
      };

      setCurrentProduct(productWithScore);
      setProducts((previousProducts) => [
        productWithScore,
        ...previousProducts.filter((item) => item.barcode !== cleanBarcode)
      ]);

      setScreen("result");
    } catch (err) {
      setError("Product not found. Check the barcode and try again.");
    } finally {
      setLoading(false);
      scanLockRef.current = false;
    }
  }

  useEffect(() => {
    if (screen !== "scanner") {
      return undefined;
    }

    let stream;
    let cancelled = false;
    let timer;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera is not available in this browser. Use manual barcode entry.");
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment"
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }

        if ("BarcodeDetector" in window) {
          const detector = new window.BarcodeDetector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e"]
          });

          const scanLoop = async () => {
            if (cancelled) {
              return;
            }

            try {
              if (
                videoRef.current &&
                videoRef.current.readyState >= 2 &&
                !scanLockRef.current
              ) {
                const codes = await detector.detect(videoRef.current);

                if (codes.length > 0 && codes[0].rawValue) {
                  scanLockRef.current = true;
                  fetchProduct(codes[0].rawValue);
                  return;
                }
              }
            } catch {
              // Browser barcode detection can fail quietly. Manual entry remains available.
            }

            timer = window.setTimeout(scanLoop, 700);
          };

          scanLoop();
        }
      } catch {
        setError("Camera access denied. Use manual barcode entry instead.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setCameraActive(false);
    };
  }, [screen]);

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

      if (alreadyAdded) {
        return previousProducts;
      }

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
    currentProduct && favorites.some((item) => item.barcode === currentProduct.barcode);

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
            <p className="text-lg text-gray-600">Understand what you’re buying</p>
          </div>

          <div className="mb-8 space-y-3">
            <button
              onClick={() => {
                setError("");
                setScreen("scanner");
              }}
              className="flex w-full transform items-center justify-center gap-3 rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700"
            >
              <Camera className="h-6 w-6" />
              Scan Barcode
            </button>

            <button
              onClick={() => {
                setError("");
                setScreen("search");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-emerald-600 bg-white py-4 text-lg font-bold text-emerald-600 hover:bg-emerald-50"
            >
              <Search className="h-6 w-6" />
              Manual Search
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScreen("settings")}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-blue-300 bg-white py-3 font-semibold text-blue-600"
              >
                <Bell className="h-5 w-5" />
                Alerts
              </button>

              <button
                onClick={() => setScreen("comparison")}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-purple-300 bg-white py-3 font-semibold text-purple-600"
              >
                <Scale className="h-5 w-5" />
                Compare
              </button>
            </div>
          </div>

          {products.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Recently Scanned</h2>

              <div className="space-y-3">
                {products.slice(0, 3).map((product) => {
                  const scoreInfo = getScoreInfo(product.score);

                  return (
                    <button
                      key={product.barcode}
                      onClick={() => {
                        setCurrentProduct(product);
                        setScreen("result");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl bg-white p-4 shadow"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={getProductName(product)}
                          className="h-14 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded bg-emerald-100 text-2xl">
                          🛒
                        </div>
                      )}

                      <div className="flex-1 text-left">
                        <p className="line-clamp-1 font-semibold text-gray-900">
                          {getProductName(product)}
                        </p>
                        <p className="text-sm text-gray-500">{getProductBrand(product)}</p>
                      </div>

                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow"
                        style={{ backgroundColor: scoreInfo.color }}
                      >
                        {product.score}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setScreen("history")}
              className="rounded-xl bg-white p-4 text-center shadow"
            >
              <p className="mb-1 text-2xl">📋</p>
              <p className="text-xs font-bold text-gray-700">{products.length} Scans</p>
            </button>

            <button
              onClick={() => setScreen("favorites")}
              className="rounded-xl bg-white p-4 text-center shadow"
            >
              <p className="mb-1 text-2xl">❤️</p>
              <p className="text-xs font-bold text-gray-700">{favorites.length} Fav</p>
            </button>

            <button
              onClick={() => setScreen("settings")}
              className="rounded-xl bg-white p-4 text-center shadow"
            >
              <p className="mb-1 text-2xl">⚙️</p>
              <p className="text-xs font-bold text-gray-700">Settings</p>
            </button>
          </div>

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
            <div className="absolute bottom-8 text-center text-white">
              <p className="font-semibold">
                {cameraActive ? "Point at barcode" : "Opening camera..."}
              </p>
              <p className="text-sm text-white/70">
                Manual entry works if scanning is not supported.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-800 bg-gray-900 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              fetchProduct(searchBarcode);
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="Or enter barcode..."
              value={searchBarcode}
              onChange={(event) => setSearchBarcode(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
            />
          </form>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_BARCODES.map((item) => (
              <button
                key={item.barcode}
                onClick={() => fetchProduct(item.barcode)}
                className="rounded-lg bg-gray-800 px-2 py-3 text-xs font-semibold text-white"
              >
                {item.name}
              </button>
            ))}
          </div>

          {loading && (
            <div className="rounded-lg bg-emerald-900/60 p-3 text-center text-sm font-semibold text-emerald-100">
              Searching product...
            </div>
          )}

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="mx-auto max-w-lg px-4 py-6">
          <button
            onClick={() => setScreen("home")}
            className="mb-6 flex items-center gap-2 font-semibold text-emerald-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <h1 className="mb-6 text-3xl font-bold text-gray-900">Search Product</h1>

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
              placeholder="Enter barcode..."
              value={searchBarcode}
              onChange={(event) => setSearchBarcode(event.target.value)}
              className="mb-4 w-full rounded-xl border-2 border-emerald-300 px-4 py-3 text-lg focus:border-emerald-600 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="mb-6 rounded-xl bg-white p-4 shadow">
            <h2 className="mb-3 font-bold text-gray-900">Try a demo barcode</h2>
            <div className="space-y-2">
              {DEMO_BARCODES.map((item) => (
                <button
                  key={item.barcode}
                  onClick={() => fetchProduct(item.barcode)}
                  className="flex w-full items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-left"
                >
                  <span className="font-semibold text-emerald-900">{item.name}</span>
                  <span className="text-sm text-emerald-700">{item.barcode}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "result" && currentProduct) {
    const scoreInfo = getScoreInfo(currentProduct.score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-28">
        <div className="mx-auto max-w-lg px-4 py-6">
          <button
            onClick={() => setScreen("home")}
            className="mb-6 flex items-center gap-2 font-semibold text-emerald-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          {currentProduct.image_url ? (
            <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
              <img
                src={currentProduct.image_url}
                alt={getProductName(currentProduct)}
                className="h-64 w-full object-contain bg-white"
              />
            </div>
          ) : (
            <div className="mb-6 flex h-40 items-center justify-center rounded-2xl bg-white text-5xl shadow-lg">
              🛒
            </div>
          )}

          <div className="mb-6">
            <p className="mb-1 text-sm text-gray-500">{getProductBrand(currentProduct)}</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {getProductName(currentProduct)}
            </h1>
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

          <div className="mb-4 rounded-xl bg-white p-4 shadow">
            <h3 className="mb-2 font-bold text-gray-900">Why this score?</h3>
            <p className="text-sm leading-6 text-gray-700">
              Pinch calculates this using nutrition quality, additive risk, and
              organic or quality labels where available. The score is based only on
              available product data.
            </p>

            {currentProduct.productKind === "food" && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-gray-500">Nutrition</p>
                  <p className="font-bold text-emerald-700">
                    {currentProduct.details.nutrition}/60
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-xs text-gray-500">Additives</p>
                  <p className="font-bold text-amber-700">
                    {currentProduct.details.additives}/30
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-gray-500">Organic</p>
                  <p className="font-bold text-blue-700">
                    {currentProduct.details.organic}/10
                  </p>
                </div>
              </div>
            )}
          </div>

          {currentProduct.details?.warnings?.length > 0 && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <h3 className="mb-2 font-bold text-amber-900">⚠️ Concerns</h3>
              {currentProduct.details.warnings.map((warning, index) => (
                <p key={`${warning}-${index}`} className="text-sm text-amber-800">
                  • {warning}
                </p>
              ))}
            </div>
          )}

          {currentProduct.details?.positives?.length > 0 && (
            <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-4">
              <h3 className="mb-2 font-bold text-green-900">✓ Positives</h3>
              {currentProduct.details.positives.map((positive, index) => (
                <p key={`${positive}-${index}`} className="text-sm text-green-800">
                  • {positive}
                </p>
              ))}
            </div>
          )}

          <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-lg space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => toggleFavorite(currentProduct)}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-semibold ${
                  isFavorited
                    ? "border border-red-300 bg-red-100 text-red-700"
                    : "border border-gray-300 bg-white text-gray-700"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Saved" : "Save"}
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
          </div>
        </div>
      </div>
    );
  }

  if (screen === "details" && currentProduct) {
    const nutriments = currentProduct.nutriments || {};
    const additiveTags = currentProduct.additives_tags || [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="mx-auto max-w-lg px-4 py-6">
          <button
            onClick={() => setScreen("result")}
            className="mb-6 flex items-center gap-2 font-semibold text-emerald-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <h1 className="mb-6 text-2xl font-bold text-gray-900">Full Details</h1>

          <div className="mb-4 rounded-xl bg-white p-5 shadow">
            <h3 className="mb-4 font-bold text-gray-900">Nutrition per 100g</h3>

            <div className="grid grid-cols-2 gap-4">
              <DetailMetric
                label="Energy"
                value={`${Math.round(getEnergyKcal(currentProduct)) || 0} kcal`}
                tone="orange"
              />
              <DetailMetric
                label="Sugar"
                value={`${Number(nutriments.sugars_100g || 0).toFixed(1)}g`}
                tone="red"
              />
              <DetailMetric
                label="Saturated Fat"
                value={`${Number(
                  nutriments["saturated-fat_100g"] ||
                    nutriments.saturated_fat_100g ||
                    0
                ).toFixed(1)}g`}
                tone="amber"
              />
              <DetailMetric
                label="Salt"
                value={`${getSalt(currentProduct).toFixed(2)}g`}
                tone="blue"
              />
              <DetailMetric
                label="Fibre"
                value={`${Number(nutriments.fiber_100g || nutriments.fibre_100g || 0).toFixed(1)}g`}
                tone="green"
              />
              <DetailMetric
                label="Protein"
                value={`${Number(nutriments.proteins_100g || nutriments.protein_100g || 0).toFixed(1)}g`}
                tone="emerald"
              />
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-white p-5 shadow">
            <h3 className="mb-3 font-bold text-gray-900">Additives</h3>

            {additiveTags.length > 0 ? (
              <div className="space-y-2">
                {additiveTags.map((tag) => {
                  const key = normaliseAdditiveTag(tag);
                  const additive = ADDITIVE_DATABASE[key];

                  return (
                    <div key={tag} className="rounded-lg bg-amber-50 p-3 text-sm">
                      <p className="font-bold text-amber-900">
                        {key.toUpperCase()} {additive ? `· ${additive.name}` : ""}
                      </p>
                      <p className="text-amber-800">
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

          <div className="mb-4 rounded-xl bg-white p-5 shadow">
            <h3 className="mb-3 font-bold text-gray-900">Ingredients</h3>
            <p className="text-sm leading-6 text-gray-700">
              {currentProduct.ingredients_text ||
                currentProduct.ingredients_text_en ||
                "No ingredient list available."}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs leading-5 text-blue-700">
              <strong>Disclaimer:</strong> Pinch provides product information based
              on available label data and prototype scoring rules. It is not medical
              advice and does not replace a doctor, dietitian, pharmacist, or the
              official product label.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "settings") {
    const allergens = ["gluten", "peanuts", "milk", "eggs", "fish", "soy", "tree nuts"];
    const dietary = ["vegetarian", "vegan", "kosher", "halal"];
    const avoidIngredients = ["palm oil", "artificial sweeteners", "GMO", "parfum", "BHT"];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="mx-auto max-w-lg px-4 py-6">
          <button
            onClick={() => setScreen("home")}
            className="mb-6 flex items-center gap-2 font-semibold text-emerald-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <h1 className="mb-6 text-3xl font-bold text-gray-900">Settings & Alerts</h1>

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
        </div>
      </div>
    );
  }

  if (screen === "history") {
    return (
      <ProductListScreen
        title="Scan History"
        emptyText="No scans yet"
        products={products}
        onBack={() => setScreen("home")}
        onSelect={(product) => {
          setCurrentProduct(product);
          setScreen("result");
        }}
      />
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="mx-auto max-w-lg px-4 py-6">
          <button
            onClick={() => setScreen("home")}
            className="mb-6 flex items-center gap-2 font-semibold text-emerald-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">Compare Products</h1>
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
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={getProductName(product)}
                          className="mb-3 h-24 w-full rounded object-contain bg-white"
                        />
                      ) : (
                        <div className="mb-3 flex h-24 w-full items-center justify-center rounded bg-emerald-50 text-3xl">
                          🛒
                        </div>
                      )}

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
        </div>
      </div>
    );
  }

  return null;
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="mx-auto max-w-lg px-4 py-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 font-semibold text-emerald-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">{title}</h1>

        {products.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow">
            <p className="text-gray-500">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const scoreInfo = getScoreInfo(product.score);

              return (
                <button
                  key={product.barcode}
                  onClick={() => onSelect(product)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white p-4 shadow"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={getProductName(product)}
                      className="h-14 w-14 rounded object-contain bg-white"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded bg-emerald-50 text-2xl">
                      🛒
                    </div>
                  )}

                  <div className="flex-1 text-left">
                    <p className="line-clamp-1 font-semibold text-gray-900">
                      {getProductName(product)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.scannedAt || getProductBrand(product)}
                    </p>
                  </div>

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: scoreInfo.color }}
                  >
                    {product.score}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
