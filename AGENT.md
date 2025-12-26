# Agent Guide - Spotify React Prototype

## Commands

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build production bundle
- `pnpm test` - Run all tests
- `pnpm test src/components/ArtistGrid/ArtistGrid.test.tsx` - Run single test file
- `pnpm typecheck` - TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm validate` - Run test, lint, build, typecheck concurrently

## Architecture

React 19 + TypeScript + Vite app for Spotify profile/artists display. Uses @spotify/web-api-ts-sdk for API integration and MSW for mocking.

- `src/components/` - Reusable UI components (shadcn/ui in `ui/`)
- `src/pages/` - Page components (Dashboard, Login, etc.)
- `src/hooks/` - Custom React hooks (useSpotify, useEventsByCity)
- `src/services/` - External API integrations
- `src/lib/` - Utilities (cn for classnames)
- `src/@types/` - TypeScript type definitions

Tests use Vitest + @testing-library/react with jsdom environment.

## Code Style

- TypeScript strict mode, no `any` or `@ts-ignore`
- Prettier: single quotes, no semicolons
- Path alias: `@/*` maps to `src/*`
- Imports: Use `@/` alias, group external → internal → types
- Components: React.FC with explicit props interface
- Test files: `*.test.tsx` colocated with components
