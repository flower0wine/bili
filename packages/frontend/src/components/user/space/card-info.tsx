import type { UserSpaceVO } from "@/types/user-space";
import { Calendar, Heart, User } from "lucide-react";

interface UserSpaceCardServiceProps {
  userSpaceData: UserSpaceVO;
}

export function UserSpaceCardService({ userSpaceData }: UserSpaceCardServiceProps) {
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
      <div className="flex items-center mb-6">
        <User className="w-6 h-6 text-primary mr-3" />
        <h2 className="text-2xl font-bold text-card-foreground">
          空间信息
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground mb-3">
            基本信息
          </h3>

          {userSpaceData.birthday && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">
                生日:
                {" "}
                {userSpaceData.birthday}
              </span>
            </div>
          )}

          <div className="flex items-center">
            <User className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-muted-foreground">
              {userSpaceData.isSeniorMember ? "高级会员" : "普通用户"}
            </span>
          </div>

          {userSpaceData.isFollowed !== undefined && (
            <div className="flex items-center">
              <Heart className="w-4 h-4 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">
                {userSpaceData.isFollowed ? "已关注" : "未关注"}
              </span>
            </div>
          )}
        </div>

        {/* 直播间信息 */}
        {userSpaceData.liveRoom && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-3">
              直播间信息
            </h3>

            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium text-foreground mb-2">
                {userSpaceData.liveRoom.title || "暂无标题"}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                房间号:
                {" "}
                {userSpaceData.liveRoom.roomid}
              </div>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  userSpaceData.liveRoom.liveStatus === 1
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-muted text-muted-foreground"
                }`}
                >
                  {userSpaceData.liveRoom.liveStatus === 1 ? "直播中" : "未直播"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 标签 */}
      {userSpaceData.tags && userSpaceData.tags.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-3">
            标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {userSpaceData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
