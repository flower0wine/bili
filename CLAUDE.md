# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo** for a task scheduling system that consists of:
- **Backend**: NestJS-based task scheduling system with PostgreSQL database
- **Frontend**: Next.js application using React 19 and Tailwind CSS
- **Monorepo Management**: Turbo for workspace management and pnpm for package management

## Key Technologies

- **Backend**: NestJS 11.0.1, TypeScript, PostgreSQL, Prisma 6.19.0, @nestjs/schedule, @larksuiteoapi/node-sdk
- **Frontend**: Next.js 15.5.6, React 19, TypeScript, Tailwind CSS 4, @tanstack/react-query 5.90.8
- **Development**: pnpm 10.15.0, Turbo, ESLint, Prettier, Jest

## Development Commands

### Root Level (Monorepo)
```bash
pnpm install      # Install all dependencies
pnpm run dev      # Start all packages in development mode
pnpm run build    # Build all packages
pnpm run lint     # Run linting across all packages
pnpm run test     # Run tests across all packages
```

### Backend Package
```bash
cd packages/backend
pnpm run start:dev    # Start backend with file watching
pnpm run build        # Build backend
pnpm run test         # Run unit tests
pnpm run test:e2e     # Run end-to-end tests
pnpm run test:cov     # Run tests with coverage
pnpm run lint         # Run ESLint with auto-fix
```

### Frontend Package
```bash
cd packages/frontend
pnpm run dev    # Start development server (with Turbopack)
pnpm run build  # Build production bundle
pnpm run start  # Start production server
pnpm run lint   # Run ESLint
pnpm run lint:fix  # Run ESLint with auto-fix
```

## Database Setup

1. Copy environment file: `cp packages/backend/.env.example packages/backend/.env`
2. Configure `DATABASE_URL` in the `.env` file
3. Run migrations: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`

The database models include:
- **UserSpaceData**: Bilibili user space information
- **UserCard**: User profile cards with statistics
- **CronTrigger**: Scheduled task triggers
- **TaskExecution**: Task execution history and logs

## Task Scheduling Architecture

The core of this system is a sophisticated task scheduling engine with:

- **Decoupled Design**: Tasks and triggers are completely separate
- **Multiple Trigger Types**: Cron scheduling, manual API calls, event-driven (extensible)
- **Dynamic Configuration**: Triggers can be modified at runtime without restart
- **Middleware Support**: Logging, monitoring, persistence middleware
- **Error Handling**: Retry mechanisms, timeout handling, cancellation support

### Task System Structure

- **@Task Decorator**: Marks methods as executable tasks
- **@Trigger Decorator**: Associates tasks with trigger configurations
- **Task Service**: Central task execution and management
- **Trigger Service**: Manages different trigger types (cron, manual)
- **Task Execution Records**: Complete execution history and monitoring

Tasks are automatically discovered and registered when the backend starts.

## API Documentation

- **Task Management**: List, execute, monitor tasks via REST API
- **Trigger Management**: Create, update, disable/enable cron triggers
- **Execution History**: Complete task execution logging and monitoring

## Environment Variables

Backend environment variables in `packages/backend/.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `BILIBILI_COOKIE`: Bilibili API authentication
- `FEISHU_APP_ID` / `FEISHU_APP_SECRET`: Feishu integration credentials

## Project Structure

```
packages/backend/src/
├── services/task/          # Core task scheduling system
│   ├── tasks/             # Task implementations
│   │   ├── user-space-sync.task.ts
│   │   ├── user-card-sync.task.ts
│   │   └── feishu-sync/  # Feishu integration tasks
│   ├── trigger/           # Trigger management
│   └── user-space/        # Bilibili user data service
├── services/common/       # Shared services (Prisma, logging)
├── decorators/           # Custom decorators (@Task, @Trigger)
├── interfaces/           # TypeScript interfaces
└── prisma/               # Database schema and migrations

packages/frontend/src/
├── app/                  # Next.js App Router pages
├── apis/                # API client configurations
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
│   ├── api/             # API utilities
│   ├── utils/           # General utilities
│   └── query-client.ts  # React Query configuration
└── types/               # TypeScript type definitions
```

## Development Workflow

1. **Setup**: Install pnpm, run `pnpm install` at root
2. **Database**: Configure PostgreSQL and run migrations
3. **Development**: Use `pnpm run dev` to start all packages
4. **Fontend**: Next.js App Router with Turbopack for fast development

## Key Implementation Details

- **Task Discovery**: Tasks are automatically discovered using metadata reflection
- **Prisma Integration**: Database operations use Prisma client with proper error handling
- **Feishu Integration**: Uses @larksuiteoapi/node-sdk for Feishu API operations
- **React Query**: Frontend uses @tanstack/react-query for data fetching and caching
- **Type Safety**: Full TypeScript coverage with strict mode enabled

## 限制

- 不要添加没有要求的功能
- 只能在已有信息当中思考，不要凭空捏造无关的内容，除非用户要求