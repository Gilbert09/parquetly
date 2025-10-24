import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parquet Type IDs from the official spec
enum ParquetTypeIDs {
  NONE = 0 /** The default placeholder type */,
  Null = 1 /** A NULL type having no physical storage */,
  Int = 2 /** Signed or unsigned 8, 16, 32, or 64-bit little-endian integer */,
  Float = 3 /** 2, 4, or 8-byte floating point value */,
  Binary = 4 /** Variable-length bytes (no guarantee of UTF8-ness) */,
  Utf8 = 5 /** UTF8 variable-length string as List<Char> */,
  Bool = 6 /** Boolean as 1 bit, LSB bit-packed ordering */,
  Decimal = 7 /** Precision-and-scale-based decimal type. Storage type depends on the parameters. */,
  Date = 8 /** int32_t days or int64_t milliseconds since the UNIX epoch */,
  Time = 9 /** Time as signed 32 or 64-bit integer, representing either seconds, milliseconds, microseconds, or nanoseconds since midnight since midnight */,
  Timestamp = 10 /** Exact timestamp encoded with int64 since UNIX epoch (Default unit millisecond) */,
  Interval = 11 /** YEAR_MONTH or DAY_TIME or MONTH_DAY_NANO interval */,
  List = 12 /** A list of some logical data type */,
  Struct = 13 /** Struct of logical types */,
  Union = 14 /** Union of logical types */,
  FixedSizeBinary = 15 /** Fixed-size binary. Each value occupies the same number of bytes */,
  FixedSizeList = 16 /** Fixed-size list. Each value occupies the same number of bytes */,
  Map = 17 /** Map of named logical types */,
  Duration = 18 /** Measure of elapsed time in either seconds, milliseconds, microseconds or nanoseconds */,
  LargeBinary = 19 /** Large variable-length bytes (no guarantee of UTF8-ness) */,
  LargeUtf8 = 20 /** Large variable-length string as List<Char> */,
}

// Mapping from ID to string name
const ParquetTypeIDToString: Record<number, string> = {
  [ParquetTypeIDs.Bool]: "BOOLEAN",
  [ParquetTypeIDs.Int]: "INT",
  [ParquetTypeIDs.Float]: "FLOAT",
  [ParquetTypeIDs.Decimal]: "DECIMAL",
  [ParquetTypeIDs.Binary]: "BINARY",
  [ParquetTypeIDs.Struct]: "STRUCT",
  [ParquetTypeIDs.Utf8]: "STRING",
  [ParquetTypeIDs.LargeUtf8]: "LARGE STRING",
  [ParquetTypeIDs.Map]: "MAP",
  [ParquetTypeIDs.Duration]: "DURATION",
  [ParquetTypeIDs.Interval]: "INTERVAL",
  [ParquetTypeIDs.List]: "LIST",
  [ParquetTypeIDs.Time]: "TIME",
  [ParquetTypeIDs.Date]: "DATE",
  [ParquetTypeIDs.Timestamp]: "TIMESTAMP",
  [ParquetTypeIDs.Null]: "NULL",
  [ParquetTypeIDs.NONE]: "NONE",
};

// Example usage
export function getParquetTypeName(typeId: number): string | undefined {
  return ParquetTypeIDToString[typeId];
}

// Parquet Compression enum values
enum ParquetCompression {
  UNCOMPRESSED = 0,
  SNAPPY = 1,
  GZIP = 2,
  BROTLI = 3,
  LZ4 = 4, // Deprecated as of Parquet 2.9.0
  LZ4_RAW = 5,
  ZSTD = 6,
  LZO = 7,
}

// Mapping from compression enum to string name
const CompressionToString: Record<number, string> = {
  [ParquetCompression.UNCOMPRESSED]: "UNCOMPRESSED",
  [ParquetCompression.SNAPPY]: "SNAPPY",
  [ParquetCompression.GZIP]: "GZIP",
  [ParquetCompression.BROTLI]: "BROTLI",
  [ParquetCompression.LZ4]: "LZ4 (deprecated)",
  [ParquetCompression.LZ4_RAW]: "LZ4_RAW",
  [ParquetCompression.ZSTD]: "ZSTD",
  [ParquetCompression.LZO]: "LZO",
};

export function getCompressionName(compression: number | string): string {
  // If it's already a string, return it
  if (typeof compression === "string") {
    return compression;
  }
  // If it's a number, look it up in the mapping
  return CompressionToString[compression] || `UNKNOWN (${compression})`;
}
