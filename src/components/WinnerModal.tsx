import React, { useEffect } from 'react';
import { Trophy, Sparkles, X, Award } from 'lucide-react';
import { firePartyConfetti } from '../lib/soundOrConfetti';

interface WinnerModalProps {
  playerName: string;
  onClose: () => void;
  onViewLeaderboard: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  playerName,
  onClose,
  onViewLeaderboard,
}) => {
  useEffect(() => {
    firePartyConfetti();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border-2 border-amber-400 p-6 shadow-2xl relative text-center overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          aria-label="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center shadow-xl shadow-amber-500/40 mb-4 animate-bounce">
          <Trophy className="w-10 h-10 text-zinc-950" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vittoria Epica</span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          COMPLIMENTI, {playerName.toUpperCase()}!
        </h2>
        <p className="text-lg font-bold text-amber-400 mb-3">
          100 / 100 PUNTI!
        </p>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          Hai completato tutte le sfide fotografiche della festa! Sei ufficialmente tra i protagonisti indiscussi del 18° di Jean!
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              firePartyConfetti();
              onViewLeaderboard();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Guarda la tua Posizione in Classifica</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-zinc-400 hover:text-white bg-zinc-800/60 transition-colors"
          >
            Chiudi e continua a festeggiare
          </button>
        </div>
      </div>
    </div>
  );
};
