import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { type ParquetColumn } from "@/lib/parquetReader";
import { getParquetTypeName } from "@/lib/utils";

interface DataTableProps {
  data: Record<string, any>[];
  columns: ParquetColumn[];
  totalRows: number;
}

export default function DataTable({
  data,
  columns,
  totalRows,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  // Format values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "null";
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (e) {
        if ("toString" in value) {
          return value.toString();
        }
      }
    }
    return String(value);
  };

  // Get column type color
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
    } else if (lowerType.includes("string") || lowerType.includes("char")) {
      return "text-data-orange";
    } else {
      return "text-muted-foreground";
    }
  };

  return (
    <div className="rounded-md border">
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.name} className="whitespace-nowrap">
                  <div className="font-medium">
                    {column.name}
                    <span
                      className={`ml-1 text-xs ${getTypeColor(
                        getParquetTypeName(column.type.typeId)
                      )}`}
                    >
                      ({getParquetTypeName(column.type.typeId)})
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${rowIndex}-${column.name}`}
                      className="truncate max-w-[200px]"
                    >
                      {formatValue(row[column.name])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{endIndex} of {data.length} rows
            {totalRows > data.length && ` (${totalRows} total in file)`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
