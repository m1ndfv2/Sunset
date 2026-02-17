import type { UserResponse } from "@/lib/types/api";
import { UserBadge } from "@/lib/types/api";

type UserWithNicknameColor = UserResponse & { nickname_color?: string | null };
type UserWithAdditionalNicknameColorFields = UserResponse & {
  nicknameColor?: string | null;
  metadata?: {
    nickname_color?: string | null;
    nicknameColor?: string | null;
  };
};

const HEX_COLOR_REGEX = /^#(?:[0-9A-F]{3}|[0-9A-F]{6})$/i;

export function getSupporterNicknameColor(user: UserResponse) {
  const userWithAdditionalFields = user as UserWithAdditionalNicknameColorFields;

  const nicknameColor
    = (user as UserWithNicknameColor).nickname_color
      ?? userWithAdditionalFields.nicknameColor
      ?? userWithAdditionalFields.metadata?.nickname_color
      ?? userWithAdditionalFields.metadata?.nicknameColor;

  console.info("[nickname-color] resolve", {
    userId: user.user_id,
    username: user.username,
    isSupporter: user.badges.includes(UserBadge.SUPPORTER),
    nicknameColor,
    metadataNicknameColor: userWithAdditionalFields.metadata?.nickname_color,
  });

  if (!user.badges.includes(UserBadge.SUPPORTER)) {
    console.info("[nickname-color] skipped: user is not supporter", {
      userId: user.user_id,
    });
    return;
  }

  if (!nicknameColor || !HEX_COLOR_REGEX.test(nicknameColor)) {
    console.warn("[nickname-color] skipped: invalid or empty nickname color", {
      userId: user.user_id,
      nicknameColor,
    });
    return;
  }

  console.info("[nickname-color] applied", {
    userId: user.user_id,
    nicknameColor,
  });

  return nicknameColor;
}
