"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportTableAs, type ExportFormat } from "@/lib/duckdb";
import { usePostHog } from "posthog-js/react";

interface ExportButtonsProps {
  /** Source file name, used to name the download. */
  fileName: string;
}

export default function ExportButtons({ fileName }: ExportButtonsProps) {
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const { toast } = useToast();
  const posthog = usePostHog();

  const handleExport = async (format: ExportFormat) => {
    setBusy(format);
    const startedAt = Date.now();

    try {
      const blob = await exportTableAs(format);
      const outName = `${fileName.replace(/\.[^.]+$/, "")}.${format}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      posthog?.capture("file_converted", {
        format,
        output_bytes: blob.size,
        duration_ms: Date.now() - startedAt,
        success: true,
      });
    } catch (err) {
      console.error(`Failed to convert to ${format}:`, err);
      toast({
        variant: "destructive",
        title: `Could not convert to ${format.toUpperCase()}`,
        description:
          err instanceof Error ? err.message : "Unknown conversion error",
      });
      posthog?.capture("file_converted", {
        format,
        duration_ms: Date.now() - startedAt,
        success: false,
        error_message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {(["csv", "json"] as const).map((format) => (
        <Button
          key={format}
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => handleExport(format)}
        >
          {busy === format ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {format.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
