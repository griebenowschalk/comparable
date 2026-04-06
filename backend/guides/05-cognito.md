# 05 — Cognito

## What this is

**Amazon Cognito User Pools** are a managed **user directory**: sign-up, sign-in, password reset, and **JWTs** (ID token, access token, refresh token). **API Gateway** can validate those tokens with a **Cognito User Pool authorizer** so Lambda receives **claims** (e.g. `sub`, `email`) without verifying the JWT in code.

---

## How it is set up in this repo (SAM / IaC)

[`template.yaml`](../template.yaml):

### User pool (`UserPool`)

| Setting | Purpose |
| ------- | ------- |
| **UsernameAttributes: email** | Users sign in with email. |
| **AutoVerifiedAttributes: email** | Email verification flow enabled. |
| **PasswordPolicy** | `MinimumLength: 8` (tighten for prod: complexity, MFA—see below). |

### App client (`UserPoolClient`)

| Setting | Purpose |
| ------- | ------- |
| **GenerateSecret: false** | **Required** for SPAs and mobile apps (no embedded secret). |
| **ExplicitAuthFlows** | `ALLOW_USER_SRP_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH` — secure password flow without sending password to Lambda. |

For **CLI testing** with `ADMIN_NO_SRP_AUTH`, you do not need to change these flows;

### API Gateway authorizer

`ComparableApi` → `Auth` → `Authorizers` → **Cognito User Pool** authorizer using `!GetAtt UserPool.Arn`. It is the **default** authorizer for routes defined on `ApiFunction`.

**Stack outputs:** `UserPoolId`, `UserPoolClientId` — use in Amplify, Hosted UI, or env config.

---

## Settings to review (security & UX)

| Setting | Recommendation |
| ------- | ---------------- |
| **MFA** | Enable **optional or required MFA** (TOTP/SMS) for production accounts. |
| **Password policy** | Increase minimum length and require upper/lower/digit/symbol in **User pool** → **Policies**. |
| **Account takeover** | **Cognito Advanced Security** (extra cost) for risk-based auth in sensitive apps. |
| **Token expiration** | **App client** → **Token expiration** — shorter access/ID token lifetime for higher security; balance with refresh UX. |
| **Callback URLs** | When using Hosted UI or OAuth, restrict **Callback URLs** and **Sign out URLs** to your **localhost** + **CloudFront** domains only. |
| **Prevent user enumeration** | Configure **message** templates and signup behavior to avoid leaking which emails exist (Cognito settings). |

---

## Equivalent in the AWS Console (learning only)

1. **Cognito** → **Create user pool** → choose sign-in options (email), password policy, MFA.
2. **App integration** → **App client** → **public client** (no secret).
3. **API Gateway** → your API → **Authorizers** → **Create** → type **Cognito**, select pool and region.
4. Attach authorizer to **methods** that should require login.

---

## Token type (ID vs access)

API Gateway Cognito authorizers are often configured to accept the **ID token** or **access token**. **Pick one**, align the app client and authorizer, and send `Authorization: Bearer <that token>`. This repo’s handler reads **claims** from `requestContext.authorizer.claims` (typical for User Pool authorizer with ID token).

---

## What to extend next

**Social IdPs** (Google, Apple), **custom attributes**, **Lambda triggers** (pre sign-up, pre token generation)—see [Cognito docs](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html). The SPA wires **User Pool + app client** via [08](08-frontend-wiring.md) (`PUBLIC_COGNITO_*` env vars).

**Official:** [User pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) · [App clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html).
