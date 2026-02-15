import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getT } from "@/lib/i18n/utils";


import { getT } from "@/lib/i18n/utils";

import Page from "./page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("pages.clans.meta");

  return {
    title: t("title"),
    openGraph: {
      title: t("title"),
    },
  };
}

export default function ClansLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export default Page;
