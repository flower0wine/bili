import type { UserCardVO } from "@/types/user-card";
import { Calendar, Heart, TrendingUp, User, Users } from "lucide-react";

interface UserProfileCardServiceProps {
  userCardData: UserCardVO;
  uid: number;
}

export function UserProfileCardService({ userCardData, uid }: UserProfileCardServiceProps) {
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* 头像区域 */}
        <div className="shrink-0">
          <div className="w-24 h-24 bg-linear-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        {/* 用户信息 */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            {userCardData.name || "未知用户"}
          </h1>
          <p className="text-muted-foreground mb-4">
            UID:
            {" "}
            {uid}
          </p>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {userCardData.fans?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-muted-foreground">粉丝</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Heart className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {userCardData.friend?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-muted-foreground">关注</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {userCardData.level || "0"}
              </div>
              <div className="text-xs text-muted-foreground">等级</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {userCardData.archiveCount?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-muted-foreground">投稿</div>
            </div>
          </div>
        </div>
      </div>

      {/* 用户简介 */}
      {userCardData.sign && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            个人简介
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {userCardData.sign}
          </p>
        </div>
      )}
    </div>
  );
}
