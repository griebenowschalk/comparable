# Fitness data on a single DynamoDB table

**Companion:** [`INDEX.md`](./INDEX.md) lists reading order; [`serverless-implementation-guide.md`](./serverless-implementation-guide.md) walks through building the AWS stack (API Gateway, Lambda, DynamoDB, Cognito, S3, CloudFront). **Backend sections** (template mapping) are in [`backend/guides/`](../backend/guides/README.md). A **reference SAM implementation** of the compare API + DynamoDB + Cognito is in [`backend/`](../backend/). **This file** is the **data and API contract** for the fitness layer—entities, keys, routes, and Lambda rules.

The frontend expects an **AWS serverless** backend: **API Gateway + Lambda + DynamoDB + Cognito**.

Use a **single-table** DynamoDB design with composite keys (`PK` / `SK` — names may differ in your template, e.g. `partitionKey` / `sortKey`). Add **new sort-key patterns and attributes** on that **same table** for fitness data—no extra table unless you deliberately split domains.

## Assumptions

- Users authenticate with **Amazon Cognito**; the stable per-user id is the JWT claim **`sub`**.
- All fitness routes are **owner-scoped**: resolve the user from the **verified token** (`sub`), not from a client-supplied `userId` in the URL (avoids IDOR).
- The **`/me`** segment in paths (e.g. `/me/fitness-profile`) is **not required** by API Gateway or Cognito—it is only a **convention** that signals “current authenticated user.” You can use paths like `/fitness-profile` or `/v1/compare` instead, as long as **every** protected handler still authorizes using **`sub` from the JWT** and never trusts a user id from the path for cross-user access.
- Timestamps are **ISO 8601** in UTC (e.g. `2026-02-04T07:59:00.000Z`) so **sort keys** sort correctly as strings.

## Comparison workflow (core app behavior)

This app’s **compare** flow follows the same **verb pattern** as a typical serverless exercise: **add** with **POST**, **compare** with **GET**, **remove** with **DELETE**. **Path and query names are suggestions**—you may rename them, but keep the **semantics**.

| Verb | Role | Typical request |
| ---- | ---- | ----------------- |
| **POST** | **Add** something to the comparison context (e.g. a candidate row, tag, or snapshot reference). | `POST /me/...` with JSON body; returns created id. |
| **GET** | **Compare** — load results for **you only** vs **everyone** (aggregate / cohort / public leaderboard—your choice). | `GET /me/...?scope=you` and `GET /me/...?scope=everyone` (or path variants like `/me/compare/you` and `/me/compare/everyone`). |
| **DELETE** | **Remove** one participant or entry from *your* comparison set (not arbitrary users). | `DELETE /me/.../{entryId}` (or `DELETE` with body containing id—prefer path for caches). |

**Authorization**

- **POST** / **DELETE**: always scoped to **`USER#<sub>`** in DynamoDB; **never** delete or add on behalf of another user via a spoofed id in the path—validate that `entryId` belongs to the caller’s items.
- **GET `scope=you`**: **Query** only rows where `PK = USER#<sub>` (same patterns as profile/body below).
- **GET `scope=everyone`**: needs an explicit **access pattern**—examples: a **GSI** for published/aggregate rows, a **single precomputed aggregate item**, or (demo only) a controlled **Scan**—document what you ship; unbounded Scan is not a production pattern.

The **fitness entities** below supply the underlying measurements; the **compare entry** entity (next section) ties the comparison UI to stored rows.

## Entities (what you store)

### 1. `FitnessProfile` (goals + baseline)

One item per user: weight/body-fat goals and the “progress since” baseline date (smart-scale style summary).

| Field                 | Type        | Notes                                      |
| --------------------- | ----------- | ------------------------------------------ |
| `weightGoalKg`        | number      | optional                                   |
| `bodyFatGoalPercent`  | number      | optional, 0–100                            |
| `baselineRecordedAt`  | string      | ISO8601; anchor for delta vs first reading |
| `displayName`         | string      | optional                                   |
| `updatedAt`           | string      | ISO8601                                    |

### 2. `BodyMeasurement` (smart scale / manual)

Time series row; most fields optional (depends on device).

| Field                     | Type   | Notes                                |
| ------------------------- | ------ | ------------------------------------ |
| `recordedAt`              | string | ISO8601 (required)                   |
| `source`                  | string | `scale` \| `manual`                  |
| `weightKg`                | number | optional                             |
| `bodyFatPercent`          | number | optional                             |
| `bmi`                     | number | optional                             |
| `skeletalMusclePercent`   | number | optional                             |
| `muscleMassKg`            | number | optional                             |
| `muscleStorageLevel`      | number | optional (device-specific)           |
| `proteinPercent`          | number | optional                             |
| `bmrKcal`                 | number | optional                             |
| `fatFreeMassKg`           | number | optional                             |
| `subcutaneousFatPercent`  | number | optional                             |
| `visceralFatIndex`        | number | optional                             |
| `bodyWaterPercent`        | number | optional                             |
| `boneMassKg`              | number | optional                             |
| `metabolicAge`            | number | optional                             |
| `notes`                   | string | optional                             |
| `device`                  | string | optional                             |

