"use client";

import useSWR from "swr";

import type { ClanDetailsResponse } from "@/lib/hooks/api/clan/types";
import { kyInstance } from "@/lib/services/fetcher";

async function fetchUserClan(userId: number): Promise<ClanDetailsResponse | null> {
  const endpoints = [`user/${userId}/clan`, `clan/user/${userId}`];

  for (const endpoint of endpoints) {
    const response = await kyInstance.get(endpoint, {
      throwHttpErrors: false,
    });

    if (response.ok)
      return await response.json<ClanDetailsResponse>();

    if (response.status !== 404)
      break;
  }

  return null;
}

export function useUserClan(userId: number | null) {
  return useSWR<ClanDetailsResponse | null>(
    userId ? `user/${userId}/clan` : null,
    () => fetchUserClan(userId!),
  );
}
