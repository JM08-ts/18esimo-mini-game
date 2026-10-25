import React from 'react';
import { X, Download, User, Calendar, Award } from 'lucide-react';
import { Submission } from '../types';

interface LightboxModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ submission, onClose }) => {
  if (!submission) return null;

  const dateStr = new Date(submission.created_at).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownload = async () => {
    try {
      let blob: Blob;
      if (submission.image_url.startsWith('data:image/')) {
        const parts = submission.image_url.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const binaryStr = atob(parts[1]);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: mime });
      } else {
        const response = await fetch(submission.image_url);
        blob = await response.blob();
      }

      const cleanPlayerName = (submission.player_name || 'Ospite')
        .trim()
        .replace(/[^a-zA-Z0-9_\-]/g, '_');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `18esimo_${cleanPlayerName}_task${submission.task_id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.warn('Fallback download:', err);
      // Direct window open fallback
      window.open(submission.image_url, '_blank');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950/95 backdrop-blur-2xl p-4 animate-in fade-in duration-200"
    >
      {/* Top action bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between z-10 pt-safe"
      >
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {submission.player_name}
            </h3>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500" /> {dateStr}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-amber-400 hover:bg-zinc-700 active:scale-95 transition-all"
            title="Scarica foto HD"
            aria-label="Scarica foto HD"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white active:scale-95 transition-all"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Center */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 flex items-center justify-center my-4 overflow-hidden"
      >
        <img
          src={submission.image_url}
          alt={submission.task_title}
          className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-zinc-800"
        />
      </div>

      {/* Bottom info banner */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md mx-auto w-full bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between text-xs pb-[calc(env(safe-area-inset-bottom,8px)+6px)]"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              Missione {submission.task_id}
            </span>
            <span className="font-semibold text-white">
              {submission.task_title}
            </span>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/40">
          +{submission.points} PT
        </div>
      </div>
    </div>
  );
};
