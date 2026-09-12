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
   
  await connection.insertArrowTable(arrowTable as any, { name: "data" });

  // Finalize insertion by sending an end-of-stream signal
  const EOS = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 0]);
  await connection.insertArrowTable(EOS as any, { name: "data" });
}

 
export async function executeQuery(sql: string): Promise<any> {
  const connection = await getConnection();
  const result = await connection.query(sql);
  return result;
}

export interface ColumnInfo {
  name: string;
  type: string;
}

export interface QueryResult {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  rowCount: number;
}

// Helper to get a readable type name from Arrow type
 
function getArrowTypeName(field: any): string {
  const type = field.type;

  // Arrow type IDs (from apache-arrow library)
  const typeIdMap: Record<number, string> = {
    0: 'NONE',
    1: 'Null',
    2: 'Int',
    3: 'Float',
    4: 'Binary',
    5: 'Utf8',
    6: 'Bool',
    7: 'Decimal',
    8: 'Date',
    9: 'Time',
    10: 'Timestamp',
    11: 'Interval',
    12: 'List',
    13: 'Struct',
    14: 'Union',
    15: 'FixedSizeBinary',
    16: 'FixedSizeList',
    17: 'Map',
    18: 'Duration',
    19: 'LargeBinary',
    20: 'LargeUtf8',
    21: 'LargeList',
    22: 'RunEndEncoded',
  };

  if (type && type.typeId !== undefined) {
    const baseName = typeIdMap[type.typeId] || 'Unknown';

    // For Int types, add bit width (Int8, Int16, Int32, Int64, UInt8, etc.)
    if (baseName === 'Int' && type.bitWidth !== undefined) {
      return type.isSigned !== false ? `Int${type.bitWidth}` : `UInt${type.bitWidth}`;
    }

    // For Float types, check precision
    if (baseName === 'Float' && type.precision !== undefined) {
      // precision 0 = HALF (16-bit), 1 = SINGLE (32-bit), 2 = DOUBLE (64-bit)
      const precisionMap: Record<number, string> = { 0: 'Float16', 1: 'Float32', 2: 'Float64' };
      return precisionMap[type.precision] || 'Float';
    }

    // For Timestamp types, we can add unit info if needed
    if (baseName === 'Timestamp' && type.unit !== undefined) {
      // unit: 0 = second, 1 = millisecond, 2 = microsecond, 3 = nanosecond
      const unitMap: Record<number, string> = {
        0: 'Timestamp(s)',
        1: 'Timestamp(ms)',
        2: 'Timestamp(us)',
        3: 'Timestamp(ns)'
      };
      return unitMap[type.unit] || 'Timestamp';
    }

    // Display "String" instead of "Utf8" for better readability
    if (baseName === 'Utf8' || baseName === 'LargeUtf8') {
      return 'String';
    }

    return baseName;
  }

  return 'Unknown';
}

export async function executeQueryAsJSON(sql: string): Promise<QueryResult> {
  const arrowResult = await executeQuery(sql);

   
  const columns: ColumnInfo[] = arrowResult.schema.fields.map((field: any) => ({
    name: field.name,
    type: getArrowTypeName(field),
  }));

   
  const rows = arrowResult.toArray().map((row: any) => row.toJSON());

  return {
    columns,
    rows,
    rowCount: arrowResult.numRows,
  };
}

export type ExportFormat = "csv" | "json";

const EXPORT_MIME: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8",
  json: "application/json",
};

/**
 * Converts the loaded table to CSV or JSON using DuckDB's COPY, entirely in
 * the browser. DuckDB writes to its in-memory filesystem, we read the bytes
 * back out, then drop the temporary file.
 */
export async function exportTableAs(
  format: ExportFormat,
  sql: string = "SELECT * FROM data"
): Promise<Blob> {
  const connection = await getConnection();
  const database = await initDuckDB();
  const tmpName = `parquetly-export.${format}`;

  const options =
    format === "csv" ? "(FORMAT CSV, HEADER)" : "(FORMAT JSON, ARRAY true)";

  try {
    await connection.query(`COPY (${sql}) TO '${tmpName}' ${options}`);
    const buffer = await database.copyFileToBuffer(tmpName);
    // Copy into a fresh array: the buffer is backed by WASM memory, which can
    // be reused or detached once the file is dropped.
    return new Blob([new Uint8Array(buffer)], { type: EXPORT_MIME[format] });
  } finally {
    await database.dropFile(tmpName).catch(() => {});
  }
}
