# 07 — Deploy with SAM

## What this is

**AWS SAM** packages your Lambda code and deploys a **CloudFormation** stack. `sam build` prepares artifacts; `sam deploy` uploads them and applies the template in [`template.yaml`](../template.yaml).

---

## Commands (from `backend/`)

```bash
cd backend
sam validate    # optional: catch template errors early
sam build
sam deploy --guided   # first time: prompts for stack name, region, capabilities
```

**Capabilities:** CloudFormation will ask to acknowledge **IAM** resources (`CAPABILITY_IAM` or `CAPABILITY_NAMED_IAM`) because the stack creates roles and policies.

**Repeatable deploys:** Copy [`samconfig.toml.example`](../samconfig.toml.example) to `samconfig.toml` (gitignored) to skip prompts.

---

## What gets created or updated

One **stack** contains (logical names from CloudFormation):

- DynamoDB **table**
- Cognito **User Pool** + **User Pool Client**
- API Gateway **REST API** + **stage** + **deployments**
- Lambda **function** + **version/alias** (as SAM configures)
- **IAM roles** for Lambda

**Updates:** Changing `template.yaml` and redeploying produces a **change set**—review in console if the diff is large.

**Rollback (updates):** On failure during an **update**, CloudFormation **rolls back** the stack to the last stable state (unless you disable rollback—usually keep rollback **on** while learning).

---

## Rollback guide

**Failed create (`ROLLBACK_COMPLETE`):** CloudFormation removes resources from the failed attempt, but the **stack record** stays until you delete it. You cannot deploy again to the **same stack name** until then.

```bash
aws cloudformation delete-stack --stack-name comparable-backend --region eu-west-1
```

Use your actual stack name and region if they differ. Optional wait: `aws cloudformation wait stack-delete-complete --stack-name comparable-backend --region eu-west-1`, then fix IAM/template issues and run `sam deploy` again.

**Teardown of a healthy stack** uses the same CLI command or console **Delete**; see [Teardown](#teardown).

---

## Outputs to capture

After deploy, note **Outputs** (CLI printout or **CloudFormation** → stack → **Outputs**):

| Output | Use |
| ------ | --- |
| `ApiUrl` | `PUBLIC_API_URL` in `frontend/.env` (no trailing slash). |
| `UserPoolId` | Cognito / Amplify configuration. |
| `UserPoolClientId` | SPA / CLI auth. |
| `FitnessTableName` | DynamoDB console / debugging. |

**CLI, `.env` mapping, run locally, sanity checks:** [08 — Frontend wiring](08-frontend-wiring.md).

---

## Teardown

**CloudFormation** → stack → **Delete** — removes most resources. **Retain** policies: if any resource has `DeletionPolicy: Retain` (not in this minimal template), clean up manually.

Empty **S3 buckets** SAM uses for deployment artifacts if you used SAM-managed buckets and want zero footprint (see SAM docs for bucket names).

---

## Operational add-ons (not in template)

| Add-on | Purpose |
| ------ | ------- |
| **Alarms** | CloudWatch alarms on **Lambda errors**, **API 5xx**, **DynamoDB throttling**. |
| **Dashboards** | Single pane for API + Lambda + DDB metrics. |
| **Cost tags** | Tag stack resources for cost allocation. |

---

## Where it lives

[`../template.yaml`](../template.yaml) · [`../samconfig.toml.example`](../samconfig.toml.example) · [`../README.md`](../README.md).

**Official:** [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) · [Deploying](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html).
