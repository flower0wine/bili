import { validateCronExpression } from "cron";
import { z } from "zod";
import { toError } from "@/utils/error.util";

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 100;
const MIN_TASKNAME_LENGTH = 1;
const MAX_TASKNAME_LENGTH = 100;
// const MIN_DESCRIPTION_LENGTH = 1;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * 标准化的触发器配置 Schema
 *
 * 所有触发器配置都必须符合此 Schema，包括：
 * - 基础配置字段（name、taskName、cron、enabled、description、params）
 * - 标识字段（id、source）
 *
 * 职责：
 * - 配置提供者负责提供所有字段，包括 id 和 source
 * - 加载器负责使用此 Schema 进行验证
 * - 所有加载的配置都必须通过此 Schema 的验证
 */
export const TriggerConfigSchema = z.object({
  id: z.string().min(1, "触发器 ID 不能为空"),
  name: z
    .string()
    .min(MIN_NAME_LENGTH, `触发器名称不能为空`)
    .max(MAX_NAME_LENGTH, `触发器名称不能超过 ${MAX_NAME_LENGTH} 个字符`),
  taskName: z
    .string()
    .min(MIN_TASKNAME_LENGTH, `任务名称不能为空`)
    .max(MAX_TASKNAME_LENGTH, `任务名称不能超过 ${MAX_TASKNAME_LENGTH} 个字符`),
  cron: z
    .string()
    .min(1, "Cron 表达式不能为空")
    .refine((value) => {
      // 使用 cron 包的标准验证函数
      const result = validateCronExpression(value);
      return result.valid === true;
    }, "Cron 表达式格式无效"),
  enabled: z.boolean().default(true),
  description: z
    .string()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `描述不能超过 ${MAX_DESCRIPTION_LENGTH} 个字符`
    )
    .nullable()
    .default(null),
  params: z.record(z.string(), z.any()).optional().default({}),
  source: z.enum(["config_file", "database"])
});

export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;

/**
 * 验证触发器配置
 * @param config 触发器配置对象
 * @returns 验证结果
 */
export function validateTriggerConfig(config: unknown) {
  try {
    const data = TriggerConfigSchema.parse(config);
    return { success: true, data };
  } catch (e) {
    if (e instanceof z.ZodError) {
      const messages = e.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return { success: false, error: messages };
    }

    const error = toError(e);
    return { success: false, error: error.message };
  }
}
