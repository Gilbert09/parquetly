import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, Info, WrapText } from "lucide-react";
import { executeQueryAsJSON, type QueryResult } from "@/lib/duckdb";
import { usePostHog } from "posthog-js/react";

// Extend TanStack Table's ColumnMeta type
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    type?: string;
  }
}

export default function QueryTab() {
  const [query, setQuery] = useState("SELECT * FROM data LIMIT 100");
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const [wrapText, setWrapText] = useState(false);
  const posthog = usePostHog();

  // Get column type color (same as DataTable)
  const getTypeColor = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (
      lowerType.includes("int") ||
      lowerType.includes("decimal") ||
      lowerType.includes("float") ||
      lowerType.includes("double")
    ) {
      return "text-data-blue";
    } else if (lowerType.includes("bool")) {
      return "text-data-green";
    } else if (lowerType.includes("date") || lowerType.includes("time")) {
      return "text-data-purple";
    } else if (lowerType.includes("string") || lowerType.includes("utf") || lowerType.includes("char")) {
      return "text-data-orange";
    } else {
      return "text-muted-foreground";
    }
  };

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a SQL query");
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    try {
      const queryResult = await executeQueryAsJSON(query);
      setResult(queryResult);

      const executionTime = Date.now() - startTime;

      // Track successful query execution
      posthog?.capture('query_executed', {
        query_length: query.length,
        query_type: query.trim().split(/\s+/)[0].toUpperCase(), // SELECT, UPDATE, etc.
        row_count: queryResult.rowCount,
        column_count: queryResult.columns.length,
        execution_time_ms: executionTime,
        success: true,
      });
    } catch (err) {
      console.error("Query execution error:", err);
      const executionTime = Date.now() - startTime;

      setError(
        err instanceof Error ? err.message : "Failed to execute query"
      );

      // Track failed query execution
      posthog?.capture('query_executed', {
        query_length: query.length,
        query_type: query.trim().split(/\s+/)[0].toUpperCase(),
        execution_time_ms: executionTime,
        success: false,
        error_message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Execute query on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecuteQuery();
    }
  };

  // Helper function to estimate content width
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const estimateColumnWidth = (columnName: string, columnType: string, rows: Record<string, any>[]) => {
    // Start with header width including type (rough estimate: 8px per character + padding)
    // Add space for type annotation like "(Int32)"
    let maxWidth = (columnName.length + columnType.length + 3) * 8 + 32;

    // Check first 100 rows to estimate content width
    const sampleSize = Math.min(rows.length, 100);
    for (let i = 0; i < sampleSize; i++) {
      const value = rows[i][columnName];
      let contentLength = 0;

      if (value === null || value === undefined) {
        contentLength = 4; // "null"
      } else if (typeof value === "object") {
        contentLength = Math.min(JSON.stringify(value).length, 100);
      } else {
        contentLength = Math.min(String(value).length, 100);
      }

      // Approximate width: 7px per character for monospace font
      const estimatedWidth = contentLength * 7 + 24;
      maxWidth = Math.max(maxWidth, estimatedWidth);
    }

    // Cap at reasonable sizes
    return Math.min(Math.max(maxWidth, 100), 400);
  };

  // Generate columns dynamically from query results
  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (!result || !result.columns.length) return [];

    return result.columns.map((columnInfo) => ({
      accessorKey: columnInfo.name,
      header: columnInfo.name,
      meta: {
        type: columnInfo.type,
      },
      cell: (info) => {
        const value = info.getValue();
        if (value === null || value === undefined) {
          return <span className="text-muted-foreground italic">null</span>;
        }
        if (typeof value === "object") {
          const jsonStr = JSON.stringify(value);
          return (
            <span
              className={wrapText ? "break-words whitespace-normal" : "truncate block"}
              title={jsonStr}
            >
              {jsonStr}
            </span>
          );
        }
        const stringValue = String(value);
        return (
          <span
            className={wrapText ? "break-words whitespace-normal" : "truncate block"}
            title={stringValue}
          >
            {stringValue}
          </span>
        );
      },
      size: estimateColumnWidth(columnInfo.name, columnInfo.type, result.rows),
      minSize: 80,
      maxSize: 800,
    }));
  }, [result, wrapText]);

  const table = useReactTable({
    data: result?.rows ?? [],
    columns,
    columnResizeMode,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The parquet data is loaded into a DuckDB table named{" "}
          <code className="font-mono font-semibold">data</code>. You can query
          it using standard SQL. Press{" "}
          <kbd className="px-2 py-1 text-xs font-semibold border rounded">
            Cmd/Ctrl + Enter
          </kbd>{" "}
          to execute.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SQL Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="SELECT * FROM data LIMIT 100"
              className="font-mono text-sm min-h-[120px]"
              disabled={isExecuting}
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Table name:{" "}
                <code className="font-mono font-semibold">data</code>
              </div>
              <Button
                onClick={handleExecuteQuery}
                disabled={isExecuting}
                size="sm"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Query
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="font-mono text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Results ({result.rowCount.toLocaleString()} rows)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWrapText(!wrapText)}
              >
                <WrapText className="mr-2 h-4 w-4" />
                {wrapText ? "Unwrap Text" : "Wrap Text"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-auto max-h-[600px]">
              <table
                className="w-full text-sm border-collapse"
                style={{
                  width: table.getCenterTotalSize(),
                }}
              >
                <thead className="sticky top-0 bg-muted z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-3 py-2 text-left font-semibold border-b border-r relative group"
                          style={{
                            width: header.getSize(),
                          }}
                        >
                          <div className="truncate">
                            {header.isPlaceholder ? null : (
                              <div className="font-medium">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.columnDef.meta?.type && (
                                  <span
                                    className={`ml-1 text-xs ${getTypeColor(
                                      header.column.columnDef.meta.type
                                    )}`}
                                  >
                                    ({header.column.columnDef.meta.type})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary opacity-0 group-hover:opacity-100 ${
                              header.column.getIsResizing()
                                ? "bg-primary opacity-100"
                                : ""
                            }`}
                          />
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`px-3 py-2 font-mono text-xs border-r ${
                            wrapText ? "align-top" : "max-w-0"
                          }`}
                          style={{
                            width: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
