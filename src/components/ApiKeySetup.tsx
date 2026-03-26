import { useState } from 'react';
import { Youtube, Key, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';

export default function ApiKeySetup() {
  const { setApiKey } = useYouTube();
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) { setErr('Cole sua chave de API do YouTube'); return; }
    if (trimmed.length < 20) { setErr('Chave inválida — deve ter mais de 20 caracteres'); return; }
    setApiKey(trimmed);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <Youtube size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TrendScope</h1>
          <p className="text-gray-500 text-sm mt-1">YouTube Trends Dashboard</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-red-400" />
            <h2 className="text-white font-semibold">Configure sua API Key</h2>
          </div>
          <p className="text-gray-500 text-sm mb-5">
            Para buscar dados reais do YouTube você precisa de uma chave da <strong className="text-gray-300">YouTube Data API v3</strong> (gratuita).
          </p>

          {/* Steps */}
          <div className="space-y-2 mb-5">
            {[
              { n: '1', text: 'Acesse o Google Cloud Console' },
              { n: '2', text: 'Crie um projeto e ative a YouTube Data API v3' },
              { n: '3', text: 'Em "Credenciais", crie uma API Key' },
              { n: '4', text: 'Cole a chave abaixo e confirme' },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-300 shrink-0">
                  {s.n}
                </span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>

          <a
            href="https://console.cloud.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 mb-5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors"
          >
            <ExternalLink size={13} />
            Abrir Google Cloud Console
          </a>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={input}
                onChange={(e) => { setInput(e.target.value); setErr(''); }}
                placeholder="Cole sua API Key aqui..."
                className="w-full bg-gray-800 border border-gray-700 focus:border-red-600 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none pr-10 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {err && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span>⚠</span> {err}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Conectar ao YouTube
            </button>
          </form>

          <p className="text-gray-700 text-xs text-center mt-4">
            A chave é salva localmente no seu navegador e nunca enviada a servidores externos.
          </p>
        </div>
      </div>
    </div>
  );
}
