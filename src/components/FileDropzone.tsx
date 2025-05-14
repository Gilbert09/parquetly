
import React, { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FileJson } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileDropzone({ onFileSelect, isProcessing }: FileDropzoneProps) {
  const { toast } = useToast();
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  }, [isProcessing, onFileSelect]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  }, [isProcessing, onFileSelect]);
  
  const validateAndProcessFile = (file: File) => {
    // Check if file is likely a parquet file
    // Parquet files don't have a standard extension, so we'll accept various possibilities
    const validExtensions = ['.parquet', '.pqt', '.parq', '.pq'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a .parquet file."
      });
      return;
    }
    
    onFileSelect(file);
  };
  
  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center transition-colors",
        isProcessing ? "border-muted bg-muted/20" : "border-border hover:border-primary/50 hover:bg-muted/10"
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
        disabled={isProcessing}
      />
      <label 
        htmlFor="file-upload"
        className={cn(
          "flex flex-col items-center justify-center gap-4 cursor-pointer",
          isProcessing && "opacity-70 pointer-events-none"
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
            {isProcessing ? "This may take a moment for large files" : "or click to browse"}
          </p>
        </div>
      </label>
    </div>
  );
}
