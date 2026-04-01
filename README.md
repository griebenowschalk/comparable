# comparable

A serverless application for capturing personal data and comparing it.

## Frontend

The UI lives in [`frontend/`](frontend/): **React**, **Tailwind CSS**, **shadcn/ui**, developed with **[Bun](https://bun.sh/)** only (HTML entry + `bun-plugin-tailwind`—no Vite, no npm).

```bash
cd frontend
bun install
bun run dev
```

Other useful commands (all use Bun):

- `bun run build` — production bundle to `frontend/dist`
- `bun run lint` / `bun run lint:fix`
- `bun run format` / `bun run format:check`
- `bun run typecheck`

Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env` and set `PUBLIC_API_URL` for your API base URL.

Routes (`react-router-dom`):

| Path       | Screen |
| ---------- | ------ |
| `/`        | [`SignInPage`](frontend/src/features/auth/pages/sign-in-page.tsx) |
| `/signup`  | [`SignUpPage`](frontend/src/features/auth/pages/sign-up-page.tsx) |
| `/compare` | [`ComparePage`](frontend/src/features/compare/pages/compare-page.tsx) (requires auth) |

### Feature-based layout

| Area | Purpose |
| ---- | ------- |
| [`src/app/`](frontend/src/app/) | App shell: [`App.tsx`](frontend/src/app/App.tsx) (routes + layout). |
| [`src/features/<name>/`](frontend/src/features/) | Vertical slice: pages, components, hooks, types, context. |
| [`src/shared/components/`](frontend/src/shared/components/) | Shared UI: **atoms**, **molecules**, **layout**, and [`ui/`](frontend/src/shared/components/ui/) for **shadcn/ui** CLI output (e.g. [`button`](frontend/src/shared/components/ui/button.tsx)). |

**Conventions:** import from a feature’s public API via [`features/<name>/index.ts`](frontend/src/features/auth/index.ts) when crossing boundaries; use relative imports inside the same feature.

## Git hooks

At the repo root, **Husky** runs:

- **pre-commit:** [lint-staged](https://github.com/lint-staged/lint-staged) (ESLint + Prettier on staged files under `frontend/`)
- **pre-push:** `lint`, `typecheck`, and `build` in `frontend/`

Install hooks with `bun install` (the `prepare` script runs `husky`).
