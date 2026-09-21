# Decision Wheel

A single-page React app that displays a slot-machine-style spinner over a list of words/items and lands on one at random. Useful for making quick decisions when you can't pick between a set of options.

## Features

- Slot-machine-style spin animation that lands on a random item
- Three item source modes:
  - **Default** — the bundled default word list
  - **URL** — fetch a plain-text list from a user-supplied URL (one item per line)
  - **Custom** — paste your own list of items
- Source configuration is saved to `localStorage`, so it persists across sessions
- Automatically spins once on load

## Getting started

This project uses [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

## Commands

- `pnpm dev` — start the Vite dev server
- `pnpm build` — type-check (`tsc -b`) and build for production
- `pnpm lint` — run oxlint
- `pnpm preview` — preview a production build locally

There is no test suite configured.

## Tech stack

- [React](https://react.dev) 19 + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev), with the Babel-based [React Compiler](https://react.dev/learn/react-compiler) plugin
- [styled-components](https://styled-components.com) for styling
- [eva-icons](https://akveo.github.io/eva-icons/) for icons