### 3. `CompareEntry` (who or what is in *your* comparison list)

One item per row in the current user’s comparison set (who you are comparing against, or which snapshot ids participate). Shape depends on product; minimal example:

| Field        | Type   | Notes |
| ------------ | ------ | ----- |
| `entryId`    | string | server-generated id (also in `SK` suffix) |
| `label`      | string | optional display name |
| `targetSub`  | string | optional Cognito `sub` of another user if comparing people |
| `bodySk`     | string | optional pointer `SK` to a `BODY#...` row |
| `createdAt`  | string | ISO8601 |

### 4. `PerformanceSnapshot` (Garmin-style)

Snapshot or daily rollup; many fields are **nested** maps/lists.

| Field                     | Type   | Notes                                                                 |
| ------------------------- | ------ | --------------------------------------------------------------------- |
| `recordedAt`              | string | ISO8601 (required)                                                    |
| `trainingStatus`          | string | optional enum / free text                                             |
| `trainingReadiness`       | number | optional, e.g. 0–100                                                  |
| `hrvStatus`               | string | optional                                                              |
| `hrvMs`                   | number | optional                                                              |
| `vo2Max`                  | number | optional                                                              |
| `trainingEffect`          | object | optional `{ aerobic?: number, anaerobic?: number }`                 |
| `ftpWatts`                | number | optional                                                              |
| `criticalSwimSpeed`       | string | optional (pace or m/s—pick one and document)                          |
| `runningLactateThreshold` | object | optional `{ hrBpm?: number, pace?: string }`                          |
| `racePredictor`           | object | optional keys e.g. `5k`, `10k`, `half`, `marathon` → duration strings |
| `powerCurve`              | array  | optional `[{ durationSec: number, watts: number }, ...]`              |

**DynamoDB item size** is max **400 KB**. Large raw exports can be stored in **S3** with a pointer on the item (optional; only if you exceed limits).

## DynamoDB: single-table keys for your additions

Use **one user-scoped table**. Partition key scopes to the user; sort key distinguishes item types and time.

### Key patterns (adjust `PK`/`SK` attribute names to match your IaC template)

| Item type            | `PK`           | `SK` example                              |
| -------------------- | -------------- | ----------------------------------------- |
| Fitness profile      | `USER#<sub>`   | `FITNESS#PROFILE`                         |
| Compare entry        | `USER#<sub>`   | `COMPARE#ENTRY#<uuid>`                    |
| Body measurement     | `USER#<sub>`   | `BODY#2026-02-04T07:59:00.000Z#<uuid>`    |
| Performance snapshot | `USER#<sub>`   | `PERF#2026-02-04T07:59:00.000Z#<uuid>`    |

- **`<sub>`** = Cognito `sub` from the JWT.
- Append **`#<uuid>`** on time-series rows so two readings in the same second do not overwrite.
- Store non-key fields (`weightKg`, nested Garmin maps, etc.) as **attributes** on the same item. **Nested maps:** use DynamoDB **Map** types or one **JSON string** attribute.

### Queries (no Scan for “my data”)

- **Profile:** `GetItem` with `PK = USER#<sub>`, `SK = FITNESS#PROFILE`.
- **Body measurements in a range:** `Query` with `PK = USER#<sub>` and `SK` **between** `BODY#<fromIso>#` and `BODY#<toIso>#\uffff` (or `begins_with SK, BODY#` + filter on time). **ISO8601** in `SK` keeps lexicographic order aligned with time.
- **Latest body row:** `Query` on that PK + `SK` begins with `BODY#`, **ScanIndexForward=false**, **Limit=1** (or track `latest` in profile — optional).
- **Performance snapshots:** same pattern with `PERF#` prefix.
- **Compare entries (your list):** `Query` with `PK = USER#<sub>`, `SK` begins with `COMPARE#ENTRY#` (used for **POST** list and **DELETE**).

**GSI:** Not required for “all data for this logged-in user” if every read starts from `USER#<sub>`. **GET `scope=everyone`** may need a **GSI** or aggregate item—see **Comparison workflow** above.

### Example items (illustrative JSON)

**Profile**

```json
{
  "PK": "USER#cognito-sub-here",
  "SK": "FITNESS#PROFILE",
  "entityType": "FITNESS_PROFILE",
  "weightGoalKg": 85,
  "bodyFatGoalPercent": 13.5,
  "baselineRecordedAt": "2021-09-06T20:09:00.000Z",
  "updatedAt": "2026-03-31T12:00:00.000Z"
}
```

