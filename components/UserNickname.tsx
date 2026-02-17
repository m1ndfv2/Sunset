import { twMerge } from "tailwind-merge";

import type { UserResponse } from "@/lib/types/api";
import { getSupporterNicknameColor } from "@/lib/utils/getSupporterNicknameColor";

type Props = {
  user: UserResponse;
  className?: string;
};

export default function UserNickname({ user, className }: Props) {
  const supporterNicknameColor = getSupporterNicknameColor(user);

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
