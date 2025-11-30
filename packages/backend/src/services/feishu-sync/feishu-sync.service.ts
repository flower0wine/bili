import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toError } from "@/utils/error.util";
import * as lark from "@larksuiteoapi/node-sdk";
import { DataTableField, DataTableSort, RecordField } from "./types";

/**
 * 飞书API服务
 * 负责与飞书云文档进行交互，管理文件夹和多维表格
 *
 * 认证说明：
 * - 默认使用 tenant_access_token（应用访问凭证）进行认证
 * - SDK 会自动获取和刷新 token，无需手动管理
 * - 所有 API 调用都会自动附加认证信息
 *
 * 如需使用 user_access_token（用户访问凭证），需要：
 * 1. 通过 OAuth 流程获取用户授权码
 * 2. 使用授权码换取 user_access_token
 * 3. 在请求参数中指定 user_access_token
 */
@Injectable()
export class FeishuSyncService {
  private readonly logger = new Logger(FeishuSyncService.name);
  private client: lark.Client;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>("FEISHU_APP_ID");
    const appSecret = this.configService.get<string>("FEISHU_APP_SECRET");

    if (!appId || !appSecret) {
      this.logger.error(
        "飞书应用配置缺失，请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET"
      );
      throw new Error("飞书应用配置缺失");
    }

    // 初始化飞书客户端
    // SDK 会自动使用 appId 和 appSecret 获取 tenant_access_token
    // 并在所有 API 请求中自动添加认证 header
    this.client = new lark.Client({
      appId,
      appSecret,
      appType: lark.AppType.SelfBuild // 自建应用类型
    });

