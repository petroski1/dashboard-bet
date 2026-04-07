import { useEffect, useState } from 'react'
import { Star, Send, Shield, CheckCircle } from 'lucide-react'
import { supabase, type Review } from '../../lib/supabase'

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          onMouseEnter={() => onRate && setHovered(star)}
          onMouseLeave={() => onRate && setHovered(0)}
          className={onRate ? 'cursor-pointer' : 'cursor-default'}
          disabled={!onRate}
        >
          <Star
            size={onRate ? 32 : 20}
            className={
              star <= (hovered || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{review.name}</p>
          <p className="text-sm text-gray-400">{date}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
    </div>
  )
}

export default function PublicReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', rating: 0, comment: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    setReviews(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Digite seu nome.')
    if (form.rating === 0) return setError('Selecione uma nota.')
    if (form.comment.trim().length < 10) return setError('Escreva um comentário com pelo menos 10 caracteres.')

    setSubmitting(true)
    const { error: err } = await supabase.from('reviews').insert({
      name: form.name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
    })
    setSubmitting(false)

    if (err) {
      setError('Erro ao enviar. Tente novamente.')
    } else {
      setSubmitted(true)
      setForm({ name: '', rating: 0, comment: '' })
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center gap-4">
          <div className="bg-green-700 rounded-full p-3">
            <Shield size={32} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Loja Militar</h1>
            <p className="text-green-200 text-sm">Equipamentos e vestuário tático</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Resumo de avaliações */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
              <StarRating rating={Math.round(Number(avgRating))} />
              <p className="text-sm text-gray-400 mt-1">{reviews.length} avaliações</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-gray-500">{star}</span>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-gray-400">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Deixe sua avaliação</h2>

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle size={48} className="text-green-500" />
              <p className="font-semibold text-gray-900">Avaliação enviada!</p>
              <p className="text-gray-500 text-sm">
                Obrigado pelo feedback. Sua avaliação será exibida após aprovação.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-green-700 text-sm font-medium underline"
              >
                Enviar outra avaliação
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nota</label>
                <StarRating rating={form.rating} onRate={(r) => setForm({ ...form, rating: r })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentário</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Conte sua experiência com a loja..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <Send size={16} />
                {submitting ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </form>
          )}
        </div>

        {/* Lista de avaliações */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Avaliações dos clientes
          </h2>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Carregando avaliações...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Nenhuma avaliação ainda. Seja o primeiro!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-8 text-gray-400 text-sm">
        © {new Date().getFullYear()} Loja Militar · Todos os direitos reservados
      </footer>
    </div>
  )
}
