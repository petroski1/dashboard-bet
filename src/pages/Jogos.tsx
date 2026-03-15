import { useState } from 'react';
import { useBetting } from '../context/BettingContext';
import type { Game } from '../types';
import { generateId } from '../utils/format';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { format } from 'date-fns';

const emptyForm: Omit<Game, 'id'> = {
  name: '',
  categoryId: '',
  league: '',
  homeTeam: '',
  awayTeam: '',
  date: format(new Date(), 'yyyy-MM-dd'),
};

export default function Jogos() {
  const { state, dispatch, getCategoryById } = useBetting();
  const [showModal, setShowModal] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [form, setForm] = useState<Omit<Game, 'id'>>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const openAdd = () => {
    setForm(emptyForm);
    setEditGame(null);
    setShowModal(true);
  };

  const openEdit = (game: Game) => {
    setForm({ ...game });
    setEditGame(game);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.categoryId) return;
    if (editGame) {
      dispatch({ type: 'UPDATE_GAME', payload: { ...form, id: editGame.id } });
    } else {
      dispatch({ type: 'ADD_GAME', payload: { ...form, id: generateId() } });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_GAME', payload: id });
    setDeleteConfirm(null);
  };

  const filtered = state.games
    .filter(g => filterCategory === 'all' || g.categoryId === filterCategory)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.homeTeam?.toLowerCase().includes(search.toLowerCase()) ||
      g.awayTeam?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Jogos</h1>
          <p className="text-slate-400 text-sm mt-1">{state.games.length} jogos cadastrados</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Novo Jogo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar jogo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
        >
          <option value="all">Todas categorias</option>
          {state.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Games grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center text-slate-500">
          <p className="text-lg mb-1">Nenhum jogo encontrado</p>
          <p className="text-sm">Clique em "Novo Jogo" para cadastrar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(game => {
            const cat = getCategoryById(game.categoryId);
            const gameBets = state.bets.filter(b => b.gameId === game.id);
            return (
              <div key={game.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {cat && (
                      <span className="text-base">{cat.icon}</span>
                    )}
                    <div>
                      <p className="text-slate-400 text-xs">{cat?.name ?? ''} {game.league ? `· ${game.league}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(game)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirm === game.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(game.id)} className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-lg">Ok</button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(game.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {game.homeTeam && game.awayTeam ? (
                  <div className="text-center my-3">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-white font-semibold text-sm">{game.homeTeam}</span>
                      <span className="text-slate-500 text-xs font-bold">VS</span>
                      <span className="text-white font-semibold text-sm">{game.awayTeam}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{game.name}</p>
                  </div>
                ) : (
                  <p className="text-white font-semibold my-3">{game.name}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <span className="text-slate-400 text-xs">{format(new Date(game.date), 'dd/MM/yyyy')}</span>
                  <span className="text-slate-400 text-xs">{gameBets.length} {gameBets.length === 1 ? 'aposta' : 'apostas'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-white font-semibold text-lg">{editGame ? 'Editar Jogo' : 'Novo Jogo'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome do Jogo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Flamengo x Palmeiras"
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Liga / Torneio</label>
                  <input
                    type="text"
                    value={form.league ?? ''}
                    onChange={e => setForm(f => ({ ...f, league: e.target.value }))}
                    placeholder="Ex: Brasileirão"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Time Casa</label>
                  <input
                    type="text"
                    value={form.homeTeam ?? ''}
                    onChange={e => setForm(f => ({ ...f, homeTeam: e.target.value }))}
                    placeholder="Ex: Flamengo"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Time Visitante</label>
                  <input
                    type="text"
                    value={form.awayTeam ?? ''}
                    onChange={e => setForm(f => ({ ...f, awayTeam: e.target.value }))}
                    placeholder="Ex: Palmeiras"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Data</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-sm font-medium">
                {editGame ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
