import * as arrow from "@apache-arrow/ts";
// import wasmInit, { readParquet } from "parquet-wasm";

const parquet = await import(
  "https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.0/esm/+esm"
);
await parquet.default();

export interface ParquetColumn {
  name: string;
  type: { typeId: number };
  nullable: boolean;
}

export interface ParquetFileData {
  columns: ParquetColumn[];
  data: Record<string, any>[];
  totalRows: number;
  fileName: string;
  fileSize: string;
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
    // await wasmInit();
    const buffer = await file.arrayBuffer();
    const reader = parquet.readParquet(new Uint8Array(buffer));
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
    };
  } catch (error) {
    console.error("Failed to read parquet file:", error);
    throw new Error(
      "Failed to read parquet file. Please make sure it's a valid parquet file."
    );
  }
}
