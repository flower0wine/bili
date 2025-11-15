# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **backend** package of a monorepo for a task scheduling system built on NestJS. The core innovation is a **completely decoupled task scheduling architecture** where business logic (Task) is completely separated from trigger mechanisms (Trigger).

## Key Technologies

- **Framework**: NestJS 11.0.1 with TypeScript
- **Database**: PostgreSQL with Prisma 6.19.0 ORM
- **Task Scheduling**: @nestjs/schedule + custom decoupled architecture
- **External APIs**: @larksuiteoapi/node-sdk (Feishu), Bilibili API integration
- **Logging**: nestjs-pino with structured logging
- **Documentation**: Swagger/OpenAPI with @nestjs/swagger

## Development Commands

```bash
# Environment setup
cp .env.example .env  # Configure DATABASE_URL and other env vars
npx prisma migrate dev  # Run database migrations
npx prisma generate    # Generate Prisma client

# Development
pnpm run start:dev    # Start with file watching
pnpm run start:debug  # Start with debug mode

# Building and Production
pnpm run build        # Build the application
pnpm run start:prod   # Start production build

# Testing
pnpm run test         # Run unit tests
pnpm run test:e2e     # Run end-to-end tests
pnpm run test:cov     # Run tests with coverage

# Code Quality
pnpm run lint         # Run ESLint with auto-fix
pnpm run format       # Format code with Prettier
```

## Core Architecture: Decoupled Task Scheduling

### Design Philosophy
The system implements a **task-trigger separation** pattern:
- **Tasks**: Pure business logic that knows nothing about when/how they'll be executed
- **Triggers**: Scheduling mechanisms that know nothing about task implementation
- **Middleware**: Cross-cutting concerns (logging, monitoring, persistence)

### Directory Structure

```
src/
├── services/
│   ├── task/              # Core task scheduling system
│   │   ├── decorators/    # @Task, @Trigger decorators
│   │   ├── interfaces/    # TypeScript interfaces
│   │   ├── trigger/       # Trigger management (cron, manual)
│   │   └── tasks/         # Task implementations
│   ├── common/            # Shared services (Prisma, logging)
│   ├── user-space/        # Bilibili user space service
│   ├── user-card/         # User profile cards service
│   ├── feishu-sync/       # Feishu integration service
│   └── git/               # Git-related services
├── decorators/            # Custom decorators
├── filters/              # Global exception filters
├── interceptors/         # Response transformation
├── pipes/                # Global validation pipes
├── interfaces/           # TypeScript interfaces
└── prisma/               # Database schema and migrations
```

## Task System Patterns

### Creating Tasks
```typescript
@Injectable()
export class MyTask {
  @Task({
    name: "my-task",
    description: "Task description",
    timeout: 60000
  })
  async execute(params?: any) {
    // Pure business logic
    return { success: true };
  }
}
```

### Task Registration
Tasks are automatically discovered using metadata reflection when the backend starts.

### Trigger Configuration
Triggers are configured in `trigger.config.ts` and can be managed via API:
- **Cron Triggers**: Time-based scheduling
- **Manual Triggers**: API-initiated execution
- **Event Triggers**: Extensible for future event-driven execution

## API Architecture

- **Global Prefix**: `/api`
- **Versioning**: URI-based (default: v1)
- **Documentation**: Swagger at `/docs`
- **Authentication**: Bearer token support
- **Validation**: Global DTO validation
- **Error Handling**: Centralized exception filters
- **Logging**: Structured logging with request IDs

## Database Setup

1. Configure `DATABASE_URL` in `.env`
2. Run migrations: `npx prisma migrate dev`
3. Generate client: `npx prisma generate`

Key models:
- **UserSpaceData**: Bilibili user space information
- **UserCard**: User profile cards with statistics
- **CronTrigger**: Scheduled task triggers
- **TaskExecution**: Task execution history and logs

## Development Workflow

1. **Local Development**: Use `pnpm run start:dev` for hot reloading
2. **API Testing**: Use Swagger UI at `/docs` or included `.http` files
3. **Database Changes**: Create Prisma migrations, then generate client
4. **Adding Tasks**: Create task classes with `@Task` decorator, auto-discovered
5. **Adding Triggers**: Update `trigger.config.ts` or use API endpoints

## Environment Variables

Backend `.env` configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Application port (default: 9000)
- `NODE_ENV`: Environment (development/production)
- `BILIBILI_COOKIE`: Bilibili API authentication
- `FEISHU_APP_ID` / `FEISHU_APP_SECRET`: Feishu integration credentials

## Key Implementation Details

- **Task Discovery**: Uses metadata reflection for automatic task registration
- **Prisma Integration**: Centralized PrismaService with proper error handling
- **External APIs**: Bilibili and Feishu SDKs for data synchronization
- **Structured Logging**: Request correlation IDs and redacted sensitive data
- **Type Safety**: Full TypeScript coverage with strict mode enabled