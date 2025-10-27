import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import FileDropzone from "./FileDropzone";
import DataTable from "./DataTable";
import SchemaSummary from "./SchemaSummary";
import RowGroupsTable from "./RowGroupsTable";
import QueryTab from "./QueryTab";
import { readParquetFile, type ParquetFileData } from "@/lib/parquetReader";
import { loadArrowTable } from "@/lib/duckdb";
import { useToast } from "@/hooks/use-toast";
import { getParquetTypeName } from "@/lib/utils";

export default function ParquetViewer() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<ParquetFileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await readParquetFile(file);

      // Load the Arrow table into DuckDB
      await loadArrowTable(data.arrowTable);

      setFileData(data);
      toast({
        title: "File loaded successfully",
        description: `Loaded ${
          file.name
        } with ${data.totalRows.toLocaleString()} rows and ${
          data.columns.length
        } columns.`,
      });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unknown error loading file"
      );
      toast({
        variant: "destructive",
        title: "Error loading file",
        description:
          err instanceof Error
            ? err.message
            : "Failed to read the parquet file",
      });
      setFileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <a
            href="/"
            className="bg-gradient-to-r from-primary to-data-purple bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Parquetly
          </a>
        </h1>
        <a
          href="https://github.com/Gilbert09/parquetly"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="hidden sm:inline">Open Source</span>
        </a>
      </div>

      {!fileData && (
        <Card>
          <CardContent className="pt-6">
            <FileDropzone
              onFileSelect={handleFileSelect}
              isProcessing={isLoading}
            />

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {fileData && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{fileData.fileName}</h2>
            <button
              onClick={() => setFileData(null)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Load different file
            </button>
          </div>

          <SchemaSummary
            columns={fileData.columns}
            fileName={fileData.fileName}
            fileSize={fileData.fileSize}
            totalRows={fileData.totalRows}
          />

          <Tabs defaultValue="data">
            <TabsList>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="rowgroups">Row Groups</TabsTrigger>
              <TabsTrigger value="query">Query</TabsTrigger>
            </TabsList>
            <TabsContent value="data" className="mt-4">
              <DataTable
                data={fileData.data}
                columns={fileData.columns}
                totalRows={fileData.totalRows}
              />
            </TabsContent>
            <TabsContent value="schema" className="mt-4">
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left">Column Name</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.columns.map((column, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2 font-mono text-sm">
                          {column.name}
                        </td>
                        <td className="px-4 py-2 font-mono text-sm">
                          {getParquetTypeName(column.type.typeId)}
                        </td>
                        <td className="px-4 py-2">
                          {column.nullable ? (
                            <span className="text-data-orange">Yes</span>
                          ) : (
                            <span className="text-data-green">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="rowgroups" className="mt-4">
              <RowGroupsTable rowGroups={fileData.rowGroups} />
            </TabsContent>
            <TabsContent value="query" className="mt-4">
              <QueryTab />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
