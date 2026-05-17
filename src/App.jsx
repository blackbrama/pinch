import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  ArrowLeft,
  Award,
  Bell,
  Camera,
  ChevronRight,
  Flame,
  Gift,
  Heart,
  History,
  Home,
  Leaf,
  Lock,
  Sparkles,
  Trash2,
  TrendingUp,
  Zap,
  Map,
  Star
} from "lucide-react";

// Local products database
const LOCAL_PRODUCTS = {
  "mt": { // Malta
    name: "Malta",
    products: [
      {
        barcode: "3017620422003",
        name: "Nutella",
        brand: "Ferrero",
        local: false,
        emoji: "🍫"
      },
      {
        barcode: "8006205024069",
        name: "Mellieħa Tomatoes",
        brand: "Local Farm",
        local: true,
        emoji: "🍅",
        description: "Fresh local tomatoes from Mellieħa"
      },
      {
        barcode: "9999000001",
        name: "Kinnie",
        brand: "Malta Beverage",
        local: true,
        emoji: "🥤",
        description: "Traditional Maltese carbonated drink"
      }
    ]
  }
};

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

// Gamification achievements
const ACHIEVEMENTS = {
  firstScan: { id: "firstScan", name: "First Scan", icon: "🎯", points: 10 },
  healthyStreak: { id: "healthyStreak", name: "Health Warrior", icon: "💪", points: 25, requirement: 5 },
  localLover: { id: "localLover", name: "Local Lover", icon: "🌍", points: 30 },
  collectorX10: { id: "collectorX10", name: "Product Collector", icon: "📚", points: 50, requirement: 10 },
  comparisonMaster: { id: "comparisonMaster", name: "Comparison Master", icon: "⚖️", points: 20 },
  sevenDayStreak: { id: "sevenDayStreak", name: "Dedicated Scanner", icon: "🔥", points: 100 }
};

