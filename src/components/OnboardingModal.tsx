import React, { useState } from 'react';
import { Sparkles, Trophy, Camera, ArrowRight, Loader2 } from 'lucide-react';

interface OnboardingModalProps {
  onJoin: (name: string) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Inserisci il tuo nome per iniziare!');
      return;
    }
    if (trimmed.length > 25) {
      setError('Il nome non può superare 25 caratteri.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onJoin(trimmed);
    } catch (err: any) {
      setError(err?.message || 'Errore durante la registrazione. Riprova!');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-xl">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-amber-500/30 p-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Badge 18 */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
            <span className="text-zinc-950 font-black text-2xl tracking-tighter">18</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MINI GAME FOTOGRAFICO</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight mb-2">
            18° Compleanno
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Completa le sfide fotografiche, carica le foto della festa e accumula <strong className="text-amber-400">100 punti</strong> per vincere il trofeo!
          </p>

          {/* Quick rules preview */}
          <div className="grid grid-cols-2 gap-2 mb-6 text-left">
            <div className="bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-[11px] text-zinc-300">
                <span className="font-bold text-white block">6 Missioni</span>
                Foto & sfide
              </div>
            </div>
            <div className="bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-[11px] text-zinc-300">
                <span className="font-bold text-white block">Obiettivo 100 PT</span>
                Vince chi finisce prima!
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-left text-xs font-semibold text-zinc-300 mb-1.5">
                Il tuo Nome o Soprannome
              </label>
              <input
                id="playerName"
                type="text"
                autoFocus
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Marco, Giulia, Il Bomber..."
                maxLength={25}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-amber-500/40 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-base transition-all"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-950/50 border border-red-800/60 rounded-xl p-2.5 text-left">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-wide text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Accesso alla festa...</span>
                </>
              ) : (
                <>
                  <span>Inizia a Giocare</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
