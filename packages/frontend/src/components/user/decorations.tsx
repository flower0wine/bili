"use client";

import dayjs from "dayjs";
import Image from "next/image";

interface DecorationsProps {
  userSpace: {
    nameplate?: {
      name?: string;
      level?: string;
      image?: string;
    };
    pendant?: {
      name?: string;
      image?: string;
      expire?: number;
    };
  } | null;
}

export function Decorations({ userSpace }: DecorationsProps) {
  return (
    <>
      {/* 徽章 */}
      {userSpace?.nameplate && (
        <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-md transition-all dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-lg text-gray-900 font-semibold dark:text-gray-100">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            徽章信息
          </h3>
          <div className="flex items-center gap-4">
            {userSpace.nameplate.image && (
              <Image
                src={userSpace.nameplate.image}
                alt={userSpace.nameplate.name || "徽章"}
                width={60}
                height={60}
                className="h-16 w-16 rounded object-cover"
              />
            )}
            <div>
              <div className="text-gray-900 font-medium dark:text-gray-100">
                {userSpace.nameplate.name || "未设置"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {userSpace.nameplate.level || ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 挂件 */}
      {userSpace?.pendant && (
        <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-md transition-all dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-lg text-gray-900 font-semibold dark:text-gray-100">
            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
            挂件信息
          </h3>
          <div className="flex items-center gap-4">
            {userSpace.pendant.image && (
              <Image
                src={userSpace.pendant.image}
                alt={userSpace.pendant.name || "挂件"}
                width={60}
                height={60}
                className="h-16 w-16 rounded object-cover"
              />
            )}
            <div>
              <div className="text-gray-900 font-medium dark:text-gray-100">
                {userSpace.pendant.name || "未设置"}
              </div>
              {userSpace.pendant.expire && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  到期:
                  {" "}
                  {dayjs(userSpace.pendant.expire * 1000).format(
                    "YYYY年MM月DD日",
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
