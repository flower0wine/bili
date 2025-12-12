# ============ 基础镜像 ============
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ============ 构建阶段 ============
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY packages/backend ./packages/backend

# 2. 安装全部依赖（包括 devDependencies，用于构建）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. 生成 Prisma Client + 编译 NestJS
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend run build

# ============ 生产镜像 ============
FROM base AS runner

# ⬇️⬇️ 重要！让 NestJS 以 backend 为根目录运行
WORKDIR /app/packages/backend

ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r nodejs && useradd -r -g nodejs -d /app -s /sbin/nologin nodejs

# 复制文件（相对路径不变）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/backend /app/packages/backend

# 修复权限
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 9000

# ⬇️ 因为已经 WORKDIR 到 backend，所以路径变短
CMD ["node", "dist/main"]