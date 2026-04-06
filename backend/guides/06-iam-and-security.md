# 06 — IAM and security

## What this is

**AWS IAM** controls **who** can call **which** AWS APIs. In this stack there are two important actors:

1. **You (human / CI)** — IAM user or role that runs `sam deploy` and manages CloudFormation.
2. **Lambda execution role** — assumed by the function at runtime; may **only** access resources you allow (here: one DynamoDB table, plus implicit CloudWatch Logs).

---

## Human / deploy principal

Deploying SAM requires permissions to:

- Create/update **CloudFormation** stacks
- Create **Lambda**, **API Gateway**, **DynamoDB**, **Cognito**, **IAM roles** (often via CloudFormation `CAPABILITY_IAM` / `CAPABILITY_NAMED_IAM`)

Use **least privilege** for CI/CD; for solo dev, many tutorials use broad permissions only in a **dedicated dev account**.

**Never** commit long-lived access keys to git. Prefer **OIDC** to AWS for GitHub Actions, or short-lived credentials.

---

## Lambda execution role (this repo)

[`template.yaml`](../template.yaml) attaches:

| Policy | Effect |
| ------ | ------ |
| **`DynamoDBCrudPolicy` on `FitnessTable`** | `GetItem`, `PutItem`, `Query`, `UpdateItem`, `DeleteItem`, `Batch*` scoped to that table ARN. |
| **AWS managed policies SAM adds** | e.g. **AWSLambdaBasicExecutionRole** — write logs to CloudWatch Logs. |

**What Lambda must not have:** `dynamodb:*` on `*`, `s3:*`, `sts:AssumeRole` to arbitrary roles, or **IAM admin**—unless you have a specific reason.

When you add **S3**, **SQS**, **Secrets Manager**, etc., add **one** narrow policy statement per service.

---

## API Gateway and Cognito

- **Authorization** is enforced at **API Gateway** (Cognito authorizer) **before** Lambda runs.
- **Lambda** must still **authorize at the data layer**: use **`sub`** from claims to build `PK = USER#…` and never trust a client-supplied user id for cross-user access ([`../../docs/serverless-fitness-data.md`](../../docs/serverless-fitness-data.md)).

---

## Secrets and configuration

| Secret | Where it belongs |
| ------ | ---------------- |
| AWS access keys | **Not** in frontend; not in public repos. |
| JWTs | **Browser:** memory or secure storage per your threat model; never log in production. |
| Third-party API keys (future) | **Secrets Manager** or **SSM Parameter Store** (SecureString); Lambda reads at runtime. |
| Cognito app client “secret” | **Not used** for public SPAs (`GenerateSecret: false`). |

---

## Network and exposure

- **API Gateway** is public HTTPS; protect with **Cognito**, optional **API keys + usage plans**, optional **WAF**.
- **DynamoDB** has **no public endpoint**; only reachable with valid AWS credentials (your Lambda role).
- **Lambda** in this template is **not** in a VPC—no NAT required for DynamoDB/API calls.

---

## Checklist before production

| Item | Action |
| ---- | ------ |
| CORS | Replace `AllowOrigin: '*'` with your real SPA origin(s). |
| Cognito | Stronger password policy, MFA, restricted callback URLs. |
| Logs | Set **CloudWatch Logs retention** on Lambda log groups. |
| DynamoDB | Enable **PITR** if you need point-in-time recovery. |
| API abuse | **Usage plans / throttling**, or **WAF** in front of API Gateway. |

**Official:** [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) · [Lambda permissions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html).
