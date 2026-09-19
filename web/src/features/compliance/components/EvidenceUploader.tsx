import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, UploadCloud, X, Loader2 } from 'lucide-react';

interface Props {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  uploading?: boolean;
}

export function EvidenceUploader({ onFilesSelected, maxFiles = 3, uploading = false }: Props) {
  const {
    t
  } = useTranslation();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [selectedFiles, maxFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10485760, // 10MB
    disabled: uploading,
  });

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        {...getRootProps()} 
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`mx-auto h-10 w-10 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <h3 className="text-lg font-semibold mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & Drop Documents'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t("support_pdf_jpg_png_up_to_10mb", "Support PDF, JPG, PNG up to 10MB")}</p>
        <Button type="button" variant="outline" disabled={uploading}>{t("browse_files", "Browse Files")}</Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-muted-foreground">{t("selected_files", "Selected Files (")}{selectedFiles.length}/{maxFiles}{t("text", ")")}</h4>
          {selectedFiles.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-border/50 p-3 bg-background">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm line-clamp-1">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}{t("mb", "MB")}</p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
