"use client";

import { twMerge } from "tailwind-merge";

import { useUserMetadata } from "@/lib/hooks/api/user/useUserMetadata";
import type { UserResponse } from "@/lib/types/api";
import { UserBadge } from "@/lib/types/api";
import { getSupporterNicknameColor } from "@/lib/utils/getSupporterNicknameColor";

type Props = {
  user: UserResponse;
  className?: string;
};

export default function UserNickname({ user, className }: Props) {
  const shouldFetchMetadata = user.badges.includes(UserBadge.SUPPORTER);
  const { data: metadata } = useUserMetadata(
    shouldFetchMetadata ? user.user_id : null,
  );

  const metadataNicknameColor = (metadata as { nickname_color?: string | null } | undefined)
    ?.nickname_color;

  const supporterNicknameColor = metadataNicknameColor
    ?? getSupporterNicknameColor(user);

  return (
    <span
      className={twMerge(className)}
      style={
        supporterNicknameColor
          ? { color: supporterNicknameColor }
          : undefined
      }
    >
      {user.username}
    </span>
  );
}
