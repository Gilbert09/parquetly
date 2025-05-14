
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type ParquetColumn } from '@/lib/parquetReader';

interface SchemaSummaryProps {
  columns: ParquetColumn[];
  fileName: string;
  fileSize: string;
  totalRows: number;
}

export default function SchemaSummary({ columns, fileName, fileSize, totalRows }: SchemaSummaryProps) {
  // Count column types
  const typeCounts: Record<string, number> = columns.reduce((acc, column) => {
    // Extract base type (e.g., "int32" -> "int")
    const baseType = column.type.split('(')[0].replace(/[0-9]/g, '');
    acc[baseType] = (acc[baseType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get color for type badge
  const getTypeBadgeColor = (type: string): string => {
    if (type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double')) {
      return 'bg-data-blue/20 text-data-blue border-data-blue/30';
    } else if (type.includes('bool')) {
      return 'bg-data-green/20 text-data-green border-data-green/30';
    } else if (type.includes('date') || type.includes('time')) {
      return 'bg-data-purple/20 text-data-purple border-data-purple/30';
    } else if (type.includes('string') || type.includes('char')) {
      return 'bg-data-orange/20 text-data-orange border-data-orange/30';
    } else {
      return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">File name</div>
              <div className="text-sm truncate">{fileName}</div>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Size</div>
                <div className="text-sm">{fileSize}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Rows</div>
                <div className="text-sm">{totalRows.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Columns</div>
                <div className="text-sm">{columns.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Data Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeCounts).map(([type, count]) => (
              <Badge 
                key={type} 
                variant="outline" 
                className={`${getTypeBadgeColor(type)} text-xs`}
              >
                {type}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Column Preview</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[120px] overflow-y-auto">
          <ul className="space-y-1">
            {columns.slice(0, 20).map((column) => (
              <li key={column.name} className="text-sm flex items-center justify-between">
                <span className="truncate">{column.name}</span>
                <span className={`text-xs ${column.nullable ? 'text-data-orange' : 'text-data-green'}`}>
                  {column.type} {column.nullable ? '(nullable)' : ''}
                </span>
              </li>
            ))}
          </ul>
          {columns.length > 20 && (
            <div className="text-xs text-muted-foreground mt-1">
              +{columns.length - 20} more columns
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