function calculateFoodScore(product) {
  let score = 100;
  const nutriments = product.nutriments || {};

  if (nutriments["energy-kcal_100g"] > 500) score -= 8;
  if (nutriments.sugars_100g > 20) score -= 12;
  if (nutriments["saturated-fat_100g"] > 6) score -= 8;
  if (nutriments.salt_100g > 1.5) score -= 10;
  if (nutriments.fiber_100g > 5) score += 8;
  if (nutriments.proteins_100g > 12) score += 8;

  if (product.additives_tags?.length > 5) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function getScoreColor(score) {
  if (score >= 80) return { color: "#10b981", label: "Excellent", emoji: "🟢" };
  if (score >= 60) return { color: "#84cc16", label: "Good", emoji: "🟡" };
  if (score >= 40) return { color: "#f59e0b", label: "Average", emoji: "🟠" };
  if (score >= 20) return { color: "#ef4444", label: "Poor", emoji: "🔴" };
  return { color: "#7c2d12", label: "Very Poor", emoji: "⚫" };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoActive, setVideoActive] = useState(false);
  
  // Gamification state
  const [stats, setStats] = useState({
    totalScans: 0,
    points: 0,
    streak: 0,
    lastScanDate: null,
    achievements: [],
    topScore: 0
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const readerRef = useRef(null);

  // Initialize barcode reader
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
  }, []);

  // Start camera scanning
  useEffect(() => {
    if (screen !== "scanner" || !videoActive) return;

    const startScanning = async () => {
      try {
        const deviceId = await readerRef.current.getVideoInputDevices().then(devices =>
          devices[0]?.deviceId
        );

        readerRef.current.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (result) {
            fetchProduct(result.getText());
            setVideoActive(false);
          }
        });
      } catch (err) {
        setError("Camera access denied");
      }
    };

    startScanning();

    return () => {
      readerRef.current?.reset();
    };
  }, [screen, videoActive]);

  const fetchProduct = async (barcode) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1) {
        const score = calculateFoodScore(data.product);
        const productData = { ...data.product, calculatedScore: score, scannedAt: new Date() };

        setCurrentProduct(productData);
        setProducts([productData, ...products]);

        // Update gamification
        updateGameification(score);
        setScreen("result");
      } else {
        setError("Product not found");
      }
    } catch (err) {
      setError("Error fetching product");
    } finally {
      setLoading(false);
    }
  };

  const updateGameification = (score) => {
    setStats(prev => {
      const today = new Date().toDateString();
      const newStreak = prev.lastScanDate === today ? prev.streak : prev.streak + 1;
      const points = prev.points + (score >= 60 ? 15 : 5);
      const achievements = [...prev.achievements];

      // Check achievements
      if (prev.totalScans === 0) achievements.push("firstScan");
      if (prev.totalScans + 1 === 10) achievements.push("collectorX10");
      if (score >= 80 && !achievements.includes("healthyStreak")) achievements.push("healthyStreak");
      if (newStreak >= 7 && !achievements.includes("sevenDayStreak")) achievements.push("sevenDayStreak");

      return {
        totalScans: prev.totalScans + 1,
        points,
        streak: newStreak,
        lastScanDate: today,
        achievements: [...new Set(achievements)],
        topScore: Math.max(prev.topScore, score)
      };
    });
  };

  const toggleFavorite = (product) => {
    const isFav = favorites.some(f => f.code === product.code);
    if (isFav) {
      setFavorites(favorites.filter(f => f.code !== product.code));
    } else {
      setFavorites([...favorites, product]);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all scan history?")) {
      setProducts([]);
    }
  };

  // Home Screen
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-emerald-600">Pinch</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setScreen("settings")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg mb-6 transform hover:scale-105 transition-transform">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{stats.points}</div>
                <div className="text-sm opacity-90">Points</div>
              </div>
              <div>
                <div className="text-3xl font-bold flex items-center justify-center gap-1">
                  {stats.streak}
                  <Flame className="w-6 h-6 text-orange-300" />
                </div>
                <div className="text-sm opacity-90">Streak</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{stats.totalScans}</div>
                <div className="text-sm opacity-90">Scans</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {stats.achievements.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-sm font-bold text-yellow-900 mb-3">🎉 Achievements</p>
              <div className="flex flex-wrap gap-2">
                {stats.achievements.map(ach => {
                  const achievement = ACHIEVEMENTS[ach];
                  return (
                    <div key={ach} className="bg-white px-3 py-1 rounded-full text-sm font-semibold border border-yellow-300">
                      {achievement.icon} {achievement.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Actions */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => {
                setVideoActive(true);
                setScreen("scanner");
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              Scan Product
            </button>

            <button
              onClick={() => setScreen("search")}
              className="w-full bg-white border-2 border-emerald-600 text-emerald-600 py-4 rounded-xl font-bold hover:bg-emerald-50 active:scale-95 transition-all"
            >
              Manual Search
            </button>
          </div>

          {/* Recent Scans */}
          {products.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-lg">Recent Scans</h2>
                <button onClick={() => setScreen("history")} className="text-emerald-600 text-sm font-semibold">
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {products.slice(0, 3).map((product, idx) => {
                  const score = product.calculatedScore;
                  const scoreInfo = getScoreColor(score);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentProduct(product);
                        setScreen("result");
                      }}
                      className="w-full bg-white p-3 rounded-lg flex items-center justify-between hover:shadow-md transition-all"
                    >
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm line-clamp-1">{product.product_name}</p>
                        <p className="text-xs text-gray-500">{product.brands}</p>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-2xl font-bold" style={{ color: scoreInfo.color }}>
                          {scoreInfo.emoji}
                        </div>
                        <p className="text-xs font-semibold">{score}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScreen("favorites")}
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all"
            >
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="font-semibold text-sm">{favorites.length} Favorites</p>
            </button>
            <button
              onClick={() => setScreen("achievements")}
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all"
            >
              <Award className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="font-semibold text-sm">{stats.achievements.length} Badges</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scanner Screen
  if (screen === "scanner") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 relative bg-gray-900 overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-48 border-4 border-emerald-400 rounded-lg opacity-50 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-black p-4 border-t border-gray-800 space-y-3">
          <input
            type="text"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            placeholder="Or enter barcode..."
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                fetchProduct(searchBarcode);
                setSearchBarcode("");
              }
            }}
          />

          <button
            onClick={() => {
              setScreen("home");
              setVideoActive(false);
            }}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Result Screen
  if (screen === "result" && currentProduct) {
    const score = currentProduct.calculatedScore;
    const scoreInfo = getScoreColor(score);
    const isFav = favorites.some(f => f.code === currentProduct.code);

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-24">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setScreen("home")}
              className="flex items-center gap-2 text-emerald-600 font-semibold hover:bg-gray-100 px-2 py-1 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {/* Score Card */}
          <div
            className="rounded-3xl p-8 text-center mb-6 shadow-lg transform hover:scale-105 transition-transform"
            style={{ backgroundColor: scoreInfo.color + "20", borderColor: scoreInfo.color, borderWidth: "3px" }}
          >
            <div className="text-6xl mb-4">{scoreInfo.emoji}</div>
            <div className="text-5xl font-bold mb-2" style={{ color: scoreInfo.color }}>
              {score}
            </div>
            <div className="text-xl font-bold" style={{ color: scoreInfo.color }}>
              {scoreInfo.label}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-lg font-bold">{currentProduct.product_name}</h2>
            <p className="text-sm text-gray-600">{currentProduct.brands}</p>
          </div>

          {/* Nutrition */}
          {currentProduct.nutriments && (
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <h3 className="font-bold mb-3">Nutrition (per 100g)</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-emerald-50 p-2 rounded">
                  <p className="text-gray-600">Energy</p>
                  <p className="font-bold text-emerald-700">{currentProduct.nutriments["energy-kcal_100g"]} kcal</p>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <p className="text-gray-600">Sugar</p>
                  <p className="font-bold text-red-700">{currentProduct.nutriments.sugars_100g}g</p>
                </div>
                <div className="bg-amber-50 p-2 rounded">
                  <p className="text-gray-600">Fat</p>
                  <p className="font-bold text-amber-700">{currentProduct.nutriments["saturated-fat_100g"]}g</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-gray-600">Protein</p>
                  <p className="font-bold text-blue-700">{currentProduct.nutriments.proteins_100g}g</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => toggleFavorite(currentProduct)}
              className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                isFav
                  ? "bg-red-100 text-red-700"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
              {isFav ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => setScreen("home")}
              className="flex-1 py-3 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
            >
              Next Scan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Favorites Screen
  if (screen === "favorites") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setScreen("home")}
              className="flex items-center gap-2 text-emerald-600 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-lg font-bold">Favorites</h1>
            <div></div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No favorites yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((product, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentProduct(product);
                    setScreen("result");
                  }}
                  className="w-full bg-white p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-all"
                >
                  <div className="text-left flex-1">
                    <p className="font-semibold">{product.product_name}</p>
                    <p className="text-sm text-gray-500">{product.brands}</p>
                  </div>
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Achievements Screen
  if (screen === "achievements") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setScreen("home")}
              className="flex items-center gap-2 text-emerald-600 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-lg font-bold">Achievements</h1>
            <div></div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
              const isUnlocked = stats.achievements.includes(key);
              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl text-center border-2 transition-all ${
                    isUnlocked
                      ? "bg-yellow-50 border-yellow-400 shadow-lg"
                      : "bg-gray-100 border-gray-300 opacity-50"
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <p className="font-bold text-sm">{achievement.name}</p>
                  <p className="text-xs text-gray-600 mt-1">+{achievement.points} pts</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // History Screen
  if (screen === "history") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setScreen("home")}
              className="flex items-center gap-2 text-emerald-600 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-lg font-bold">History</h1>
            <button
              onClick={clearHistory}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No scan history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product, idx) => {
                const score = product.calculatedScore;
                const scoreInfo = getScoreColor(score);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentProduct(product);
                      setScreen("result");
                    }}
                    className="w-full bg-white p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-all"
                  >
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">{product.product_name}</p>
                      <p className="text-xs text-gray-500">{product.brands}</p>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: scoreInfo.color }}>
                      {scoreInfo.emoji}
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

  // Search Screen
  if (screen === "search") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setScreen("home")}
              className="text-emerald-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  fetchProduct(searchBarcode);
                  setSearchBarcode("");
                }
              }}
              placeholder="Enter barcode..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <button
            onClick={() => {
              if (searchBarcode) {
                fetchProduct(searchBarcode);
                setSearchBarcode("");
              }
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold mb-6"
          >
            Search
          </button>

          {loading && <p className="text-center text-gray-600">Loading...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  // Settings Screen
  if (screen === "settings") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setScreen("home")}
              className="flex items-center gap-2 text-emerald-600 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-lg font-bold">Settings</h1>
            <div></div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold mb-4">About Pinch</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pinch is an independent product transparency scanner. Scan barcodes to understand ingredients, nutrition, and allergens.
            </p>
            <p className="text-xs text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
