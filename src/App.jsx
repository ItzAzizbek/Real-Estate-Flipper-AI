import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Home,
  DollarSign,
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

  // ✅ Load from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("realEstateProperties");
      if (saved) setProperties(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setInitialized(true);
    }
  }, []);

  // ✅ Save only after load complete
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem("realEstateProperties", JSON.stringify(properties));
    } catch (error) {
      console.error("Error saving properties:", error);
    }
  }, [properties, initialized]);

  // ✅ Gemini API call
  const callGeminiAPI = async (propertyData) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setApiError(
        "Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file."
      );
      throw new Error("Missing VITE_GEMINI_API_KEY");
    }

    const prompt = `You are a professional real estate investment analyst. Analyze this property for flipping potential and provide ONLY valid JSON (no markdown, no code blocks, raw JSON only).

Property Details:
- Address: ${propertyData.address}
- Purchase Price: $${propertyData.purchasePrice.toLocaleString()}
- Size: ${propertyData.squareFeet.toLocaleString()} sq ft
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Current Condition: ${propertyData.condition}
- Market Context: ${
      propertyData.marketDescription || "Standard suburban market"
    }

Provide analysis in this exact JSON format:
{
  "predictedResaleValue": <number>,
  "estimatedRenovationCosts": <number>,
  "marketAnalysis": "<brief analysis>",
  "renovationBreakdown": "<what needs to be done>",
  "riskFactors": "<potential risks>",
  "investmentRating": "<EXCELLENT|GOOD|MODERATE|POOR>",
  "recommendationSummary": "<investment recommendation>"
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Gemini API error");
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text.trim();
      let cleanedText = responseText
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();

      const analysisData = JSON.parse(cleanedText);
      const totalInvestment =
        propertyData.purchasePrice + analysisData.estimatedRenovationCosts;
      const profit = analysisData.predictedResaleValue - totalInvestment;
      const roi = ((profit / totalInvestment) * 100).toFixed(2);
      const holdingCosts = Math.round(totalInvestment * 0.05);
      const netProfit = profit - holdingCosts;

      return {
        ...propertyData,
        resaleValue: analysisData.predictedResaleValue,
        renovationCosts: analysisData.estimatedRenovationCosts,
        marketAnalysis: analysisData.marketAnalysis,
        renovationBreakdown: analysisData.renovationBreakdown,
        riskFactors: analysisData.riskFactors,
        investmentRating: analysisData.investmentRating,
        recommendationSummary: analysisData.recommendationSummary,
        profit,
        roi,
        netProfit,
        holdingCosts,
        totalInvestment,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const analyzeProperty = async (property) => {
    setLoading(true);
    setApiError("");
    try {
      const result = await callGeminiAPI(property);
      setAnalysis(result);
    } catch (error) {
      setApiError(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    if (!formData.address || !formData.purchasePrice || !formData.squareFeet) {
      alert("Please fill in Address, Purchase Price, and Square Feet");
      return;
    }

    const newProperty = {
      id: Date.now(),
      address: formData.address,
      purchasePrice: parseInt(formData.purchasePrice),
      bedrooms: parseInt(formData.bedrooms) || 3,
      bathrooms: parseInt(formData.bathrooms) || 2,
      squareFeet: parseInt(formData.squareFeet),
      condition: formData.condition,
      marketDescription: formData.marketDescription,
    };

    setProperties((prev) => [...prev, newProperty]);
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

  const ratingColor = (rating) => {
    switch (rating) {
      case "EXCELLENT":
        return "text-green-600";
      case "GOOD":
        return "text-emerald-500";
      case "MODERATE":
        return "text-yellow-600";
      case "POOR":
        return "text-red-600";
      default:
        return "text-slate-400";
    }
  };

  const ratingEmoji = (rating) => {
    switch (rating) {
      case "EXCELLENT":
        return "🚀";
      case "GOOD":
        return "✓";
      case "MODERATE":
        return "⚠";
      case "POOR":
        return "⛔";
      default:
        return "?";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">
                AI Real Estate Flipper
              </h1>
              <span
                className={`text-xs px-2 py-1 rounded ${
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
            <p className="text-slate-400">
              AI-powered property analysis using Google Gemini
            </p>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-3">
            <label className="text-sm font-medium text-slate-300">Model:</label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </select>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-200 font-semibold">API Error</p>
              <p className="text-red-300 text-sm">{apiError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Property Form */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => setFormOpen(!formOpen)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Add Property
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${
                    formOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  formOpen ? "max-h-screen" : "max-h-0"
                }`}
              >
                <div className="px-6 py-4 bg-slate-750 border-t border-slate-700 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="123 Main St, City"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      placeholder="250000"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchasePrice: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        placeholder="3"
                        value={formData.bedrooms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bedrooms: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        placeholder="2"
                        value={formData.bathrooms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bathrooms: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Square Feet
                    </label>
                    <input
                      type="number"
                      placeholder="2000"
                      value={formData.squareFeet}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          squareFeet: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condition: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="poor">Poor (Major Repairs)</option>
                      <option value="average">Average (Some Updates)</option>
                      <option value="good">Good (Minor Updates)</option>
                      <option value="excellent">Excellent (Move-in Ready)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Market Context (Optional)
                    </label>
                    <textarea
                      placeholder="e.g., Hot market, near schools, low inventory"
                      value={formData.marketDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marketDescription: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none h-16 text-sm"
                    />
                  </div>

                  <button
                    onClick={handleAddProperty}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                  >
                    Add Property
                  </button>
                </div>
              </div>
            </div>

            {/* Properties List */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Properties ({properties.length})
              </h2>
              <p className="text-xs text-slate-500 mb-3">💾 Auto-saved locally</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
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
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm truncate">
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

          {/* Right Column */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 flex flex-col items-center justify-center min-h-96">
                <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                <p className="text-slate-300 font-semibold">
                  Gemini AI is analyzing...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Running deep market analysis
                </p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Property Header */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {analysis.address}
                  </h3>
                  <div className="grid grid-cols-4 gap-3 text-sm text-slate-300">
                    <p>
                      <b>Purchase:</b> ${analysis.purchasePrice.toLocaleString()}
                    </p>
                    <p>
                      <b>Size:</b> {analysis.squareFeet.toLocaleString()} sq ft
                    </p>
                    <p>
                      <b>Beds:</b> {analysis.bedrooms}
                    </p>
                    <p>
                      <b>Baths:</b> {analysis.bathrooms}
                    </p>
                  </div>
                </div>

                {/* Investment Summary */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Investment Summary
                  </h2>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Predicted Resale</p>
                      <p className="text-xl font-bold text-white">
                        ${analysis.resaleValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Renovation Costs</p>
                      <p className="text-xl font-bold text-yellow-400">
                        ${analysis.renovationCosts.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Net Profit</p>
                      <p
                        className={`text-xl font-bold ${
                          analysis.netProfit > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        ${analysis.netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">ROI</p>
                      <p className="text-xl font-bold text-blue-400">
                        {analysis.roi}%
                      </p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Holding Costs</p>
                      <p className="text-xl font-bold text-orange-400">
                        ${analysis.holdingCosts.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Rating</p>
                      <p
                        className={`text-xl font-bold ${ratingColor(
                          analysis.investmentRating
                        )}`}
                      >
                        {ratingEmoji(analysis.investmentRating)}{" "}
                        {analysis.investmentRating}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      🏗 Renovation Breakdown
                    </h3>
                    <p className="text-slate-300 text-sm whitespace-pre-line">
                      {analysis.renovationBreakdown}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      📊 Market Analysis
                    </h3>
                    <p className="text-slate-300 text-sm whitespace-pre-line">
                      {analysis.marketAnalysis}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      ⚠ Risk Factors
                    </h3>
                    <p className="text-slate-300 text-sm whitespace-pre-line">
                      {analysis.riskFactors}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      💡 Recommendation Summary
                    </h3>
                    <p className="text-slate-300 text-sm whitespace-pre-line">
                      {analysis.recommendationSummary}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center text-slate-400">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
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
