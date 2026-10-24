import React from 'react';
import { Trophy, Crown, Medal, Sparkles, CheckCircle } from 'lucide-react';
import { Player } from '../../types';
import { TOTAL_GOAL_POINTS } from '../../lib/tasks';

interface LeaderboardViewProps {
  players: Player[];
  currentPlayerId: string | null;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  players,
  currentPlayerId,
}) => {
  // Sort players deterministically in frontend as well
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    if (a.completed_at && b.completed_at) {
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    }
    if (a.completed_at) return -1;
    if (b.completed_at) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  return (
    <div className="space-y-4">
      {/* Podium Cards for Top 3 */}
      {sortedPlayers.length > 0 && (
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-center gap-2 sm:gap-3 max-w-sm mx-auto">
            {/* 2nd Place */}
            {top2 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-zinc-400 flex items-center justify-center text-zinc-300 shadow-lg mb-1 relative">
                  <Medal className="w-6 h-6 text-zinc-300" />
                  <span className="absolute -top-2 -right-1 text-[10px] font-black px-1.5 py-0.2 bg-zinc-400 text-zinc-950 rounded-full">
                    2°
                  </span>
                </div>
                <div className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-2.5 text-center flex flex-col items-center">
                  <span className="font-bold text-xs text-white truncate max-w-[85px] block">
                    {top2.name}
                  </span>
                  <span className="text-xs font-black text-zinc-300">
                    {top2.total_points} PT
                  </span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top1 && (
              <div className="flex-1 flex flex-col items-center -translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-yellow-200 flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-500/30 mb-1 relative animate-pulse">
                  <Crown className="w-8 h-8 text-zinc-950" />
                  <span className="absolute -top-2.5 -right-1 text-[11px] font-black px-2 py-0.5 bg-yellow-300 text-zinc-950 rounded-full border border-yellow-500">
                    1°
                  </span>
                </div>
                <div className="w-full bg-gradient-to-b from-amber-950/40 to-zinc-900 border-2 border-amber-400/50 rounded-2xl p-3 text-center flex flex-col items-center shadow-lg shadow-amber-500/10">
                  <span className="font-black text-sm text-amber-200 truncate max-w-[95px] block">
                    {top1.name}
                  </span>
                  <span className="text-sm font-black text-amber-400">
                    {top1.total_points} PT
                  </span>
                  {top1.total_points >= TOTAL_GOAL_POINTS && (
                    <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-tighter mt-0.5">
                      Vincitore
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-amber-700 flex items-center justify-center text-amber-600 shadow-lg mb-1 relative">
                  <Medal className="w-6 h-6 text-amber-600" />
                  <span className="absolute -top-2 -right-1 text-[10px] font-black px-1.5 py-0.2 bg-amber-700 text-white rounded-full">
                    3°
                  </span>
                </div>
                <div className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-2.5 text-center flex flex-col items-center">
                  <span className="font-bold text-xs text-white truncate max-w-[85px] block">
                    {top3.name}
                  </span>
                  <span className="text-xs font-black text-amber-500">
                    {top3.total_points} PT
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Full List */}
      <div className="bg-zinc-900/90 rounded-3xl border border-amber-500/20 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Tutti i Giocatori ({sortedPlayers.length})
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Aggiornamento Live
          </span>
        </div>

        <div className="space-y-2">
          {sortedPlayers.map((p, index) => {
            const isMe = p.id === currentPlayerId;
            const isFinished = p.total_points >= TOTAL_GOAL_POINTS;
            const rank = index + 1;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      rank === 1
                        ? 'bg-yellow-400 text-zinc-950'
                        : rank === 2
                        ? 'bg-zinc-400 text-zinc-950'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Player Name & Tag */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-white truncate max-w-[130px] sm:max-w-[180px]">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-zinc-950">
                          TU
                        </span>
                      )}
                    </div>

                    {isFinished ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-amber-400" />
                        100 PT - FINITO!
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">
                        {p.total_points < TOTAL_GOAL_POINTS ? `Mancano ${TOTAL_GOAL_POINTS - p.total_points} PT` : 'Completato'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black text-amber-400 flex items-center justify-end gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{p.total_points}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">PT</span>
                  </div>
                </div>
              </div>
            );
          })}

          {sortedPlayers.length === 0 && (
            <div className="text-center py-10 text-zinc-500 text-xs">
              Nessun giocatore registrato. Sii il primo a giocare!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
