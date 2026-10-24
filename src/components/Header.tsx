import React from 'react';
import { QrCode, Trophy, Sparkles } from 'lucide-react';
import { Player } from '../types';
import { TOTAL_GOAL_POINTS } from '../lib/tasks';

interface HeaderProps {
  player: Player | null;
  onOpenQR: () => void;
}

export const Header: React.FC<HeaderProps> = ({ player, onOpenQR }) => {
  const points = player?.total_points || 0;
  const progressPercent = Math.min(100, Math.round((points / TOTAL_GOAL_POINTS) * 100));
  const isWinner = points >= TOTAL_GOAL_POINTS;

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-amber-500/20 pt-safe px-4 pb-3">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          {/* Logo & Player Info */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
              <span className="text-zinc-950 font-black text-lg tracking-tight">18</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400/90">
                  Mini Game
                </span>
                {isWinner && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-zinc-950 animate-pulse">
                    <Trophy className="w-2.5 h-2.5" /> 100 PT
                  </span>
                )}
              </div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight truncate max-w-[170px] sm:max-w-[210px]">
                {player ? player.name : 'Giocatore'}
              </h1>
            </div>
          </div>

          {/* Points & QR Button */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                Punteggio
              </div>
              <div className="text-sm font-black text-amber-400 flex items-center justify-end gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{points}</span>
                <span className="text-zinc-500 text-xs font-semibold">/ {TOTAL_GOAL_POINTS} PT</span>
              </div>
            </div>

            <button
              onClick={onOpenQR}
              className="p-2 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 active:scale-95 transition-all shadow-sm"
              title="Condividi o Scansiona QR Code"
              aria-label="Apri QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Animated Gold Progress Bar */}
        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 relative">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 rounded-full transition-all duration-700 ease-out shadow-sm shadow-amber-400/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
};
