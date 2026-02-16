"use client";

import useSWR from "swr";

import type { ClanDetailsResponse } from "@/lib/hooks/api/clan/types";
import { kyInstance } from "@/lib/services/fetcher";
import { GameMode } from "@/lib/types/api";

async function fetchUserClan(userId: number, mode: GameMode): Promise<ClanDetailsResponse | null> {
  const response = await kyInstance.get(`user/${userId}/clan?mode=${mode}`, {
    throwHttpErrors: false,
  });

  if (response.ok)
    return await response.json<ClanDetailsResponse>();

  if (response.status === 404)
    return null;

  throw new Error(await response.text());
}

export function useUserClan(userId: number | null, mode: GameMode = GameMode.STANDARD) {
  return useSWR<ClanDetailsResponse | null>(
    userId ? `user/${userId}/clan?mode=${mode}` : null,
    () => fetchUserClan(userId!, mode),
  );
}
