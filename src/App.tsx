import { useState, useEffect, useCallback } from 'react';
import { Player, Submission, TabType } from './types';
import {
  getPlayer,
  registerPlayer,
  getLeaderboard,
  getAllSubmissions,
  supabase,
} from './lib/supabase';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { QRCodeModal } from './components/QRCodeModal';
import { LightboxModal } from './components/LightboxModal';
import { WinnerModal } from './components/WinnerModal';
import { AdminModal } from './components/AdminModal';
import { TVModeModal } from './components/TVModeModal';
import { MissionsView } from './components/views/MissionsView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { LiveWallView } from './components/views/LiveWallView';
import { firePartyConfetti } from './lib/soundOrConfetti';
import { TOTAL_GOAL_POINTS } from './lib/tasks';
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'party_player_id';

export function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('missions');

  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Modals state
  const [showQRModal, setShowQRModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showTVModal, setShowTVModal] = useState(false);
  const [activeLightboxSub, setActiveLightboxSub] = useState<Submission | null>(null);

  // 1. Initial Data Load & Player Session Resolution
  const refreshData = useCallback(async () => {
    try {
      const [allPlayers, allSubs] = await Promise.all([
        getLeaderboard(),
        getAllSubmissions(),
      ]);
      setLeaderboard(allPlayers);
      setSubmissions(allSubs);

      // Keep current player in sync with latest leaderboard score
      setPlayer((current) => {
        if (!current) return null;
        const found = allPlayers.find((p) => p.id === current.id);
        if (found) {
          if (found.total_points >= TOTAL_GOAL_POINTS && current.total_points < TOTAL_GOAL_POINTS) {
            firePartyConfetti();
            setShowWinnerModal(true);
          }
          return found;
        }
        return current;
      });
    } catch (err: any) {
      console.warn('Errore refreshData:', err);
    }
  }, []);

  useEffect(() => {
    async function initSession() {
      setIsLoadingPlayer(true);
      const savedPlayerId = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (savedPlayerId) {
        try {
          const dbPlayer = await getPlayer(savedPlayerId);
          if (dbPlayer) {
            setPlayer(dbPlayer);
          } else {
            // Player ID in localStorage does not exist in DB (e.g. database wiped)
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setPlayer(null);
          }
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setPlayer(null);
        }
      }

      await refreshData();
      setIsLoadingPlayer(false);
    }

    initSession();
  }, [refreshData]);

  // 2. Realtime Subscriptions & Heartbeat Polling for Mobile Safari & Android
  useEffect(() => {
    // A. Supabase Realtime Channel
    const channel = supabase
      .channel('party_game_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => {
          refreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        () => {
          refreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patriot_sync' },
        () => {
          refreshData();
        }
      )
      .subscribe();

    // B. Heartbeat polling (every 3 seconds) for mobile network resilience
    const pollInterval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [refreshData]);

  // 3. Handle Player Registration from Onboarding
  const handleJoin = async (name: string) => {
    const newPlayer = await registerPlayer(name);
    localStorage.setItem(LOCAL_STORAGE_KEY, newPlayer.id);
    setPlayer(newPlayer);
    setLeaderboard((prev) => {
      if (prev.some((p) => p.id === newPlayer.id)) return prev;
      return [...prev, newPlayer];
    });
  };

  // 4. Handle Successful Submission from MissionsView
  const handleSubmissionSuccess = (updatedPlayer: Player, newSub: Submission) => {
    setPlayer(updatedPlayer);
    setSubmissions((prev) => [newSub, ...prev.filter((s) => s.id !== newSub.id)]);
    setLeaderboard((prev) =>
      prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
    );

    // If player just hit 100 points, celebrate!
    if (updatedPlayer.total_points >= TOTAL_GOAL_POINTS) {
      firePartyConfetti();
      setShowWinnerModal(true);
    }
  };

  // Submissions for the current player
  const mySubmissions = player
    ? submissions.filter((s) => s.player_id === player.id)
    : [];

  if (isLoadingPlayer) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-pulse">
          <span className="text-zinc-950 font-black text-2xl tracking-tight">18</span>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-amber-400 mb-2" />
        <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
          Caricamento 18esimo Mini Game...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-zinc-950 relative">
      {/* Onboarding if player is not set */}
      {!player && <OnboardingModal onJoin={handleJoin} />}

      {/* Main Header */}
      <Header player={player} onOpenQR={() => setShowQRModal(true)} />

      {/* Main Views Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-28">
        {activeTab === 'missions' && player && (
          <MissionsView
            player={player}
            submissions={mySubmissions}
            onSubmissionSuccess={handleSubmissionSuccess}
            onOpenLightbox={(sub) => setActiveLightboxSub(sub)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            players={leaderboard}
            currentPlayerId={player?.id || null}
          />
        )}

        {activeTab === 'livewall' && (
          <LiveWallView
            submissions={submissions}
            onOpenLightbox={(sub) => setActiveLightboxSub(sub)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Modals */}
      {showQRModal && <QRCodeModal onClose={() => setShowQRModal(false)} />}

      {showWinnerModal && player && (
        <WinnerModal
          playerName={player.name}
          onClose={() => setShowWinnerModal(false)}
          onViewLeaderboard={() => setActiveTab('leaderboard')}
        />
      )}

      {activeLightboxSub && (
        <LightboxModal
          submission={activeLightboxSub}
          onClose={() => setActiveLightboxSub(null)}
        />
      )}

      {showAdminModal && (
        <AdminModal
          players={leaderboard}
          submissions={submissions}
          onClose={() => setShowAdminModal(false)}
          onRefresh={refreshData}
          onOpenTVMode={() => {
            setShowAdminModal(false);
            setShowTVModal(true);
          }}
        />
      )}

      {showTVModal && (
        <TVModeModal
          players={leaderboard}
          submissions={submissions}
          onClose={() => setShowTVModal(false)}
        />
      )}
    </div>
  );
}

export default App;
