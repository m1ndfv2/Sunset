"use client";

import { Crown, Shield, User } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

import GameModeSelector from "@/components/GameModeSelector";
import PrettyHeader from "@/components/General/PrettyHeader";
import RoundedContent from "@/components/General/RoundedContent";
import Spinner from "@/components/Spinner";
import { useClan } from "@/lib/hooks/api/clan/useClan";
import { useT } from "@/lib/i18n/utils";
import { GameMode } from "@/lib/types/api";
import numberWith from "@/lib/utils/numberWith";
import { isInstance } from "@/lib/utils/type.util";

export default function ClanDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const t = useT("pages.clansDetails");

  const mode = searchParams.get("mode") ?? GameMode.STANDARD;
  const [activeMode, setActiveMode] = useState(
    () => (isInstance(mode, GameMode) ? (mode as GameMode) : GameMode.STANDARD),
  );

  const clanId = Number(params.id);
  const clanQuery = useClan(clanId, activeMode);

  const clan = clanQuery.data?.clan;
  const members = clanQuery.data?.members ?? [];

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

                            <p className="font-medium">{numberWith(Math.round(member.pp))}{t("suffix.pp")}</p>
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
