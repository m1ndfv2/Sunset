"use client";

import { Crown, LogOut, Shield, User, UserPlus } from "lucide-react";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

import GameModeSelector from "@/components/GameModeSelector";
import ImageSelect from "@/components/General/ImageSelect";
import PrettyHeader from "@/components/General/PrettyHeader";
import RoundedContent from "@/components/General/RoundedContent";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUserToken } from "@/lib/actions/getUserToken";
import type { ClanDetailsResponse } from "@/lib/hooks/api/clan/types";
import { useClan } from "@/lib/hooks/api/clan/useClan";
import useSelf from "@/lib/hooks/useSelf";
import { useT } from "@/lib/i18n/utils";
import { kyInstance } from "@/lib/services/fetcher";
import poster from "@/lib/services/poster";
import { GameMode } from "@/lib/types/api";
import numberWith from "@/lib/utils/numberWith";
import { isInstance } from "@/lib/utils/type.util";

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const maxSide = 128;
  const scale = Math.min(maxSide / bitmap.width, maxSide / bitmap.height, 1);

  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error("Failed to process image");

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/webp", 0.8);
  bitmap.close();

  return dataUrl;
}

async function requestWithMethod<T>(
  method: "post" | "delete",
  url: string,
  options?: Parameters<typeof poster>[1],
): Promise<T> {
  if (method === "post") {
    return await poster<T>(url, options);
  }

  const token = await getUserToken();
  const result = await kyInstance
    .delete(url, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(async (res) => {
      const contentType = res?.headers?.get("content-type");

      if (!(contentType != null
        && contentType.includes("application/json"))) {
        return null;
      }

      try {
        return await res.json();
      }
      catch {
        return null;
      }
    });

  return result as T;
}

async function tryRequests<T>(
  attempts: Array<{
    method?: "post" | "delete";
    url: string;
    options?: Parameters<typeof poster>[1];
  }>,
): Promise<T | null> {
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await requestWithMethod<T>(attempt.method ?? "post", attempt.url, attempt.options);
    }
    catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export default function ClanDetailsPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { self } = useSelf();

  const t = useT("pages.clansDetails");

  const mode = searchParams.get("mode") ?? GameMode.STANDARD;
  const [activeMode, setActiveMode] = useState(
    () => (isInstance(mode, GameMode) ? (mode as GameMode) : GameMode.STANDARD),
  );

  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [isLeaveLoading, setIsLeaveLoading] = useState(false);
  const [isSavingClan, setIsSavingClan] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const clanId = Number(params.id);
  const clanQuery = useClan(clanId, activeMode);

  const clan = clanQuery.data?.clan;
  const members = clanQuery.data?.members ?? [];

  const inviteMode = searchParams.get("invite") === "1";

  const selfMembership = members.find(m => m.user.user_id === self?.user_id);

  const isCreator = selfMembership?.role === "creator";
  const isMember = Boolean(selfMembership);

  const createInviteLink = async () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("invite", "1");

    const link = `${window.location.origin}${pathname}?${params.toString()}`;

    await navigator.clipboard.writeText(link);

    toast({
      title: t("invite.linkCopied"),
      variant: "success",
    });
  };

  const closeInvitePrompt = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("invite");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const leaveClan = async () => {
    setIsLeaveLoading(true);

    try {
      await tryRequests([
        { method: "post", url: `clan/${clanId}/leave` },
        { method: "post", url: `clan/leave/${clanId}` },
        { method: "post", url: `clan/leave`, options: { json: { clan_id: clanId } } },
        { method: "delete", url: `clan/${clanId}/leave` },
        { method: "delete", url: `clan/leave/${clanId}` },
        { method: "delete", url: `clan/${clanId}/member/self` },
        { method: "delete", url: `clan/${clanId}/members/me` },
      ]);

      toast({
        title: t("leave.left"),
        variant: "success",
      });

      router.push("/clans");
    }
    catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("leave.unavailable"),
        variant: "destructive",
      });
    }
    finally {
      setIsLeaveLoading(false);
    }
  };

  const saveClanProfile = async () => {
    if (!isCreator)
      return;

    setIsSavingClan(true);
    try {
      const encodedAvatar = avatarFile ? await fileToDataUrl(avatarFile) : undefined;

      const payload = {
        avatar_url: encodedAvatar,
      };

      const updated = await tryRequests<ClanDetailsResponse>([
        { url: `clan/${clanId}/edit`, options: { json: payload } },
        { url: `clan/${clanId}/update`, options: { json: payload } },
        { url: `clan/${clanId}`, options: { json: payload } },
      ]);

      await clanQuery.mutate(updated, { revalidate: false });

      toast({
        title: t("manage.saved"),
        variant: "success",
      });
    }
    catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("manage.updateFailed"),
        variant: "destructive",
      });
    }
    finally {
      setIsSavingClan(false);
    }
  };

  const kickMember = async (userId: number) => {
    if (!isCreator || !isMember) {
      toast({
        title: t("manage.onlyCreatorCanKick"),
        variant: "destructive",
      });
      return;
    }

    try {
      const updated = await tryRequests<ClanDetailsResponse>([
        { method: "post", url: `clan/${clanId}/kick/${userId}` },
        { method: "post", url: `clan/${clanId}/kick`, options: { json: { user_id: userId } } },
        { method: "post", url: `clan/${clanId}/member/${userId}/kick` },
        { method: "post", url: `clan/${clanId}/members/${userId}/kick` },
        { method: "post", url: `clan/kick/${clanId}/${userId}` },
        { method: "delete", url: `clan/${clanId}/kick/${userId}` },
        { method: "delete", url: `clan/${clanId}/member/${userId}` },
        { method: "delete", url: `clan/${clanId}/members/${userId}` },
      ]);

      if (updated?.clan) {
        await clanQuery.mutate(updated, { revalidate: false });
      }
      else {
        await clanQuery.mutate();
      }

      toast({
        title: t("manage.kicked"),
        variant: "success",
      });
    }
    catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("manage.kickFailed"),
        variant: "destructive",
      });
    }
  };

  const acceptInvite = async () => {
    setIsJoinLoading(true);

    try {
      const joinedClanDetails = await poster<ClanDetailsResponse>(`clan/${clanId}/join`, {});

      toast({
        title: t("invite.joined"),
        variant: "success",
      });

      closeInvitePrompt();
      await clanQuery.mutate(joinedClanDetails, { revalidate: false });
    }
    catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("invite.joinUnavailable"),
        variant: "destructive",
      });
    }
    finally {
      setIsJoinLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col space-y-4">
      <PrettyHeader text={clan?.name ?? t("fallbackTitle")} icon={<Shield />} roundBottom={true} />

      <div>
        <PrettyHeader className="border-b-0">
          <GameModeSelector
            activeMode={activeMode}
            setActiveMode={setActiveMode}
          />
        </PrettyHeader>

        <div className="rounded-b-3xl border border-t-0 bg-card shadow">
          <RoundedContent className="rounded-t-xl border-none shadow-none">
            {clanQuery.isLoading
              ? (
                  <div className="flex min-h-32 items-center justify-center">
                    <Spinner />
                  </div>
                )
              : clan
                ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {clan.avatar_url
                          ? (
                              <img
                                src={clan.avatar_url}
                                alt={`${clan.name} avatar`}
                                className="size-16 rounded-lg object-cover"
                              />
                            )
                          : (
                              <div className="flex size-16 items-center justify-center rounded-lg bg-secondary">
                                <Shield />
                              </div>
                            )}

                        <div>
                          <p className="text-xl font-semibold">{clan.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("labels.totalPp")}: {numberWith(Math.round(clan.total_pp))}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("labels.created")}: {new Date(clan.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {isCreator && (
                        <div className="space-y-3 rounded-xl border border-dashed p-3">
                          <p className="text-sm text-muted-foreground">{t("invite.creatorHint")}</p>
                          <Button onClick={createInviteLink} variant="secondary">
                            <UserPlus size={16} />
                            {t("invite.copyInviteLink")}
                          </Button>

                          <div className="space-y-2 pt-2">
                            <p className="text-sm text-muted-foreground">{t("manage.header")}</p>
                            <label className="text-xs text-muted-foreground">{t("manage.avatarLabel")}</label>
                            <ImageSelect
                              setFile={setAvatarFile}
                              file={avatarFile}
                              maxFileSizeBytes={2 * 1024 * 1024}
                            />

                            <Button onClick={saveClanProfile} isLoading={isSavingClan}>
                              {t("manage.save")}
                            </Button>
                          </div>
                        </div>
                      )}

                      {inviteMode && !isMember && self && (
                        <div className="rounded-xl border p-3">
                          <p className="mb-3 text-sm">{t("invite.prompt")}</p>
                          <div className="flex flex-wrap gap-2">
                            <Button onClick={acceptInvite} isLoading={isJoinLoading}>
                              {t("invite.accept")}
                            </Button>
                            <Button onClick={closeInvitePrompt} variant="secondary">
                              {t("invite.decline")}
                            </Button>
                          </div>
                        </div>
                      )}

                      {isMember && (
                        <div className="rounded-xl border p-3">
                          <p className="mb-2 text-sm text-muted-foreground">{t("leave.hint")}</p>
                          <Button onClick={leaveClan} isLoading={isLeaveLoading} variant="destructive">
                            <LogOut size={16} />
                            {t("leave.action")}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        {members.map((member, index) => (
                          <div
                            key={member.user.user_id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 text-xs text-muted-foreground">#{index + 1}</span>
                              <img
                                src={member.user.avatar_url}
                                alt={`${member.user.username} avatar`}
                                className="size-10 rounded-md object-cover"
                              />
                              <div>
                                <Link href={`/user/${member.user.user_id}`} className="font-medium hover:underline">
                                  {member.user.username}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                  {member.role === "creator"
                                    ? (
                                        <span className="inline-flex items-center gap-1"><Crown size={12} /> {t("roles.creator")}</span>
                                      )
                                    : (
                                        <span className="inline-flex items-center gap-1"><User size={12} /> {t("roles.member")}</span>
                                      )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <p className="font-medium">{numberWith(Math.round(member.pp))}{t("suffix.pp")}</p>
                              {isCreator && member.role !== "creator" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => kickMember(member.user.user_id)}
                                  disabled={!isCreator || !isMember}
                                >
                                  {t("manage.kick")}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                : (
                    <p className="text-sm text-red-400">{t("errors.notFound")}</p>
                  )}
          </RoundedContent>
        </div>
      </div>
    </div>
  );
}
