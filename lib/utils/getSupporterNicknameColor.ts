import type { UserResponse } from "@/lib/types/api";
import { UserBadge } from "@/lib/types/api";

type UserWithNicknameColor = UserResponse & { nickname_color?: string | null };

const HEX_COLOR_REGEX = /^#(?:[0-9A-F]{3}|[0-9A-F]{6})$/i;

export function getSupporterNicknameColor(user: UserResponse) {
  if (!user.badges.includes(UserBadge.SUPPORTER)) {
    return;
  }

  const nicknameColor = (user as UserWithNicknameColor).nickname_color;

  if (!nicknameColor || !HEX_COLOR_REGEX.test(nicknameColor)) {
    return;
  }

  return nicknameColor;
}
