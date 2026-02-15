import type { GameMode, UserResponse } from "@/lib/types/api";

export interface ClanResponse {
  id: number;
  name: string;
  avatar_url?: string | null;
  total_pp: number;
  created_at: string;
}

export interface ClanMemberResponse {
  user: UserResponse;
  role: "creator" | "member";
  pp: number;
}

export interface ClanDetailsResponse {
  clan: ClanResponse;
  members: ClanMemberResponse[];
}

export interface ClansLeaderboardResponse {
  clans: ClanResponse[];
  total_count: number;
}

export interface CreateClanRequest {
  name: string;
  avatar_url?: string;
}

export interface UseClansLeaderboardOptions {
  mode: GameMode;
  page?: number;
  limit?: number;
}
