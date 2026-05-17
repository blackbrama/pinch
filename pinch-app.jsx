import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Heart, ArrowLeft, AlertCircle, CheckCircle, TrendingUp, Leaf, Settings, Bell, Scale, Share2, Download, Filter, X, Lock, Zap } from 'lucide-react';

// Comprehensive additive database
const ADDITIVE_DATABASE = {
  'e102': { name: 'Tartrazine', risk: 'high', concerns: ['allergen', 'hyperactivity'] },
  'e110': { name: 'Sunset Yellow', risk: 'high', concerns: ['allergen', 'hyperactivity'] },
  'e129': { name: 'Allura Red', risk: 'high', concerns: ['allergen', 'hyperactivity'] },
  'e621': { name: 'Monosodium Glutamate (MSG)', risk: 'moderate', concerns: ['sensitivity'] },
  'e627': { name: 'Disodium guanylate', risk: 'moderate', concerns: ['sensitivity'] },
  'e631': { name: 'Disodium inosinate', risk: 'moderate', concerns: ['sensitivity'] },
  'e635': { name: 'Disodium 5-ribonucleotide', risk: 'moderate', concerns: ['sensitivity'] },
  'e250': { name: 'Sodium nitrite', risk: 'moderate', concerns: ['cancer_concern'] },
  'e251': { name: 'Sodium nitrate', risk: 'moderate', concerns: ['cancer_concern'] },
  'e320': { name: 'BHA', risk: 'high', concerns: ['carcinogenic'] },
  'e321': { name: 'BHT', risk: 'high', concerns: ['carcinogenic'] },
};

