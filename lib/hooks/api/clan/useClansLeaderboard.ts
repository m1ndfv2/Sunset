"use client";

import useSWR from "swr";

import fetcher from "@/lib/services/fetcher";

import type {
  ClansLeaderboardResponse,
  UseClansLeaderboardOptions,
} from "./types";

export function useClansLeaderboard({
  mode,
  page,
  limit,
}: UseClansLeaderboardOptions) {
  return useSWR<ClansLeaderboardResponse>(
    `clan/leaderboard?mode=${mode}${page ? `&page=${page}` : ""}${
      limit ? `&limit=${limit}` : ""
    }`,
    fetcher,
    {
      keepPreviousData: true,
    },
  );
}
