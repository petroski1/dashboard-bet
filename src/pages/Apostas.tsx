import { useState } from 'react';
import { useBetting } from '../context/BettingContext';
import type { Bet, BetStatus } from '../types';
import BetStatusBadge from '../components/BetStatusBadge';
import { formatCurrency, generateId } from '../utils/format';
import { Plus, Pencil, Trash2, Filter, Search, X } from 'lucide-react';
import { format } from 'date-fns';

const emptyForm: Omit<Bet, 'id'> = {
  gameId: '',
  categoryId: '',
  description: '',
  stake: 0,
  odds: 1,
  status: 'pending',
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
  betType: 'single',
};

const statusOptions: { value: BetStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendente' },
  { value: 'won', label: 'Ganhou' },
  { value: 'lost', label: 'Perdeu' },
  { value: 'cashout', label: 'Cashout' },
  { value: 'cancelled', label: 'Cancelada' },
];

export default function Apostas() {
  const { state, dispatch, getCategoryById, getGameById } = useBetting();
  const [showModal, setShowModal] = useState(false);
  const [editBet, setEditBet] = useState<Bet | null>(null);
  const [form, setForm] = useState<Omit<Bet, 'id'>>(emptyForm);
  const [filterStatus, setFilterStatus] = useState<BetStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditBet(null);
    setShowModal(true);
  };

  const openEdit = (bet: Bet) => {
    setForm({ ...bet });
    setEditBet(bet);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.description || !form.categoryId || form.stake <= 0 || form.odds < 1) return;
    if (editBet) {
      dispatch({ type: 'UPDATE_BET', payload: { ...form, id: editBet.id } });
    } else {
      dispatch({ type: 'ADD_BET', payload: { ...form, id: generateId() } });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_BET', payload: id });
    setDeleteConfirm(null);
  };

  const filtered = state.bets
    .filter(b => filterStatus === 'all' || b.status === filterStatus)
    .filter(b => filterCategory === 'all' || b.categoryId === filterCategory)
    .filter(b => !search || b.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const potentialReturn = (form.stake * form.odds);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Apostas</h1>
          <p className="text-slate-400 text-sm mt-1">{state.bets.length} apostas registradas</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nova Aposta
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar aposta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as BetStatus | 'all')}
            className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          >
            <option value="all">Todas categorias</option>
            {state.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Bets table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-lg mb-1">Nenhuma aposta encontrada</p>
            <p className="text-sm">Clique em "Nova Aposta" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Descrição</th>
                  <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Categoria</th>
                  <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Jogo</th>
                  <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Stake</th>
                  <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Odd</th>
                  <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Resultado</th>
                  <th className="text-center text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-5 py-3">Data</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map(bet => {
                  const category = getCategoryById(bet.categoryId);
                  const game = getGameById(bet.gameId);
                  const profit = bet.status === 'won'
                    ? (bet.profit ?? bet.stake * bet.odds - bet.stake)
                    : bet.status === 'lost' ? -bet.stake : null;
                  return (
                    <tr key={bet.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white text-sm font-medium">{bet.description}</p>
                        {bet.notes && <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[200px]">{bet.notes}</p>}
                      </td>
                      <td className="px-5 py-4">
                        {category && (
                          <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: category.color }}>
                            {category.icon} {category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{game?.name ?? '—'}</td>
                      <td className="px-5 py-4 text-right text-white text-sm font-medium">{formatCurrency(bet.stake)}</td>
                      <td className="px-5 py-4 text-right text-slate-300 text-sm">{bet.odds.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right text-sm font-semibold">
                        {profit !== null ? (
                          <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                          </span>
                        ) : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <BetStatusBadge status={bet.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{format(new Date(bet.date), 'dd/MM/yy')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(bet)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {deleteConfirm === bet.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(bet.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg">Confirmar</button>
                              <button onClick={() => setDeleteConfirm(null)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(bet.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-white font-semibold text-lg">{editBet ? 'Editar Aposta' : 'Nova Aposta'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição *</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Flamengo vence o jogo"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                  >
                    <option value="">Selecionar</option>
                    {state.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Jogo</label>
                  <select
                    value={form.gameId}
                    onChange={e => setForm(f => ({ ...f, gameId: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                  >
                    <option value="">Selecionar</option>
                    {state.games.filter(g => !form.categoryId || g.categoryId === form.categoryId).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Stake (R$) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.stake || ''}
                    onChange={e => setForm(f => ({ ...f, stake: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Odd *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.odds || ''}
                    onChange={e => setForm(f => ({ ...f, odds: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
              </div>
              {form.stake > 0 && form.odds >= 1 && (
                <div className="bg-slate-700/50 rounded-xl p-3 text-sm">
                  <span className="text-slate-400">Retorno potencial: </span>
                  <span className="text-green-400 font-semibold">{formatCurrency(potentialReturn)}</span>
                  <span className="text-slate-400"> (lucro: </span>
                  <span className="text-green-400 font-semibold">{formatCurrency(potentialReturn - form.stake)}</span>
                  <span className="text-slate-400">)</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status *</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as BetStatus }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                  >
                    <option value="pending">Pendente</option>
                    <option value="won">Ganhou</option>
                    <option value="lost">Perdeu</option>
                    <option value="cashout">Cashout</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Data *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
              </div>
              {form.status === 'won' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Lucro líquido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.profit ?? ''}
                    onChange={e => setForm(f => ({ ...f, profit: parseFloat(e.target.value) || undefined }))}
                    placeholder={`Padrão: ${formatCurrency(form.stake * form.odds - form.stake)}`}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Observações</label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Notas adicionais..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 text-sm resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-sm font-medium">
                {editBet ? 'Salvar' : 'Criar Aposta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
