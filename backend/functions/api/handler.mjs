/**
 * API Gateway Lambda proxy handler for `/me/compare/*`.
 * Aligns with `docs/serverless-fitness-data.md` (COMPARE#ENTRY keys, JWT `sub`).
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function getSub(event) {
  const c = event.requestContext?.authorizer?.claims;
  if (c && typeof c === "object" && c.sub) return String(c.sub);
  return null;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, {});
  }

  const sub = getSub(event);
  if (!sub) {
    return json(401, { error: "Unauthorized" });
  }

  const pk = `USER#${sub}`;
  const method = event.httpMethod || "GET";
  const resource = event.resource || "";

  try {
    if (method === "GET" && resource === "/me/compare") {
      const scope = event.queryStringParameters?.scope || "you";
      return await handleGetCompare(pk, scope);
    }

    if (method === "POST" && resource === "/me/compare/entries") {
      let body = {};
      if (event.body) {
        body = JSON.parse(event.body);
      }
      return await handlePostEntry(pk, body);
    }

    if (method === "DELETE" && resource === "/me/compare/entries/{entryId}") {
      const entryId = event.pathParameters?.entryId;
      if (!entryId) {
        return json(400, { error: "Missing entryId" });
      }
      return await handleDeleteEntry(pk, decodeURIComponent(entryId));
    }

    return json(404, {
      error: "Not found",
      method,
      resource,
    });
  } catch (e) {
    console.error(e);
    return json(500, {
      error: "Internal error",
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

async function handleGetCompare(pk, scope) {
  const entries = await queryCompareEntries(pk);

  /** @type {Array<{ id: string; label: string; metrics: Record<string, number> }>} */
  const series = [];

  if (scope === "you") {
    series.push({
      id: "self",
      label: "You",
      metrics: {
        compareEntries: entries.length,
      },
    });
    for (const e of entries) {
      series.push({
        id: e.entryId,
        label: e.label || e.entryId,
        metrics: { listed: 1 },
      });
    }
  } else {
    series.push({
      id: "everyone",
      label: "Everyone (stub aggregate)",
      metrics: {
        compareEntries: entries.length,
      },
    });
  }

  return json(200, {
    entries,
    series,
    scope,
  });
}

async function queryCompareEntries(pk) {
  const out = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": pk,
        ":prefix": "COMPARE#ENTRY#",
      },
    }),
  );
  const items = out.Items || [];
  return items.map((it) => ({
    entryId: it.entryId,
    label: it.label,
    targetSub: it.targetSub,
    bodySk: it.bodySk,
    createdAt: it.createdAt,
  }));
}

async function handlePostEntry(pk, body) {
  const entryId = randomUUID();
  const sk = `COMPARE#ENTRY#${entryId}`;
  const now = new Date().toISOString();

  await doc.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: pk,
        SK: sk,
        entityType: "COMPARE_ENTRY",
        entryId,
        label: body.label ?? "",
        targetSub: body.targetSub,
        bodySk: body.bodySk,
        createdAt: now,
      },
    }),
  );

  return json(200, { entryId, createdAt: now });
}

async function handleDeleteEntry(pk, entryId) {
  const sk = `COMPARE#ENTRY#${entryId}`;
  await doc.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { PK: pk, SK: sk },
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    }),
  );
  return {
    statusCode: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: "",
  };
}