**Body measurement**

```json
{
  "PK": "USER#cognito-sub-here",
  "SK": "BODY#2026-02-04T07:59:00.000Z#a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "entityType": "BODY_MEASUREMENT",
  "recordedAt": "2026-02-04T07:59:00.000Z",
  "source": "scale",
  "weightKg": 82.05,
  "bodyFatPercent": 13.8
}
```

**Compare entry**

```json
{
  "PK": "USER#cognito-sub-here",
  "SK": "COMPARE#ENTRY#a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "entityType": "COMPARE_ENTRY",
  "entryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "label": "Friend run group",
  "createdAt": "2026-04-05T12:00:00.000Z"
}
```

## API Gateway routes (suggested)

**Comparison trio** (same logic as the common serverless exercise; **paths are examples**):

| Method | Path (example) | Purpose |
| ------ | -------------- | ------- |
| **POST** | `/me/compare/entries` | **Add** an entry to *your* comparison set (`COMPARE#ENTRY#…`). |
| **GET** | `/me/compare?scope=you` | **Compare** using only **your** data (Query `USER#<sub>`). |
| **GET** | `/me/compare?scope=everyone` | **Compare** in **everyone** / aggregate mode (define GSI or aggregate; see above). |
| **DELETE** | `/me/compare/entries/{entryId}` | **Remove** one entry; must verify `entryId` belongs to `USER#<sub>`. |

**GET `/me/compare` response (this repo’s SPA):** Return JSON the UI can render, e.g. `{ "entries": [ ... ], "series": [ { "id": "...", "label": "...", "metrics": { "weightKg": 80, "bodyFatPercent": 15 } } ] }`. `entries` maps to compare list items; `series` is used for the metric table. Types: `frontend/src/features/compare/compare.types.ts`.
**POST `/me/compare/entries` response:** Include `entryId` (and optional fields) so the client can correlate rows.

**Fitness / profile** (measurements and goals):

| Method | Path                                   | Purpose                                    |
| ------ | -------------------------------------- | ------------------------------------------ |
| GET    | `/me/fitness-profile`                  | Read profile/goals                         |
| PUT    | `/me/fitness-profile`                  | Replace profile (or PATCH for partial)     |
| PATCH  | `/me/fitness-profile`                  | Partial update goals/baseline            |
| POST   | `/me/body-measurements`                | Create measurement                         |
| GET    | `/me/body-measurements?from=&to=`      | List in range                              |
| GET    | `/me/body-measurements/latest`         | Latest row (dashboard)                     |
| POST   | `/me/performance-snapshots`          | Create snapshot                            |
| GET    | `/me/performance-snapshots?from=&to=`  | List in range                              |
| GET    | `/me/performance-snapshots/latest`     | Latest snapshot                            |

Wire each route to a Lambda (or your handler) the same way you wire other CRUD endpoints. Attach the **Cognito User Pool authorizer** (or equivalent JWT authorizer) on every protected route.

### API Gateway resource hierarchy (REST API)

In **API Gateway REST APIs**, each URL segment is a **resource**; methods attach to a resource. This doc uses **`/me`** as the parent for clarity; you may **omit `me`** and attach the same methods to **`/fitness-profile`**, **`/compare`**, etc., at the API root—**authorization rules do not change** (still JWT `sub` only).

**Suggested tree** (paths match the tables above):

```
/me
├── /compare                         → GET (query: scope=you | everyone)
│   ├── /entries                     → POST
│   └── /entries/{entryId}           → DELETE
├── /fitness-profile                 → GET, PUT, PATCH
├── /body-measurements               → GET (query: from, to), POST
│   └── /latest                      → GET   (optional child resource)
└── /performance-snapshots           → GET (query), POST
    └── /latest                      → GET
```

**Notes**

- **`/me`** is the common parent: create a resource `me` (path part `me`) on the root (`/`).
- **Compare:** `me` → child `compare` → children `entries` and `entries/{entryId}`. **GET** `/me/compare` attaches to the **`compare`** resource; **POST** attaches to **`entries`**; **DELETE** to **`entries/{entryId}`**.
- **Query strings** (`scope`, `from`, `to`) do **not** create extra resources—they are handled on the **GET** method of the resource (`/me/compare`, `/me/body-measurements`, etc.).
- **CORS:** add **OPTIONS** on each resource that the browser calls (or enable CORS once at API level, depending on how you configure API Gateway).
- **HTTP API:** uses **routes** (`GET /me/compare`) instead of this resource tree, but the **path strings** can be identical.

### Resources to create (REST API — console order)

