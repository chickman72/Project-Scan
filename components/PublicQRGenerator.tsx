"use client";

import { useState } from "react";

export default function PublicQRGenerator() {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a destination URL.");
      return;
    }

    setSubmittedUrl(trimmed);
  };

  const qrImageSrc = submittedUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
        submittedUrl
      )}`
    : "";

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Destination URL
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="https://example.com/landing"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5"
        >
          Generate QR
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      {submittedUrl ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/20 bg-black/5 p-4 text-center">
          <img
            src={qrImageSrc}
            alt={`QR code for ${submittedUrl}`}
            className="mx-auto h-56 w-56 rounded-xl bg-white p-2"
          />
          <p className="mt-3 break-all text-sm text-black/60">
            {submittedUrl}
          </p>
        </div>
      ) : null}
    </div>
  );
}
