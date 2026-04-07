import { useEffect, useState } from 'react'
import { Star, Check, Trash2, Shield, LogOut, Eye, Clock, ThumbsUp } from 'lucide-react'
import { supabase, type Review } from '../../lib/supabase'

const ADMIN_PASSWORD = 'lojamilitar2026'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-300'}
        />
      ))}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} rounded-xl p-3`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      onLogin()
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-800 rounded-full p-4 mb-3">
            <Shield size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-400 text-sm mt-1">Loja Militar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              placeholder="Digite a senha"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm">Senha incorreta.</p>}
          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminReviews() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')

  useEffect(() => {
    if (authed) fetchReviews()
  }, [authed])

  async function fetchReviews() {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    setReviews(data ?? [])
    setLoading(false)
  }

  async function approve(id: string) {
    await supabase.from('reviews').update({ approved: true }).eq('id', id)
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)))
  }

  async function remove(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  function logout() {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const pending = reviews.filter((r) => !r.approved)
  const approved = reviews.filter((r) => r.approved)
  const displayed = tab === 'pending' ? pending : approved

  const avgRating =
    approved.length > 0
      ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1)
      : '-'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-yellow-400" />
            <div>
              <h1 className="font-bold text-lg">Painel Admin — Loja Militar</h1>
              <p className="text-green-200 text-xs">Gerenciamento de avaliações</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-green-200 hover:text-white text-sm transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={reviews.length} icon={Eye} color="bg-slate-500" />
          <StatCard label="Pendentes" value={pending.length} icon={Clock} color="bg-yellow-500" />
          <StatCard label="Aprovadas" value={approved.length} icon={ThumbsUp} color="bg-green-600" />
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">Média</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{avgRating}</p>
            {approved.length > 0 && (
              <StarDisplay rating={Math.round(Number(avgRating))} />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('pending')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pendentes {pending.length > 0 && `(${pending.length})`}
          </button>
          <button
            onClick={() => setTab('approved')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Aprovadas ({approved.length})
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {tab === 'pending' ? 'Nenhuma avaliação pendente.' : 'Nenhuma avaliação aprovada ainda.'}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <StarDisplay rating={review.rating} />
                      {!review.approved && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      )}
                      {review.approved && (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Aprovada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(review.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!review.approved && (
                      <button
                        onClick={() => approve(review.id)}
                        className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        <Check size={16} />
                        Aprovar
                      </button>
                    )}
                    <button
                      onClick={() => remove(review.id)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
