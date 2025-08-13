# Agent Guide - Spotify React Prototype

## Commands

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build production bundle
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test src/components/ArtistGrid/ArtistGrid.test.tsx` - Run single test file
- `pnpm typecheck` - TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm prettier` - Format all files
- `pnpm validate` - Run test, lint, build, typecheck concurrently

## Architecture

React 18 + TypeScript + Vite app for Spotify profile/artists display. Uses @spotify/web-api-ts-sdk for API integration. Structure: `src/components/`, `src/pages/`, `src/hooks/`, `src/@types/`. Tests use Vitest + @testing-library/react with jsdom environment.

## Code Style

- TypeScript strict mode enabled
- Prettier: single quotes, no semicolons
- ESLint with ts-prefixer config and React hooks rules
- Path alias: `@/*` maps to `src/*`
- Test files: `*.test.tsx` or `*.test.ts` pattern
- Imports: Use `@/` alias for internal imports
