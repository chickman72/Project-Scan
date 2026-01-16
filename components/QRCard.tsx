"use client";

import { useState, useTransition } from "react";

import { deleteQR, updateQR } from "@/app/actions/qrActions";

type QRItem = {
  id: string;
  userId: string;
  shortCode: string;
  originalUrl: string;
  name: string | null;
  clickCount: number;
  createdAt: string;
};

type QRCardProps = {
  item: QRItem;
  baseUrl: string;
  onDeleted?: (id: string) => void;
  onUpdated?: (id: string, name: string, url: string) => void;
};

export default function QRCard({
  item,
  baseUrl,
  onDeleted,
  onUpdated,
}: QRCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name ?? "");
  const [url, setUrl] = useState(item.originalUrl);
  const [isPending, startTransition] = useTransition();

  const trackingUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/t/${item.shortCode}`
    : `/t/${item.shortCode}`;

  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    trackingUrl
  )}`;

  const handleDelete = () => {
    startTransition(async () => {
      await deleteQR(item.id, item.userId);
      onDeleted?.(item.id);
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateQR(item.id, item.userId, name, url);
      onUpdated?.(item.id, name, url);
      setIsEditing(false);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">
            Short Code
          </p>
          <p className="text-lg font-semibold text-black">{item.shortCode}</p>
        </div>
        <div className="rounded-full border border-black/10 bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          {item.clickCount} Clicks
        </div>
      </div>
      <div className="flex items-center justify-center rounded-2xl bg-black/5 p-3">
        <img
          src={qrImageSrc}
          alt={`QR code for ${trackingUrl}`}
          className="h-40 w-40 rounded-xl bg-white p-2"
        />
      </div>
      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            <input
              className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Friendly name"
            />
            <input
              className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Destination URL"
            />
          </div>
        ) : (
          <p className="text-base font-medium text-black">
            {name || "Untitled QR"}
          </p>
        )}
        <p className="break-all text-sm text-black/60">{item.originalUrl}</p>
      </div>
      <div className="mt-auto flex items-center gap-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:-translate-y-0.5"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete
        </button>
        <a
          href={trackingUrl}
          className="ml-auto text-xs font-semibold uppercase tracking-[0.2em] text-black/60"
        >
          Open
        </a>
      </div>
    </div>
  );
}
