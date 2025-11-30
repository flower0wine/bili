import { Suspense } from "react";
import { BackButton } from "@/components/user/back-button";
import { FansFriendCharts, FansFriendChartsSkeleton } from "@/components/user/charts";
import { UserProfileCardSkeleton } from "@/components/user/profile/card-skeleton";
import { UserProfileCardWrapper } from "@/components/user/profile/card-wrapper";
import { UserSpaceCardSkeleton } from "@/components/user/space/card-skeleton";
import { UserSpaceCardWrapper } from "@/components/user/space/card-wrapper";


interface UserPageProps {
  params: Promise<{
    uid: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { uid: uidString } = await params;
  const uid = parseInt(uidString);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <BackButton />
        <div className="max-w-4xl mx-auto flex flex-col gap-8">

          {/* 用户资料卡片 - 独立的 Suspense */}
          <Suspense fallback={<UserProfileCardSkeleton />}>
            <UserProfileCardWrapper uid={uid} />
          </Suspense>

          {/* 用户空间卡片 - 独立的 Suspense */}
          <Suspense fallback={<UserSpaceCardSkeleton />}>
            <UserSpaceCardWrapper uid={uid} />
          </Suspense>

          {/* 粉丝关注图表 - 独立的 Suspense */}
          <Suspense fallback={<FansFriendChartsSkeleton />}>
            <FansFriendCharts uid={uid} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

