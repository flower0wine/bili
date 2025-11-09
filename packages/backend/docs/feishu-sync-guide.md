# 飞书多维表格同步功能

## 功能概述

该功能可以将B站用户数据自动同步到飞书多维表格中，方便数据查看和分析。

## 数据结构

### 文件夹结构

```
bili/
└── [用户名]/
    ├── [用户名]的数据.bitable
    │   ├── 用户状态表（不常变化的数据，有变化时才插入新记录）
    │   └── 用户统计表（经常变化的数据，每次都记录）
```

### 用户状态表

记录用户的基本信息和认证信息（去重）：

- 用户ID
- 用户名
- 性别
- 头像
- 签名
- 等级
- 生日
- 认证信息
- 会员信息
- 头像框
- 勋章
- 更新时间

### 用户统计表

记录用户的统计数据（每次都插入）：

- 用户ID
- 粉丝数
- 关注数
- 稿件数
- 专栏数
- 点赞数
- 被关注状态
- 已关注状态
- 记录时间

## 配置步骤

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建一个企业自建应用
3. 获取 `App ID` 和 `App Secret`

### 2. 配置应用权限

在应用管理后台，添加以下权限：

**云文档权限：**

- `drive:drive` - 查看、编辑、下载云空间文件
- `bitable:app` - 查看、编辑多维表格

### 3. 配置环境变量

在 `.env` 文件中添加：

```env
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
```

### 4. 配置触发器

在 `trigger.config.ts` 中已经配置了每天凌晨1点执行的触发器：

```typescript
{
  name: "feishu-bitable-sync-daily",
  taskName: "feishu-bitable-sync",
  cron: "0 0 1 * * *", // 每天凌晨1点
  params: {
    mids: [456664753] // 可以指定用户列表，或留空同步所有用户
  },
  enabled: true,
  description: "同步用户数据到飞书多维表格"
}
```

## 使用方式

### 自动同步（定时任务）

任务会按照配置的cron表达式自动执行。

### 手动触发

通过API手动触发任务：

```bash
POST http://localhost:9000/task/execute
Content-Type: application/json

{
  "taskName": "feishu-bitable-sync",
  "params": {
    "mids": [456664753]
  }
}
```

## 注意事项

1. **首次运行**：首次运行会自动创建 `bili` 文件夹和相应的子文件夹、多维表格
2. **同名文件夹**：系统会自动查找同名文件夹，避免重复创建
3. **数据去重**：用户状态数据会与最新记录对比，只有变化时才插入新记录
4. **权限问题**：确保飞书应用有足够的权限创建文件夹和多维表格
5. **并发控制**：多个用户会顺序同步，避免并发问题
6. **错误处理**：单个用户同步失败不会影响其他用户，会在日志中记录错误

## 故障排查

### 1. 权限不足

**错误信息**：`permission denied` 或 `insufficient permissions`

**解决方案**：

- 检查飞书应用是否添加了必要的权限
- 确认应用已经发布版本（权限修改后需要重新发布）

### 2. 文件夹/表格创建失败

**错误信息**：`create folder failed` 或 `create bitable failed`

**解决方案**：

- 检查网络连接
- 确认飞书账号空间未满
- 查看飞书应用的API调用配额

### 3. 找不到数据

**错误信息**：`没有找到需要同步的用户数据`

**解决方案**：

- 确认数据库中有对应的 `UserSpaceData` 和 `UserCard` 数据
- 检查 `mids` 参数是否正确
- 运行 `user-space-sync` 和 `user-card-sync` 任务先同步用户数据

## API参考

### 任务参数

```typescript
interface SyncParams {
  mids?: number[]; // 要同步的用户ID列表，不指定则同步所有用户
}
```

### 返回结果

```typescript
interface SyncResult {
  total: number; // 总用户数
  success: number; // 成功数
  failed: number; // 失败数
  results: Array<{
    mid: number;
    name: string;
    success: boolean;
    error?: string;
  }>;
}
```

