import React, { useState } from "react";
import { type RowGroupInfo } from "@/lib/parquetReader";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getCompressionName } from "@/lib/utils";

interface RowGroupsTableProps {
  rowGroups: RowGroupInfo[];
}

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

export default function RowGroupsTable({ rowGroups }: RowGroupsTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left w-12"></th>
              <th className="px-4 py-3 text-left">Row Group</th>
              <th className="px-4 py-3 text-left">Rows</th>
              <th className="px-4 py-3 text-left">Columns</th>
              <th className="px-4 py-3 text-left">Total Size</th>
              <th className="px-4 py-3 text-left">Compressed Size</th>
              <th className="px-4 py-3 text-left">Compression Ratio</th>
            </tr>
          </thead>
          <tbody>
            {rowGroups.map((rowGroup) => {
              const isExpanded = expandedGroups.has(rowGroup.rowGroupIndex);
              const compressionRatio = (
                (1 - rowGroup.compressedSize / rowGroup.totalByteSize) *
                100
              ).toFixed(1);

              return (
                <React.Fragment key={rowGroup.rowGroupIndex}>
                  <tr
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleGroup(rowGroup.rowGroupIndex)}
                  >
                    <td className="px-4 py-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono">
                      {rowGroup.rowGroupIndex}
                    </td>
                    <td className="px-4 py-2">
                      {rowGroup.numRows.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{rowGroup.numColumns}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {formatBytes(rowGroup.totalByteSize)}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {formatBytes(rowGroup.compressedSize)}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-data-green">{compressionRatio}%</span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-0 py-0">
                        <div className="bg-muted/20 px-8 py-4">
                          <h4 className="font-semibold mb-3 text-sm">
                            Column Chunks
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b bg-muted/30">
                                  <th className="px-3 py-2 text-left">
                                    Column Path
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Compression
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Encodings
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Values
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Compressed Size
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Uncompressed Size
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rowGroup.columns.map((column, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b last:border-0 hover:bg-muted/30"
                                  >
                                    <td className="px-3 py-2 font-mono">
                                      {column.columnPath}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className="text-data-blue">
                                        {getCompressionName(column.compression)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      {column.encodings.join(", ")}
                                    </td>
                                    <td className="px-3 py-2">
                                      {column.numValues.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 font-mono">
                                      {formatBytes(column.compressedSize)}
                                    </td>
                                    <td className="px-3 py-2 font-mono">
                                      {formatBytes(column.uncompressedSize)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
