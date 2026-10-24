import React, { useState, useRef } from 'react';
import { Camera, CheckCircle2, Plus, Sparkles, Loader2, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { Player, Submission, TaskConfig } from '../../types';
import { GAME_TASKS } from '../../lib/tasks';
import { compressImage } from '../../lib/compressImage';
import { submitPhotoTask } from '../../lib/supabase';

interface MissionsViewProps {
  player: Player;
  submissions: Submission[];
  onSubmissionSuccess: (updatedPlayer: Player, newSub: Submission) => void;
  onOpenLightbox: (submission: Submission) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  player,
  submissions,
  onSubmissionSuccess,
  onOpenLightbox,
}) => {
  const [uploadingTaskId, setUploadingTaskId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hidden file input ref per task
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFileChange = async (task: TaskConfig, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTaskId(task.id);
      setStatusMessage('Compressione e ottimizzazione HD...');
      setErrorMessage(null);

      // 1. Client-Side High-Speed Canvas Compression (max 1920px, 0.85 jpeg)
      const { blob } = await compressImage(file);

      setStatusMessage('Invio foto alla festa...');

      // 2. Upload to Supabase Storage & insert Submission
      const result = await submitPhotoTask({
        player,
        taskId: task.id,
        taskTitle: task.title,
        points: task.points,
        blob,
      });

      setStatusMessage('Completato con successo!');
      onSubmissionSuccess(result.player, result.submission);
    } catch (err: any) {
      console.error('Errore invio foto:', err);
      setErrorMessage(err?.message || 'Errore durante il caricamento della foto. Riprova!');
    } finally {
      // Reset input value so user can upload another photo if needed
      if (e.target) e.target.value = '';
      setUploadingTaskId(null);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const triggerUpload = (taskId: number) => {
    if (uploadingTaskId !== null) return; // Prevent double click
    fileInputRefs.current[taskId]?.click();
  };

  // Group submissions by task_id for this player
  const taskSubmissionsMap = submissions.reduce<{ [taskId: number]: Submission[] }>(
    (acc, sub) => {
      if (!acc[sub.task_id]) acc[sub.task_id] = [];
      acc[sub.task_id].push(sub);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {/* Status or error toast banner */}
      {statusMessage && (
        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-950/60 border border-red-800/60 text-red-300 px-4 py-3 rounded-2xl text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* 6 Mission Cards */}
      <div className="space-y-3.5">
        {GAME_TASKS.map((task) => {
          const isTask6 = task.id === 6;
          const playerTaskSubs = taskSubmissionsMap[task.id] || [];
          const count = playerTaskSubs.length;
          const isCompleted = count >= task.maxSubmissions;
          const isUploadingThis = uploadingTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`rounded-3xl p-4 sm:p-5 border transition-all relative overflow-hidden ${
                isCompleted
                  ? 'bg-zinc-900/95 border-emerald-500/30'
                  : 'bg-zinc-900/85 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              {/* Top Row: Mission Header & Points Badge */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : task.id}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 block">
                      Missione {task.id}
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                      {task.title}
                    </h2>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 flex-shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>
                    {isTask6
                      ? `${count * task.points} / ${task.maxTotalPoints} PT`
                      : `+${task.points} PT`}
                  </span>
                </div>
              </div>

              {/* Task Description */}
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                {task.description}
              </p>

              {/* Hidden File Input for universal camera or gallery picker */}
              <input
                type="file"
                accept="image/*"
                ref={(el) => (fileInputRefs.current[task.id] = el)}
                onChange={(e) => handleFileChange(task, e)}
                className="hidden"
                disabled={isUploadingThis || uploadingTaskId !== null}
              />

              {/* Specific Content for Tasks 1-5 */}
              {!isTask6 && (
                <div>
                  {isCompleted && playerTaskSubs[0] ? (
                    <div className="flex items-center justify-between bg-zinc-950/70 rounded-2xl p-2.5 border border-emerald-500/20">
                      <div className="flex items-center space-x-3">
                        <div
                          onClick={() => onOpenLightbox(playerTaskSubs[0])}
                          className="relative group cursor-pointer"
                        >
                          <img
                            src={playerTaskSubs[0].image_url}
                            alt={task.title}
                            className="w-14 h-14 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div>
                          <div className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completata (+10 pt)</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">
                            {new Date(playerTaskSubs[0].created_at).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenLightbox(playerTaskSubs[0])}
                        className="p-2 text-zinc-400 hover:text-white"
                        title="Vedi foto a tutto schermo"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => triggerUpload(task.id)}
                      disabled={isUploadingThis || uploadingTaskId !== null}
                      className="w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUploadingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>Compressione e invio in corso...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>Carica Foto (+{task.points} PT)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Specific Content for Task 6 ("Scatto Libero") */}
              {isTask6 && (
                <div className="space-y-3">
                  {/* Progress bar and counter */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Foto caricate:</span>
                      <strong className="text-amber-400">{count} / {task.maxSubmissions}</strong>
                    </span>
                    <span className="text-zinc-400 text-[11px]">
                      {count * task.points} / {task.maxTotalPoints} pt
                    </span>
                  </div>

                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${(count / task.maxSubmissions) * 100}%` }}
                    />
                  </div>

                  {/* Thumbnail Gallery of Task 6 Photos */}
                  {playerTaskSubs.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                      {playerTaskSubs.map((sub, idx) => (
                        <div
                          key={sub.id}
                          onClick={() => onOpenLightbox(sub)}
                          className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700 cursor-pointer bg-zinc-950"
                        >
                          <img
                            src={sub.image_url}
                            alt={`Scatto libero ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button for Task 6 */}
                  {count < task.maxSubmissions ? (
                    <button
                      onClick={() => triggerUpload(task.id)}
                      disabled={isUploadingThis || uploadingTaskId !== null}
                      className="w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUploadingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>Compressione e invio in corso...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Aggiungi Foto (+5 PT) ({count}/{task.maxSubmissions})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl p-3 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Hai raggiunto il massimo di 10 foto per lo Scatto Libero! (+50 pt)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
