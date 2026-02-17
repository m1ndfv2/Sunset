import { getUserToken } from "@/lib/actions/getUserToken";
import { kyInstance } from "@/lib/services/fetcher";

export async function deleteClan() {
  const token = await getUserToken();

  await kyInstance.delete("clan", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
