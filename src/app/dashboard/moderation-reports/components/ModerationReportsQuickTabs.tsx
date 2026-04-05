"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";

export default function ModerationReportsQuickTabs() {
  const searchParams = useSearchParams();
  const targetType = searchParams.get("targetType");
  const tabValue =
    targetType === "Trip" ? "trip" : targetType === "Post" ? "post" : "all";

  return (
    <Tabs value={tabValue}>
      <TabsList>
        <TabsTrigger value="all" asChild>
          <Link href={ROUTES.MODERATION_REPORTS}>Tất cả</Link>
        </TabsTrigger>
        <TabsTrigger value="trip" asChild>
          <Link href={ROUTES.MODERATION_REPORTS_BY_TYPE("Trip")}>
            Trip Reports
          </Link>
        </TabsTrigger>
        <TabsTrigger value="post" asChild>
          <Link href={ROUTES.MODERATION_REPORTS_BY_TYPE("Post")}>
            Post Reports
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
