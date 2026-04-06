# 02 — DynamoDB (single table)

## What this is

**Amazon DynamoDB** is a managed NoSQL database. This app uses **one table** with a **composite primary key**: partition key `PK` + sort key `SK`. All user-owned items use a stable prefix on `PK` (e.g. `USER#<cognito-sub>`) and typed prefixes on `SK` (compare entries, future fitness rows)—see [`../../docs/serverless-fitness-data.md`](../../docs/serverless-fitness-data.md).

---

## How it is set up in this repo (SAM / IaC)

[`template.yaml`](../template.yaml) defines `FitnessTable`:

| Setting | Value | Notes |
| ------- | ----- | ----- |
| **Billing mode** | `PAY_PER_REQUEST` (on-demand) | Good for low/variable traffic; no capacity planning. For steady high traffic, consider **provisioned** + auto scaling. |
| **Partition key** | `PK` (String) | User partition. |
| **Sort key** | `SK` (String) | Entity type + id patterns. |
| **Table name** | `${StackName}-fitness` | Unique per stack. |

**Encryption:** DynamoDB **encrypts at rest by default** (AWS owned key). You can switch to **customer-managed KMS** for compliance ([DynamoDB encryption](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/EncryptionAtRest.html)).

**Point-in-time recovery (PITR):** Not enabled in this minimal template. For **production**, enable PITR on the table for continuous backups.

**VPC:** This table is **VPC-agnostic** (standard for API + Lambda in public AWS endpoints). Lambda is not VPC-attached in this template, so no VPC endpoints required for DynamoDB here.

Lambda receives **`TABLE_NAME`** as an environment variable and uses **AWS SDK** to call DynamoDB.

---

## Equivalent in the AWS Console (learning only)

1. **DynamoDB** → **Create table**.
2. **Table name** — e.g. `myapp-fitness`.
3. **Partition key** — `PK` (String). **Sort key** — `SK` (String).
4. **Table settings** — **On-demand** billing.
5. **Encryption** — default (or CMK for stricter policies).
6. **Optional:** Enable **Point-in-time recovery** for prod.

If you create the table manually, you must still **grant the Lambda IAM role** `dynamodb:GetItem`, `PutItem`, `Query`, `DeleteItem`, etc., on **this table’s ARN**—SAM’s `DynamoDBCrudPolicy` does that automatically when the table is in the same template.

---

## IAM and access (security)

| Practice | Detail |
| -------- | ------ |
| **Least privilege** | Lambda role should only access **this** table (or specific indexes), not `Resource: "*"`. |
| **No table-level public access** | DynamoDB has no “public read”; access is always IAM/API. |
| **Condition keys** | For multi-tenant hardening, some teams add IAM conditions; this app relies on **`PK = USER#sub`** in application code. |

See [06](06-iam-and-security.md).

---

## Where it lives

```yaml
# template.yaml — excerpt
FitnessTable:
  Type: AWS::DynamoDB::Table
  Properties:
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions: ...
    KeySchema: ...
```

Lambda: `Policies` → `DynamoDBCrudPolicy` on `!Ref FitnessTable`.

---

## What to extend next

Add **new `SK` patterns** on the **same table** for fitness data. Add a **GSI** only when a new **access pattern** needs a different partition/sort key (design first, then add `GlobalSecondaryIndexes` to the table resource).

**Official:** [DynamoDB core components](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html) · [Best practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html).