const Pinch = () => {
  const [screen, setScreen] = useState('home');
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchBarcode, setSearchBarcode] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    allergens: ['gluten', 'peanuts', 'milk'],
    dietary: ['vegetarian'],
    avoidIngredients: ['palm oil'],
    isPremium: false,
  });
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Enhanced food scoring
  const calculateFoodScore = (product) => {
    let score = 100;
    let details = {
      nutrition: 0,
      additives: 0,
      organic: 0,
      reasons: [],
      warnings: [],
      positives: [],
    };

    // NUTRITION SCORING (60% = 60 points)
    if (product.nutriments) {
      let nutritionScore = 60;
      const energy = product.nutriments.energy_100g || 0;
      const sugars = product.nutriments.sugars_100g || 0;
      const saturated_fat = product.nutriments.saturated_fat_100g || 0;
      const sodium = product.nutriments.sodium_100g || 0;
      const fiber = product.nutriments.fiber_100g || 0;
      const protein = product.nutriments.protein_100g || 0;

      if (energy > 350) { nutritionScore -= 8; details.warnings.push('Very high calories'); }
      else if (energy > 250) { nutritionScore -= 5; }

      if (sugars > 20) { nutritionScore -= 12; details.warnings.push('Very high sugar'); }
      else if (sugars > 12) { nutritionScore -= 8; details.warnings.push('High sugar'); }
      else if (sugars <= 3) { details.positives.push('Low sugar'); }

      if (saturated_fat > 6) { nutritionScore -= 8; details.warnings.push('Very high saturated fat'); }
      else if (saturated_fat > 3) { nutritionScore -= 5; }

      if (sodium > 600) { nutritionScore -= 10; details.warnings.push('Very high sodium'); }
      else if (sodium > 400) { nutritionScore -= 6; }

      if (fiber > 5) { nutritionScore += 8; details.positives.push('Excellent fiber'); }
      else if (fiber > 3) { nutritionScore += 5; details.positives.push('Good fiber'); }

      if (protein > 8) { nutritionScore += 8; details.positives.push('Excellent protein'); }
      else if (protein > 5) { nutritionScore += 5; }

      nutritionScore = Math.max(0, Math.min(60, nutritionScore));
      details.nutrition = Math.round(nutritionScore);
    }

    // ADDITIVES SCORING (30% = 30 points)
    let additivesScore = 30;
    if (product.additives_tags?.length > 0) {
      const highRiskFound = product.additives_tags.some(tag => {
        const additive = ADDITIVE_DATABASE[tag];
        return additive?.risk === 'high';
      });

      if (highRiskFound) {
        additivesScore = 0;
        details.warnings.push('Contains high-risk additives');
        score = Math.min(score, 49);
      } else if (product.additives_tags.length > 5) {
        additivesScore -= 10;
        details.warnings.push('Multiple additives');
      } else {
        additivesScore -= 5;
      }
    } else {
      details.positives.push('No artificial additives');
    }
    additivesScore = Math.max(0, additivesScore);
    details.additives = additivesScore;

    // ORGANIC BONUS (10% = 10 points)
    let organicScore = 0;
    if (product.labels && (product.labels.includes('en:organic') || product.labels.includes('Organic'))) {
      organicScore = 10;
      details.positives.push('Certified organic');
    }
    details.organic = organicScore;

    score = Math.max(0, Math.min(100, details.nutrition + details.additives + details.organic));
    return { score: Math.round(score), details };
  };

  const calculateCosmeticScore = (product) => {
    let score = 100;
    let details = {
      warnings: [],
      positives: [],
    };

    const ingredients = product.ingredients || [];
    let highRiskCount = 0;

    ingredients.forEach(ing => {
      const name = ing.text?.toLowerCase() || '';
      if (name.includes('paraben') || name.includes('phthalate') || name.includes('triclosan')) {
        highRiskCount++;
      }
    });

    if (highRiskCount > 0) {
      score = Math.min(score, 25);
      details.warnings.push('Contains high-risk ingredients');
    }

    if (product.ecoscore_grade && ['a', 'b'].includes(product.ecoscore_grade)) {
      score += 10;
      details.positives.push('Good eco-score');
    }

    score = Math.max(0, Math.min(100, score));
    return { score: Math.round(score), details };
  };

  const checkUserAlerts = (product) => {
    const alerts = [];
    const ingredientText = (product.ingredients_text || '').toLowerCase();

    userPreferences.allergens.forEach(allergen => {
      if (ingredientText.includes(allergen.toLowerCase())) {
        alerts.push({ type: 'allergen', message: `Contains ${allergen}`, severity: 'high' });
      }
    });

    userPreferences.avoidIngredients.forEach(ingredient => {
      if (ingredientText.includes(ingredient.toLowerCase())) {
        alerts.push({ type: 'ingredient', message: `Contains ${ingredient}`, severity: 'medium' });
      }
    });

    return alerts;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent', bg: 'bg-emerald-50' };
    if (score >= 60) return { color: '#84cc16', label: 'Good', bg: 'bg-lime-50' };
    if (score >= 40) return { color: '#f59e0b', label: 'Average', bg: 'bg-amber-50' };
    if (score >= 20) return { color: '#ef4444', label: 'Poor', bg: 'bg-red-50' };
    return { color: '#7c2d12', label: 'Very Poor', bg: 'bg-red-100' };
  };

  const fetchProduct = async (barcode) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      
      if (!response.ok) throw new Error('Product not found');
      
      const data = await response.json();
      if (!data?.product) throw new Error('Product not found');

      const product = data.product;
      
      let scoring = { score: 0, details: {} };
      if (product.product_type === 'beauty') {
        scoring = calculateCosmeticScore(product);
      } else {
        scoring = calculateFoodScore(product);
      }

      const userAlerts = checkUserAlerts(product);

      const productWithScore = {
        ...product,
        barcode,
        score: scoring.score,
        details: scoring.details,
        userAlerts,
        scannedAt: new Date().toLocaleDateString(),
      };

      setCurrentProduct(productWithScore);
      setProducts([productWithScore, ...products.filter(p => p.barcode !== barcode)]);
      setScreen('result');
    } catch (err) {
      setError('Product not found. Check barcode and try again.');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      setError('Camera access denied. Use manual search instead.');
    }
  };

  useEffect(() => {
    if (screen === 'scanner' && !cameraActive) {
      startCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [screen, cameraActive]);

  const toggleFavorite = (product) => {
    const isFav = favorites.some(f => f.barcode === product.barcode);
    if (isFav) {
      setFavorites(favorites.filter(f => f.barcode !== product.barcode));
    } else {
      setFavorites([...favorites, product]);
    }
  };

  const isFavorited = currentProduct && favorites.some(f => f.barcode === currentProduct.barcode);

  // ============ HOME ============
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg text-white text-4xl font-bold">
                P
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Pinch</h1>
            <p className="text-gray-600 text-lg">Understand what you're buying</p>
          </div>

          <div className="space-y-3 mb-8">
            <button
              onClick={() => setScreen('scanner')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition transform hover:scale-105"
            >
              <Camera className="w-6 h-6" />
              Scan Barcode
            </button>

            <button
              onClick={() => setScreen('search')}
              className="w-full bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
            >
              <Search className="w-6 h-6" />
              Manual Search
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScreen('settings')}
                className="bg-white border-2 border-blue-300 text-blue-600 py-3 rounded-xl font-semibold flex flex-col items-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Alerts
              </button>
              <button
                onClick={() => setScreen('comparison')}
                className="bg-white border-2 border-purple-300 text-purple-600 py-3 rounded-xl font-semibold flex flex-col items-center gap-2"
              >
                <Scale className="w-5 h-5" />
                Compare
              </button>
            </div>
          </div>

          {products.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Recently Scanned</h2>
              <div className="space-y-3">
                {products.slice(0, 3).map((p, i) => {
                  const scoreInfo = getScoreColor(p.score);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentProduct(p);
                        setScreen('result');
                      }}
                      className="w-full bg-white p-4 rounded-xl shadow flex items-center gap-3"
                    >
                      {p.image_url && (
                        <img src={p.image_url} alt={p.product_name} className="w-14 h-14 object-cover rounded" />
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 line-clamp-1">{p.product_name}</p>
                        <p className="text-sm text-gray-500">{p.brands}</p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                        style={{ backgroundColor: scoreInfo.color }}
                      >
                        {p.score}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setScreen('history')}
              className="bg-white p-4 rounded-xl shadow text-center"
            >
              <p className="text-2xl mb-1">📋</p>
              <p className="text-xs font-bold text-gray-700">{products.length} Scans</p>
            </button>
            <button
              onClick={() => setScreen('favorites')}
              className="bg-white p-4 rounded-xl shadow text-center"
            >
              <p className="text-2xl mb-1">❤️</p>
              <p className="text-xs font-bold text-gray-700">{favorites.length} Fav</p>
            </button>
            <button
              onClick={() => setScreen('settings')}
              className="bg-white p-4 rounded-xl shadow text-center"
            >
              <p className="text-2xl mb-1">⚙️</p>
              <p className="text-xs font-bold text-gray-700">Settings</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ SCANNER ============
  if (screen === 'scanner') {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 relative bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-48 border-3 border-emerald-400 rounded-lg opacity-60"></div>
            <div className="absolute bottom-8 text-white text-center">
              <p className="font-semibold">Point at barcode</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 border-t border-gray-800 space-y-3">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (searchBarcode.trim()) {
              fetchProduct(searchBarcode);
            }
          }}>
            <input
              type="text"
              placeholder="Or enter barcode..."
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            />
          </form>
          
          <button
            onClick={() => setScreen('home')}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ============ SEARCH ============
  if (screen === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setScreen('home')}
            className="mb-6 flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Product</h1>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (searchBarcode.trim()) {
              fetchProduct(searchBarcode);
              setSearchBarcode('');
            }
          }} className="mb-6">
            <input
              type="text"
              placeholder="Enter barcode..."
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:border-emerald-600 focus:outline-none text-lg mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ RESULT ============
  if (screen === 'result' && currentProduct) {
    const scoreInfo = getScoreColor(currentProduct.score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setScreen('home')}
            className="mb-6 flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentProduct.image_url && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={currentProduct.image_url} 
                alt={currentProduct.product_name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">{currentProduct.brands}</p>
            <h1 className="text-2xl font-bold text-gray-900">{currentProduct.product_name}</h1>
          </div>

          {currentProduct.userAlerts && currentProduct.userAlerts.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
              <p className="font-bold text-red-700 mb-2">⚠️ Your Alerts</p>
              {currentProduct.userAlerts.map((alert, i) => (
                <p key={i} className="text-sm text-red-700">• {alert.message}</p>
              ))}
            </div>
          )}

          <div className={`${scoreInfo.bg} border-3 rounded-3xl p-8 mb-6 text-center shadow-lg`}>
            <p className="text-gray-600 font-semibold mb-2">Health Score</p>
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-5xl mx-auto mb-4 shadow-xl"
              style={{ backgroundColor: scoreInfo.color }}
            >
              {currentProduct.score}
            </div>
            <p className="text-2xl font-bold" style={{ color: scoreInfo.color }}>
              {scoreInfo.label}
            </p>
          </div>

          {currentProduct.details?.warnings && currentProduct.details.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-amber-900 mb-2">⚠️ Concerns</h3>
              {currentProduct.details.warnings.map((w, i) => (
                <p key={i} className="text-sm text-amber-800">• {w}</p>
              ))}
            </div>
          )}

          {currentProduct.details?.positives && currentProduct.details.positives.length > 0 && (
            <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-green-900 mb-2">✓ Positives</h3>
              {currentProduct.details.positives.map((p, i) => (
                <p key={i} className="text-sm text-green-800">• {p}</p>
              ))}
            </div>
          )}

          <div className="space-y-3 fixed bottom-4 left-4 right-4 max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleFavorite(currentProduct)}
                className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  isFavorited
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={() => setScreen('details')}
                className="bg-emerald-600 text-white py-3 rounded-xl font-bold"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ DETAILS ============
  if (screen === 'details' && currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setScreen('result')}
            className="mb-6 flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Full Details</h1>

          {currentProduct.nutriments && (
            <div className="bg-white rounded-xl p-5 mb-4 shadow">
              <h3 className="font-bold text-gray-900 mb-4">Nutrition per 100g</h3>
              <div className="grid grid-cols-2 gap-4">
                {currentProduct.nutriments.energy_100g && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Energy</p>
                    <p className="font-bold text-orange-700">{Math.round(currentProduct.nutriments.energy_100g)} kcal</p>
                  </div>
                )}
                {currentProduct.nutriments.sugars_100g && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Sugar</p>
                    <p className="font-bold text-red-700">{currentProduct.nutriments.sugars_100g.toFixed(1)}g</p>
                  </div>
                )}
                {currentProduct.nutriments.saturated_fat_100g && (
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Sat. Fat</p>
                    <p className="font-bold text-amber-700">{currentProduct.nutriments.saturated_fat_100g.toFixed(1)}g</p>
                  </div>
                )}
                {currentProduct.nutriments.protein_100g && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Protein</p>
                    <p className="font-bold text-green-700">{currentProduct.nutriments.protein_100g.toFixed(1)}g</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentProduct.additives_tags && currentProduct.additives_tags.length > 0 && (
            <div className="bg-white rounded-xl p-5 mb-4 shadow">
              <h3 className="font-bold text-gray-900 mb-3">Additives</h3>
              <div className="space-y-2">
                {currentProduct.additives_tags.map((tag, i) => (
                  <div key={i} className="bg-amber-50 p-3 rounded-lg text-sm">
                    {tag.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentProduct.ingredients && currentProduct.ingredients.length > 0 && (
            <div className="bg-white rounded-xl p-5 mb-4 shadow">
              <h3 className="font-bold text-gray-900 mb-3">Ingredients</h3>
              <p className="text-sm text-gray-700">
                {currentProduct.ingredients.map(i => i.text).join(', ')}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <p className="text-xs text-blue-700"><strong>Disclaimer:</strong> For informational use only. Not a substitute for medical advice.</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ SETTINGS ============
  if (screen === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setScreen('home')}
            className="mb-6 flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings & Alerts</h1>

          <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Go Premium</h3>
                <p className="text-sm">Offline mode • Export data • Family profiles</p>
              </div>
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 mb-4 shadow">
            <h3 className="font-bold text-gray-900 mb-3">Your Allergens</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {userPreferences.allergens.map(allergen => (
                <div key={allergen} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {allergen} ×
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 mb-4 shadow">
            <h3 className="font-bold text-gray-900 mb-3">Dietary Preferences</h3>
            <div className="space-y-2">
              {['vegetarian', 'vegan', 'kosher'].map(diet => (
                <label key={diet} className="flex items-center gap-3 p-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" defaultChecked={userPreferences.dietary.includes(diet)} />
                  <span className="text-gray-700 font-semibold capitalize">{diet}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <h3 className="font-bold text-gray-900 mb-3">Ingredients to Avoid</h3>
            <div className="space-y-2">
              {['palm oil', 'artificial sweeteners', 'GMO'].map(ing => (
                <label key={ing} className="flex items-center gap-3 p-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" defaultChecked={userPreferences.avoidIngredients.includes(ing)} />
                  <span className="text-gray-700 font-semibold capitalize">{ing}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ HISTORY ============
  if (screen === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setScreen('home')}
            className="mb-6 flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Scan History</h1>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No scans yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p, i) => {
                const scoreInfo = getScoreColor(p.score);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentProduct(p);
                      setScreen('result');
                    }}
                    className="w-full bg-white p-4 rounded-xl shadow flex items-center gap-3"
                  >
                    {p.image_url && (
                      <img src={p.image_url} alt={p.product_name} className="w-14 h-14 object-cover rounded" />
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 line-clamp-1">{p.product_name}</p>
                      <p className="text-xs text-gray-500">{p.scannedAt}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: scoreInfo.color }}
                    >
                      {p.score}
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

  // ============ FAVORITES ============
  if (screen === 'favorites') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setScreen('home')}
            className="mb-6 flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Favorites</h1>

          {favorites.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No favorites yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((p, i) => {
                const scoreInfo = getScoreColor(p.score);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentProduct(p);
                      setScreen('result');
                    }}
                    className="w-full bg-white p-4 rounded-xl shadow flex items-center gap-3"
                  >
                    {p.image_url && (
                      <img src={p.image_url} alt={p.product_name} className="w-14 h-14 object-cover rounded" />
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 line-clamp-1">{p.product_name}</p>
                      <p className="text-sm text-gray-500">{p.brands}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: scoreInfo.color }}
                    >
                      {p.score}
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

  // ============ COMPARISON ============
  if (screen === 'comparison') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setScreen('home')}
            className="mb-6 flex items-center gap-2 text-emerald-600 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Products</h1>
          <p className="text-gray-600 mb-6">Select up to 3 products</p>

          {comparisonProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No products selected</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {comparisonProducts.map((p, i) => {
                const scoreInfo = getScoreColor(p.score);
                return (
                  <div key={i} className="bg-white rounded-xl p-4 shadow">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.product_name} className="w-full h-24 object-cover rounded mb-3" />
                    )}
                    <p className="text-xs text-gray-500 mb-2">{p.brands}</p>
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2 mb-3">{p.product_name}</p>
                    <div
                      className="w-full h-12 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: scoreInfo.color }}
                    >
                      {p.score}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Pinch;
