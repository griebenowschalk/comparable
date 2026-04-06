# 04 — Lambda

## What this is

**AWS Lambda** runs your code on demand without managing servers. **API Gateway** invokes the function synchronously for each HTTP request (**request-response** pattern). This repo uses **Node.js 20** and the **AWS SDK v3** for DynamoDB.

---

## How it is set up in this repo (SAM / IaC)

[`template.yaml`](../template.yaml) — resource `ApiFunction` (`AWS::Serverless::Function`):

| Setting | Value | Notes |
| ------- | ----- | ----- |
| **Runtime** | `nodejs20.x` | From `Globals.Function`. |
| **Handler** | `handler.handler` | File `handler.mjs`, exported `handler`. |
| **CodeUri** | `functions/api/` | SAM builds with **npm** (`Metadata: BuildMethod: npm`). |
| **Timeout** | `29` seconds | API Gateway has ~29s max integration timeout; keep handler under this. |
| **Memory** | `256` MB | More memory = proportionally more CPU; tune if needed. |
| **Architecture** | `x86_64` | Match any native deps; `arm64` optional for Graviton cost savings. |
| **Environment** | `TABLE_NAME` | Resolves to DynamoDB table name at deploy time. |
| **Policies** | `DynamoDBCrudPolicy` | Grants CRUD on the referenced table only (see [06](06-iam-and-security.md)). |

**Events:** Each `Type: Api` event wires one HTTP method + path to this function (see [03](03-api-gateway.md)).

---

## Lambda proxy event (what your code receives)

API Gateway **proxy** integration sends one JSON **event** per request, including:

- `httpMethod`, `path`, `resource`, `pathParameters`, `queryStringParameters`, `body`
- `requestContext.authorizer.claims` — Cognito JWT claims after authorizer success (`sub`, `email`, …)

The handler in [`handler.mjs`](../functions/api/handler.mjs) reads **`sub`** to build `PK = USER#${sub}`.

---

## CloudWatch Logs (operations)

- Lambda **automatically** writes logs to a log group: `/aws/lambda/<function-name>`.
- **Retention:** Default is often “never expire”; set **retention** (e.g. 7–30 days) on the log group in production to control cost.
- **Errors:** `console.error` and uncaught exceptions appear here—use for debugging 500s.

**X-Ray:** Not enabled in this template. Enable **active tracing** on the function + API Gateway for distributed tracing if you need it.

---

## Optional Lambda features (not in this template)

| Feature | When to use |
| ------- | ----------- |
| **Dead-letter queue (DLQ)** | Capture failed async invokes; less critical for sync API invokes unless you add async patterns. |
| **Reserved concurrency** | Cap max concurrent executions for this function (protect downstreams). |
| **VPC** | Only if Lambda must reach private RDS/ElastiCache; adds cold-start and ENI complexity—not needed for DynamoDB/API Gateway in default setup. |
| **Environment variables** | Add secrets via **Secrets Manager** / **SSM Parameter Store** (not plain text for prod secrets). |

---

## Equivalent in the AWS Console (learning only)

1. **Lambda** → **Create function** → **Author from scratch** → Runtime **Node.js 20.x**.
2. Upload code or connect to SAM/CI deployment package.
3. **Configuration** → **Environment variables** → `TABLE_NAME`.
4. **Configuration** → **Permissions** → execution role with DynamoDB access to your table.
5. Add **API Gateway** trigger (or define in SAM as this repo does).

---

## What to extend next

Add routes in `template.yaml` and branches in [`handler.mjs`](../functions/api/handler.mjs). Split into multiple functions if the role or scaling needs diverge.

**Official:** [Lambda developer guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) · [Node.js Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html).
