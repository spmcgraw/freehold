"use client";

import dynamic from "next/dynamic";
import type { Page } from "@/lib/types";

const PageEditor = dynamic(
  () => import("@/components/page-editor").then((m) => m.PageEditor),
  { ssr: false }
);

export function PageEditorLoader({ initialPage }: { initialPage: Page }) {
  return <PageEditor initialPage={initialPage} />;
}
