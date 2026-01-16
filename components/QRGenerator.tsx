"use client";

import { useState, useTransition } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    </form>
  );
}
