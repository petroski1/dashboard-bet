import { useState } from 'react';
import { useBetting } from '../context/BettingContext';
import type { Category } from '../types';
import { generateId, formatCurrency } from '../utils/format';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const PRESET_COLORS = ['#22c55e', '#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
const PRESET_ICONS = ['⚽', '🏀', '🎾', '🎮', '🥊', '🏈', '⚾', '🏒', '🏐', '🎱', '🏇', '🎯'];

const emptyForm: Omit<Category, 'id'> = {
  name: '',
  color: '#22c55e',
  icon: '⚽',
};

export default function Categorias() {
  const { state, dispatch } = useBetting();
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditCat(null);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, color: cat.color, icon: cat.icon });
    setEditCat(cat);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editCat) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...form, id: editCat.id } });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: { ...form, id: generateId() } });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    setDeleteConfirm(null);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-slate-400 text-sm mt-1">{state.categories.length} categorias cadastradas</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.categories.map(cat => {
          const catBets = state.bets.filter(b => b.categoryId === cat.id);
          const won = catBets.filter(b => b.status === 'won').length;
          const lost = catBets.filter(b => b.status === 'lost').length;
          const profit = catBets.reduce((acc, b) => {
            if (b.status === 'won') return acc + (b.profit ?? b.stake * b.odds - b.stake);
            if (b.status === 'lost') return acc - b.stake;
            return acc;
          }, 0);
          const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

          return (
            <div key={cat.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${cat.color}20` }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{cat.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <span className="text-slate-400 text-xs">{cat.color}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === cat.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg">Ok</button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-700/50 rounded-xl p-2">
                  <p className="text-white font-bold text-lg">{catBets.length}</p>
                  <p className="text-slate-400 text-xs">Apostas</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-2">
                  <p className="text-white font-bold text-lg">{winRate.toFixed(0)}%</p>
                  <p className="text-slate-400 text-xs">Acerto</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-2">
                  <p className={`font-bold text-lg ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                  </p>
                  <p className="text-slate-400 text-xs">Lucro</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-white font-semibold text-lg">{editCat ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Futebol"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-10 h-10 text-xl rounded-xl transition-colors ${form.icon === icon ? 'bg-green-500/30 ring-2 ring-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${form.color}20` }}>
                  {form.icon}
                </div>
                <div>
                  <p className="text-white font-medium">{form.name || 'Prévia'}</p>
                  <p className="text-slate-400 text-xs">{form.color}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-sm font-medium">
                {editCat ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