    this.logger.log("飞书客户端初始化成功，使用 tenant_access_token 自动认证");
  }

  /**
   * 获取文件夹列表
   *
   * 说明：默认使用 tenant_access_token（应用访问凭证）
   * SDK 会自动在请求中添加认证信息
   */
  async listFolders(parentToken?: string) {
    try {
      const res = await this.client.drive.v1.file.list({
        params: {
          page_size: 200,
          folder_token: parentToken,
          order_by: "EditedTime",
          direction: "DESC"
        }
      });

      if (res.code !== 0) {
        this.logger.error(`获取文件夹列表失败: ${res.msg}`);
        throw new Error(res.msg);
      }

      return res.data?.files || [];
    } catch (e) {
      const error = toError(e);

      this.logger.error(`获取文件夹列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查找文件夹（支持按名称查找）
   */
  async findFolder(folderName: string, parentToken?: string) {
    try {
      const files = await this.listFolders(parentToken);
      const folder = files.find(
        (f) => f.name === folderName && f.type === "folder"
      );
      return folder ? folder.token : null;
    } catch (e) {
      const error = toError(e);

      this.logger.error(`查找文件夹失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 创建文件夹
   * @param folderName 文件夹名称
   * @param parentToken 父文件夹token，不传则创建在根目录（我的空间）
   */
  async createFolder(folderName: string, parentToken: string = "") {
    try {
      // 构建请求数据
      const requestData = {
        name: folderName,
        folder_token: parentToken
      };

      const res = await this.client.drive.v1.file.createFolder({
        data: requestData
      });

      if (res.code !== 0) {
        const msg = `创建文件夹 "${folderName}" 失败: ${res.msg}`;
        this.logger.error(msg, { code: res.code, response: res });
        throw new Error(msg);
      }

      const token = res.data?.token;
      if (!token) {
        throw new Error("创建文件夹成功但未返回token");
      }

      this.logger.log(`成功创建文件夹: "${folderName}", token: ${token}`);
      return token;
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `创建文件夹 "${folderName}" 失败: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * 确保文件夹存在（不存在则创建）
   */
  async ensureFolder(folderName: string, parentToken?: string) {
    let folderToken = await this.findFolder(folderName, parentToken);
    if (!folderToken) {
      folderToken = await this.createFolder(folderName, parentToken);
    }
    return folderToken;
  }

  /**
   * 查找多维表格
   */
  async findBitable(bitableName: string, folderToken?: string) {
    try {
      const files = await this.listFolders(folderToken);
      const bitable = files.find(
        (f) => f.name === bitableName && f.type === "bitable"
      );
      return bitable ? bitable.token : null;
    } catch (e) {
      const error = toError(e);
      this.logger.error(`查找多维表格失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 创建多维表格
   * @param bitableName 多维表格名称
   * @param folderToken 文件夹token，不传则创建在根目录
   */
  async createBitable(bitableName: string, folderToken: string = "") {
    try {
      // 构建请求数据
      const requestData = {
        name: bitableName,
        folder_token: folderToken
      };

      this.logger.debug(`创建多维表格请求参数: ${JSON.stringify(requestData)}`);

      const res = await this.client.bitable.v1.app.create({
        data: requestData
      });

      if (res.code !== 0) {
        const msg = `创建多维表格 "${bitableName}" 失败: ${res.msg}`;
        this.logger.error(msg, { code: res.code, response: res });
        throw new Error(msg);
      }

      const appToken = res.data?.app?.app_token;
      if (!appToken) {
        throw new Error("创建多维表格成功但未返回app_token");
      }

      this.logger.log(`成功创建多维表格: "${bitableName}", token: ${appToken}`);
      return appToken;
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `创建多维表格 "${bitableName}" 失败: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * 确保多维表格存在
   */
  async ensureBitable(bitableName: string, folderToken?: string) {
    let bitableToken = await this.findBitable(bitableName, folderToken);
    if (!bitableToken) {
      bitableToken = await this.createBitable(bitableName, folderToken);
    }
    return bitableToken;
  }

  /**
   * 获取多维表格的所有数据表
   */
  async listTables(appToken: string) {
    try {
      const res = await this.client.bitable.v1.appTable.list({
        path: {
          app_token: appToken
        },
        params: {
          page_size: 100
        }
      });

      if (res.code !== 0) {
        this.logger.error(`获取数据表列表失败: ${res.msg}`);
        throw new Error(res.msg || "获取数据表列表失败");
      }

      return res.data?.items || [];
    } catch (e) {
      const error = toError(e);

      this.logger.error(`获取数据表列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 创建数据表
   */
  async createTable(
    appToken: string,
    tableName: string,
    fields: DataTableField[] = []
  ) {
    try {
      const res = await this.client.bitable.v1.appTable.create({
        path: {
          app_token: appToken
        },
        data: {
          table: {
            name: tableName,
            fields
          }
        }
      });

      if (res.code !== 0) {
        this.logger.error(`创建数据表失败: ${res.msg}`);
        throw new Error(res.msg || "创建数据表失败");
      }

      const tableId = res.data?.table_id;
      if (!tableId) {
        throw new Error("创建数据表成功但未返回table_id");
      }

      this.logger.log(`成功创建数据表: ${tableName}, table_id: ${tableId}`);
      return tableId;
    } catch (e) {
      const error = toError(e);

      this.logger.error(`创建数据表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查找数据表
   */
  async findTable(appToken: string, tableName: string) {
    try {
      const tables = await this.listTables(appToken);
      const table = tables.find((t) => t.name === tableName);
      return table?.table_id;
    } catch (e) {
      const error = toError(e);

      this.logger.error(`查找数据表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 确保数据表存在
   */
  async ensureTable(
    appToken: string,
    tableName: string,
    fields?: DataTableField[]
  ) {
    let tableId = await this.findTable(appToken, tableName);
    if (!tableId) {
      tableId = await this.createTable(appToken, tableName, fields);
    }
    return tableId;
  }

  /**
   * 获取数据表记录
   * @param appToken 多维表格token
   * @param tableId 数据表ID
   * @param pageSize 每页记录数
   * @param sort 排序规则，例如: [{ field_name: "更新时间", desc: true }]
   */
  async getRecords(
    appToken: string,
    tableId: string,
    pageSize: number = 1,
    sort?: DataTableSort
  ) {
    try {
      // 如果需要排序，使用 search 接口；否则使用 list 接口
      if (sort && sort.length > 0) {
        // 使用 search 接口支持排序
        const res = await this.client.bitable.v1.appTableRecord.search({
          path: {
            app_token: appToken,
            table_id: tableId
          },
          data: {
            sort: sort.map((s) => ({
              field_name: s.field_name,
              desc: s.desc ?? false
            }))
          },
          params: {
            page_size: pageSize
          }
        });

        if (res.code !== 0) {
          this.logger.error(`查询记录失败: ${res.msg}`);
          throw new Error(res.msg || "查询记录失败");
        }

        return res.data?.items || [];
      } else {
        // 使用 list 接口（不支持排序）
        const res = await this.client.bitable.v1.appTableRecord.list({
          path: {
            app_token: appToken,
            table_id: tableId
          },
          params: {
            page_size: pageSize
          }
        });

        if (res.code !== 0) {
          this.logger.error(`获取记录失败: ${res.msg}`);
          throw new Error(res.msg || "获取记录失败");
        }

        return res.data?.items || [];
      }
    } catch (e) {
      const error = toError(e);

      this.logger.error(`获取记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 添加记录
   */
  async addRecord(appToken: string, tableId: string, fields: RecordField) {
    try {
      const res = await this.client.bitable.v1.appTableRecord.create({
        path: {
          app_token: appToken,
          table_id: tableId
        },
        data: {
          fields
        }
      });

      if (res.code !== 0) {
        this.logger.error(`添加记录失败: ${res.msg}`);
        throw new Error(res.msg || "添加记录失败");
      }

      const recordId = res.data?.record?.record_id;
      if (!recordId) {
        throw new Error("添加记录成功但未返回record_id");
      }

      this.logger.log(`成功添加记录, record_id: ${recordId}`);
      return recordId;
    } catch (e) {
      const error = toError(e);

      this.logger.error(`添加记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量添加记录
   */
  async batchAddRecords(
    appToken: string,
    tableId: string,
    records: RecordField[]
  ) {
    try {
      const res = await this.client.bitable.v1.appTableRecord.batchCreate({
        path: {
          app_token: appToken,
          table_id: tableId
        },
        data: {
          records: records.map((fields) => ({ fields }))
        }
      });

      if (res.code !== 0) {
        this.logger.error(`批量添加记录失败: ${res.msg}`);
        throw new Error(res.msg || "批量添加记录失败");
      }

      const recordIds =
        res.data?.records?.map((r) => r.record_id).filter(Boolean) || [];
      this.logger.log(`成功批量添加 ${recordIds.length} 条记录`);
      return recordIds as string[];
    } catch (e) {
      const error = toError(e);

      this.logger.error(`批量添加记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
