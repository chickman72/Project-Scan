"use client";

import { useEffect, useState, useTransition } from "react";

import { createQR } from "@/app/actions/qrActions";

type QRItem = {
  id: string;
  userId: string;
  shortCode: string;
  originalUrl: string;
  name: string | null;
  clickCount: number;
  createdAt: string;
};

type QRGeneratorProps = {
  userId: string;
  onCreated?: (item: QRItem) => void;
};

export default function QRGenerator({ userId, onCreated }: QRGeneratorProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [generatedItem, setGeneratedItem] = useState<QRItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shortLink = generatedItem
    ? origin
      ? `${origin}/t/${generatedItem.shortCode}`
      : `/t/${generatedItem.shortCode}`
    : "";

  const qrImageSrc = shortLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
        shortLink
      )}`
    : "";

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    setCopyError(null);
    setCopied(false);

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      setCopyError("Unable to copy link.");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Enter a destination URL.");
      return;
    }

    startTransition(async () => {
      try {
        const item = await createQR({
          userId,
          originalUrl: url.trim(),
          name: name.trim() || undefined,
        });
        setUrl("");
        setName("");
        setGeneratedItem(item);
        onCreated?.(item);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to create QR code."
        );
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
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
        <div className="flex-1">
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Friendly Name (optional)
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="Spring campaign"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Generating..." : "Create QR"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {generatedItem ? (
        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-4 shadow-[0_15px_40px_-30px_rgba(0,0,0,0.45)] md:p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div className="flex items-center justify-center rounded-2xl bg-black/5 p-4">
              <img
                src={qrImageSrc}
                alt={`QR code for ${shortLink}`}
                className="h-56 w-56 rounded-2xl bg-white p-3"
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                  Short Link
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-black/5 px-3 py-3">
                  <a
                    href={shortLink}
                    className="flex-1 truncate text-sm font-semibold text-black"
                  >
                    {shortLink}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shortLink)}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:-translate-y-0.5"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M6 3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1a1 1 0 1 1 0-2h1V3H8v1a1 1 0 0 1-2 0V3z" />
                      <path d="M4 7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm2 0v10h6V7H6z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
                {copied ? (
                  <p className="mt-2 text-xs font-semibold text-black">
                    Copied!
                  </p>
                ) : null}
                {copyError ? (
                  <p className="mt-2 text-xs text-red-600">{copyError}</p>
                ) : null}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                  Destination URL
                </p>
                <p className="mt-2 break-all text-sm text-black/70">
                  {generatedItem.originalUrl}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
