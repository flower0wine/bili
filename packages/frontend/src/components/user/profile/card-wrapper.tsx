import { userCardApi } from "@/apis/user-card.api";
import { FadeInUp } from "@/components/motion";
import { CardStateHandler } from "@/components/user/card-state-handler";
import { UserProfileCardService } from "@/components/user/profile/card-info";
import { UserProfileCardSkeleton } from "./card-skeleton";

interface UserProfileCardWrapperProps {
  uid: number;
}

export async function UserProfileCardWrapper({ uid }: UserProfileCardWrapperProps) {
  let userCardData;
  let error;

  try {
    const userCardResponse = await userCardApi.getLatestUserCardData(uid);
    userCardData = userCardResponse.data?.data;
  }
  catch (err) {
    console.error("Failed to fetch user card data:", err);
    error = err instanceof Error ? err.message : "获取用户资料时发生未知错误";
  }

  return (
    <CardStateHandler
      error={error}
      hasData={!!userCardData}
      noDataTitle="暂无用户资料"
      noDataMessage="未找到该用户的资料信息"
      errorTitle="加载用户资料失败"
    >
      {userCardData && (
        <FadeInUp fallback={<UserProfileCardSkeleton></UserProfileCardSkeleton>}>
          <UserProfileCardService
            userCardData={userCardData}
            uid={uid}
          />
        </FadeInUp>
      )}
    </CardStateHandler>
  );
}
