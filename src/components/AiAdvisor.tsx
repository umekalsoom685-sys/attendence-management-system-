import React, { useState, useEffect } from 'react';
import { AIRecommendation } from '../types';
import { BrainCircuit, Loader2, Sparkles, CheckSquare, Target, Hourglass, HelpCircle, ShieldAlert } from 'lucide-react';

export default function AiAdvisor() {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAIInsights = async () => {
    try {
      const res = await fetch('/api/ai/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
      }
    } catch (err) {
      console.error('Error loading AI insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const handleRegenerate = () => {
    setRefreshing(true);
    fetchAIInsights();
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <div>
          <h3 className="text-base font-bold font-display text-slate-200">Consulting Gemini Principal Advisor...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating diagnostic predictive models, evaluating low attendance triggers, and framing intervention suggestions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" id="ai-advisor-root">
      {/* GLOWING INSIGHT BANNER */}
      <div className="bg-gradient-to-tr from-slate-900 via-indigo-950/20 to-brand-500/10 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-200">Gemini Predictive Analyst</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time model integration providing academic intelligence summaries and proactive alerts.</p>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={refreshing}
          className="bg-brand-500 hover:bg-brand-605 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Recalculating Models...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Regenerate Recommendation Models
            </>
          )}
        </button>
      </div>

      {/* CORE CARDS WRAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Executive Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-brand-blue uppercase font-mono bg-brand-50 px-2 py-0.5 rounded border border-brand-blue/20 flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3 h-3 text-brand-blue" /> Executive Evaluation Brief
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-semibold">
              {recommendation?.summary}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-500" /> Actionable Task Items For Staff
            </h4>
            <ul className="space-y-2.5">
              {recommendation?.actionItems.map((item, index) => (
                <li key={index} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 hover:border-slate-800 transition-all">
                  <span className="flex items-center justify-center w-5 h-5 bg-brand-50 text-brand-500 border border-brand-500/10 text-[10px] rounded-md font-mono shrink-0 font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2: Risk Profile Predictor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-amber-505 uppercase font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1.5 w-fit">
              <Hourglass className="w-3 h-3" /> Predictive Forecasts
            </span>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">CRITICAL ALERTS</p>
                <p className="text-2xl font-bold font-mono text-red-500 mt-1">{recommendation?.riskAnalysis.criticalCount}</p>
                <span className="text-[9px] text-slate-500 block font-bold">under 50%</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">LOW ATTENDANCE</p>
                <p className="text-2xl font-bold font-mono text-yellow-550 mt-1">{recommendation?.riskAnalysis.warningCount}</p>
                <span className="text-[9px] text-slate-500 block font-bold">under 75%</span>
              </div>
            </div>

            <div className="pt-3">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-brand-500" /> Behavioral Forecasting
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 font-medium">
                {recommendation?.riskAnalysis.predictions}
              </p>
            </div>
          </div>

          <div className="p-3 bg-brand-50 border border-brand-blue/10 rounded-xl flex gap-2.5 items-start mt-4">
            <ShieldAlert className="w-4.5 h-4.5 text-brand-blue shrink-0 mt-0.5" />
            <p className="text-[10px] text-brand-blue leading-relaxed font-semibold">
              Predictions automatically account for trailing rolling averages and user-entered remarks before outputting guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
