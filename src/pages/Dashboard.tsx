import { useBetting } from '../context/BettingContext';
import StatCard from '../components/StatCard';
import BetStatusBadge from '../components/BetStatusBadge';
import { formatCurrency, formatPercent } from '../utils/format';
import {
  TrendingUp, TrendingDown, DollarSign, Target,
  Percent, Trophy, Clock, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#6b7280'];

export default function Dashboard() {
  const { state, getFinancialSummary, getCategoryById, getGameById } = useBetting();
  const summary = getFinancialSummary();

  // Build last 14 days profit chart
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBets = state.bets.filter(b => b.date.startsWith(dateStr) && (b.status === 'won' || b.status === 'lost'));
    const dayProfit = dayBets.reduce((acc, b) => {
      if (b.status === 'won') return acc + (b.profit ?? b.stake * b.odds - b.stake);
      return acc - b.stake;
    }, 0);
    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      lucro: parseFloat(dayProfit.toFixed(2)),
    };
  });

  const pieData = [
    { name: 'Ganhou', value: summary.wonBets },
    { name: 'Perdeu', value: summary.lostBets },
    { name: 'Pendente', value: summary.pendingBets },
    { name: 'Cancelada', value: summary.cancelledBets },
  ].filter(d => d.value > 0);

  const recentBets = [...state.bets]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Per-category stats
  const categoryStats = state.categories.map(cat => {
    const catBets = state.bets.filter(b => b.categoryId === cat.id);
    const won = catBets.filter(b => b.status === 'won').length;
    const lost = catBets.filter(b => b.status === 'lost').length;
    const staked = catBets.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + b.stake, 0);
    const profit = catBets.reduce((acc, b) => {
      if (b.status === 'won') return acc + (b.profit ?? b.stake * b.odds - b.stake);
      if (b.status === 'lost') return acc - b.stake;
      return acc;
    }, 0);
    return { ...cat, total: catBets.length, won, lost, staked, profit };
  }).filter(c => c.total > 0);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral das suas apostas</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(summary.netProfit)}
          icon={<DollarSign className="w-5 h-5" />}
          color={summary.netProfit >= 0 ? 'green' : 'red'}
          subtitle={`ROI: ${formatPercent(summary.roi)}`}
        />
        <StatCard
          title="Taxa de Acerto"
          value={`${summary.winRate.toFixed(1)}%`}
          icon={<Percent className="w-5 h-5" />}
          color="blue"
          subtitle={`${summary.wonBets}G / ${summary.lostBets}P`}
        />
        <StatCard
          title="Total Apostado"
          value={formatCurrency(summary.totalStaked)}
          icon={<Target className="w-5 h-5" />}
          color="yellow"
          subtitle={`${summary.totalBets} apostas`}
        />
        <StatCard
          title="Pendentes"
          value={summary.pendingBets}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
          subtitle="apostas em aberto"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ganho"
          value={formatCurrency(summary.totalWon)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          subtitle={`${summary.wonBets} apostas`}
        />
        <StatCard
          title="Total Perdido"
          value={formatCurrency(summary.totalLost)}
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
          subtitle={`${summary.lostBets} apostas`}
        />
        <StatCard
          title="Apostas Ganhas"
          value={summary.wonBets}
          icon={<Trophy className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Apostas Perdidas"
          value={summary.lostBets}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Lucro Diário (14 dias)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last14Days}>
              <defs>
                <linearGradient id="lucroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [formatCurrency(v as number), 'Lucro']}
              />
              <Area type="monotone" dataKey="lucro" stroke="#22c55e" strokeWidth={2} fill="url(#lucroGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Distribuição</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">Nenhuma aposta ainda</div>
          )}
        </div>
      </div>

      {/* Category breakdown + Recent bets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Por Categoria</h2>
          {categoryStats.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Nenhuma aposta registrada</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${cat.color}20` }}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{cat.name}</p>
                      <p className="text-slate-400 text-xs">{cat.total} apostas · {cat.won}G {cat.lost}P</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${cat.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(cat.profit)}
                    </p>
                    <p className="text-slate-400 text-xs">{formatCurrency(cat.staked)} apostado</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Apostas Recentes</h2>
          {recentBets.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Nenhuma aposta registrada</p>
          ) : (
            <div className="space-y-3">
              {recentBets.map(bet => {
                const category = getCategoryById(bet.categoryId);
                const game = getGameById(bet.gameId);
                return (
                  <div key={bet.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: `${category?.color ?? '#6b7280'}20` }}>
                        {category?.icon ?? '🎯'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium truncate max-w-[160px]">{bet.description}</p>
                        <p className="text-slate-400 text-xs">{game?.name ?? 'Jogo'} · {format(new Date(bet.date), 'dd/MM/yy')}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <BetStatusBadge status={bet.status} />
                      <p className="text-slate-400 text-xs">{formatCurrency(bet.stake)} @ {bet.odds}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
