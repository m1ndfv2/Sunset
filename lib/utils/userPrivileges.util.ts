import type { UserResponse } from "@/lib/types/api";
import { UserBadge } from "@/lib/types/api";

const MODERATOR_BADGE = "Moderator";

function hasBadge(user: UserResponse, badge: UserBadge | string) {
  return user.badges.includes(badge as UserBadge);
}

export function isUserHasModeratorPrivilege(user: UserResponse) {
  return hasBadge(user, MODERATOR_BADGE);
}

export function isUserCanUseAdminPanel(user: UserResponse) {
  return [
    isUserHasBATPrivilege(user),
    isUserHasAdminPrivilege(user),
    isUserHasModeratorPrivilege(user),
  ].some(Boolean);
}

export function isUserHasAdminPrivilege(user: UserResponse) {
  return hasBadge(user, UserBadge.ADMIN);
}

export function isUserHasBATPrivilege(user: UserResponse) {
  return hasBadge(user, UserBadge.BAT);
}

export function isUserCanUseAdminUserSearch(user: UserResponse) {
  return isUserHasAdminPrivilege(user) || isUserHasModeratorPrivilege(user);
}