## 开发说明

### 文件结构

```
src/services/feishu-sync/
├── feishu-sync.service.ts  # 飞书API封装服务
└── feishu-sync.module.ts   # 模块定义

src/services/task/tasks/
└── feishu-bitable-sync.task.ts  # 同步任务实现
```

### 扩展开发

如需添加更多字段或修改表结构，可以修改：

- `getProfileTableFields()` - 用户状态表字段定义
- `getStatsTableFields()` - 用户统计表字段定义
- `syncProfileData()` - 用户状态数据同步逻辑
- `syncStatsData()` - 用户统计数据同步逻辑

## 认证机制说明

### 飞书API的两种认证方式

飞书开放平台提供两种访问凭证：

#### 1. tenant_access_token（应用访问凭证）✅ 当前使用

**特点：**

- 代表应用身份访问API
- 权限范围由应用在开发者后台配置
- 适用于后台服务、定时任务等场景
- **SDK自动管理**，无需手动获取和刷新

**当前实现：**

```typescript
// SDK初始化时自动配置
this.client = new lark.Client({
  appId,           // 从环境变量 FEISHU_APP_ID 读取
  appSecret,       // 从环境变量 FEISHU_APP_SECRET 读取
  appType: lark.AppType.SelfBuild
});

// 所有API调用都会自动使用 tenant_access_token
await this.client.drive.v1.file.createFolder({...})
```

**工作流程：**

1. SDK使用 appId + appSecret 自动获取 tenant_access_token
2. 自动在每次API请求中添加认证header: `Authorization: Bearer <token>`
3. 自动处理token过期和刷新（有效期2小时）
4. 开发者无需关心token管理细节

**满足飞书API要求：**
根据飞书文档，创建文件夹等API要求 `tenant_access_token` 或 `user_access_token` 二选一。
当前实现使用 tenant_access_token，**已满足认证要求** ✅

#### 2. user_access_token（用户访问凭证）

**特点：**

- 代表用户身份访问API
- 权限取决于用户的实际权限
- 适用于代表用户操作的场景
- 需要用户授权（OAuth 2.0流程）

**何时使用：**

- 需要访问用户的私人文件
- 需要以用户身份执行操作
- 需要用户的个人权限而非应用权限

**实现方式（如需）：**

```typescript
// 1. 引导用户访问授权页面
const authUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?` +
  `app_id=${appId}&redirect_uri=${redirectUri}&scope=drive:drive`;

// 2. 用户授权后获得code，使用code换取user_access_token
const tokenRes = await this.client.authen.v1.oidcAccessToken.create({
  data: {
    grant_type: 'authorization_code',
    code: authCode
  }
});

const userAccessToken = tokenRes.data.access_token;

// 3. 创建使用用户凭证的客户端实例
const userClient = new lark.Client({
  appId,
  appSecret,
  appType: lark.AppType.SelfBuild
});
userClient.setUserAccessToken(userAccessToken);

// 4. 使用用户身份调用API
await userClient.drive.v1.file.list({...});
```

### 认证总结

✅ **当前实现已正确处理认证**

- 使用 tenant_access_token（应用访问凭证）
- SDK自动管理token生命周期
- 无需手动处理认证逻辑
- 满足飞书API的认证要求（tenant_access_token 或 user_access_token 二选一）

⚠️ **仅在以下场景需要考虑 user_access_token：**

- 需要访问特定用户的私人文件
- 需要用户的个人权限而非应用权限
- 需要实现用户授权登录功能

### 权限配置要求

使用 tenant_access_token 时，需要在飞书开发者后台配置应用权限：

1. 进入[飞书开放平台](https://open.feishu.cn/)
2. 选择你的应用
3. 进入「权限管理」
4. 添加以下权限：
   - `查看、评论、编辑和管理云空间中所有文件` (drive:drive)
   - `获取云文档信息` (drive:drive:readonly)
   - `管理多维表格` (bitable:app)

5. 发布应用版本或在开发环境中启用权限
