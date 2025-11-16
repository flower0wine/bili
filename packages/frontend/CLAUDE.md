# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this frontend package.

## Project Overview

Frontend package for a task scheduling system with Bilibili user data integration. Built with Next.js 15, React 19, and modern web technologies.

## Key Technologies

- **Framework**: Next.js 15.5.6 (App Router) + React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: @tanstack/react-query for server state
- **HTTP Client**: axios
- **Icons**: Lucide React + Carbon Icons
- **Charts**: echarts-for-react
- **Animations**: framer-motion
- **Development**: Turbopack, TypeScript, ESLint

## Development Commands

```bash
# Development
pnpm run dev              # Start development server with Turbopack
pnpm run build            # Build for production with Turbopack
pnpm run start            # Start production server

# Code Quality
pnpm run lint             # Run ESLint
pnpm run lint:fix         # Auto-fix ESLint issues
```

## Code Standards

### ESLint Configuration

- Base: @antfu/eslint-config
- Styling: 2-space indentation, double quotes, semicolons
- TypeScript: Strict mode enabled with some safety rules relaxed
- Console usage: Allowed (warning level)
- Tailwind CSS class names: Supported and validated

### TypeScript Configuration

- Target: ES2017
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled with incremental compilation
- JSX and Next.js types supported

### Styling with Tailwind CSS

- Uses Tailwind CSS 4 with modern utility-first approach
- shadcn/ui preset with built-in color system
- Icon presets, animations, and variant groups enabled
- Media query-based dark mode support

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   └── user/[id]/page.tsx # User detail page
├── components/            # Reusable React components
│   ├── ui/                # Reusable UI components
├── apis/                  # API interface definitions
│   ├── index.ts          # Unified exports
│   ├── user-space.api.ts # User space API
│   ├── user-card.api.ts  # User card API
│   ├── task.api.ts       # Task API
│   └── trigger.api.ts    # Trigger API
├── hooks/                 # Custom React hooks
│   ├── apis/             # API-related hooks
│   └── index.ts          # Unified exports
├── lib/                   # Utility libraries
│   ├── api/              # API utilities (axios config)
│   ├── utils/            # Common utility functions
│   ├── query-client.ts   # React Query configuration
│   └── utils.tsx         # React utility functions
├── types/                 # TypeScript type definitions
│   ├── pagination.ts     # Pagination types
│   ├── task.d.ts         # Task types
│   ├── trigger.d.ts      # Trigger types
│   ├── user-card.d.ts    # User card types
│   ├── user-space.d.ts   # User space types
│   └── http.d.ts         # HTTP response types
└── providers/             # React Context providers
    └── query-provider.tsx # React Query provider
```

## Build Configuration

### Next.js Configuration (next.config.ts)

- Turbopack enabled for development and build
- API proxy: `/api/*` -> `http://localhost:9000/api/*`
- Image optimization: All external domains allowed
- Locator integration for development tools

## Git Hooks

- **Pre-commit**: Automatic lint-staged execution for all files
- **Lint-staged**: Runs ESLint with auto-fix on staged files

## API Integration

The frontend connects to a backend service running on `localhost:9000` with the following main API modules:

- User space data management
- User card information
- Task scheduling and execution
- Trigger management

## Development Workflow

1. Install dependencies with `pnpm install`
2. Start development server with `pnpm run dev`
3. ESLint will run automatically on commit
4. Use path alias `@/` for imports from src directory
5. Follow the established component and API patterns
