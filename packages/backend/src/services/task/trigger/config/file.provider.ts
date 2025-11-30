import * as fs from "fs";
import * as path from "path";
import { createJiti } from "jiti";
import { Injectable, Logger } from "@nestjs/common";
import {
  validateTriggerConfig,
  type TriggerConfig
} from "@/services/task/trigger/config/trigger.schema";
import {
  ConfigSource,
  ITriggerConfigProvider
} from "@/services/task/trigger/config/types";
import { toError } from "@/utils/error.util";

/**
 * 配置文件提供者
 *
 * 职责：
 * - 从 trigger.config.ts/js 加载触发器配置
 * - 验证配置格式
 * - 提供完整的配置（包括 id 和 source）
 *
 * 设计原则：
 * - 配置文件中的每个触发器必须提供 ID
 * - 所有配置都必须包含 source 字段
 * - 使用 Zod 进行运行时验证
 * - 不负责管理监听器，由加载器负责
 */
@Injectable()
export class ConfigFileProvider implements ITriggerConfigProvider {
  private readonly logger = new Logger(ConfigFileProvider.name);
  private readonly configFilePath: string | null;

  constructor() {
    // 配置文件路径：项目根目录/trigger.config.ts (优先) 或 trigger.config.js
    const possiblePaths = [
      path.resolve(process.cwd(), "trigger.config.ts"),
      path.resolve(process.cwd(), "trigger.config.js")
    ];

    this.configFilePath = possiblePaths.find((p) => fs.existsSync(p)) || null;

    if (this.configFilePath) {
      this.logger.log(`✅ 找到触发器配置文件: ${this.configFilePath}`);
    } else {
      this.logger.debug(
        `未找到触发器配置文件，检查路径: ${possiblePaths.join(", ")}`
      );
    }
  }

  getSource() {
    return ConfigSource.CONFIG_FILE;
  }

  getName() {
    return "fileConfig";
  }

  /**
   * 加载配置文件中的触发器配置
   *
   * 流程：
   * 1. 检查配置文件是否存在
   * 2. 使用 jiti 动态加载配置文件（支持 TypeScript）
   * 3. 验证导出的数据格式
   * 4. 对每个配置进行验证和规范化
   * 5. 为每个配置生成稳定的 UUID
   * 6. 返回规范化的配置列表
   *
   * @returns 规范化的触发器配置列表
   */
  async load(): Promise<TriggerConfig[]> {
    try {
      // 检查配置文件是否存在
      if (!this.configFilePath) {
        this.logger.debug("配置文件不存在，跳过配置文件加载");
        return [];
      }

      // 使用 jiti 动态加载配置文件（支持 TypeScript）
      this.logger.debug(`加载配置文件: ${this.configFilePath}`);
      const jiti = createJiti(__filename, {
        interopDefault: true
      });
      const configModule = (await jiti.import(this.configFilePath)) as any;
      const triggerConfigs = (configModule.default ||
        configModule.triggerConfigs) as unknown[];

      // 验证导出的数据是否为数组
      if (!Array.isArray(triggerConfigs)) {
        const errorMsg = `配置文件格式错误: 应该导出一个数组，实际类型: ${typeof triggerConfigs}`;
        this.logger.error(errorMsg);
        return [];
      }

      // 验证并加载配置
      const configs: TriggerConfig[] = [];
      for (let index = 0; index < triggerConfigs.length; index++) {
        const rawConfig = triggerConfigs[index];

        // 检查配置是否为对象
        if (typeof rawConfig !== "object" || rawConfig === null) {
          const errorMsg = `配置文件中第 ${index + 1} 项配置格式错误: 应该是对象`;
          this.logger.error(errorMsg);
          continue;
        }

        const configObj = rawConfig as any;

        // 检查是否提供了 ID
        if (!configObj.id) {
          const errorMsg = `配置文件中第 ${index + 1} 项配置缺少 ID，触发器: ${configObj.name || "未知"}`;
          this.logger.error(errorMsg);
          continue;
        }

        // 构建完整的配置（包含 id 和 source）
        const fullConfig = {
          ...configObj,
          source: ConfigSource.CONFIG_FILE
        };

        // 验证完整配置格式
        const validation = validateTriggerConfig(fullConfig);
        if (!validation.success) {
          const errorMsg = `配置文件中第 ${index + 1} 项配置 (ID: ${configObj.id}) 验证失败: ${validation.error}`;
          this.logger.error(errorMsg);
          continue;
        }

        const config = validation.data!;
        configs.push(config);
        this.logger.debug(
          `✅ 加载触发器: ${config.name} (ID: ${config.id}, 来源: ${ConfigSource.CONFIG_FILE})`
        );
      }

      this.logger.log(
        `从配置文件加载 ${configs.length}/${triggerConfigs.length} 个有效触发器配置`
      );

      return configs;
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `从配置文件加载触发器配置失败: ${error.message}`,
        error.stack
      );
      return [];
    }
  }
}
