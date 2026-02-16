import { getUserToken } from "@/lib/actions/getUserToken";
import { kyInstance } from "@/lib/services/fetcher";
import poster from "@/lib/services/poster";

import type { ClanDetailsResponse, EditClanAvatarRequest } from "./types";

async function patchClanAvatar(payload: EditClanAvatarRequest) {
  const token = await getUserToken();

  return await kyInstance.patch<ClanDetailsResponse>("clan/avatar", {
    json: payload,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).json();
}

export async function editClanAvatar(payload: EditClanAvatarRequest) {
  try {
    return await patchClanAvatar(payload);
  }
  catch {
    // Kept for compatibility: Sunrise exposes both PATCH and POST for this endpoint.
    return await poster<ClanDetailsResponse>("clan/avatar", {
      json: payload,
    });
  }
}
