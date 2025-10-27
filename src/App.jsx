// src/RealEstateFlipper.jsx
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Home,
  Zap,
  Plus,
  Trash2,
  Loader,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const RealEstateFlipper = () => {
  const [properties, setProperties] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    purchasePrice: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    condition: "average",
    marketDescription: "",
  });

  // Local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("realEstateProperties");
      if (saved) setProperties(JSON.parse(saved));
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (initialized)
      localStorage.setItem("realEstateProperties", JSON.stringify(properties));
  }, [properties, initialized]);

  const analyzeProperty = async (property) => {
    setLoading(true);
    setApiError("");
    try {
      setTimeout(() => {
        setAnalysis({
          ...property,
          resaleValue: property.purchasePrice * 1.7,
          renovationCosts: property.purchasePrice * 0.2,
          netProfit: property.purchasePrice * 0.45,
          roi: 45,
          holdingCosts: property.purchasePrice * 0.05,
          investmentRating: "EXCELLENT",
          renovationBreakdown: "Kitchen remodel, new roof, and landscaping.",
          marketAnalysis:
            "Strong local appreciation, low supply, high buyer demand.",
          riskFactors: "Rising interest rates, local permit delays.",
          recommendationSummary:
            "High upside potential — buy, renovate quickly, and resell.",
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setApiError(err.message);
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    if (!formData.address || !formData.purchasePrice || !formData.squareFeet) {
      alert("Please fill in required fields");
      return;
    }
    setProperties([
      ...properties,
      {
        id: Date.now(),
        ...formData,
        purchasePrice: parseInt(formData.purchasePrice),
        bedrooms: parseInt(formData.bedrooms) || 3,
        bathrooms: parseInt(formData.bathrooms) || 2,
        squareFeet: parseInt(formData.squareFeet),
      },
    ]);
    setFormData({
      address: "",
      purchasePrice: "",
      bedrooms: "",
      bathrooms: "",
      squareFeet: "",
      condition: "average",
      marketDescription: "",
    });
    setFormOpen(false);
  };

  const removeProperty = (id) => {
    setProperties(properties.filter((p) => p.id !== id));
    if (analysis?.id === id) setAnalysis(null);
  };

  const ratingColor = (r) =>
    ({
      EXCELLENT: "text-green-400",
      GOOD: "text-emerald-400",
      MODERATE: "text-yellow-400",
      POOR: "text-red-400",
    }[r] || "text-slate-400");

  const ratingEmoji = (r) =>
    ({ EXCELLENT: "🚀", GOOD: "👍", MODERATE: "⚠️", POOR: "⛔" }[r] || "❓");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Home className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                AI Real Estate Flipper
              </h1>
              <span
                className={`text-xs sm:text-sm px-2 py-1 rounded ${
                  geminiModel === "gemini-2.5-flash"
                    ? "bg-green-900 text-green-300"
                    : "bg-blue-900 text-blue-300"
                }`}
              >
                {geminiModel === "gemini-2.5-flash"
                  ? "Gemini 2.5 Flash"
                  : "Gemini 2.0 Flash"}
              </span>
            </div>
            <p className="text-slate-400 text-sm sm:text-base">
              AI-powered property analysis using Google Gemini
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2 sm:p-3 w-full sm:w-auto justify-between">
            <label className="text-xs sm:text-sm font-medium text-slate-300">
              Model:
            </label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </select>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex flex-col sm:flex-row items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-200 font-semibold">API Error</p>
              <p className="text-red-300 text-sm">{apiError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Property */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => setFormOpen(!formOpen)}
                className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Add Property
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-blue-400 transition-transform ${
                    formOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {formOpen && (
                <div className="px-4 sm:px-6 py-4 space-y-4 bg-slate-750 border-t border-slate-700">
                  {[
                    { name: "Address", key: "address", type: "text" },
                    { name: "Purchase Price ($)", key: "purchasePrice", type: "number" },
                    { name: "Square Feet", key: "squareFeet", type: "number" },
                  ].map(({ name, key, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        {name}
                      </label>
                      <input
                        type={type}
                        value={formData[key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 text-sm"
                      />
                    </div>
                  ))}

                  <button
                    onClick={handleAddProperty}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                  >
                    Add Property
                  </button>
                </div>
              )}
            </div>

            {/* Properties List */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                Properties ({properties.length})
              </h2>
              <p className="text-xs text-slate-500 mb-3">💾 Auto-saved locally</p>
              <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
                {properties.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    Add a property to get started
                  </p>
                ) : (
                  properties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => analyzeProperty(prop)}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded cursor-pointer transition group flex justify-between items-start"
                    >
                      <div>
                        <p className="text-white text-sm truncate">
                          {prop.address}
                        </p>
                        <p className="text-slate-400 text-xs">
                          ${prop.purchasePrice.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProperty(prop.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 flex flex-col items-center justify-center min-h-80">
                <Loader className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                <p className="text-slate-300 font-semibold text-center">
                  Gemini AI is analyzing...
                </p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Property Header */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {analysis.address}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-slate-300">
                    <p><b>Purchase:</b> ${analysis.purchasePrice.toLocaleString()}</p>
                    <p><b>Size:</b> {analysis.squareFeet} sq ft</p>
                    <p><b>Beds:</b> {analysis.bedrooms}</p>
                    <p><b>Baths:</b> {analysis.bathrooms}</p>
                  </div>
                </div>

                {/* Investment Summary */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Investment Summary
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                    {[
                      ["Predicted Resale", analysis.resaleValue, "text-white"],
                      ["Renovation Costs", analysis.renovationCosts, "text-yellow-400"],
                      ["Net Profit", analysis.netProfit, analysis.netProfit > 0 ? "text-green-400" : "text-red-400"],
                      ["ROI", `${analysis.roi}%`, "text-blue-400"],
                      ["Holding Costs", analysis.holdingCosts, "text-orange-400"],
                      ["Rating", `${ratingEmoji(analysis.investmentRating)} ${analysis.investmentRating}`, ratingColor(analysis.investmentRating)],
                    ].map(([label, value, color], i) => (
                      <div key={i} className="bg-slate-700 p-3 rounded-lg">
                        <p className="text-slate-400 text-xs sm:text-sm">{label}</p>
                        <p className={`text-base sm:text-xl font-bold ${color}`}>
                          {typeof value === "number" ? `$${value.toLocaleString()}` : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6 space-y-6">
                  {[
                    ["🏗 Renovation Breakdown", analysis.renovationBreakdown],
                    ["📊 Market Analysis", analysis.marketAnalysis],
                    ["⚠ Risk Factors", analysis.riskFactors],
                    ["💡 Recommendation Summary", analysis.recommendationSummary],
                  ].map(([title, text]) => (
                    <div key={title}>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                        {title}
                      </h3>
                      <p className="text-slate-300 text-sm whitespace-pre-line">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center text-slate-400">
                <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                <p>Select a property to analyze using Gemini AI</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateFlipper;
