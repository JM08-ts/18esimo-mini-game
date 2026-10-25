import React, { useState, useEffect } from 'react';
import { X, Trophy, Maximize, Minimize, Sparkles, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Player, Submission } from '../types';

interface TVModeModalProps {
  players: Player[];
  submissions: Submission[];
  onClose: () => void;
}

export const TVModeModal: React.FC<TVModeModalProps> = ({
  players,
  submissions,
  onClose,
}) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://18esimo-game.local';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(currentUrl)}`;

  // Auto-rotate photos every 5 seconds
  useEffect(() => {
    if (submissions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPhotoIdx((prev) => (prev + 1) % submissions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [submissions.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const top5Players = players.slice(0, 5);
  const activeSubmission = submissions[currentPhotoIdx];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col p-4 sm:p-6 overflow-hidden select-none">
      {/* Top TV Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center font-black text-2xl text-zinc-950 shadow-lg shadow-amber-500/20">
            18
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              18° di Jean <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            </h1>
            <span className="text-xs uppercase tracking-widest text-amber-400/90 font-bold">
              Modalità Regia & Maxischermo
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-300 hover:text-white transition-all"
            title="Schermo Intero"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-500/20 hover:border-red-500/40 text-zinc-300 hover:text-red-400 transition-all"
            title="Esci dalla modalità TV"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Photo Live Carousel (65%), Right side Leaderboard + QR (35%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 min-h-0">
        {/* Left Side: Photo Slider */}
        <div className="lg:col-span-8 flex flex-col bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              Live Wall In Tempo Reale ({submissions.length} foto)
            </span>
            {submissions.length > 0 && (
              <span className="text-xs text-zinc-400 font-mono">
                {currentPhotoIdx + 1} / {submissions.length}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-0">
            {activeSubmission ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <img
                  src={activeSubmission.image_url}
                  alt={activeSubmission.task_title}
                  className="max-h-[58vh] sm:max-h-[64vh] max-w-full object-contain rounded-2xl shadow-2xl border border-zinc-800"
                />

                {/* Subtitle overlay */}
                <div className="absolute bottom-2 left-4 right-4 bg-zinc-950/80 backdrop-blur-md rounded-2xl p-3 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-zinc-950 font-bold flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {activeSubmission.player_name}
                      </span>
                      <span className="text-[11px] text-amber-400">
                        Missione {activeSubmission.task_id}: {activeSubmission.task_title}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-black text-xs">
                    +{activeSubmission.points} PT
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-12">
                <p className="text-base font-semibold">In attesa del primo scatto della serata!</p>
                <p className="text-xs mt-1">Scansiona il QR Code a destra per iniziare.</p>
              </div>
            )}

            {/* Slider Nav Buttons */}
            {submissions.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhotoIdx((prev) => (prev - 1 + submissions.length) % submissions.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-950/70 border border-zinc-700 text-white hover:bg-zinc-900 transition-all"
                  aria-label="Precedente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPhotoIdx((prev) => (prev + 1) % submissions.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-950/70 border border-zinc-700 text-white hover:bg-zinc-900 transition-all"
                  aria-label="Successiva"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Leaderboard Top 5 + Big QR */}
        <div className="lg:col-span-4 flex flex-col space-y-4 min-h-0">
          {/* Top 5 Leaderboard */}
          <div className="flex-1 bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-4 flex flex-col min-h-0">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              Classifica Live • Top 5
            </h2>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {top5Players.map((p, idx) => {
                const isFinished = p.total_points >= 100;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : idx === 1
                        ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
                        : idx === 2
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                        : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 text-center font-black text-sm text-zinc-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}°`}
                      </span>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-white block truncate max-w-[120px] sm:max-w-[150px]">
                          {p.name}
                        </span>
                        {isFinished && (
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                            🏆 100 PT - Finito!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400">
                        {p.total_points}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-0.5">PT</span>
                    </div>
                  </div>
                );
              })}

              {top5Players.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-6">
                  Nessun giocatore registrato al momento.
                </p>
              )}
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-amber-500/30 p-4 text-center flex flex-col items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
              Scansiona e Gioca Ora!
            </h3>
            <p className="text-[11px] text-zinc-400 mb-2">
              Inquadra con il tuo smartphone per entrare nella sfida
            </p>

            <div className="w-36 h-36 p-2 bg-white rounded-2xl shadow-lg border-2 border-amber-400/50 mb-2">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="text-[11px] font-mono text-zinc-400 truncate max-w-full">
              {currentUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
