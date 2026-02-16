import { getUserToken } from "@/lib/actions/getUserToken";
import { kyInstance } from "@/lib/services/fetcher";

import type { ClanDetailsResponse, EditClanDescriptionRequest } from "./types";

export async function editClanDescription(payload: EditClanDescriptionRequest) {
  const token = await getUserToken();

  return await kyInstance.patch<ClanDetailsResponse>("clan/description", {
    json: payload,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).json();
}
