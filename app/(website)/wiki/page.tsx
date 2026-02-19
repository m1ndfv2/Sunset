"use client";

import { BookCopy, LucideMessageCircleQuestion } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import PrettyHeader from "@/components/General/PrettyHeader";
import RoundedContent from "@/components/General/RoundedContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT } from "@/lib/i18n/utils";

export default function Wiki() {
  const t = useT("pages.wiki.articles");
  const tHeader = useT("pages.wiki");

  const [value, setValue] = useState<string | null>(null);

  const wikiContent = useMemo(
    () => [
      {
        title: t("howToConnect.title"),
        content: (
          <RoundedContent>
            <div className="mx-auto flex w-11/12 flex-col">
              <h1 className="text-xl">{t("howToConnect.intro")}</h1>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>{t.rich("howToConnect.step1")}</li>
                <li>{t("howToConnect.step2")}</li>
                <li>{t("howToConnect.step3")}</li>
                <li>
                  {t.rich("howToConnect.step4", {
                    serverDomain: process.env.NEXT_PUBLIC_SERVER_DOMAIN || "your-server.com",
                  })}
                </li>
                <li>{t("howToConnect.step5")}</li>
                <li>{t("howToConnect.step6")}</li>
              </ol>
              <Image
                src="/images/wiki/osu-connect.png"
                alt={t("howToConnect.imageAlt")}
                width={800}
                height={200}
                className="mt-6 rounded-lg mx-auto"
              />
            </div>
          </RoundedContent>
        ),
      },
      {
        title: t("multipleAccounts.title"),
        content: (
          <RoundedContent>
            <div className="mx-auto flex w-11/12 flex-col">
              <h1 className="text-xl">{t("multipleAccounts.answer")}</h1>
              <p className="mt-2">{t("multipleAccounts.consequence")}</p>
            </div>
          </RoundedContent>
        ),
      },
      {
        title: t("cheatsHacks.title"),
        content: (
          <RoundedContent>
            <div className="mx-auto flex w-11/12 flex-col">
              <h1 className="text-xl">{t("cheatsHacks.answer")}</h1>
              <p className="mt-2">{t.rich("cheatsHacks.policy")}</p>
            </div>
          </RoundedContent>
        ),
      },
      {
        title: t("appealRestriction.title"),
        content: (
          <RoundedContent>
            <div className="mx-auto flex w-11/12 flex-col">
              <p>
                {t("appealRestriction.instructions")}
                {process.env.NEXT_PUBLIC_DISCORD_LINK && (
                  <span>
                    {" "}
                    {t.rich("appealRestriction.contactStaff", {
                      a: (chunks: any) => (
                        <Link
                          href={process.env.NEXT_PUBLIC_DISCORD_LINK ?? ""}
                          className="text-primary underline transition-opacity hover:opacity-80"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </span>
                )}
              </p>
              <div />
            </div>
          </RoundedContent>
        ),
      },
      {
        title: t("contributeSuggest.title"),
        content: (
          <RoundedContent>
            <div className="mx-auto flex w-11/12 flex-col">
              <h1 className="text-xl">{t("contributeSuggest.answer")}</h1>
              <p className="mt-2">
                {t.rich("contributeSuggest.instructions", {
                  a: (chunks: any) => (
                    <Link
                      href="https://github.com/SunriseCommunity"
                      className="text-primary underline transition-opacity hover:opacity-80"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </RoundedContent>
        ),
      },
      {
        title: t("multiplayerDownload.title"),
        content: (
          <RoundedContent>
            <div className="mx-auto flex w-11/12 flex-col">
              <h1 className="text-xl">
                {t.rich("multiplayerDownload.solution")}
              </h1>
            </div>
          </RoundedContent>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex w-full flex-col space-y-6 p-4 max-w-4xl mx-auto">
      <PrettyHeader
        text={tHeader("header")}
        icon={<BookCopy className="h-8 w-8" />}
        roundBottom={true}
      />

      <Accordion
        type="single"
        collapsible
        value={value ?? undefined}
        onValueChange={setValue}
        className="space-y-4"
      >
        {wikiContent.map(({ title, content }, index) => (
          <AccordionItem
            key={index}
            value={index.toString()}
            className="border border-border rounded-lg overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline data-[state=open]:bg-muted/50">
              <div className="flex items-center gap-3 text-left">
                <LucideMessageCircleQuestion className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="font-medium">{title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              {content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
