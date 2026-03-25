import { Sparkles, Target, DollarSign, Clock, Lightbulb, ChevronRight, Award } from 'lucide-react';
import type { AIRecommendation } from '../types';

interface Props {
  recommendation: AIRecommendation;
}

const competitionColors = {
  low: { bg: 'bg-green-600/15', border: 'border-green-600/30', text: 'text-green-400', label: 'Baixa' },
  medium: { bg: 'bg-yellow-600/15', border: 'border-yellow-600/30', text: 'text-yellow-400', label: 'Média' },
  high: { bg: 'bg-red-600/15', border: 'border-red-600/30', text: 'text-red-400', label: 'Alta' },
};

function formatMoney(n: number): string {
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$${n}`;
}

export default function AIInsightPanel({ recommendation: rec }: Props) {
  const compStyle = competitionColors[rec.competitionLevel];
  const typeLabels = { short: 'Shorts', long: 'Vídeos Longos', both: 'Shorts + Longos' };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-purple-600/5 to-transparent rounded-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Recomendação IA</h2>
            <p className="text-gray-500 text-xs">Análise em tempo real das tendências</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">{rec.confidence}% confiança</span>
          </div>
        </div>
      </div>

      {/* Main niche recommendation */}
      <div className="bg-gray-800/60 rounded-xl p-4 mb-5 border border-gray-700/50 relative">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{rec.niche.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white text-xl font-bold">{rec.niche.name}</h3>
              <Award size={16} className="text-yellow-400" />
            </div>
            <p className="text-gray-400 text-sm mt-0.5">Nicho mais promissor agora</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{rec.reason}</p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
          <DollarSign size={14} className="text-green-400 mb-1.5" />
          <p className="text-xs text-gray-500 mb-0.5">Ganho Mensal Est.</p>
          <p className="text-white text-sm font-bold">
            {formatMoney(rec.estimatedMonthlyEarnings.min)}–{formatMoney(rec.estimatedMonthlyEarnings.max)}
          </p>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
          <Target size={14} className="text-blue-400 mb-1.5" />
          <p className="text-xs text-gray-500 mb-0.5">Formato Ideal</p>
          <p className="text-white text-sm font-bold">{typeLabels[rec.bestVideoType]}</p>
        </div>
        <div className={`rounded-xl p-3 border ${compStyle.bg} ${compStyle.border}`}>
          <div className="w-3 h-3 rounded-full bg-current mb-1.5 opacity-70" />
          <p className="text-xs text-gray-500 mb-0.5">Competição</p>
          <p className={`text-sm font-bold ${compStyle.text}`}>{compStyle.label}</p>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
          <Clock size={14} className="text-purple-400 mb-1.5" />
          <p className="text-xs text-gray-500 mb-0.5">Tempo p/ Monetizar</p>
          <p className="text-white text-sm font-bold">{rec.timeToMonetize}</p>
        </div>
      </div>

      {/* Content ideas */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-yellow-400" />
          <h4 className="text-sm font-semibold text-white">Ideias de Conteúdo para Começar</h4>
        </div>
        <div className="space-y-2">
          {rec.contentIdeas.map((idea, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600 transition-colors">
              <ChevronRight size={12} className="text-red-400 shrink-0" />
              <span className="text-sm text-gray-300">{idea}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
