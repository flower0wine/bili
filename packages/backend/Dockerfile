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

WORKDIR /app
ENV NODE_ENV=production

# 安装 Prisma 运行时所需的系统包
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -r nodejs && useradd -r -g nodejs -d /app -s /sbin/nologin nodejs
USER nodejs

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend ./packages/backend

EXPOSE 9000
CMD ["node", "packages/backend/dist/main"]