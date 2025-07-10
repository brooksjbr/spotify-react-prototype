# Spotify UI

### Description

This is prototype app built in React, integrating with the Spotify typescript SDK.

**Tech Stack:**

- ⚛️ React 18 with TypeScript
- ⚡ Vite for fast development and building
- 🎨 Tailwind CSS for styling
- 🧪 Vitest + Jest for testing
- 📦 pnpm for package management

This project was bootstrapped using the [create-react-app-vite](https://github.com/laststance/create-react-app-vite) template, providing a modern development experience with hot module replacement and optimized builds.

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

# Notes:

The act extension for the GH command line tool is helpful testing workflows locally prior to PRs. Requires Docker.
https://nektosact.com/introduction.html
