
import React, { useState, useEffect } from 'react';
import { ScanResult, FoodProduct } from '../types';
import { analyzeContent } from '../services/geminiService';
import { fetchProductData } from '../services/foodService';
import { 
  Copy, 
  ExternalLink, 
  Share2, 
  X, 
  BrainCircuit,
  Loader2,
  Heart,
  ShoppingCart,
  Apple,
  AlertTriangle,
  Globe
} from 'lucide-react';

interface ResultSheetProps {
  result: ScanResult | null;
  onClose: () => void;
  showAi: boolean;
  onToggleFavorite?: (result: ScanResult) => void;
}

const ResultSheet: React.FC<ResultSheetProps> = ({ result, onClose, showAi, onToggleFavorite }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState<FoodProduct | null>(null);
  const [loadingFood, setLoadingFood] = useState(false);

  useEffect(() => {
    if (result) {
      if (result.type === 'barcode') {
        loadFoodData(result.data);
      }
      if (showAi) {
        handleAnalyze();
      }
    } else {
      setAnalysis(null);
      setFoodData(null);
    }
  }, [result, showAi]);

  const loadFoodData = async (barcode: string) => {
    setLoadingFood(true);
    const data = await fetchProductData(barcode);
    setFoodData(data);
    setLoadingFood(false);
  };

  const handleAnalyze = async () => {
    if (!result) return;
    setAnalyzing(true);
    const text = await analyzeContent(result.data);
    setAnalysis(text);
    setAnalyzing(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.data);
    alert('Copied to clipboard!');
  };

  if (!result) return null;

  const renderNutriScore = (grade?: string) => {
    if (!grade) return null;
    const g = grade.toLowerCase();
    return (
      <div className="flex items-center space-x-1 mt-2">
        {['a', 'b', 'c', 'd', 'e'].map((step) => (
          <div 
            key={step}
            className={`w-6 h-8 flex items-center justify-center font-bold text-white rounded-sm text-xs ${
              g === step ? `nutri-score-${step} scale-125 z-10 shadow-lg` : 'bg-zinc-800 opacity-30'
            }`}
          >
            {step.toUpperCase()}
          </div>
        ))}
        <span className="ml-2 text-xs text-zinc-400 font-medium">Nutri-Score</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-zinc-900 rounded-t-3xl border-t border-white/10 p-6 pointer-events-auto shadow-2xl animate-[slideUp_0.3s_ease-out] overflow-y-auto max-h-[90vh] no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
              result.type === 'barcode' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {result.type}
            </span>
            <h3 className="text-lg font-semibold">Scan Result</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onToggleFavorite?.(result)}
              className={`p-2 rounded-full transition-colors ${result.isFavorite ? 'text-red-500' : 'text-zinc-400'}`}
            >
              <Heart size={20} fill={result.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {loadingFood ? (
          <div className="flex flex-col items-center py-12 space-y-4">
            <Loader2 className="animate-spin text-green-400" size={32} />
            <p className="text-zinc-400 text-sm">Searching OpenFoodFacts...</p>
          </div>
        ) : foodData ? (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex space-x-4">
              {foodData.image_url ? (
                <img src={foodData.image_url} alt={foodData.product_name} className="w-24 h-24 object-contain bg-white rounded-xl" />
              ) : (
                <div className="w-24 h-24 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                  <Apple size={32} />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-zinc-100">{foodData.product_name || 'Unknown Product'}</h2>
                <p className="text-zinc-400 text-sm">{foodData.brands || 'Unknown Brand'}</p>
                <p className="text-zinc-500 text-xs mt-1">{foodData.quantity}</p>
                {renderNutriScore(foodData.nutriscore_grade)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-800/50 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Eco-Score</p>
                <p className="text-lg font-bold uppercase text-zinc-200">
                  {foodData.ecoscore_grade?.toUpperCase() || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Barcode</p>
                <p className="text-sm font-mono text-zinc-200">{result.data}</p>
              </div>
            </div>

            {foodData.nutriments && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Nutrition (per 100g)</h4>
                <div className="bg-zinc-950/50 rounded-2xl overflow-hidden border border-white/5">
                  <NutritionRow label="Energy" value={`${foodData.nutriments.energy_100g || 0} kJ`} />
                  <NutritionRow label="Fat" value={`${foodData.nutriments.fat_100g || 0}g`} />
                  <NutritionRow label="Sugar" value={`${foodData.nutriments.sugars_100g || 0}g`} />
                  <NutritionRow label="Salt" value={`${foodData.nutriments.salt_100g || 0}g`} />
                </div>
              </div>
            )}

            {foodData.allergens && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3">
                <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-red-400">Allergens detected</p>
                  <p className="text-xs text-zinc-300 mt-1">{foodData.allergens}</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-zinc-800/50 rounded-2xl flex items-center space-x-3">
              <Globe className="text-zinc-500" size={18} />
              <div>
                <p className="text-xs text-zinc-500">Countries where sold</p>
                <p className="text-xs text-zinc-300 line-clamp-1">{foodData.countries || 'Unknown'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 mb-6 break-all">
             {result.type === 'barcode' && !loadingFood && (
                <div className="mb-4 text-center py-4 bg-zinc-900 rounded-xl">
                  <p className="text-zinc-400 text-sm">Product not found in OpenFoodFacts database.</p>
                </div>
             )}
             <p className="text-sm mono text-zinc-300 select-all">{result.data}</p>
          </div>
        )}

        {/* AI Insight Section */}
        {showAi && (
          <div className="my-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <div className="flex items-center space-x-2 mb-2 text-indigo-400">
              <BrainCircuit size={18} />
              <span className="text-sm font-semibold">AI Insight</span>
            </div>
            {analyzing ? (
              <div className="flex items-center space-x-2 py-2">
                <Loader2 className="animate-spin text-indigo-400" size={16} />
                <span className="text-sm text-zinc-400">AI is thinking...</span>
              </div>
            ) : (
              <p className="text-xs text-zinc-300 leading-relaxed">
                {analysis || "No analysis generated."}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-6">
          <button 
            onClick={copyToClipboard}
            className="flex flex-col items-center justify-center space-y-2 py-4 bg-zinc-800 rounded-2xl active:scale-95 transition-transform"
          >
            <Copy size={20} />
            <span className="text-xs">Copy</span>
          </button>
          
          <button 
            onClick={() => window.open(result.type === 'barcode' ? `https://world.openfoodfacts.org/product/${result.data}` : result.data)}
            className={`flex flex-col items-center justify-center space-y-2 py-4 rounded-2xl active:scale-95 transition-transform ${
              result.type === 'url' || result.type === 'barcode' ? 'bg-indigo-600' : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <ExternalLink size={20} />
            <span className="text-xs">Browse</span>
          </button>

          <button 
            onClick={() => navigator.share?.({ title: 'Scan result', text: result.data })}
            className="flex flex-col items-center justify-center space-y-2 py-4 bg-zinc-800 rounded-2xl active:scale-95 transition-transform"
          >
            <Share2 size={20} />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

const NutritionRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 last:border-0">
    <span className="text-zinc-400 text-xs">{label}</span>
    <span className="text-zinc-200 text-xs font-bold">{value}</span>
  </div>
);

export default ResultSheet;
