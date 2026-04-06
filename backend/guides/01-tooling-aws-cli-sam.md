# 01 — Tooling: AWS CLI and SAM

## What this is

- **AWS CLI** — calls AWS APIs from your machine (deploy stacks, read Cognito, tail logs).
- **AWS SAM CLI** — packages and deploys serverless apps: `sam build`, `sam deploy`, `sam validate`; uses **CloudFormation** to create/update resources defined in [`template.yaml`](../template.yaml).

## What this repo expects

- `aws sts get-caller-identity` succeeds (IAM user, role, or SSO profile).
- `sam --version` works.
- **One AWS Region** for the whole stack (e.g. `eu-west-1`) so API Gateway, Lambda, DynamoDB, and Cognito stay consistent.

---

## AWS account setup (before first deploy)

1. **AWS account** — billing alerts / budget recommended (Billing → Budgets).
2. **IAM identity for your laptop** — not the root user for daily work:
   - **IAM user** with access keys *or* **IAM Identity Center (SSO)** — prefer SSO for organizations.
   - Attach policies that allow **CloudFormation** stack create/update/delete and **SAM**’s packaged deployments. For a **personal dev** account, some users attach `AdministratorAccess` only to that account; for production, use **least-privilege** custom policies.
3. **Configure the CLI:**
   ```bash
   aws configure
   # or: aws configure sso
   ```
4. **Verify:**
   ```bash
   aws sts get-caller-identity
   ```

**Security notes:** Enable **MFA** on the root account; avoid long-lived access keys on shared machines; rotate keys periodically.

**Official:** [AWS CLI install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) · [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

---

## Install SAM CLI

- **macOS (Homebrew):** `brew tap aws/tap && brew install aws-sam-cli`
- **Verify:** `sam --version`

**Docker** is only required for `sam local invoke` / `sam local start-api`, not for deploying to real AWS.

**Official:** [Install SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).

---

## Where this shows up in the project

Tooling is **not** in `template.yaml`; it lives on your machine. Repeatable deploy options: [`samconfig.toml.example`](../samconfig.toml.example) → `samconfig.toml` (see [07](07-deploy-sam.md)).

---

## Checklist before `sam deploy`

| Check | Why |
| ----- | --- |
| Correct **region** in profile / env | Resources must align with stack region. |
| IAM principal can **pass** execution roles and create CloudFormation stacks | SAM/CloudFormation need `iam:PassRole` and stack permissions. |
| **Billing** visibility | Avoid surprise charges during experiments. |
