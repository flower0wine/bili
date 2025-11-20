"use client";

import { motion } from "framer-motion";
import { Search, TrendingUp, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const recommendedUsers = [
  {
    uid: "456664753",
    name: "央视新闻",
    description: "中央电视台新闻中心官方账号",
    avatar: "https://i2.hdslb.com/bfs/face/8394c2c78c8e8b2b8b8b8b8b8b8b8b8b.jpg",
  },
];

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchValue.trim() && /^\d+$/.test(searchValue.trim())) {
      router.push(`/user/${searchValue.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许输入数字
    if (/^\d*$/.test(value)) {
      setSearchValue(value);
    }
  };

  const handleUserClick = (uid: string) => {
    router.push(`/user/${uid}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Bilibili 用户查询
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            输入用户 UID 查看详细的用户信息和最新动态
          </p>
        </motion.div>

        {/* 搜索区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <InputGroup className="h-14 text-lg shadow-lg border-2 hover:border-primary/30 focus-within:border-primary transition-colors">
              <InputGroupAddon align="inline-start">
                <Search className="w-5 h-5 text-primary" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="请输入用户 UID（纯数字）"
                value={searchValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="text-lg px-4"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={handleSearch}
                  disabled={!searchValue.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  搜索
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </motion.div>

        {/* 推荐用户区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-2xl font-semibold text-foreground">
              推荐用户
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedUsers.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-border"
                onClick={() => handleUserClick(user.uid)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-card-foreground">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        UID:
                        {" "}
                        {user.uid}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {user.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium">
                    查看详情
                    <motion.span
                      className="ml-1"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 底部提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground text-sm">
            输入有效的 Bilibili 用户 UID 开始探索
          </p>
        </motion.div>
      </div>
    </div>
  );
}
