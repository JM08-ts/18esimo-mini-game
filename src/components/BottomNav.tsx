import React from 'react';
import { Camera, Trophy, Image as ImageIcon, Lock } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenAdmin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAdmin,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-lg border-t border-amber-500/20 px-3 pb-[calc(env(safe-area-inset-bottom,8px)+6px)] pt-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab Missioni */}
        <button
          onClick={() => onChangeTab('missions')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'missions'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'missions'
                ? 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30'
                : ''
            }`}
          >
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Missioni</span>
        </button>

        {/* Tab Classifica */}
        <button
          onClick={() => onChangeTab('leaderboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'leaderboard'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30'
                : ''
            }`}
          >
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Classifica</span>
        </button>

        {/* Tab Live Wall */}
        <button
          onClick={() => onChangeTab('livewall')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'livewall'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'livewall'
                ? 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30'
                : ''
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Live Wall</span>
        </button>

        {/* Discreet Admin Button */}
        <button
          onClick={onOpenAdmin}
          className="p-2 text-zinc-600 hover:text-zinc-400 active:text-amber-400 transition-colors rounded-lg"
          title="Area Festeggiato / Admin"
          aria-label="Admin"
        >
          <Lock className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </nav>
  );
};
