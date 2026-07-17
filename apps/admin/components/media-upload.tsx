"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "../lib/supabase/client";
import styles from "../app/workspace.module.css";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function safeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function readImageDimensions(file: File) {
  if (!file.type.startsWith("image/")) {
    return Promise.resolve({ height: null, width: null });
  }

  return new Promise<{ height: number | null; width: number | null }>(
    (resolve) => {
      const image = new Image();
      const url = URL.createObjectURL(file);

      image.onload = () => {
        resolve({ height: image.naturalHeight, width: image.naturalWidth });
        URL.revokeObjectURL(url);
      };
      image.onerror = () => {
        resolve({ height: null, width: null });
        URL.revokeObjectURL(url);
      };
      image.src = url;
    },
  );
}

export function MediaUpload() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function upload(formData: FormData) {
    const file = formData.get("file");
    const altText = String(formData.get("altText") || "").trim();
    const bucket = String(formData.get("bucket") || "public-media");

    if (!(file instanceof File) || !file.size) {
      setStatus("Odaberi datoteku za upload.");
      return;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      setStatus("Format nije dopušten. Koristi sliku, MP4/WebM ili PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setStatus("Datoteka je veća od dopuštenih 20 MB.");
      return;
    }
    if (file.type.startsWith("image/") && !altText) {
      setStatus("Alt tekst je obvezan za javno pristupačne slike.");
      return;
    }
    if (bucket !== "public-media" && bucket !== "private-media") {
      setStatus("Storage zona nije valjana.");
      return;
    }

    setBusy(true);
    setStatus("Upload je u tijeku…");

    try {
      const supabase = createClient();
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Sesija je istekla. Ponovno se prijavi.");
      }

      const path = [
        new Date().toISOString().slice(0, 7),
        crypto.randomUUID() + "-" + safeFilename(file.name),
      ].join("/");
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const dimensions = await readImageDimensions(file);
      const { error: recordError } = await supabase
        .from("media_assets")
        .insert({
          alt_text: altText || null,
          bucket,
          created_by: userData.user.id,
          filename: file.name,
          height: dimensions.height,
          mime_type: file.type,
          path,
          size_bytes: file.size,
          width: dimensions.width,
        });

      if (recordError) {
        await supabase.storage.from(bucket).remove([path]);
        throw recordError;
      }

      setStatus("Datoteka je sigurno spremljena.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload nije uspio.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Dodaj datoteku</h2>
        <span>sigurni formati · najviše 20 MB</span>
      </div>
      <form action={upload} className={styles.uploadForm}>
        <label>
          <span>Datoteka</span>
          <input
            name="file"
            type="file"
            accept="image/avif,image/gif,image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf"
            required
          />
        </label>
        <label>
          <span>Alt tekst</span>
          <input
            name="altText"
            placeholder="Opiši što je važno na slici"
            type="text"
          />
        </label>
        <label>
          <span>Zona</span>
          <select name="bucket" defaultValue="public-media">
            <option value="public-media">Javna</option>
            <option value="private-media">Privatna</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Spremam…" : "Učitaj datoteku"}
        </button>
        <output aria-live="polite">{status}</output>
      </form>
    </section>
  );
}
