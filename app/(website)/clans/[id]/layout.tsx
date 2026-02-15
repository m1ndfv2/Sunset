import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getT } from "@/lib/i18n/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("pages.clansDetails.meta");

  return {
    title: t("title"),
    openGraph: {
      title: t("title"),
    },
  };
}

export default function ClanDetailsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
