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
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <a
          href="/"
          className="bg-gradient-to-r from-primary to-data-purple bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Parquetly
        </a>
      </h1>

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
