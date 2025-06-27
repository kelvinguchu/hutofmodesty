import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert absolute Payload media URLs (e.g. http://localhost:3000/api/media/file/xyz.webp)
// to relative paths that Next can serve locally (e.g. /media/xyz.webp). This avoids
// triggering a remote fetch through the Next Image optimizer which can lead to
// timeouts during development when the REST handler streams the file.
export function normalizeMediaURL(url?: string | null): string | undefined {
  if (!url) return undefined;

  // 1. If we already see the canonical UploadThing or API-formatted URL, just return it.
  if (url.includes("/api/media/file")) {
    try {
      const parsed = new URL(url, "http://dummy");
      const sameHostnames = [
        "localhost",
        "127.0.0.1",
        "hutofmodesty.com",
        "hutofmodesty.vercel.app",
      ];
      if (sameHostnames.includes(parsed.hostname)) {
        return parsed.pathname + parsed.search;
      }
    } catch {}
    return url;
  }

  // 2. Convert legacy local-storage paths that begin with /media/<filename>
  //    to the new API endpoint so that Payload can stream the file (works for
  //    both local dev + storage-uploadthing).
  if (url.startsWith("/media/")) {
    const filename = url.replace(/^\/media\//, "");
    return `/api/media/file/${filename}`;
  }

  // 3. If the value is a FULL absolute URL we leave it unchanged. That covers
  //    UploadThing CDN (https://**.ufs.sh/f/…), utfs.io etc.
  return url;
}
