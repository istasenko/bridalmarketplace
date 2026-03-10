"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "listing-photos";
const MAX_FILES = 6;

export type ImageUploadRef = {
  upload: () => Promise<string[]>;
  getFiles: () => File[];
  clear: () => void;
};

type ImageUploadProps = {
  onFilesChange?: (files: File[]) => void;
};

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(
  function ImageUpload({ onFilesChange }, ref) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearPreviews = useCallback((urls: string[]) => {
    urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const handleFiles = useCallback(
    (newFiles: FileList | File[] | null) => {
      if (!newFiles?.length) return;
      const arr = Array.from(newFiles);
      const images = arr.filter(
        (f) => f.type.startsWith("image/") && f.size > 0 && f.size < 5 * 1024 * 1024 // 5MB max
      );
      const combined = [...files, ...images].slice(0, MAX_FILES);
      setFiles(combined);

      // Update previews
      clearPreviews(previews);
      const newPreviews = combined.map((f) => URL.createObjectURL(f));
      setPreviews(newPreviews);

      onFilesChange?.(combined);
    },
    [files, previews, clearPreviews, onFilesChange]
  );

  const removeFile = useCallback(
    (idx: number) => {
      const next = files.filter((_, i) => i !== idx);
      clearPreviews([previews[idx]]);
      setFiles(next);
      setPreviews((p) => p.filter((_, i) => i !== idx));
      onFilesChange?.(next);
    },
    [files, previews, clearPreviews, onFilesChange]
  );

  const upload = useCallback(async (): Promise<string[]> => {
    if (files.length === 0) return [];
    const supabase = createClient();
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}_${i}.${ext}`;
      const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  }, [files]);

  const clear = useCallback(() => {
    clearPreviews(previews);
    setFiles([]);
    setPreviews([]);
    onFilesChange?.([]);
  }, [previews, clearPreviews, onFilesChange]);

  useImperativeHandle(
    ref,
    () => ({
      upload,
      getFiles: () => files,
      clear,
    }),
    [upload, files, clear]
  );

  return (
    <div>
      <div
        className={`mt-1 flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          dragActive ? "border-neutral-400 bg-neutral-50" : "border-neutral-300 bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {previews.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-2 -top-2 rounded-full bg-neutral-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
            {previews.length < MAX_FILES && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-600"
              >
                <span className="text-xs">+ Add</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Click or drag to upload (1–6 images)
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        {files.length}/6 images · Max 5MB each · JPG, PNG, WebP
      </p>
    </div>
  );
});
