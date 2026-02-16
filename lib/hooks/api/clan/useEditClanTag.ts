import { getUserToken } from "@/lib/actions/getUserToken";
import { kyInstance } from "@/lib/services/fetcher";
import poster from "@/lib/services/poster";

import type { ClanDetailsResponse, EditClanTagRequest } from "./types";

async function patchClanTag(payload: EditClanTagRequest) {
  const token = await getUserToken();

  return await kyInstance.patch<ClanDetailsResponse>("clan/tag", {
    json: payload,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).json();
}

export async function editClanTag(payload: EditClanTagRequest) {
  try {
    return await patchClanTag(payload);
  }
  catch {
    return await poster<ClanDetailsResponse>("clan/tag", {
      json: payload,
    });
  }
}
