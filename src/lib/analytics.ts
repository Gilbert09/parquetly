// DuckDB messages start with the error class, for example
// "Binder Error: Referenced column ...". Only that class is safe to send to
// analytics: the rest of the message can quote data values, column names or
// query text.
const DUCKDB_CLASS = /^([A-Za-z][A-Za-z ]{0,39}?) Error:/;

export function errorCategory(err: unknown): string {
  if (!(err instanceof Error)) return "Unknown";

  const match = DUCKDB_CLASS.exec(err.message);
  if (match) return match[1];

  return /^\w{1,40}$/.test(err.name) ? err.name : "Unknown";
}

const SQL_KEYWORDS = new Set([
  "SELECT",
  "WITH",
  "FROM",
  "DESCRIBE",
  "SUMMARIZE",
  "SHOW",
  "EXPLAIN",
  "PRAGMA",
  "CREATE",
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "ALTER",
  "COPY",
  "VALUES",
]);

// The first word of a query is free text. Send it only when it is a known
// keyword, so a typo or a pasted value does not reach analytics.
export function queryType(query: string): string {
  const word = query.trim().split(/\s+/)[0].toUpperCase();
  return SQL_KEYWORDS.has(word) ? word : "OTHER";
}
