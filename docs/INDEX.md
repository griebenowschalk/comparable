# Documentation index

## Start here

Follow this path to understand what the repo contains and how it fits together:

1. **[`README.md`](../README.md)** — what the app is, how to run the **frontend** (Bun), and where the **backend** SAM stack lives.
2. **[`aws-setup-and-security.md`](./aws-setup-and-security.md)** — how resources are created (SAM vs console), security themes, and links into every backend guide.
3. **[`backend/guides/README.md`](../backend/guides/README.md)** — read guides **01 → 08** in order. They explain **API Gateway, Lambda, DynamoDB, Cognito, IAM**, deploy, and frontend wiring—including **settings to verify** for each service.
4. **[`backend/README.md`](../backend/README.md)** — deploy commands and stack outputs after you understand the guides.
5. **[`serverless-fitness-data.md`](./serverless-fitness-data.md)** — DynamoDB keys, entities, and `/me/...` API contract (compare + future fitness).
6. **[`serverless-implementation-guide.md`](./serverless-implementation-guide.md)** — long-form phases (bootstrap, S3/CloudFront, troubleshooting, usage plans) when you want the full narrative or to duplicate the stack from scratch.

The **frontend** code paths for auth and compare are described in the root `README.md` (routes and feature layout).

---

## Part I — Core serverless (reading order)

This order matches a typical path: **tooling → table → API → Lambda → Cognito → deploy → wire the SPA**.[^footnote]

| Step | Topic | Where to read |
| ---- | ----- | ------------- |
| 1 | Account, region, billing alerts | [`serverless-implementation-guide.md`](./serverless-implementation-guide.md) §2 · [`backend/guides/01-tooling-aws-cli-sam.md`](../backend/guides/01-tooling-aws-cli-sam.md) |
| 2 | AWS CLI + SAM CLI | [`backend/guides/01-tooling-aws-cli-sam.md`](../backend/guides/01-tooling-aws-cli-sam.md) |
| 3 | DynamoDB single-table (`PK` + `SK`) | [`backend/guides/02-dynamodb.md`](../backend/guides/02-dynamodb.md) · [`serverless-fitness-data.md`](./serverless-fitness-data.md) |
| 4 | API Gateway (REST, CORS, authorizer) | [`backend/guides/03-api-gateway.md`](../backend/guides/03-api-gateway.md) |
| 5 | Lambda + IAM | [`backend/guides/04-lambda.md`](../backend/guides/04-lambda.md) · [`backend/guides/06-iam-and-security.md`](../backend/guides/06-iam-and-security.md) |
| 6 | Cognito | [`backend/guides/05-cognito.md`](../backend/guides/05-cognito.md) |
| 7 | Deploy + compare API | [`backend/README.md`](../backend/README.md) · [`backend/guides/07-deploy-sam.md`](../backend/guides/07-deploy-sam.md) |
| 8 | Frontend env + API | [`backend/guides/08-frontend-wiring.md`](../backend/guides/08-frontend-wiring.md) · [`serverless-implementation-guide.md`](./serverless-implementation-guide.md) §9–10 |

**Contract for compare + fitness:** [`serverless-fitness-data.md`](./serverless-fitness-data.md).

**End-to-end phases (detailed):** [`serverless-implementation-guide.md`](./serverless-implementation-guide.md) (phases 1–8, troubleshooting, usage plans).

---

## Part II — Product extensions

| Topic | Where to read |
| ----- | ------------- |
| Fitness entities, routes, `/me/...` API | [`serverless-fitness-data.md`](./serverless-fitness-data.md) |
| S3 + CloudFront, deployment, portfolio | [`serverless-implementation-guide.md`](./serverless-implementation-guide.md) §7–8, §11 |
| Custom domain (ACM, Route 53, CloudFront) | [`serverless-implementation-guide.md`](./serverless-implementation-guide.md) §7.2 |
| Extend SAM template + Lambda | [`backend/README.md`](../backend/README.md) · [`backend/guides/`](../backend/guides/README.md) |

---

## Backend guides (quick reference)

| Guide | Purpose |
| ----- | ------- |
| [`backend/guides/README.md`](../backend/guides/README.md) | Index + architecture diagram |
| [`01-tooling-aws-cli-sam.md`](../backend/guides/01-tooling-aws-cli-sam.md) | CLI + SAM |
| [`02-dynamodb.md`](../backend/guides/02-dynamodb.md) | Table + keys |
| [`03-api-gateway.md`](../backend/guides/03-api-gateway.md) | REST API, authorizer, CORS |
| [`04-lambda.md`](../backend/guides/04-lambda.md) | Runtime, handler, this repo’s function |
| [`05-cognito.md`](../backend/guides/05-cognito.md) | User pool, app client, JWT |
| [`06-iam-and-security.md`](../backend/guides/06-iam-and-security.md) | Roles, least privilege |
| [`07-deploy-sam.md`](../backend/guides/07-deploy-sam.md) | Build, deploy, outputs |
| [`08-frontend-wiring.md`](../backend/guides/08-frontend-wiring.md) | `PUBLIC_API_URL`, tokens |

---
