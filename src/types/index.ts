export interface Player {
  id: string;
  name: string;
  total_points: number;
  completed_at: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  player_id: string;
  player_name: string;
  task_id: number;
  task_title: string;
  image_url: string;
  points: number;
  created_at: string;
}

export interface TaskConfig {
  id: number;
  title: string;
  description: string;
  points: number;
  maxSubmissions: number;
  maxTotalPoints: number;
}

export type TabType = 'missions' | 'leaderboard' | 'livewall';
