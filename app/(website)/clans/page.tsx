"use client";

import { Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import GameModeSelector from "@/components/GameModeSelector";
import ImageSelect from "@/components/General/ImageSelect";
import PrettyHeader from "@/components/General/PrettyHeader";
import RoundedContent from "@/components/General/RoundedContent";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ClanDetailsResponse,
  CreateClanRequest,
} from "@/lib/hooks/api/clan/types";
import { useClansLeaderboard } from "@/lib/hooks/api/clan/useClansLeaderboard";
import { useT } from "@/lib/i18n/utils";
import poster from "@/lib/services/poster";
import { GameMode } from "@/lib/types/api";
import { fileToClanAvatarDataUrl } from "@/lib/utils/clanAvatar.util";
import numberWith from "@/lib/utils/numberWith";
import { isInstance, tryParseNumber } from "@/lib/utils/type.util";

export default function ClansPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useT("pages.clans");

  const page = tryParseNumber(searchParams.get("page")) ?? 0;
  const size = tryParseNumber(searchParams.get("size")) ?? 10;
  const mode = searchParams.get("mode") ?? GameMode.STANDARD;

  const [activeMode, setActiveMode] = useState(
    () => (isInstance(mode, GameMode) ? (mode as GameMode) : GameMode.STANDARD),
  );
  const [pagination, setPagination] = useState({
    pageIndex: page,
    pageSize: size,
  });

  const [clanName, setClanName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const leaderboardQuery = useClansLeaderboard({
    mode: activeMode,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const clans = leaderboardQuery.data?.clans ?? [];
  const totalCount = leaderboardQuery.data?.total_count ?? 0;
  const maxPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);

    return params.toString();
  }, [searchParams]);

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `${pathname}?${createQueryString("mode", activeMode.toString())}`,
    );
  }, [activeMode, createQueryString, pathname]);

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `${pathname}?${createQueryString("size", pagination.pageSize.toString())}`,
    );
  }, [pagination.pageSize, createQueryString, pathname]);

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `${pathname}?${createQueryString("page", pagination.pageIndex.toString())}`,
    );
  }, [pagination.pageIndex, createQueryString, pathname]);

  const canSubmitCreate = useMemo(() => clanName.trim().length >= 2, [clanName]);

  const onCreateClan = useCallback(async () => {
    setCreateError(null);
    setIsCreating(true);

    try {
      const encodedAvatar = avatarFile ? await fileToClanAvatarDataUrl(avatarFile) : undefined;

      const payload: CreateClanRequest = {
        name: clanName.trim(),
        avatar_url: encodedAvatar,
      };

      const created = await poster<ClanDetailsResponse>("clan", {
        json: payload,
      });

      window.location.href = `/clans/${created.clan.id}`;
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message === "avatarTooLarge"
          ? t("form.avatarTooLarge")
          : error.message
        : t("form.createFailed");

      setCreateError(errorMessage);
    }
    finally {
      setIsCreating(false);
    }
  }, [avatarFile, clanName, t]);

  return (
    <div className="flex w-full flex-col space-y-4">
      <PrettyHeader text={t("header")} icon={<Shield />} roundBottom={true} />

      <div>
        <PrettyHeader className="border-b-0">
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <GameModeSelector
              activeMode={activeMode}
              setActiveMode={setActiveMode}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setPagination(prev => ({
                    ...prev,
                    pageIndex: Math.max(0, prev.pageIndex - 1),
                  }));
                }}
                disabled={pagination.pageIndex <= 0}
              >
                {t("pagination.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("pagination.pageOf", { page: pagination.pageIndex + 1, maxPages })}
              </span>
              <Button
                variant="secondary"
                onClick={() => {
                  setPagination(prev => ({
                    ...prev,
                    pageIndex: Math.min(maxPages - 1, prev.pageIndex + 1),
                  }));
                }}
                disabled={pagination.pageIndex >= maxPages - 1}
              >
                {t("pagination.next")}
              </Button>
            </div>
          </div>
        </PrettyHeader>

        <div className="rounded-b-3xl border border-t-0 bg-card shadow">
          <RoundedContent className="rounded-t-xl border-none shadow-none">
            {leaderboardQuery.isLoading && clans.length === 0
              ? (
                  <div className="flex min-h-36 items-center justify-center">
                    <Spinner />
                  </div>
                )
              : (
                  <div className="space-y-2">
                    {clans.map((clan, index) => (
                      <Link
                        key={clan.id}
                        href={`/clans/${clan.id}`}
                        className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-secondary/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-10 text-sm text-muted-foreground">
                            #{pagination.pageIndex * pagination.pageSize + index + 1}
                          </span>
                          {clan.avatar_url
                            ? (
                                <img
                                  src={clan.avatar_url}
                                  alt={`${clan.name} avatar`}
                                  className="size-10 rounded-md object-cover"
                                />
                              )
                            : (
                                <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-xs">
                                  <Users size={16} />
                                </div>
                              )}
                          <div>
                            <p className="font-semibold">{clan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {t("labels.created")} {new Date(clan.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{t("labels.totalPp")}</p>
                          <p className="font-semibold">{numberWith(Math.round(clan.total_pp))}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
          </RoundedContent>
        </div>
      </div>

      <div>
        <PrettyHeader text={t("createHeader")} icon={<Users />} roundBottom={true} />
        <div className="rounded-b-3xl border border-t-0 bg-card shadow">
          <RoundedContent className="space-y-3 rounded-t-xl border-none shadow-none">
            <Input
              placeholder={t("form.namePlaceholder")}
              value={clanName}
              onChange={e => setClanName(e.target.value)}
              maxLength={32}
            />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("form.avatarFromComputer")}</p>
              <ImageSelect
                setFile={setAvatarFile}
                file={avatarFile}
                maxFileSizeBytes={2 * 1024 * 1024}
              />
            </div>

            {createError && <p className="text-sm text-red-400">{createError}</p>}

            <Button
              onClick={onCreateClan}
              disabled={!canSubmitCreate || isCreating}
              isLoading={isCreating}
            >
              {t("form.create")}
            </Button>
          </RoundedContent>
        </div>
      </div>
    </div>
  );
}
