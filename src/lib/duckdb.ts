import * as duckdb from "@duckdb/duckdb-wasm";
import * as arrow from "apache-arrow";

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;
let isInitializing = false;

export async function initDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) {
    return db;
  }

  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (db) return db;
  }

  isInitializing = true;

  try {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      })
    );

    // Instantiate the asynchronous version of DuckDB-Wasm
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);

    return db;
  } finally {
    isInitializing = false;
  }
}

async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (conn) {
    return conn;
  }

  const database = await initDuckDB();
  conn = await database.connect();
  return conn;
}

export async function loadArrowTable(arrowTable: arrow.Table): Promise<void> {
  const connection = await getConnection();

  // Drop the table if it exists
  try {
    await connection.query("DROP TABLE IF EXISTS data");
  } catch {
    // Ignore errors if table doesn't exist
    console.log("No existing table to drop");
  }

  // Insert the Arrow table with a standard name 'data'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await connection.insertArrowTable(arrowTable as any, { name: "data" });

  // Finalize insertion by sending an end-of-stream signal
  const EOS = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 0]);
  await connection.insertArrowTable(EOS as any, { name: "data" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeQuery(sql: string): Promise<any> {
  const connection = await getConnection();
  const result = await connection.query(sql);
  return result;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
}

export async function executeQueryAsJSON(sql: string): Promise<QueryResult> {
  const arrowResult = await executeQuery(sql);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = arrowResult.schema.fields.map((field: any) => field.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = arrowResult.toArray().map((row: any) => row.toJSON());

  return {
    columns,
    rows,
    rowCount: arrowResult.numRows,
  };
}
