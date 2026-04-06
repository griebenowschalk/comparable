# 08 — Frontend wiring

## What this is

The React app in [`../../frontend/`](../../frontend/) calls the **deployed API Gateway URL** over **HTTPS** and sends **`Authorization: Bearer <ID token>`** after **Cognito sign-in** (`amazon-cognito-identity-js` SRP flow). Tokens are kept in React state and restored via **Cognito’s persisted session** (`getSession` on load).

---

## Get stack outputs (CLI)

After **`sam deploy`** succeeds, list outputs (adjust stack name and region if needed):

```bash
aws cloudformation describe-stacks \
  --stack-name comparable-backend \
  --region eu-west-1 \
  --query "Stacks[0].Outputs" \
  --output table
```

---

## Environment variables

Copy [`../../frontend/.env.example`](../../frontend/.env.example) → **`frontend/.env`** and set:

| `frontend/.env` | CloudFormation output |
| --------------- | --------------------- |
| `PUBLIC_API_URL` | `ApiUrl` (**no trailing slash** — the template output already avoids one). |
| `PUBLIC_COGNITO_USER_POOL_ID` | `UserPoolId` |
| `PUBLIC_COGNITO_CLIENT_ID` | `UserPoolClientId` (same app client the API Gateway authorizer uses). |

No separate “dev bearer” variable—the SPA obtains JWTs from **email/password sign-in** and sign-up + email confirmation.

**Security:** Pool id and client id are **public** by design (they ship in the frontend). Never put **AWS access keys** or **client secrets** in the bundle; this template uses a **public** app client (`GenerateSecret: false`).

---

## Run the app

From [`../../frontend/`](../../frontend/):

```bash
bun dev
# or: npm run dev
```

Sign up (and **confirm email** if the user pool requires it), then use **compare**.

---

## Optional sanity checks

- **API Gateway** → **Stages** → **`Prod`** matches the base path you put in `PUBLIC_API_URL`.
- **Cognito** → **App client** id matches **`PUBLIC_COGNITO_CLIENT_ID`**.
- **Bypass the UI:** `GET` to `/me/compare` with a real **`Authorization: Bearer <id token>`** (after sign-in).

---

## CORS (browser side)

The API must allow your **origin** (e.g. local dev server or CloudFront URL). This template sets permissive CORS on API Gateway; the Lambda also returns `Access-Control-Allow-Origin` in [`handler.mjs`](../functions/api/handler.mjs). If you see **CORS errors**, verify **API Gateway CORS**, **Lambda response headers**, and **exact origin** (scheme + host + port).

---

## Compare feature

Implementation: [`../../frontend/src/features/auth/cognito.ts`](../../frontend/src/features/auth/cognito.ts), [`../../frontend/src/api/client.ts`](../../frontend/src/api/client.ts). Contract: [`../../docs/serverless-fitness-data.md`](../../docs/serverless-fitness-data.md) and [`../../docs/serverless-implementation-guide.md`](../../docs/serverless-implementation-guide.md) §9–10.

---

## What to extend next

- **Cognito Hosted UI** or **social IdPs** if you want OAuth redirects instead of the built-in forms.
- **Token refresh:** the SDK refreshes via `getSession` when a refresh token exists; tune **token lifetime** in the User Pool app client if needed.

**Official:** [`README.md`](../../README.md) (repo root) · [`../../frontend/src/env.ts`](../../frontend/src/env.ts).
