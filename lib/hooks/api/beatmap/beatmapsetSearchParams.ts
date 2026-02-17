import type { GameMode } from "@/lib/types/api";

export type RankStatusInt = -2 | -1 | 0 | 1 | 2 | 3 | 4;

const UI_STATUS_TO_API_STATUS: Record<string, RankStatusInt> = {
  Graveyard: -2,
  Wip: -1,
  Pending: 0,
  Ranked: 1,
  Approved: 2,
  Qualified: 3,
  Loved: 4,
};

export function mapUiStatusesToApiStatuses(uiStatuses: string[]): number[] {
  const mappedStatuses = uiStatuses
    .map(status => UI_STATUS_TO_API_STATUS[status])
    .filter((status): status is RankStatusInt => status != null);

  return Array.from(new Set(mappedStatuses));
}

export interface BeatmapsetSearchParamsInput {
  query?: string;
  limit?: number;
  page: number;
  status?: string[];
  mode?: GameMode;
  searchByCustomStatus?: boolean;
}

export function buildBeatmapsetSearchParams(input: BeatmapsetSearchParamsInput): URLSearchParams {
  const {
    query,
    limit,
    page,
    status,
    mode,
    searchByCustomStatus,
  } = input;

  const params = new URLSearchParams();

  const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1;

  if (limit != null && limit > 0) {
    params.append("limit", limit.toString());

    const offset = (normalizedPage - 1) * limit;
    params.append("offset", offset.toString());
  }

  if (!searchByCustomStatus && query != null && query.trim().length > 0)
    params.append("query", query.trim());

  if (!searchByCustomStatus && mode != null)
    params.append("mode", mode.toString());

  const apiStatuses = mapUiStatusesToApiStatuses(status ?? []);

  if (apiStatuses.length > 0) {
    apiStatuses.forEach((apiStatus) => {
      params.append("status", apiStatus.toString());
    });
  }

  return params;
}
