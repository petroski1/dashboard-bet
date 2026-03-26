import { Eye, TrendingUp, Zap, BarChart3, RefreshCw } from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';
import StatCard from '../components/StatCard';
import VideoCard from '../components/VideoCard';
import NicheCard from '../components/NicheCard';
import AIInsightPanel from '../components/AIInsightPanel';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function Dashboard() {
  const { videos, niches, recommendation, stats, isRefreshing, refresh, lastUpdated } = useYouTube();

  const topVideos = [...videos].sort((a, b) => b.growthScore - a.growthScore).slice(0, 6);
  const topNiches = niches.slice(0, 4);

  // Bar chart data: top niches by views
  const nicheBarData = niches.slice(0, 8).map((n) => ({
    name: `${n.emoji} ${n.name}`,
    views: Math.floor(n.totalViews / 1_000_000),
    score: n.growthScore,
  }));

  // Radar chart for top niche
  const topNiche = niches[0];
  const radarData = topNiche
    ? [
        { metric: 'Crescimento', value: topNiche.growthScore },
        { metric: 'Monetização', value: topNiche.monetizationScore },
        { metric: 'Viral', value: topNiche.viralPotential },
        { metric: 'Engajamento', value: Math.min(100, topNiche.avgEngagement * 10) },
        { metric: 'Alcance', value: Math.min(100, (topNiche.totalViews / 12_000_000) * 100) },
      ]
    : [];

  const minsAgo = lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000) : null;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tendências do YouTube nas últimas 48 horas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            {minsAgo === null ? '' : minsAgo === 0 ? 'Atualizado agora' : `Atualizado ${minsAgo}m atrás`}
          </span>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="Views nas últimas 48h"
          value={formatCount(stats.totalViewsLast48h)}
          accent="red"
          trend={{ value: 12.4, label: '' }}
        />
        <StatCard
          icon={TrendingUp}
          label="Vídeos rastreados"
          value={String(stats.totalVideosTracked)}
          accent="blue"
          sub="Últimas 48 horas"
        />
        <StatCard
          icon={Zap}
          label="Engajamento médio"
          value={`${stats.avgEngagementRate.toFixed(1)}%`}
          accent="green"
          trend={{ value: 3.2, label: '' }}
        />
        <StatCard
          icon={BarChart3}
          label="Nicho em destaque"
          value={topNiche ? `${topNiche.emoji} ${topNiche.name}` : '—'}
          accent="purple"
          sub={topNiche ? `Score ${topNiche.growthScore.toFixed(0)}/100` : ''}
        />
      </div>

      {/* AI Recommendation */}
      {recommendation && <AIInsightPanel recommendation={recommendation} />}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Views por Nicho (milhões)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={nicheBarData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}M`}
              />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}M views`]}
                cursor={{ fill: '#ffffff08' }}
              />
              <Bar dataKey="views" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-1">Score do Top Nicho</h2>
          {topNiche && (
            <p className="text-gray-500 text-xs mb-3">{topNiche.emoji} {topNiche.name}</p>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Radar
                dataKey="value"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top niches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Nichos em Alta</h2>
          <a href="/niches" className="text-xs text-red-400 hover:text-red-300">Ver todos →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topNiches.map((n, i) => (
            <NicheCard key={n.id} niche={n} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Top viral videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Vídeos Mais Virais</h2>
          <a href="/trending" className="text-xs text-red-400 hover:text-red-300">Ver todos →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topVideos.map((v, i) => (
            <VideoCard key={v.id} video={v} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
