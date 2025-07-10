# Spotify React Prototype

### Description

This is prototype app built in React using typescript. Incorporating the Spotify web SDK, to retrieve and render a spotify user profile.

**Tech Stack:**

- ⚛️ React 18 with TypeScript
- ⚡ Vite for fast development and building
- 🎨 Tailwind CSS for styling
- 🧪 Vitest for testing
- 🧪 @testing-library/react for DOM testing
- 📦 pnpm for package management
- 🐙 GitHub Workflow for lint, test, build automation
- 🎵 @spotify/web-api-ts-sdk for Spotify API integration

This project was bootstrapped using the [create-react-app-vite](https://github.com/laststance/create-react-app-vite) template, providing a modern development experience with hot module replacement and optimized builds.
To run this app locally you need an spotify client id and register an app with spotify, here's where to start that process. https://developer.spotify.com/

### pnpm

```sh
pnpm install
pnpm validate
pnpm start
```

If you don't need TailwindCSS, run `pnpm remove:tailwind` after npm installed.

### Commands

```sh
pnpm dev             # start development server
pnpm start           # start development server
pnpm validate        # run test,lint,build,typecheck concurrently
pnpm test            # run jest
pnpm lint            # run eslint
pnpm lint:fix        # run eslint with --fix option
pnpm typecheck       # run TypeScript compiler check
pnpm build           # build production bundle to 'dist' directly
pnpm prettier        # run prettier for json|yml|css|md|mdx files
pnpm clean           # remove 'node_modules' 'yarn.lock' 'dist' completely
pnpm serve           # launch server for production bundle in local
pnpm remove:tailwind # remove TailwindCSS
```

# Learning Notes:

- The act extension for the GH command line tool is helpful testing workflows locally prior to PRs. Requires Docker.
  https://nektosact.com/introduction.html

- Vitest provides nice mocking for testing page components and external APIs

- First time using pnpm, the command line is similar to yarn. pnpm stands for proficient node package management, it intend to cut down of duplicate packages among local applications.

- Using a app template to bootstrap the project was really helpful getting started quickly

- First time using tailwind, it was fine. No strong opinion at this point.

