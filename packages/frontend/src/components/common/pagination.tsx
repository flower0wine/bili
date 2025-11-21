"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * 经典分页算法：始终显示首尾，当前页前后各 delta 页，中间用 ... 连接
 * 示例：1 ... 4 5 [6] 7 8 ... 100
 */
function generatePaginationArray(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const delta = 2;
  const range: (number | "ellipsis")[] = [];

  // 始终包含第一页
  range.push(1);

  // 左侧省略号判断
  if (current > delta + 2) {
    range.push("ellipsis");
  }

  // 当前页附近的页码
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  // 右侧省略号判断
  if (current < total - delta - 1) {
    range.push("ellipsis");
  }

  // 始终包含最后一页（如果总页数 > 1）
  if (total > 1) {
    range.push(total);
  }

  // 去重（防御性编程，虽然正常不会重复）
  return Array.from(new Set(range));
}

export function CommonPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps): ReactNode {
  // 输入框永远与当前页保持同步，用户输入临时状态通过本地变量控制
  const [inputValue, setInputValue] = useState<string>("");

  // 当 currentPage 变化时，重置输入框（最重要！）
  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  if (totalPages <= 1)
    return null;

  const pages = generatePaginationArray(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 只允许数字（包括空字符串，方便删除）
    if (val === "" || /^\d+$/.test(val)) {
      setInputValue(val);
    }
  };

  const handleJump = () => {
    const page = parseInt(inputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
    else {
      // 非法值恢复当前页
      setInputValue(currentPage.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJump();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4",
        className,
      )}
    >
      {/* 分页按钮 */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pages.map((page, index) =>
            page === "ellipsis"
              ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={
                currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* 跳转输入框 */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground whitespace-nowrap">跳转到</span>
        <Input
          type="text" // 改成 text 更可控
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleJump}
          className="h-9 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
          placeholder={currentPage.toString()}
        />
        <span className="text-muted-foreground whitespace-nowrap">
          /
          {" "}
          {totalPages}
          {" "}
          页
        </span>
      </div>
    </div>
  );
}