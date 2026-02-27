import { useEffect, useState } from "react";

async function ngrokImageToBlobUrl(url: string) {
  const r = await fetch(url, {
    headers: {
      "ngrok-skip-browser-warning": "1",
      // NOTE: browsers ignore setting User-Agent; keep this line out (it doesn't help in browser)
      // "User-Agent": "Mozilla/5.0",
    },
  });
  if (!r.ok) throw new Error(`Image fetch failed: ${r.status}`);
  const blob = await r.blob();
  return URL.createObjectURL(blob);
}

export function useNgrokImageSrc(src?: string) {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(src);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let blobUrl: string | null = null;

    async function run() {
      if (!src) {
        setResolvedSrc(undefined);
        return;
      }

      // only convert ngrok urls
      if (!src.includes("ngrok")) {
        setResolvedSrc(src);
        return;
      }

      setLoading(true);
      try {
        blobUrl = await ngrokImageToBlobUrl(src);
        if (!cancelled) setResolvedSrc(blobUrl);
      } catch (e) {
        // fallback: show original url (or set undefined)
        if (!cancelled) setResolvedSrc(src);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src]);

  return { src: resolvedSrc, loading };
}