import { useState } from 'react';
import { useYouTube } from '../context/YouTubeContext';
import NicheCard from '../components/NicheCard';
import VideoCard from '../components/VideoCard';
import type { Niche } from '../types';
import { BarChart3, TrendingUp, X, DollarSign, Eye, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell,
} from 'recharts';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function NicheDetail({ niche, videos, onClose }: { niche: Niche; videos: ReturnType<typeof useYouTube>['videos']; onClose: () => void }) {
  const nicheVideos = videos.filter((v) => v.category === niche.name).slice(0, 6);
  const radarData = [
    { metric: 'Crescimento', value: niche.growthScore },
    { metric: 'Monetização', value: niche.monetizationScore },
    { metric: 'Viral', value: niche.viralPotential },
    { metric: 'Engajamento', value: Math.min(100, niche.avgEngagement * 10) },
    { metric: 'Alcance', value: Math.min(100, (niche.totalViews / 12_000_000) * 100) },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-auto" onClick={onClose}>
      <div
        className="max-w-4xl mx-auto my-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{niche.emoji}</span>
            <div>
              <h2 className="text-white text-xl font-bold">{niche.name}</h2>
              <p className="text-gray-500 text-sm">{niche.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Eye, label: 'Total Views', value: formatCount(niche.totalViews), accent: 'text-blue-400' },
              { icon: Zap, label: 'Views/Hora', value: formatCount(Math.floor(niche.avgViewsPerHour)), accent: 'text-yellow-400' },
              { icon: DollarSign, label: 'CPM Estimado', value: `$${niche.cpmEstimate}`, accent: 'text-green-400' },
              { icon: TrendingUp, label: 'Engajamento', value: `${niche.avgEngagement.toFixed(1)}%`, accent: 'text-purple-400' },
            ].map((m) => (
              <div key={m.label} className="bg-gray-800/50 rounded-xl p-4 text-center">
                <m.icon size={18} className={`${m.accent} mx-auto mb-2`} />
                <p className="text-white text-lg font-bold">{m.value}</p>
                <p className="text-gray-500 text-xs">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3 text-sm">Análise Multidimensional</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Radar dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3 text-sm">Scores</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Crescimento', val: niche.growthScore },
                  { name: 'Monetização', val: niche.monetizationScore },
                  { name: 'Viral', val: niche.viralPotential },
                ]} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: '#ffffff08' }}
                  />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                    {['#22c55e', '#eab308', '#a855f7'].map((color, i) => <Cell key={i} fill={color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {niche.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-800 text-gray-400 text-xs rounded-full border border-gray-700">
                #{tag}
              </span>
            ))}
          </div>

          {/* Videos in this niche */}
          <div>
            <h3 className="text-white font-medium mb-3">Vídeos em Alta neste Nicho</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {nicheVideos.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NicheAnalysis() {
  const { niches, videos } = useYouTube();
  const [selected, setSelected] = useState<Niche | null>(null);
  const [sortBy, setSortBy] = useState<'growthScore' | 'monetizationScore' | 'viralPotential'>('growthScore');

  const sorted = [...niches].sort((a, b) => b[sortBy] - a[sortBy]);

  // Comparison bar chart
  const compData = sorted.slice(0, 10).map((n) => ({
    name: `${n.emoji} ${n.name}`,
    crescimento: n.growthScore,
    monetizacao: n.monetizationScore,
    viral: n.viralPotential,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={22} className="text-red-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Análise de Nichos</h1>
            <p className="text-gray-500 text-sm">{niches.length} nichos identificados nas últimas 48h</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['growthScore', 'monetizationScore', 'viralPotential'] as const).map((s) => {
            const labels = { growthScore: 'Crescimento', monetizationScore: 'Monetização', viralPotential: 'Viral' };
            return (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === s ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Comparação de Nichos (Top 10)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={compData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: '#ffffff08' }}
            />
            <Bar dataKey="crescimento" fill="#22c55e" radius={[3, 3, 0, 0]} name="Crescimento" />
            <Bar dataKey="monetizacao" fill="#eab308" radius={[3, 3, 0, 0]} name="Monetização" />
            <Bar dataKey="viral" fill="#a855f7" radius={[3, 3, 0, 0]} name="Viral" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 justify-center">
          {[{ color: 'bg-green-500', label: 'Crescimento' }, { color: 'bg-yellow-500', label: 'Monetização' }, { color: 'bg-purple-500', label: 'Viral' }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((n, i) => (
          <div key={n.id} onClick={() => setSelected(n)} className="cursor-pointer">
            <NicheCard niche={n} rank={i + 1} />
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <NicheDetail niche={selected} videos={videos} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
