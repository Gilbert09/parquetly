import * as arrow from "apache-arrow";

// Must match EXPECTED in scripts/copy-parquet-wasm.mjs, which copies these
// files out of node_modules and into public/ at build time.
const PARQUET_WASM_VERSION = "0.7.1";
const GLUE_URL = `/wasm/parquet-wasm/${PARQUET_WASM_VERSION}/parquet_wasm.js`;
const WASM_URL = `/wasm/parquet-wasm/${PARQUET_WASM_VERSION}/parquet_wasm_bg.wasm`;

type ParquetWasm = typeof import("parquet-wasm/esm/parquet_wasm.js");

let initPromise: Promise<ParquetWasm> | null = null;

/**
 * Loads the parquet-wasm module from our own origin.
 *
 * Memoized, so it is safe to call from anywhere any number of times. Callers
 * must await it rather than relying on it having been kicked off at boot.
 *
 * The magic comments keep webpack and Turbopack from trying to resolve the
 * path at build time - the glue and .wasm are served as static assets, not
 * bundled. Vite treats this as a public-dir path and ignores the comments.
 */
export function initParquet(): Promise<ParquetWasm> {
  if (!initPromise) {
    initPromise = (async () => {
      const mod = await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */
        /* @vite-ignore */ GLUE_URL
      );
      await mod.default(WASM_URL);
      return mod as ParquetWasm;
    })().catch((err) => {
      // Let a transient network failure be retried.
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export interface ParquetColumn {
  name: string;
  type: { typeId: number };
  nullable: boolean;
}

export interface ColumnChunkStats {
  columnPath: string;
  // parquet-wasm returns these as enum values, not strings.
  compression: number | string;
  encodings: (number | string)[];
  numValues: number;
  compressedSize: number;
  uncompressedSize: number;
}

export interface RowGroupInfo {
  rowGroupIndex: number;
  numRows: number;
  numColumns: number;
  totalByteSize: number;
  compressedSize: number;
  columns: ColumnChunkStats[];
}

export interface ParquetFileData {
  columns: ParquetColumn[];
  data: Record<string, any>[];
  totalRows: number;
  fileName: string;
  fileSize: string;
  rowGroups: RowGroupInfo[];
  arrowTable: arrow.Table;
}

// Utility to format bytes as human-readable string
function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

export async function readParquetFile(file: File): Promise<ParquetFileData> {
  try {
    const parquet = await initParquet();
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Create ParquetFile to access metadata
    const parquetFile = await parquet.ParquetFile.fromFile(file);
    const metadata = parquetFile.metadata();

    // Extract row group information
    const rowGroups: RowGroupInfo[] = [];
    const numRowGroups = metadata.numRowGroups();

    for (let i = 0; i < numRowGroups; i++) {
      const rowGroup = metadata.rowGroup(i);
      const numColumns = rowGroup.numColumns();

      // Extract column chunk metadata
      const columns: ColumnChunkStats[] = [];
      for (let j = 0; j < numColumns; j++) {
        const columnChunk = rowGroup.column(j);
        columns.push({
          // columnPath() is the path segments of a (possibly nested) column.
          columnPath: columnChunk.columnPath().join("."),
          compression: columnChunk.compression(),
          encodings: columnChunk.encodings(),
          numValues: columnChunk.numValues(),
          compressedSize: columnChunk.compressedSize(),
          uncompressedSize: columnChunk.uncompressedSize(),
        });
      }

      rowGroups.push({
        rowGroupIndex: i,
        numRows: rowGroup.numRows(),
        numColumns: numColumns,
        totalByteSize: rowGroup.totalByteSize(),
        compressedSize: rowGroup.compressedSize(),
        columns: columns,
      });
    }

    // Read the actual data using the existing approach
    const reader = parquet.readParquet(uint8Array);
    const table = arrow.tableFromIPC(reader.intoIPCStream());

    const schema = table.schema;
    const columns: ParquetColumn[] = schema.fields.map((field) => ({
      name: field.name,
      type: field.type ?? "UNKNOWN",
      nullable: field.nullable,
    }));

    // Extract data rows (up to 1000 for performance)
    const maxRows = Math.min(table.numRows, 1000);
    const data: Record<string, any>[] = [];

    for (let i = 0; i < maxRows; i++) {
      const row: Record<string, any> = {};
      columns.forEach((column) => {
        const col = table.getChild(column.name);
        if (col) {
          const value = col.get(i);
          row[column.name] = value !== null ? value : null;
        }
      });
      data.push(row);
    }

    // Calculate file size in human-readable format
    const fileSize = formatBytes(file.size);

    return {
      columns,
      data,
      totalRows: table.numRows,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      rowGroups,
      arrowTable: table,
    };
  } catch (error) {
    console.error("Failed to read parquet file:", error);
    throw new Error(
      "Failed to read parquet file. Please make sure it's a valid parquet file."
    );
  }
}
