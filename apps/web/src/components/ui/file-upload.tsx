import { Upload } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type FileUploadProps = {
  accept?: string;
  maxSizeMb?: number;
  onFilesValidated?: (files: File[]) => void;
  onError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
};

export function FileUpload({ accept, maxSizeMb = 10, onFilesValidated, onError, className, disabled }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validate = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    const maxBytes = maxSizeMb * 1024 * 1024;
    for (const f of list) {
      if (f.size > maxBytes) {
        onError?.(`File "${f.name}" exceeds ${maxSizeMb} MB`);
        return;
      }
    }
    onFilesValidated?.(list);
  };

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:bg-muted/50",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (disabled) return;
        validate(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-label="Upload files"
    >
      <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-medium">Drag & drop or click to upload</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {accept ? `Accepted: ${accept}. ` : ""}Max {maxSizeMb} MB per file.
      </p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        disabled={disabled}
        multiple
        onChange={(e) => validate(e.target.files)}
      />
    </div>
  );
}
