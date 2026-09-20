# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start the Vite dev server
- `pnpm build` — type-check (`tsc -b`) and build for production
- `pnpm lint` — run oxlint
- `pnpm preview` — preview a production build locally

This project uses pnpm (see `pnpm-lock.yaml`). There is no test suite configured.

## Architecture

Decision Wheel is a single-page React app that displays a slot-machine-style spinner over a list of words/items and lands on one at random.

- **`src/hooks/useWordSource.ts`** — owns where the item list comes from and its load state. Three source modes: `default` (bundled `public/default-items.txt`), `url` (fetches a user-supplied plain-text URL, one item per line), and `custom` (user-pasted text). Config is persisted to `localStorage` under `decision-wheel:source-config`. If a non-default source fails to load, it silently falls back to the default list while still surfacing the error message. This hook is the single source of truth for `items`/`status`/`error`/`config` consumed by `App.tsx`.
- **`src/components/Spinner.tsx`** — the reel animation, exposed to its parent via `useImperativeHandle`/`forwardRef` as `{ spin() }` (see `SpinnerHandle`). Spinning works by building a flat list of items to render (`renderItems`) long enough to cover several full loops plus the steps to the randomly chosen target, then animating a CSS `transform: translateY` over `SPIN_DURATION_MS`. The list is rebuilt from scratch, and the reel snaps back to a single-item list, whenever the animation completes — there's no infinite reel, just enough rendered rows to cover one spin.
- **`src/App.tsx`** — wires the hook's data into the `Spinner` and triggers an automatic first spin shortly after the item list becomes ready (`hasAutoSpun` ref guards this to once per mount).
- **`src/components/SettingsModal.tsx`** — lets the user switch between `url` and `custom` source modes (the `default` mode is only reachable via "Reset to default", not a selectable tab) and persists changes through `onSave` → `useWordSource`'s `updateConfig`.
- **`src/components/Icon.tsx`** — thin wrapper around the `eva-icons` package; looks up an icon by name from `eva.icons` and injects its raw SVG contents.
- Styling is done with `styled-components`; the theme (`src/theme.ts`) is provided via `ThemeProvider` in `main.tsx`, and global/reset styles live in `src/GlobalStyle.ts`.
- Vite is configured with the Babel-based React Compiler plugin (`vite.config.ts`), so components are auto-memoized at build time — avoid manual `useMemo`/`useCallback` unless there's a specific reason the compiler can't optimize it.
