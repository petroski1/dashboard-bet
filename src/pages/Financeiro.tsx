import { useState } from 'react';
import { useBetting } from '../context/BettingContext';
import { formatCurrency, formatPercent } from '../utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, DollarSign, Target, Percent, Award } from 'lucide-react';

type Period = '7d' | '30d' | '3m' | 'all';

const COLORS = ['#22c55e', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#eab308', '#64748b'];

export default function Financeiro() {
  const { state, getCategoryById } = useBetting();
  const [period, setPeriod] = useState<Period>('30d');

  const getFilteredBets = () => {
    const now = new Date();
    return state.bets.filter(b => {
      if (period === 'all') return true;
      const betDate = new Date(b.date);
      if (period === '7d') return betDate >= subDays(now, 7);
      if (period === '30d') return betDate >= subDays(now, 30);
      if (period === '3m') return betDate >= subMonths(now, 3);
      return true;
    });
  };

  const filteredBets = getFilteredBets();

  // Monthly profit chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthBets = state.bets.filter(b => {
      const d = new Date(b.date);
      return d >= start && d <= end && (b.status === 'won' || b.status === 'lost');
    });
    const ganhos = monthBets.filter(b => b.status === 'won')
      .reduce((acc, b) => acc + (b.profit ?? b.stake * b.odds - b.stake), 0);
    const perdas = monthBets.filter(b => b.status === 'lost')
      .reduce((acc, b) => acc + b.stake, 0);
    return {
      mes: format(date, 'MMM/yy', { locale: ptBR }),
      ganhos: parseFloat(ganhos.toFixed(2)),
      perdas: parseFloat(perdas.toFixed(2)),
      lucro: parseFloat((ganhos - perdas).toFixed(2)),
    };
  });

  // Cumulative profit
  const sortedSettled = filteredBets
    .filter(b => b.status === 'won' || b.status === 'lost')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulative = 0;
  const cumulativeData = sortedSettled.map((b, i) => {
    const p = b.status === 'won' ? (b.profit ?? b.stake * b.odds - b.stake) : -b.stake;
    cumulative += p;
    return {
      n: i + 1,
      lucro: parseFloat(cumulative.toFixed(2)),
    };
  });

  // Per category
  const categoryData = state.categories.map(cat => {
    const catBets = filteredBets.filter(b => b.categoryId === cat.id);
    const won = catBets.filter(b => b.status === 'won').length;
    const lost = catBets.filter(b => b.status === 'lost').length;
    const staked = catBets.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + b.stake, 0);
    const profit = catBets.reduce((acc, b) => {
      if (b.status === 'won') return acc + (b.profit ?? b.stake * b.odds - b.stake);
      if (b.status === 'lost') return acc - b.stake;
      return acc;
    }, 0);
    const settled = won + lost;
    const roi = staked > 0 ? (profit / staked) * 100 : 0;
    const winRate = settled > 0 ? (won / settled) * 100 : 0;
    return { ...cat, total: catBets.length, won, lost, staked, profit, roi, winRate };
  }).filter(c => c.total > 0).sort((a, b) => b.profit - a.profit);

  const pieStakeData = categoryData.map(c => ({ name: c.name, value: c.staked }));

  // Best/worst bets
  const settledBets = filteredBets.filter(b => b.status === 'won' || b.status === 'lost');
  const bestBet = settledBets.reduce<typeof settledBets[0] | null>((best, b) => {
    const p = b.status === 'won' ? (b.profit ?? b.stake * b.odds - b.stake) : -b.stake;
    if (!best) return b;
    const bestP = best.status === 'won' ? (best.profit ?? best.stake * best.odds - best.stake) : -best.stake;
    return p > bestP ? b : best;
  }, null);
  const worstBet = settledBets.reduce<typeof settledBets[0] | null>((worst, b) => {
    const p = b.status === 'won' ? (b.profit ?? b.stake * b.odds - b.stake) : -b.stake;
    if (!worst) return b;
    const worstP = worst.status === 'won' ? (worst.profit ?? worst.stake * worst.odds - worst.stake) : -worst.stake;
    return p < worstP ? b : worst;
  }, null);

  const avgOdds = filteredBets.length > 0
    ? filteredBets.reduce((acc, b) => acc + b.odds, 0) / filteredBets.length
    : 0;

  const filteredSummary = (() => {
    const won = filteredBets.filter(b => b.status === 'won');
    const lost = filteredBets.filter(b => b.status === 'lost');
    const staked = filteredBets.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + b.stake, 0);
    const totalWon = won.reduce((acc, b) => acc + (b.profit ?? b.stake * b.odds - b.stake), 0);
    const totalLost = lost.reduce((acc, b) => acc + b.stake, 0);
    const netProfit = totalWon - totalLost;
    const roi = staked > 0 ? (netProfit / staked) * 100 : 0;
    const settled = won.length + lost.length;
    const winRate = settled > 0 ? (won.length / settled) * 100 : 0;
    return { staked, totalWon, totalLost, netProfit, roi, winRate, total: filteredBets.length, won: won.length, lost: lost.length };
  })();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Controle Financeiro</h1>
          <p className="text-slate-400 text-sm mt-1">Análise detalhada da sua performance</p>
        </div>
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
          {(['7d', '30d', '3m', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '3m' ? '3 meses' : 'Tudo'}
            </button>
          ))}
        </div>
      </div>

      {/* Period summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs uppercase tracking-wider">Lucro</p>
          </div>
          <p className={`text-xl font-bold ${filteredSummary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(filteredSummary.netProfit)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs uppercase tracking-wider">ROI</p>
          </div>
          <p className={`text-xl font-bold ${filteredSummary.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercent(filteredSummary.roi)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs uppercase tracking-wider">Apostado</p>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(filteredSummary.staked)}</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs uppercase tracking-wider">Acerto</p>
          </div>
          <p className="text-xl font-bold text-white">{filteredSummary.winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs uppercase tracking-wider">Odd Média</p>
          </div>
          <p className="text-xl font-bold text-white">{avgOdds.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs uppercase tracking-wider">Apostas</p>
          </div>
          <p className="text-xl font-bold text-white">{filteredSummary.total}</p>
          <p className="text-xs text-slate-400">{filteredSummary.won}G / {filteredSummary.lost}P</p>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Ganhos vs Perdas por Mês</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(v, name) => [formatCurrency(v as number), name === 'ganhos' ? 'Ganhos' : name === 'perdas' ? 'Perdas' : 'Lucro']}
              />
              <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v === 'ganhos' ? 'Ganhos' : v === 'perdas' ? 'Perdas' : 'Lucro'}</span>} />
              <Bar dataKey="ganhos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="perdas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Lucro Acumulado</h2>
          {cumulativeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="n" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Apostas', position: 'insideBottom', fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v) => [formatCurrency(v as number), 'Lucro acumulado']}
                  labelFormatter={v => `Aposta #${v}`}
                />
                <Line type="monotone" dataKey="lucro" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-500 text-sm">Sem dados para o período</div>
          )}
        </div>
      </div>

      {/* Category table + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Performance por Categoria</h2>
          {categoryData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Sem dados para o período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider pb-3">Categoria</th>
                    <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider pb-3">Apostas</th>
                    <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider pb-3">G/P</th>
                    <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider pb-3">Acerto</th>
                    <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider pb-3">Apostado</th>
                    <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider pb-3">ROI</th>
                    <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider pb-3">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {categoryData.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-700/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-white text-sm font-medium">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-300 text-sm">{cat.total}</td>
                      <td className="py-3 text-right text-slate-300 text-sm">{cat.won}/{cat.lost}</td>
                      <td className="py-3 text-right text-sm">
                        <span className={cat.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>{cat.winRate.toFixed(1)}%</span>
                      </td>
                      <td className="py-3 text-right text-slate-300 text-sm">{formatCurrency(cat.staked)}</td>
                      <td className="py-3 text-right text-sm">
                        <span className={cat.roi >= 0 ? 'text-green-400' : 'text-red-400'}>{formatPercent(cat.roi)}</span>
                      </td>
                      <td className="py-3 text-right text-sm font-semibold">
                        <span className={cat.profit >= 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(cat.profit)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Stake por Categoria</h2>
          {pieStakeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieStakeData} cx="50%" cy="45%" innerRadius={45} outerRadius={75} dataKey="value">
                  {pieStakeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => formatCurrency(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-500 text-sm">Sem dados</div>
          )}
        </div>
      </div>

      {/* Best / Worst bet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" /> Melhor Aposta
          </h2>
          {bestBet ? (
            <div className="space-y-2">
              <p className="text-white font-medium">{bestBet.description}</p>
              <p className="text-slate-400 text-sm">{getCategoryById(bestBet.categoryId)?.icon} {getCategoryById(bestBet.categoryId)?.name} · {format(new Date(bestBet.date), 'dd/MM/yyyy')}</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-slate-400 text-xs">Stake</p>
                  <p className="text-white font-semibold">{formatCurrency(bestBet.stake)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Odd</p>
                  <p className="text-white font-semibold">{bestBet.odds.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Lucro</p>
                  <p className="text-green-400 font-semibold">
                    +{formatCurrency(bestBet.profit ?? bestBet.stake * bestBet.odds - bestBet.stake)}
                  </p>
                </div>
              </div>
            </div>
          ) : <p className="text-slate-500 text-sm">Sem dados</p>}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" /> Pior Aposta
          </h2>
          {worstBet ? (
            <div className="space-y-2">
              <p className="text-white font-medium">{worstBet.description}</p>
              <p className="text-slate-400 text-sm">{getCategoryById(worstBet.categoryId)?.icon} {getCategoryById(worstBet.categoryId)?.name} · {format(new Date(worstBet.date), 'dd/MM/yyyy')}</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-slate-400 text-xs">Stake</p>
                  <p className="text-white font-semibold">{formatCurrency(worstBet.stake)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Odd</p>
                  <p className="text-white font-semibold">{worstBet.odds.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Resultado</p>
                  <p className="text-red-400 font-semibold">
                    -{formatCurrency(worstBet.stake)}
                  </p>
                </div>
              </div>
            </div>
          ) : <p className="text-slate-500 text-sm">Sem dados</p>}
        </div>
      </div>
    </div>
  );
}
