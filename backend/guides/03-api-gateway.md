# 03 — API Gateway (REST)

## What this is

**Amazon API Gateway** exposes **HTTPS** endpoints that route HTTP requests to backends. This stack uses a **REST API** (API Gateway v1) with **Lambda proxy integration** (Lambda returns status code, headers, body). **HTTP API** (v2) is cheaper and simpler but has a different authorizer and feature set—this repo targets **REST** for Cognito User Pool authorizer compatibility with the SAM model used here.

---

## How it is set up in this repo (SAM / IaC)

[`template.yaml`](../template.yaml) declares:

### REST API resource (`ComparableApi`)

| Setting | Purpose |
| ------- | ------- |
| `Type: AWS::Serverless::Api` | Creates a **REST API**, deployment, and stage. |
| `StageName: Prod` | Stage appears in the URL path: `.../Prod/...`. |
| `Cors` | Browser **CORS**: allowed methods `DELETE,GET,OPTIONS,POST`; headers `Content-Type`, `Authorization`; origin **`*`** (see security below). |
| `Auth.DefaultAuthorizer` | **Cognito User Pool** authorizer applied by default to integrated methods. |
| `AddDefaultAuthorizerToCorsPreflight: false` | OPTIONS/CORS behavior controlled explicitly so preflight does not incorrectly require JWT. |

### Routes (Lambda `Events` on `ApiFunction`)

Each `Events` entry creates:

- API **Resource** path (e.g. `/me/compare`, `/me/compare/entries/{entryId}`).
- **Method** (GET, POST, DELETE).
- **Integration**: Lambda **proxy** → your function.
- **Lambda permission** for API Gateway to invoke the function.

| Method | Path |
| ------ | ---- |
| GET | `/me/compare` |
| POST | `/me/compare/entries` |
| DELETE | `/me/compare/entries/{entryId}` |

**Authorizer:** Requests must include `Authorization: Bearer <JWT>` unless you add a public route (this template does not expose unauthenticated compare routes).

---

## Lambda proxy integration (behavior)

- API Gateway passes a **full event** to Lambda (`httpMethod`, `path`, `headers`, `body`, `requestContext`, …).
- Lambda returns `{ statusCode, headers, body }` (your code in [`handler.mjs`](../functions/api/handler.mjs) uses this pattern).
- **`requestContext.authorizer.claims`** holds Cognito claims (e.g. `sub`) after a successful authorizer run.

---

## Equivalent in the AWS Console (learning only)

1. **API Gateway** → **Create API** → **REST** → **Build**.
2. Create **Resources** to match `/me`, `/me/compare`, `/me/compare/entries`, `{entryId}` as path parameter.
3. For each method → **Integration type: Lambda**, **Use Lambda Proxy integration** → select function.
4. **Deploy API** to a **stage** (e.g. `Prod`).
5. **Authorizers** → **Create** → **Cognito** → select User Pool, token source `Authorization`.
6. On each method → **Method Request** → set **Authorization** to the Cognito authorizer (and **API Key** if you add usage plans).
7. **Enable CORS** on resources or return CORS headers from Lambda (this template configures CORS on the API).

Manual setup must match **same paths, stage name, and authorizer** or the SPA and docs will not align.

---

## Security and operational settings

| Topic | This template | Hardening |
| ----- | ------------- | --------- |
| **CORS `AllowOrigin: *`** | Allows any browser origin | For production, set to your **CloudFront** or dev URL only. |
| **HTTPS** | API Gateway endpoints are HTTPS only | Always use `https://` in `PUBLIC_API_URL`. |
| **Throttling** | Account/region default limits apply | Configure **stage throttling** or **usage plans** if you need quotas ([`../../docs/serverless-implementation-guide.md`](../../docs/serverless-implementation-guide.md) §11). |
| **Logging** | Enable **execution logging** / **access logging** in console for audit and 4xx/5xx analysis (adds cost). |
| **WAF** | Not in template | Optionally attach **AWS WAF** to the API stage to block bad IPs/patterns. |
| **Private API** | Not used | **Private REST API** + VPC endpoint if you need network isolation (different architecture). |

---

## What to extend next

Add new `Events` under `ApiFunction` with `RestApiId: !Ref ComparableApi`. Keep **owner checks** in Lambda using `sub` from the authorizer.

**Official:** [API Gateway REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-rest-api.html) · [Cognito authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html) · [Lambda proxy](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html).
