import { FileDown, BarChart2, TrendingUp, DollarSign } from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const BAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Reports() {
  const { niches, videos, exportCSV, stats } = useYouTube();

  // CPM comparison
  const cpmData = niches
    .sort((a, b) => b.cpmEstimate - a.cpmEstimate)
    .map((n) => ({ name: `${n.emoji} ${n.name}`, cpm: n.cpmEstimate }));

  // Engagement vs views scatter
  const scatterData = videos.map((v) => ({
    x: Math.floor(v.viewCount / 1000),
    y: v.engagementRate,
    z: v.growthScore * 2,
    name: v.title.slice(0, 30),
  }));

  // Short vs Long breakdown
  const formatBreakdown = [
    { name: 'Shorts', count: videos.filter((v) => v.type === 'short').length, fill: '#8b5cf6' },
    { name: 'Longos', count: videos.filter((v) => v.type === 'long').length, fill: '#3b82f6' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileDown size={22} className="text-red-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Relatórios e Exportação</h1>
            <p className="text-gray-500 text-sm">Análise detalhada e exportação de dados</p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FileDown size={15} />
          Exportar CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Vídeos analisados', value: stats.totalVideosTracked, color: 'text-red-400' },
          { icon: BarChart2, label: 'Nichos identificados', value: niches.length, color: 'text-blue-400' },
          { icon: DollarSign, label: 'CPM máximo', value: `$${Math.max(...niches.map((n) => n.cpmEstimate))}`, color: 'text-green-400' },
          { icon: TrendingUp, label: 'Engajamento médio', value: `${stats.avgEngagementRate.toFixed(1)}%`, color: 'text-purple-400' },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <m.icon size={16} className={`${m.color} mb-2`} />
            <p className="text-white text-xl font-bold">{m.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPM by niche */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-green-400" />
            CPM Estimado por Nicho ($/mil views)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cpmData} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={120} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`$${v}/mil views`]}
                cursor={{ fill: '#ffffff08' }}
              />
              <Bar dataKey="cpm" radius={[0, 4, 4, 0]}>
                {cpmData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement vs Views scatter */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-400" />
            Engajamento vs. Visualizações
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="x"
                name="Views (K)"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}K`}
              />
              <YAxis
                dataKey="y"
                name="Engajamento (%)"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <ZAxis dataKey="z" range={[40, 400]} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v, name) => [name === 'Views (K)' ? `${v}K` : `${v}%`, name]}
              />
              <Scatter data={scatterData} fill="#ef4444" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Format breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Distribuição por Formato</h2>
        <div className="flex gap-6 mb-4">
          {formatBreakdown.map((f) => (
            <div key={f.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.fill }} />
              <span className="text-gray-300 text-sm">{f.name}:</span>
              <span className="text-white font-bold text-sm">{f.count} vídeos</span>
              <span className="text-gray-600 text-xs">
                ({((f.count / videos.length) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>

        {/* Full video table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Título', 'Categoria', 'Tipo', 'Views', 'Likes', 'Engajamento', 'Views/h', 'Score'].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs text-gray-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos
                .sort((a, b) => b.growthScore - a.growthScore)
                .map((v, i) => (
                  <tr key={v.id} className={`border-b border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-800/20' : ''} hover:bg-gray-800/40 transition-colors`}>
                    <td className="py-2 px-3">
                      <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors line-clamp-1 max-w-[240px] block">
                        {v.title}
                      </a>
                    </td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{v.category}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${v.type === 'short' ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'}`}>
                        {v.type === 'short' ? 'Short' : 'Longo'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-300 text-xs font-mono">{formatCount(v.viewCount)}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs font-mono">{formatCount(v.likeCount)}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{v.engagementRate}%</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{formatCount(Math.floor(v.viewsPerHour))}</td>
                    <td className="py-2 px-3">
                      <span className={`font-bold text-xs ${v.growthScore >= 70 ? 'text-green-400' : v.growthScore >= 40 ? 'text-yellow-400' : 'text-orange-400'}`}>
                        {v.growthScore}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
