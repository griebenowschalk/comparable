# AWS setup, resources, and security (overview)

This document ties together **how** the comparable stack is created in AWS and **what** to verify for security and operations. The **authoritative implementation** is **Infrastructure as Code** in [`backend/template.yaml`](../backend/template.yaml) deployed with **SAM** (CloudFormation under the hood).

| Topic | Primary guide |
| ----- | ------------- |
| CLI, SAM, region, deploy permissions | [`backend/guides/01-tooling-aws-cli-sam.md`](../backend/guides/01-tooling-aws-cli-sam.md) |
| DynamoDB table, keys, encryption, IAM to table | [`backend/guides/02-dynamodb.md`](../backend/guides/02-dynamodb.md) |
| API Gateway REST, routes, CORS, authorizer | [`backend/guides/03-api-gateway.md`](../backend/guides/03-api-gateway.md) |
| Lambda runtime, handler, env, logging, IAM role | [`backend/guides/04-lambda.md`](../backend/guides/04-lambda.md) |
| Cognito User Pool, app client, JWT | [`backend/guides/05-cognito.md`](../backend/guides/05-cognito.md) |
| IAM least privilege, secrets, threat model | [`backend/guides/06-iam-and-security.md`](../backend/guides/06-iam-and-security.md) |
| `sam build` / `sam deploy`, outputs, teardown | [`backend/guides/07-deploy-sam.md`](../backend/guides/07-deploy-sam.md) |
| SPA env vars, tokens, CORS from browser | [`backend/guides/08-frontend-wiring.md`](../backend/guides/08-frontend-wiring.md) |

---

## Two ways to “set up” AWS

1. **Recommended (this repo):** Define resources in **`template.yaml`** and deploy with **`sam deploy`**. One stack creates or updates API Gateway, Lambda, DynamoDB, Cognito, and IAM in a repeatable way. Use **CloudFormation** console to inspect the stack, **Events** tab for failures, **Resources** tab for physical IDs.

2. **Console-only (learning):** You *can* create each service in the AWS Console (API Gateway → Lambda → DynamoDB → Cognito) and wire them manually. That teaches the UI but is **error-prone** and **not** what this repo tracks. For parity with this project, mirror the same settings described in the guides above and in `template.yaml`.

---

## Security themes (apply everywhere)

| Area | Do |
| ---- | -- |
| **Identity** | End users authenticate with **Cognito**; APIs use **`sub`** from the verified JWT, not a client-supplied user id in the URL ([`serverless-fitness-data.md`](./serverless-fitness-data.md)). |
| **Network** | API Gateway is **HTTPS** only. No DB or Lambda admin ports exposed publicly. |
| **Data** | DynamoDB **encryption at rest** is on by default; restrict access with **IAM** (Lambda role scoped to one table). |
| **Secrets** | **Never** put AWS access keys in the frontend bundle. Pool id / region / API URL can be public; **JWTs** are bearer tokens—treat like passwords in transit. |
| **CORS** | This template uses `AllowOrigin: '*'` for simplicity—**tighten** to your CloudFront or dev origin in production ([`serverless-implementation-guide.md`](./serverless-implementation-guide.md)). |
| **Add-ons** | Optional: **API Gateway usage plans + API keys** (throttling / metering), **AWS WAF** on API Gateway, **Cognito Advanced Security**, **CloudWatch alarms**, **DynamoDB PITR** for prod—see guides **03**, **05**, **06**, **07**. |

---

## After deploy: verify

- **Outputs:** `ApiUrl`, `UserPoolId`, `UserPoolClientId`, `FitnessTableName` ([`backend/README.md`](../backend/README.md)).
- **Lambda:** CloudWatch Logs → log group `/aws/lambda/<stack>-ApiFunction-…` for errors.
- **DynamoDB:** Console → table → **Explore items** (or Query) with `PK = USER#<sub>` after writes.

---

## Related

- **Data contract:** [`serverless-fitness-data.md`](./serverless-fitness-data.md)
- **Phases (S3, CloudFront, troubleshooting):** [`serverless-implementation-guide.md`](./serverless-implementation-guide.md)
- **Custom domain for the SPA (ACM in `us-east-1`, Route 53 alias, CloudFront CNAME):** [`serverless-implementation-guide.md`](./serverless-implementation-guide.md) §7.2 — links to AWS docs for ACM, Route 53, and CloudFront.
