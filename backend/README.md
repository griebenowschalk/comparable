# Comparable serverless backend (reference)

## Guides

- **Per-service reference** (what exists, where in [`template.yaml`](template.yaml)): **[`guides/`](./guides/README.md)** (01 → 08).
- **Project reading order:** [`docs/INDEX.md`](../docs/INDEX.md).

---

This folder is a **deployable SAM stack** you can use to stand up the AWS side of **comparable** without a separate repository. It ships:

- **API Gateway** (REST, `Prod` stage) with **Cognito User Pool** authorizer  
- **Lambda** (Node.js 20) — compare API (`/me/compare`, `/me/compare/entries`, `/me/compare/entries/{entryId}`)  
- **DynamoDB** single-table (`PK` / `SK`) for `COMPARE#ENTRY#…` rows  

It matches the **comparison trio** in [`docs/serverless-fitness-data.md`](../docs/serverless-fitness-data.md) and the **GET response shape** expected by [`frontend/`](../frontend/). **Fitness profile / body / performance** routes are not in this template yet—extend `template.yaml` and `functions/api/handler.mjs` using that doc.

## Deploy

```bash
cd backend
sam build
sam deploy --guided
```

| After deploy | See |
| ------------ | --- |
| Output names (`ApiUrl`, `UserPoolId`, …) | [`guides/07-deploy-sam.md`](./guides/07-deploy-sam.md) |
| CLI / SAM prerequisites | [`guides/01-tooling-aws-cli-sam.md`](./guides/01-tooling-aws-cli-sam.md) |
| Repeatable deploys (`samconfig.toml`) | [`samconfig.toml.example`](samconfig.toml.example) (copy to `samconfig.toml`; file is gitignored) |

## Layout

| Path | Purpose |
| ---- | ------- |
| [`template.yaml`](template.yaml) | SAM: API, Lambda, DynamoDB, Cognito, outputs. |
| [`functions/api/handler.mjs`](functions/api/handler.mjs) | Lambda handler (compare routes + DynamoDB). |
| [`functions/api/package.json`](functions/api/package.json) | AWS SDK v3 dependencies. |

## Extending

- Add routes from [`docs/serverless-fitness-data.md`](../docs/serverless-fitness-data.md): new `Events` on `ApiFunction` (or additional functions), same `PK`/`SK` patterns.  
- Tighten **CORS** `AllowOrigin` in `template.yaml` to your CloudFront domain.  
- Add **usage plans / API keys** per [`docs/serverless-implementation-guide.md`](../docs/serverless-implementation-guide.md) §11.  

## Validate locally

```bash
sam validate
```

(`sam local start-api` can be used for quick tests; Cognito auth still applies.)
