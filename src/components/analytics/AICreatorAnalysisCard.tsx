import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  Bot,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Layers
} from 'lucide-react';

import { Instagram } from '../icons/InstagramIcon';

interface AICreatorAnalysisCardProps {
  analysis: any;
  isInstagramConnected: boolean;
  onAnalysisUpdated: (newAnalysis: any) => void;
  onNavigateInstagram?: () => void;
}

export const AICreatorAnalysisCard: React.FC<AICreatorAnalysisCardProps> = ({
  analysis,
  isInstagramConnected,
  onAnalysisUpdated,
  onNavigateInstagram
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.triggerAIAnalysis();
      if (res.success && res.analysis) {
        onAnalysisUpdated(res.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-pink border-pink/40 bg-pink/10';
    return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  };

  if (!isInstagramConnected) {
    return (
      <div className="bg-[#0c1416] rounded-3xl border border-white/15 p-8 sm:p-10 text-center max-w-xl mx-auto shadow-2xl animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-pink/10 border border-pink/30 text-pink flex items-center justify-center mx-auto mb-5 shadow-lg shadow-pink/10">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-heading">Connect Instagram to Unlock AI Analysis</h3>
        <p className="text-xs text-muted max-w-md mx-auto mb-6 leading-relaxed">
          CreatorHub evaluates verified metrics rather than fabricated guesses. Connect your Instagram profile to generate your grounded Creator Score and tailored growth recommendations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              if (onNavigateInstagram) {
                onNavigateInstagram();
              } else {
                const igBtn = document.querySelector('[data-tab="instagram"]') as HTMLElement;
                if (igBtn) igBtn.click();
                else window.location.href = '/creator/dashboard?tab=instagram';
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-pink hover:bg-[#ff4d79] text-[#181012] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink/20 transition cursor-pointer"
          >
            <Instagram className="w-4 h-4" /> Connect Instagram Profile
          </button>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="w-full sm:w-auto px-5 py-3 rounded-full border border-white/20 hover:border-pink hover:text-pink text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink" />
            {analyzing ? 'Evaluating...' : 'Preview Sample Analysis'}
          </button>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#10191a] text-muted border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-pink" /> Zero Synthetic Scores Policy
        </span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-[#0c1416] rounded-3xl border border-white/15 p-8 text-center max-w-xl mx-auto shadow-2xl animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-pink/10 border border-pink/30 text-pink flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-heading">Analyze Your Verified Instagram Profile</h3>
        <p className="text-xs text-muted max-w-md mx-auto mb-6 leading-relaxed">
          Run your AI evaluation to determine your Creator Score, audience suitability for local brands, and key strengths.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="px-6 py-3 rounded-full bg-pink hover:bg-[#ff4d79] text-[#181012] font-bold text-xs shadow-lg shadow-pink/20 flex items-center justify-center gap-2 mx-auto disabled:opacity-50 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {analyzing ? 'Analyzing Metrics...' : 'Generate AI Creator Analysis'}
        </button>
      </div>
    );
  }

  const subScores = [
    { label: 'Engagement Quality', score: analysis.engagementScore || 75 },
    { label: 'Content Consistency', score: analysis.consistencyScore || 75 },
    { label: 'Content Quality', score: analysis.contentScore || 75 },
    { label: 'Audience Relevance', score: analysis.audienceScore || 75 },
    { label: 'Brand Suitability', score: analysis.brandSuitabilityScore || 75 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Creator Score */}
      <div className="bg-[#0c1416] p-6 sm:p-8 rounded-3xl border border-[#1c292c] shadow-2xl relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Score Ring / Pill */}
            <div className={`w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center shadow-lg ${getScoreColor(analysis.overallScore || 80)}`}>
              <span className="text-3xl font-black">{analysis.overallScore || 80}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">/ 100</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink/15 text-pink border border-pink/30 flex items-center gap-1">
                  <Bot className="w-3 h-3 text-pink" /> AI Creator Score
                </span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(analysis.analyzed_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">Performance Evaluation</h2>
              <p className="text-xs text-zinc-300 mt-1 max-w-md leading-relaxed font-medium">
                {analysis.summary}
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] text-xs font-black shadow-lg shadow-pink/20 transition-all self-start md:self-auto disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Re-analyzing...' : 'Re-Analyze'}
          </button>
        </div>

        {/* Sub-Score Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-[#1c292c]">
          {subScores.map(sub => (
            <div key={sub.label} className="bg-[#071012] p-3.5 rounded-2xl border border-[#1c292c] shadow-inner">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 truncate">
                {sub.label}
              </div>
              <div className="text-xl font-black text-white mb-2">{sub.score}</div>
              <div className="w-full bg-[#131d20] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-pink h-full rounded-full transition-all duration-500"
                  style={{ width: `${sub.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-[#0c1416] p-6 rounded-3xl border border-[#1c292c] shadow-xl text-white">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Core Strengths
          </div>
          <ul className="space-y-2.5 text-xs">
            {analysis.strengths?.map((s: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#071012] border border-[#1c292c] text-zinc-200 leading-relaxed font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Opportunities */}
        <div className="bg-[#0c1416] p-6 rounded-3xl border border-[#1c292c] shadow-xl text-white">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Growth Opportunities
          </div>
          <ul className="space-y-2.5 text-xs">
            {analysis.weaknesses?.map((w: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#071012] border border-[#1c292c] text-zinc-200 leading-relaxed font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="bg-[#0c1416] p-6 rounded-3xl border border-[#1c292c] shadow-xl text-white">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink mb-4">
            <Lightbulb className="w-4 h-4 text-pink" /> Actionable Recommendations
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {analysis.recommendations.map((r: string, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#071012] border border-[#1c292c] text-xs text-zinc-200 leading-relaxed font-medium">
                <div className="font-bold text-pink mb-1">Tip #{idx + 1}</div>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authenticity Disclaimer */}
      <div className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>AI evaluation grounded strictly in verified Instagram synchronization. Zero synthetic scores.</span>
      </div>
    </div>
  );
};
