"use client";

import type { SWRConfiguration } from "swr";
import useSWRInfinite from "swr/infinite";

import {
  buildBeatmapsetSearchParams,
} from "@/lib/hooks/api/beatmap/beatmapsetSearchParams";
import fetcher from "@/lib/services/fetcher";
import type {
  BeatmapStatusWeb,
  GameMode,
  GetBeatmapsetSearchResponse,
} from "@/lib/types/api";

export function useBeatmapsetSearch(
  query: string,
  limit?: number,
  status?: BeatmapStatusWeb[],
  mode?: GameMode,
  searchByCustomStatus?: boolean,
  options?: SWRConfiguration,
) {
  const getKey = (
    pageIndex: number,
    previousPageData?: GetBeatmapsetSearchResponse,
  ) => {
    if (previousPageData && previousPageData.sets.length === 0)
      return null;

    if (limit === 0)
      return null;

    const params = buildBeatmapsetSearchParams({
      query,
      limit,
      mode,
      page: pageIndex + 1,
      status,
      searchByCustomStatus,
    });

    return `api/v2/search?${params.toString()}`;
  };

  return useSWRInfinite<GetBeatmapsetSearchResponse>(getKey, fetcher, options);
}
