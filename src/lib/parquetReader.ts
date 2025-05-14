
import { Arrow } from '@apache-arrow/ts';

// Define types for our parquet data
export interface ParquetColumn {
  name: string;
  type: string;
  nullable: boolean;
}

export interface ParquetFileData {
  columns: ParquetColumn[];
  data: Record<string, any>[];
  totalRows: number;
  fileName: string;
  fileSize: string;
}

export async function readParquetFile(file: File): Promise<ParquetFileData> {
  try {
    // Read the file as an ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // Use Arrow to parse the parquet file
    const table = await Arrow.Table.from([new Uint8Array(buffer)]);
    
    // Extract column information
    const columns: ParquetColumn[] = table.schema.fields.map(field => ({
      name: field.name,
      type: field.type.toString(),
      nullable: field.nullable
    }));
    
    // Extract data rows (up to 1000 for performance)
    const maxRows = Math.min(table.numRows, 1000);
    const data: Record<string, any>[] = [];
    
    for (let i = 0; i < maxRows; i++) {
      const row: Record<string, any> = {};
      columns.forEach((column) => {
        const col = table.getColumn(column.name);
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
      fileSize
    };
  } catch (error) {
    console.error("Failed to read parquet file:", error);
    throw new Error("Failed to read parquet file. Please make sure it's a valid parquet file.");
  }
}

// Helper to format file size
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
