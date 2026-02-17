"use client";

import type { SWRConfiguration } from "swr";
import useSWRInfinite from "swr/infinite";

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

    const queryParams = new URLSearchParams({
      page: (pageIndex + 1).toString(),
    });

    if (query && !searchByCustomStatus)
      queryParams.append("query", query.toString());
    if (limit)
      queryParams.append("limit", limit.toString());
    if (mode && !searchByCustomStatus)
      queryParams.append("mode", mode.toString());
    if (searchByCustomStatus) {
      queryParams.append("searchByCustomStatus", "true");
    }

    if (status && status.length > 0) {
      status.forEach(s => queryParams.append("status", s));
    }

    const key = `beatmapset/search?${queryParams.toString()}`;

    console.info("[beatmaps-search] request key built", {
      page: pageIndex + 1,
      key,
      query,
      limit,
      mode,
      status,
      searchByCustomStatus,
    });

    return key;
  };

  return useSWRInfinite<GetBeatmapsetSearchResponse>(
    getKey,
    async (key: string) => {
      console.info("[beatmaps-search] request started", { key });

      try {
        const response = await fetcher<GetBeatmapsetSearchResponse>(key);

        console.info("[beatmaps-search] request success", {
          key,
          setsCount: response.sets.length,
          totalCount: response.total_count,
        });

        return response;
      }
      catch (error) {
        console.error("[beatmaps-search] request failed", {
          key,
          error,
        });
        throw error;
      }
    },
    options,
  );
}
