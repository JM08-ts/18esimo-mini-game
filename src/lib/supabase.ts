import { createClient } from '@supabase/supabase-js';
import { Player, Submission } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sdfxveiitckxkzwdlmyg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_n9gvbbLkRjwdkoGjal9f-Q_ToFfS2oo';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { params: { eventsPerSecond: 10 } },
});

// Admin client using service role key to ensure storage upload is never blocked by RLS policies
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const STORAGE_BUCKET = 'party-photos';

const SYNC_PLAYERS_KEY = 'party_players';
const SYNC_SUBMISSIONS_KEY = 'party_submissions';

function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.details || '').toLowerCase();
  const code = error.code || '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('schema cache') ||
    msg.includes('relation') ||
    msg.includes('not find the table')
  );
}

// -------------------------------------------------------------
// Fallback Storage on patriot_sync
// -------------------------------------------------------------
async function getSyncData<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('patriot_sync')
      .select('data')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) return null;
    return (data.data as T) || null;
  } catch (err) {
    console.warn(`[Supabase Sync] Lettura chiave ${key} non riuscita:`, err);
    return null;
  }
}

async function saveSyncData<T>(key: string, data: T): Promise<void> {
  const payload = {
    key,
    data,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('patriot_sync')
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    // Try with admin client
    await supabaseAdmin
      .from('patriot_sync')
      .upsert(payload, { onConflict: 'key' });
  }
}

// -------------------------------------------------------------
// Exported Core API Functions
// -------------------------------------------------------------

export async function getPlayer(playerId: string): Promise<Player | null> {
  // 1. Try native 'players' table
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .maybeSingle();

    if (!error) return data;
    if (!isTableMissingError(error)) {
      console.error('Errore getPlayer:', error);
      return null;
    }
  } catch (err) {
    console.warn('Errore connessione tabella players, provo sync:', err);
  }

  // 2. Fallback to patriot_sync
  const players = (await getSyncData<Player[]>(SYNC_PLAYERS_KEY)) || [];
  return players.find((p) => p.id === playerId) || null;
}

export async function registerPlayer(name: string): Promise<Player> {
  const trimmed = name.trim();

  // 1. Try native 'players' table
  try {
    const { data, error } = await supabase
      .from('players')
      .insert([{ name: trimmed, total_points: 0 }])
      .select()
      .single();

    if (!error && data) return data;
    if (error && !isTableMissingError(error)) {
      throw new Error(`Errore registrazione giocatore: ${error.message}`);
    }
  } catch (err: any) {
    if (err?.message && !isTableMissingError(err)) {
      throw err;
    }
  }

  // 2. Fallback to patriot_sync
  const currentPlayers = (await getSyncData<Player[]>(SYNC_PLAYERS_KEY)) || [];
  const newPlayer: Player = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: trimmed,
    total_points: 0,
    completed_at: null,
    created_at: new Date().toISOString(),
  };

  const updatedPlayers = [...currentPlayers, newPlayer];
  await saveSyncData(SYNC_PLAYERS_KEY, updatedPlayers);
  return newPlayer;
}

