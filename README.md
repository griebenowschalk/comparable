# comparable

[![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb)](https://react.dev/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-232F3E?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)

A serverless application for capturing personal data and comparing it.

## Documentation

**Entry point:** **[`docs/INDEX.md`](docs/INDEX.md)** — where to start, Part I / II order, and links across [`frontend/`](frontend/), [`docs/`](docs/), and [`backend/`](backend/).

- [`docs/aws-setup-and-security.md`](docs/aws-setup-and-security.md) — how API Gateway, Lambda, DynamoDB, Cognito, and IAM fit together; security checklist; links to detailed guides.
- [`backend/guides/`](backend/guides/README.md) — backend sections **01–08** (CLI → frontend wiring), tied to `template.yaml`.
- [`docs/serverless-fitness-data.md`](docs/serverless-fitness-data.md) — DynamoDB keys, entities, `/me/...` routes.
- [`docs/serverless-implementation-guide.md`](docs/serverless-implementation-guide.md) — full phased walkthrough (hosting, troubleshooting, usage plans).

## Backend (reference SAM stack)

[`backend/`](backend/) contains a **deployable** [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) template (`template.yaml`), Lambda source (`functions/api/`), **[`backend/README.md`](backend/README.md)**, and **[`backend/guides/`](backend/guides/README.md)**. It implements the **comparison** API (`/me/compare/...`) and DynamoDB keys from the docs; extend it for fitness profile / body / performance routes.

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

Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env`: set **`PUBLIC_API_URL`** (API Gateway `ApiUrl` output) and **`PUBLIC_COGNITO_USER_POOL_ID`** / **`PUBLIC_COGNITO_CLIENT_ID`** (same stack’s Cognito outputs). Sign-in uses **Cognito SRP**; the ID token is sent to the API automatically—no extra bearer env var.

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
