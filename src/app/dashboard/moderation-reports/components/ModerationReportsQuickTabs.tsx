"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";

export default function ModerationReportsQuickTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const targetType = searchParams.get("targetType");
  const tabValue =
    pathname === ROUTES.MODERATION_MY_REPORTS
      ? "mine"
      : targetType === "Trip"
      ? "trip"
      : targetType === "Post"
        ? "post"
        : "all";

  return (
    <Tabs value={tabValue}>
      <TabsList>
        <TabsTrigger value="all" asChild>
          <Link href={ROUTES.MODERATION_REPORTS}>Tất cả</Link>
        </TabsTrigger>
        <TabsTrigger value="trip" asChild>
          <Link href={ROUTES.MODERATION_REPORTS_BY_TYPE("Trip")}>
            Báo cáo chuyến đi
          </Link>
        </TabsTrigger>
        <TabsTrigger value="post" asChild>
          <Link href={ROUTES.MODERATION_REPORTS_BY_TYPE("Post")}>
            Báo cáo bài viết
          </Link>
        </TabsTrigger>
        <TabsTrigger value="mine" asChild>
          <Link href={ROUTES.MODERATION_MY_REPORTS}>Báo cáo của tôi</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
