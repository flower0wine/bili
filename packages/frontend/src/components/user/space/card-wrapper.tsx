import { userSpaceApi } from "@/apis/user-space.api";
import { FadeInUp } from "@/components/motion";
import { CardStateHandler } from "@/components/user/card-state-handler";
import { UserSpaceCardService } from "@/components/user/space/card-info";
import { UserSpaceCardSkeleton } from "./card-skeleton";

interface UserSpaceCardWrapperProps {
  uid: number;
}

export async function UserSpaceCardWrapper({ uid }: UserSpaceCardWrapperProps) {
  let userSpaceData;
  let error;

  try {
    const userSpaceResponse = await userSpaceApi.getLatestUserSpaceData(uid);
    userSpaceData = userSpaceResponse.data?.data;
  }
  catch (err) {
    console.error("Failed to fetch user space data:", err);
    error = err instanceof Error ? err.message : "获取空间信息时发生未知错误";
  }

  return (
    <CardStateHandler
      error={error}
      hasData={!!userSpaceData}
      noDataTitle="暂无空间信息"
      noDataMessage="未找到该用户的空间信息"
      errorTitle="加载空间信息失败"
    >
      {userSpaceData && (
        <FadeInUp fallback={<UserSpaceCardSkeleton></UserSpaceCardSkeleton>}>
          <UserSpaceCardService userSpaceData={userSpaceData} />
        </FadeInUp>
      )}
    </CardStateHandler>
  );
}
