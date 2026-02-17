import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import { useUserSelf } from "@/lib/hooks/api/user/useUser";
import poster from "@/lib/services/poster";
import type {
  EditUserMetadataRequest,
  GetUserByIdMetadataResponse,
} from "@/lib/types/api";

export function useUserMetadata(userId: number | null) {
  return useSWR<GetUserByIdMetadataResponse>(
    userId ? `user/${userId}/metadata` : null,
  );
}

export function useEditUserMetadata() {
  const { data } = useUserSelf();
  return useSWRMutation(
    data ? `user/${data.user_id}/metadata` : null,
    editMetadata,
  );
}

export type EditNicknameColorRequest = {
  nickname_color: string;
};

export function useEditNicknameColor() {
  const { data } = useUserSelf();

  return useSWRMutation(
    data ? `user/${data.user_id}/metadata` : null,
    async (_url: string, { arg }: { arg: EditNicknameColorRequest }) => {
      const result = await poster("user/edit/nickname-color", {
        json: arg,
      });

      mutate(`user/${data?.user_id}`);
      mutate(`user/${data?.user_id}/metadata`);

      return result;
    },
  );
}

async function editMetadata(url: string, { arg }: { arg: EditUserMetadataRequest }) {
  return await poster(`user/edit/metadata`, {
    json: {
      ...arg,
    },
  });
}
