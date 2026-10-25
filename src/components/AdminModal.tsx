import React, { useState } from 'react';
import { X, Lock, Trash2, Tv, Download, ShieldCheck, RefreshCw, UserX, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { Player, Submission } from '../types';
import { adminDeleteSubmission, adminDeletePlayer } from '../lib/supabase';

interface AdminModalProps {
  players: Player[];
  submissions: Submission[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onOpenTVMode: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  players,
  submissions,
  onClose,
  onRefresh,
  onOpenTVMode,
}) => {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'players'>('submissions');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1818') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleDeletePhoto = async (sub: Submission) => {
    if (!window.confirm(`Sei sicuro di voler eliminare la foto di ${sub.player_name}? Verranno sottratti ${sub.points} punti dal suo punteggio.`)) {
      return;
    }

    try {
      setActionLoading(`sub-${sub.id}`);
      await adminDeleteSubmission(sub);
      await onRefresh();
    } catch (err: any) {
      alert(`Errore: ${err?.message || 'Eliminazione fallita'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePlayer = async (p: Player) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il giocatore "${p.name}"? Tutte le sue foto caricate verranno eliminate dal gioco.`)) {
      return;
    }

    try {
      setActionLoading(`player-${p.id}`);
      await adminDeletePlayer(p.id);
      await onRefresh();
    } catch (err: any) {
      alert(`Errore: ${err?.message || 'Eliminazione fallita'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadAllPhotos = async () => {
    if (submissions.length === 0) {
      alert('Nessuna foto disponibile per il download.');
      return;
    }

    try {
      setIsZipping(true);
      setZipProgress(`Preparazione ZIP (0/${submissions.length})...`);

      const zip = new JSZip();
      const folder = zip.folder('Foto_18esimo_Jean') || zip;

      for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i];
        setZipProgress(`Aggiunta foto (${i + 1}/${submissions.length})...`);

        // Sanitize player name and task title
        const cleanPlayerName = (sub.player_name || 'Ospite')
          .trim()
          .replace(/[^a-zA-Z0-9_\-]/g, '_');
        const cleanTaskTitle = (sub.task_title || `Task_${sub.task_id}`)
          .trim()
          .replace(/[^a-zA-Z0-9_\-]/g, '_');
        const shortId = (sub.id || String(i + 1)).slice(-6);
        const indexStr = String(i + 1).padStart(2, '0');
        const fileName = `${indexStr}_${cleanPlayerName}_${cleanTaskTitle}_${shortId}.jpg`;

        if (sub.image_url.startsWith('data:image/')) {
          // Direct Base64 extraction
          const base64Data = sub.image_url.split(',')[1];
          if (base64Data) {
            folder.file(fileName, base64Data, { base64: true });
          }
        } else {
          // HTTP/HTTPS URL download
          try {
            const res = await fetch(sub.image_url);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const arrayBuffer = await res.arrayBuffer();
            folder.file(fileName, arrayBuffer);
          } catch (fetchErr) {
            console.warn(`Impossibile scaricare foto ${fileName}:`, fetchErr);
          }
        }
      }

      setZipProgress('Generazione pacchetto ZIP...');

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/zip',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      setZipProgress('Download in corso...');

      const blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Foto_18esimo_Jean.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err: any) {
      console.error('Errore creazione ZIP:', err);
      alert(`Errore creazione file ZIP: ${err?.message || 'Riprova'}`);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  // PIN Gate
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-xs rounded-3xl bg-zinc-900 border border-amber-500/30 p-6 shadow-2xl relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="text-lg font-black text-white tracking-tight mb-1">
            Area Riservata Festeggiato
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            Inserisci il PIN segreto per accedere al pannello di controllo
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />

            {pinError && (
              <p className="text-red-400 text-xs font-semibold animate-shake">
                PIN errato! Riprova.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 active:scale-95 transition-all shadow-md shadow-amber-500/20"
            >
              Sblocca Regia
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="border-b border-amber-500/20 bg-zinc-900/90 pt-safe px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-tight">
              Pannello Regia & Festeggiato
            </h2>
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
              PIN Sbloccato • Controllo Totale
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRefresh()}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Aggiorna dati"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Action Toolbar */}
      <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex flex-wrap gap-2.5">
        <button
          onClick={() => {
            onClose();
            onOpenTVMode();
          }}
          className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Tv className="w-4 h-4" />
          <span>Modalità TV / Maxischermo</span>
        </button>

        <button
          onClick={handleDownloadAllPhotos}
          disabled={isZipping}
          className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95 transition-all"
        >
          {isZipping ? (
            <>
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
              <span className="truncate">{zipProgress || 'Creazione ZIP...'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Scarica Tutte le Foto ({submissions.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-4">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'submissions'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Tutte le Foto ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'players'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Gestione Giocatori ({players.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-safe space-y-3">
        {activeTab === 'submissions' && (
          <>
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <img
                  src={sub.image_url}
                  alt={sub.task_title}
                  className="w-14 h-14 rounded-xl object-cover border border-zinc-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {sub.player_name}
                  </span>
                  <span className="text-[11px] text-amber-400/90 block truncate">
                    {sub.task_title} (+{sub.points} pt)
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(sub.created_at).toLocaleTimeString('it-IT')}
                  </span>
                </div>
                <button
                  disabled={actionLoading === `sub-${sub.id}`}
                  onClick={() => handleDeletePhoto(sub)}
                  className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 transition-all active:scale-95 disabled:opacity-50"
                  title="Elimina foto e sottrai punti"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {submissions.length === 0 && (
              <p className="text-center text-xs text-zinc-500 py-10">
                Nessuna foto ancora caricata.
              </p>
            )}
          </>
        )}

        {activeTab === 'players' && (
          <>
            {players.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white block truncate">
                      {p.name}
                    </span>
                    {p.total_points >= 100 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                        Vincitore
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold block">
                    {p.total_points} PT totali
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Registrato: {new Date(p.created_at).toLocaleTimeString('it-IT')}
                  </span>
                </div>

                <button
                  disabled={actionLoading === `player-${p.id}`}
                  onClick={() => handleDeletePlayer(p)}
                  className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 transition-all active:scale-95 disabled:opacity-50"
                  title="Elimina giocatore di test"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            ))}

            {players.length === 0 && (
              <p className="text-center text-xs text-zinc-500 py-10">
                Nessun giocatore registrato.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
