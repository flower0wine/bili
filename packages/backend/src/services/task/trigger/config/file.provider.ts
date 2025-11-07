import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { createJiti } from "jiti";
import { Logger } from "@nestjs/common";
import {
  ConfigSource,
  ITriggerConfigProvider,
  TriggerConfigSource
} from "./trigger-config-loader.service";

/**
 * 配置文件提供者 - 从 trigger.config.ts/js 加载配置
 *
 * 使用 jiti 动态加载 TypeScript/JavaScript 配置文件
 */
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
      this.logger.log(`找到触发器配置文件: ${this.configFilePath}`);
    } else {
      this.logger.debug(
        `未找到触发器配置文件，检查路径: ${possiblePaths.join(", ")}`
      );
    }
  }

  getName(): string {
    return ConfigSource.CONFIG_FILE;
  }

  async load(): Promise<TriggerConfigSource[]> {
    try {
      // 检查配置文件是否存在
      if (!this.configFilePath) {
        this.logger.debug("配置文件不存在，跳过配置文件加载");
        return [];
      }

      // 使用 jiti 动态加载配置文件（支持 TypeScript）
      const jiti = createJiti(__filename, {
        interopDefault: true
      });
      const configModule = (await jiti.import(this.configFilePath)) as any;
      const triggerConfigs =
        configModule.default || configModule.triggerConfigs;

      if (!Array.isArray(triggerConfigs)) {
        this.logger.error(
          `配置文件格式错误: 应该导出一个数组，实际类型: ${typeof triggerConfigs}`
        );
        return [];
      }

      // 验证并转换为标准格式
      const validConfigs: TriggerConfigSource[] = [];
      for (let i = 0; i < triggerConfigs.length; i++) {
        const config = triggerConfigs[i];

        // 类型校验
        if (!this.validateConfig(config, i)) {
          continue; // 跳过非法配置
        }

        validConfigs.push({
          id: randomUUID(), // 生成唯一ID
          name: config.name,
          taskName: config.taskName,
          cron: config.cron,
          params: config.params,
          enabled: config.enabled ?? true, // 默认启用
          description: config.description,
          source: ConfigSource.CONFIG_FILE
        });
      }

      this.logger.log(
        `从配置文件加载 ${validConfigs.length}/${triggerConfigs.length} 个有效触发器配置`
      );

      return validConfigs;
    } catch (error) {
      this.logger.error(
        `从配置文件加载触发器配置失败: ${error.message}`,
        error.stack
      );
      return [];
    }
  }

  /**
   * 验证配置项是否合法
   */
  private validateConfig(config: any, index: number): boolean {
    const requiredFields = ["name", "taskName", "cron"];
    const missingFields = requiredFields.filter(
      (field) => !config[field] || typeof config[field] !== "string"
    );

    if (missingFields.length > 0) {
      this.logger.error(
        `配置文件中第 ${index + 1} 项配置缺少必填字段或类型错误: ${missingFields.join(", ")}，配置: ${JSON.stringify(config)}`
      );
      return false;
    }

    return true;
  }
}
