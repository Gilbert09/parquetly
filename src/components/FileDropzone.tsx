import React, { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FileJson, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostHog } from "posthog-js/react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const SAMPLE_FILE_URL =
  "https://huggingface.co/datasets/dim/law_stackexchange/resolve/main/data/train-00000-of-00001-594b426ddc4a1564.parquet";

export default function FileDropzone({
  onFileSelect,
  isProcessing,
}: FileDropzoneProps) {
  const { toast } = useToast();
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const posthog = usePostHog();

  const validateAndProcessFile = useCallback(
    (file: File) => {
      // Check if file is likely a parquet file
      // Parquet files don't have a standard extension, so we'll accept various possibilities
      const validExtensions = [".parquet", ".pqt", ".parq", ".pq"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a .parquet file.",
        });
        return;
      }

      // Track user file upload
      posthog?.capture("user_file_uploaded", {
        file_size: file.size,
        file_extension: fileExtension,
      });

      onFileSelect(file);
    },
    [toast, onFileSelect, posthog]
  );

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    posthog?.capture("sample_file_load_started");

    try {
      const response = await fetch(SAMPLE_FILE_URL);

      if (!response.ok) {
        throw new Error("Failed to download sample file");
      }

      const blob = await response.blob();
      const file = new File([blob], "law_stackexchange_sample.parquet", {
        type: "application/octet-stream",
      });

      posthog?.capture("sample_file_load_success", {
        file_size: blob.size,
      });

      onFileSelect(file);
    } catch (error) {
      console.error("Failed to load sample file:", error);
      posthog?.capture("sample_file_load_failed", {
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
      toast({
        variant: "destructive",
        title: "Failed to load sample file",
        description:
          error instanceof Error
            ? error.message
            : "Please try again or upload your own file.",
      });
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (isProcessing) return;

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        validateAndProcessFile(file);
      }
    },
    [isProcessing, validateAndProcessFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isProcessing) return;

      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        validateAndProcessFile(file);
      }
    },
    [isProcessing, validateAndProcessFile]
  );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-10 text-center transition-colors",
          isProcessing || isLoadingSample
            ? "border-muted bg-muted/20"
            : "border-border hover:border-primary/50 hover:bg-muted/10"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".parquet,.pqt,.parq,.pq"
          id="file-upload"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isProcessing || isLoadingSample}
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "flex flex-col items-center justify-center gap-4 cursor-pointer",
            (isProcessing || isLoadingSample) &&
              "opacity-70 pointer-events-none"
          )}
        >
          <div className="p-4 rounded-full bg-secondary text-primary">
            <FileJson className="h-10 w-10" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isProcessing ? "Processing..." : "Drop your parquet file here"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {isProcessing
                ? "This may take a moment for large files"
                : "or click to browse"}
            </p>
          </div>
        </label>
      </div>

      {/* Sample file button */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleLoadSample}
          disabled={isProcessing || isLoadingSample}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isLoadingSample
            ? "Loading sample file..."
            : "Try with a sample file from HuggingFace"}
        </Button>
      </div>

      {isLoadingSample && (
        <p className="text-xs text-center text-muted-foreground">
          Downloading sample file from HuggingFace...
        </p>
      )}

      {/* Privacy disclaimer */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Everything runs in your browser. Your files stay on your computer.
        </p>
      </div>
    </div>
  );
}
