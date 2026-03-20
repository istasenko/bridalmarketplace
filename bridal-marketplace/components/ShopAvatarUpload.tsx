"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "listing-photos";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

type ShopAvatarUploadProps = {
  sellerId: string;
  currentUrl: string | null;
  onUrlChange: (url: string | null) => void;
};

export default function ShopAvatarUpload({ sellerId, currentUrl, onUrlChange }: ShopAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = preview ?? currentUrl;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 2MB");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `shop-avatars/${sellerId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (uploadError) throw new Error(uploadError.message);
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setPreview(urlData.publicUrl);
      onUrlChange(urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUrlChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700">Shop photo</label>
      <div className="mt-1 flex items-center gap-4">
        {displayUrl ? (
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
              <Image
                src={displayUrl}
                alt="Shop avatar"
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-white hover:bg-neutral-700"
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 hover:border-neutral-400 hover:text-neutral-600"
            onClick={() => inputRef.current?.click()}
          >
            <span className="text-2xl" aria-hidden>+</span>
            <span className="text-xs">Add photo</span>
          </div>
        )}
        {displayUrl && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Change photo"}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-neutral-500">Square image, max 2MB · JPG, PNG, WebP</p>
    </div>
  );
}