export async function getLeaderboard(): Promise<Player[]> {
  // 1. Try native 'players' table
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_points', { ascending: false })
      .order('completed_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (!error && data) return data;
    if (error && !isTableMissingError(error)) {
      console.error('Errore getLeaderboard:', error);
      return [];
    }
  } catch {
    // fallback
  }

  // 2. Fallback to patriot_sync
  const players = (await getSyncData<Player[]>(SYNC_PLAYERS_KEY)) || [];
  return [...players].sort((a, b) => {
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
}

export async function getAllSubmissions(): Promise<Submission[]> {
  // 1. Try native 'submissions' table
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) return data;
    if (error && !isTableMissingError(error)) {
      console.error('Errore getAllSubmissions:', error);
      return [];
    }
  } catch {
    // fallback
  }

  // 2. Fallback to patriot_sync
  const submissions = (await getSyncData<Submission[]>(SYNC_SUBMISSIONS_KEY)) || [];
  return [...submissions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getPlayerSubmissions(playerId: string): Promise<Submission[]> {
  const all = await getAllSubmissions();
  return all.filter((s) => s.player_id === playerId);
}

export async function submitPhotoTask({
  player,
  taskId,
  taskTitle,
  points,
  blob,
}: {
  player: Player;
  taskId: number;
  taskTitle: string;
  points: number;
  blob: Blob;
}): Promise<{ player: Player; submission: Submission }> {
  const fileExt = 'jpg';
  const fileName = `${player.id}/task_${taskId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  // 1. Upload to Supabase Storage using admin client (bypasses RLS)
  let uploadRes = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadRes.error) {
    // Fallback to anon client
    uploadRes = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });
  }

  if (uploadRes.error) {
    throw new Error(`Errore upload foto su Supabase: ${uploadRes.error.message}`);
  }

  // 2. Public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  const newSubmissionId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newPoints = player.total_points + points;
  const isCompletedNow = newPoints >= 100 && !player.completed_at;

  const newSubmission: Submission = {
    id: newSubmissionId,
    player_id: player.id,
    player_name: player.name,
    task_id: taskId,
    task_title: taskTitle,
    image_url: publicUrl,
    points: points,
    created_at: new Date().toISOString(),
  };

  const updatedPlayer: Player = {
    ...player,
    total_points: newPoints,
    completed_at: isCompletedNow ? new Date().toISOString() : player.completed_at,
  };

  // 3. Try native DB tables first
  try {
    const { error: subError } = await supabase
      .from('submissions')
      .insert([newSubmission]);

    if (!subError) {
      const { data: dbUpdatedPlayer, error: updateError } = await supabase
        .from('players')
        .update({
          total_points: newPoints,
          ...(isCompletedNow ? { completed_at: updatedPlayer.completed_at } : {}),
        })
        .eq('id', player.id)
        .select()
        .single();

      if (!updateError && dbUpdatedPlayer) {
        return { player: dbUpdatedPlayer, submission: newSubmission };
      }
    }
  } catch {
    // fallback
  }

  // 4. Fallback: Save to patriot_sync
  const currentSubs = (await getSyncData<Submission[]>(SYNC_SUBMISSIONS_KEY)) || [];
  await saveSyncData(SYNC_SUBMISSIONS_KEY, [newSubmission, ...currentSubs]);

  const currentPlayers = (await getSyncData<Player[]>(SYNC_PLAYERS_KEY)) || [];
  const updatedPlayerList = currentPlayers.map((p) =>
    p.id === player.id ? updatedPlayer : p
  );
  if (!updatedPlayerList.some((p) => p.id === player.id)) {
    updatedPlayerList.push(updatedPlayer);
  }
  await saveSyncData(SYNC_PLAYERS_KEY, updatedPlayerList);

  return { player: updatedPlayer, submission: newSubmission };
}

export async function adminDeleteSubmission(submission: Submission): Promise<void> {
  // 1. Try native table
  try {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submission.id);

    if (!error) {
      // Recalculate points
      const { data: remainingSubs } = await supabase
        .from('submissions')
        .select('points')
        .eq('player_id', submission.player_id);

      const newTotal = (remainingSubs || []).reduce((acc, curr) => acc + (curr.points || 0), 0);
      await supabase
        .from('players')
        .update({
          total_points: newTotal,
          ...(newTotal < 100 ? { completed_at: null } : {}),
        })
        .eq('id', submission.player_id);
      return;
    }
  } catch {
    // fallback
  }

  // 2. Fallback: patriot_sync
  const currentSubs = (await getSyncData<Submission[]>(SYNC_SUBMISSIONS_KEY)) || [];
  const filteredSubs = currentSubs.filter((s) => s.id !== submission.id);
  await saveSyncData(SYNC_SUBMISSIONS_KEY, filteredSubs);

  const currentPlayers = (await getSyncData<Player[]>(SYNC_PLAYERS_KEY)) || [];
  const playerSubs = filteredSubs.filter((s) => s.player_id === submission.player_id);
  const newTotal = playerSubs.reduce((acc, curr) => acc + (curr.points || 0), 0);

  const updatedPlayers = currentPlayers.map((p) => {
    if (p.id === submission.player_id) {
      return {
        ...p,
        total_points: newTotal,
        ...(newTotal < 100 ? { completed_at: null } : {}),
      };
    }
    return p;
  });
  await saveSyncData(SYNC_PLAYERS_KEY, updatedPlayers);
}

export async function adminDeletePlayer(playerId: string): Promise<void> {
  // 1. Try native table
  try {
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (!error) return;
  } catch {
    // fallback
  }

  // 2. Fallback: patriot_sync
  const currentPlayers = (await getSyncData<Player[]>(SYNC_PLAYERS_KEY)) || [];
  const filteredPlayers = currentPlayers.filter((p) => p.id !== playerId);
  await saveSyncData(SYNC_PLAYERS_KEY, filteredPlayers);

  const currentSubs = (await getSyncData<Submission[]>(SYNC_SUBMISSIONS_KEY)) || [];
  const filteredSubs = currentSubs.filter((s) => s.player_id !== playerId);
  await saveSyncData(SYNC_SUBMISSIONS_KEY, filteredSubs);
}
