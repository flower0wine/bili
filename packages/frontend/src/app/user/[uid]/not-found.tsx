import { ArrowLeft, Search, User } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* 返回按钮 */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </div>

          {/* 404 内容 */}
          <div className="py-16">
            {/* 图标 */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>

            {/* 标题 */}
            <h1 className="text-4xl font-bold text-foreground mb-4">
              用户不存在
            </h1>

            {/* 描述 */}
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              抱歉，我们找不到您要查找的用户信息。
              <br />
              请检查用户 UID 是否正确，或者该用户可能已不存在。
            </p>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Search className="w-4 h-4 mr-2" />
                重新搜索
              </Link>

              <Link
                href="javascript:history.back()"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回上页
              </Link>
            </div>

            {/* 提示信息 */}
            <div className="mt-12 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 提示：确保输入的是有效的 Bilibili 用户 UID（纯数字）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
