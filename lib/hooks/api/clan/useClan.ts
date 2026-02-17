"use client";

import useSWR from "swr";

import fetcher from "@/lib/services/fetcher";
import type { GameMode } from "@/lib/types/api";

import type { ClanDetailsResponse } from "./types";

export function useClan(id: number, mode: GameMode) {
  return useSWR<ClanDetailsResponse>(
    Number.isFinite(id) && id > 0 ? `clan/${id}?mode=${mode}` : null,
    fetcher,
  );
}

export function useUserClan(userId: number, mode: GameMode) {
  return useSWR<ClanDetailsResponse>(
    Number.isFinite(userId) && userId > 0
      ? `user/${userId}/clan?mode=${mode}`
      : null,
    fetcher,
  );
}
