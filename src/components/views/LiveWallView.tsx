import React from 'react';
import { Camera, Clock, Award, ZoomIn, Download } from 'lucide-react';
import { Submission } from '../../types';

interface LiveWallViewProps {
  submissions: Submission[];
  onOpenLightbox: (submission: Submission) => void;
}

export const LiveWallView: React.FC<LiveWallViewProps> = ({
  submissions,
  onOpenLightbox,
}) => {
  const handleQuickDownload = async (e: React.MouseEvent, sub: Submission) => {
    e.stopPropagation();
    try {
      let blob: Blob;
      if (sub.image_url.startsWith('data:image/')) {
        const parts = sub.image_url.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const binaryStr = atob(parts[1]);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: mime });
      } else {
        const response = await fetch(sub.image_url);
        blob = await response.blob();
      }

      const cleanPlayerName = (sub.player_name || 'Ospite')
        .trim()
        .replace(/[^a-zA-Z0-9_\-]/g, '_');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `18esimo_${cleanPlayerName}_task${sub.task_id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.warn('Fallback download:', err);
      window.open(sub.image_url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Feed Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-400">
            Feed Social Della Serata
          </h2>
          <p className="text-[11px] text-zinc-400">
            Tutti i momenti memorabili condivisi dagli invitati
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-semibold">
          {submissions.length} {submissions.length === 1 ? 'Foto' : 'Foto'}
        </div>
      </div>

      {/* Instagram-style Cards List */}
      <div className="space-y-4">
        {submissions.map((sub) => {
          const dateStr = new Date(sub.created_at).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <article
              key={sub.id}
              onClick={() => onOpenLightbox(sub)}
              className="bg-zinc-900/90 rounded-3xl border border-amber-500/20 overflow-hidden shadow-xl cursor-pointer group hover:border-amber-500/40 transition-all"
            >
              {/* Post Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-zinc-800/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-zinc-950 font-black text-xs shadow-md">
                    {sub.player_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {sub.player_name}
                    </h3>
                    <span className="text-[10px] text-amber-400/90 flex items-center gap-1 font-medium">
                      <Award className="w-3 h-3 text-amber-400" />
                      {sub.task_title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {dateStr}
                  </span>
                  <div className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-bold text-[10px] border border-amber-400/30">
                    +{sub.points} PT
                  </div>
                </div>
              </div>

              {/* Photo */}
              <div className="relative aspect-square sm:aspect-auto sm:max-h-[500px] w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                <img
                  src={sub.image_url}
                  alt={sub.task_title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="px-3 py-1.5 rounded-full bg-zinc-950/80 text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-700">
                    <ZoomIn className="w-4 h-4 text-amber-400" />
                    <span>Visualizza HD</span>
                  </div>
                </div>
              </div>

              {/* Post Footer */}
              <div className="p-3 bg-zinc-900/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-400 truncate max-w-[220px]">
                  Scattata per la <strong className="text-zinc-200">Missione {sub.task_id}</strong>
                </span>

                <button
                  onClick={(e) => handleQuickDownload(e, sub)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 transition-colors"
                  title="Scarica foto"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </article>
          );
        })}

        {submissions.length === 0 && (
          <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800 p-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <Camera className="w-6 h-6 text-amber-500/60" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Nessuna foto ancora pubblicata
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Vai nella tab <strong className="text-amber-400">Missioni</strong> e carica la prima foto della serata!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