Create **child resources top-down** (each row is one resource; path is cumulative). Attach **methods** on the resource shown.

**If you use `/me`:**

| # | Resource path (full) | Methods to add on *this* resource |
|---|----------------------|-----------------------------------|
| 1 | `/me` | *(none required—only a parent)* |
| 2 | `/me/compare` | `GET`, `OPTIONS` |
| 3 | `/me/compare/entries` | `POST`, `OPTIONS` |
| 4 | `/me/compare/entries/{entryId}` | `DELETE`, `OPTIONS` |
| 5 | `/me/fitness-profile` | `GET`, `PUT`, `PATCH`, `OPTIONS` |
| 6 | `/me/body-measurements` | `GET`, `POST`, `OPTIONS` |
| 7 | `/me/body-measurements/latest` | `GET`, `OPTIONS` |
| 8 | `/me/performance-snapshots` | `GET`, `POST`, `OPTIONS` |
| 9 | `/me/performance-snapshots/latest` | `GET`, `OPTIONS` |

**If you omit `/me`:** create the same segments under `/` (e.g. `/compare`, `/compare/entries`, `/compare/entries/{entryId}`, `/fitness-profile`, …)—same methods.

**Path param:** On resource `.../entries`, add a child with path **`{entryId}`** (or `{proxy+}` only if you use a catch-all Lambda router—usually prefer explicit `{entryId}`).

### Lambda behavior

1. Resolve **`sub`** from JWT (authorizer context or claims).
2. **POST** (compare add): **PutItem** `PK = USER#<sub>`, `SK = COMPARE#ENTRY#<uuid>`; return `entryId` to the client.
3. **GET** (compare): Read **`scope`** (e.g. `you` | `everyone`). **`you`:** **Query** `USER#<sub>` + relevant `SK` prefixes (entries + measurements as needed). **`everyone`:** use your chosen aggregate/GSI pattern—do not expose other users’ raw rows without explicit design.
4. **DELETE** (compare remove): **GetItem**/`Query` to confirm the entry’s `PK` is `USER#<sub>`, then **DeleteItem** (or `ConditionExpression` on `PK`).
5. **POST** body (fitness): validate types/ranges (e.g. `weightKg > 0`, body fat 0–100).
6. **GET** list (body/perf): parse `from` / `to` query params → **Query** with `PK = USER#<sub>` and `SK` range for the right prefix (`BODY#` or `PERF#`).
7. Prefer an **allowlist** of attribute names on write.

### Suggested build order

1. Ship a working **authenticated API** + **DynamoDB** + consistent key/query patterns.
2. Implement the **comparison trio**: **POST** add entry, **GET** compare with **`scope=you`**, **GET** with **`scope=everyone`** (stub aggregate if needed), **DELETE** entry—matches the **compare** page flow in the frontend.
3. Add **fitness profile** + **body measurements** (`FITNESS#PROFILE`, `BODY#...`).
4. Add **performance snapshots** (`PERF#...`) when you need Garmin-style fields.
5. Add **latest** list endpoints last (or use `Query` + limit as above).

## Frontend env (this repo)

Bun’s HTML bundler inlines **`process.env.PUBLIC_*`** for the browser bundle (see [Bun HTML docs](https://bun.com/docs/bundler/html)). Example:

```bash
# frontend/.env
PUBLIC_API_URL=https://xxxx.execute-api.region.amazonaws.com/Prod
```

The UI reads `PUBLIC_API_URL` via `src/env.ts`. Send API requests with `Authorization: Bearer <token>` using the **same token type the API authorizer expects** (often **ID token** for a simple SPA—configure authorizer and client to match).

## Deployment checklist (single table)

Track this in **your backend / infra project** (not this repo):

- [ ] **DynamoDB:** Fitness rows live on the **same table** as the rest of your user data (unless you explicitly use multiple tables). Confirm `PK`/`SK` attribute names in your template and use the patterns above.
- [ ] **IAM:** Lambda execution role includes `dynamodb:GetItem`, `PutItem`, `Query`, `UpdateItem` on **that table’s ARN** (and `ConditionExpression` if you use optimistic locking).
- [ ] **Lambda:** Handler(s) for `/me/...` routes; map `sub` → `USER#<sub>` for keys.
- [ ] **API Gateway:** Methods and integrations; **authorizer** on each route; **CORS** allowing the SPA origin (e.g. your **CloudFront** distribution hostname or custom domain—not only `localhost`).
- [ ] **Deploy:** Build and deploy your stack; smoke-test **Query** with a test user.

## Later: analytics

- **In-app:** same list endpoints + charting in the frontend.
- **Heavy analytics:** replicate DynamoDB to **S3** (streams + Firehose) or **Athena** on Parquet; not required for ingestion.
