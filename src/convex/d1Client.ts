/**
 * Cloudflare D1 REST API Client
 *
 * Provides read/write access to D1 databases via the Cloudflare REST API.
 * Used inside Convex "use node" actions for edge-accelerated queries.
 */

export interface D1Config {
  accountId: string;
  apiToken: string;
  databaseId: string;
}

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: {
    served_by: string;
    duration: number;
    changes: number;
    last_row_id: number;
    changed_db: boolean;
    size_after: number;
  };
}

function getConfig(): D1Config {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const databaseId = process.env.D1_DATABASE_ID;

  if (!accountId || !apiToken || !databaseId) {
    throw new Error(
      "D1 configuration missing. Required env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, D1_DATABASE_ID",
    );
  }

  return { accountId, apiToken, databaseId };
}

function getBaseUrl(config: D1Config): string {
  return `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}`;
}

async function d1Fetch<T = Record<string, unknown>>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<D1Result<T>> {
  const config = getConfig();
  const url = `${getBaseUrl(config)}${path}`;

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D1 API error (${response.status}): ${errorText}`);
  }

  const json = (await response.json()) as {
    result: D1Result<T>;
    success: boolean;
  };

  if (!json.success) {
    throw new Error("D1 API returned success: false");
  }

  return json.result;
}

/**
 * Execute a read-only SQL query
 */
export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<D1Result<T>> {
  return d1Fetch<T>("/raw", {
    method: "POST",
    body: { sql, params },
  });
}

/**
 * Execute a write SQL statement (INSERT, UPDATE, DELETE)
 */
export async function d1Execute(
  sql: string,
  params: unknown[] = [],
): Promise<D1Result> {
  return d1Fetch("/raw", {
    method: "POST",
    body: { sql, params },
  });
}

/**
 * Execute multiple SQL statements in a batch
 */
export async function d1Batch(
  statements: Array<{ sql: string; params?: unknown[] }>,
): Promise<D1Result[]> {
  const config = getConfig();
  const url = `${getBaseUrl(config)}/batch`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      statements.map((s) => ({ sql: s.sql, params: s.params || [] })),
    ),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D1 batch error (${response.status}): ${errorText}`);
  }

  const json = (await response.json()) as {
    result: D1Result[];
    success: boolean;
  };

  if (!json.success) {
    throw new Error("D1 batch API returned success: false");
  }

  return json.result;
}

/**
 * Get database metadata
 */
export async function d1Metadata(): Promise<{
  uuid: string;
  name: string;
  version: string;
}> {
  const config = getConfig();
  const url = `${getBaseUrl(config)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D1 metadata error (${response.status}): ${errorText}`);
  }

  const json = (await response.json()) as {
    result: { uuid: string; name: string; version: string };
    success: boolean;
  };

  return json.result;
}
