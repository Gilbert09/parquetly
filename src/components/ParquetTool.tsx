"use client";

import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/toaster";

// The viewer reads files with WebAssembly and must never run on the server.
// ssr:false also keeps @duckdb/duckdb-wasm out of the server bundle entirely -
// its package exports resolve to a Node build that touches worker_threads at
// module scope, which would break the prerender.
const ParquetViewer = dynamic(() => import("@/components/ParquetViewer"), {
  ssr: false,
  loading: () => <ParquetToolSkeleton />,
});

function ParquetToolSkeleton() {
  return (
    <div
      className="border-2 border-dashed border-border rounded-lg p-10 text-center"
      aria-busy="true"
    >
      <p className="text-lg font-medium">Drop your parquet file here</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything runs in your browser. Your files stay on your computer.
      </p>
    </div>
  );
}

export default function ParquetTool() {
  return (
    <>
      <ParquetViewer />
      <Toaster />
    </>
  );
}
