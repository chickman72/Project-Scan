"use client";

import { useState, useTransition } from "react";
import { deleteContactQR } from "@/app/actions/contactActions";

type ContactQRItem = {
  id: string;
  userId: string;
  shortCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  organization: string | null;
  website: string | null;
  vcard: string;
  clickCount: number;
  createdAt: string;
};

type ContactQRCardProps = {
  item: ContactQRItem;
  origin: string;
  onDeleted?: (id: string) => void;
};

export default function ContactQRCard({
  item,
  origin,
  onDeleted,
}: ContactQRCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shortLink = `${origin}/c/${item.shortCode}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    shortLink
  )}`;

  const handleDelete = () => {
    if (
      !confirm(
        `Delete contact QR code for ${item.firstName} ${item.lastName}?`
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await deleteContactQR(item.id, item.userId);
        onDeleted?.(item.id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to delete QR code."
        );
      }
    });
  };

  const copyToClipboard = async (text: string) => {
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
      // Silently fail
    }
  };

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-4 shadow-[0_15px_40px_-30px_rgba(0,0,0,0.45)]">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-2xl bg-black/5 p-3">
          <img
            src={qrImageSrc}
            alt={`QR code for ${item.firstName} ${item.lastName}`}
            className="h-32 w-32 rounded-lg bg-white p-2"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-black">
            {item.firstName} {item.lastName}
          </h3>

          <div className="mt-2 space-y-1 text-xs text-black/60">
            {item.email && (
              <p>
                <span className="font-semibold">Email:</span> {item.email}
              </p>
            )}
            {item.phone && (
              <p>
                <span className="font-semibold">Phone:</span> {item.phone}
              </p>
            )}
            {item.organization && (
              <p>
                <span className="font-semibold">Org:</span>{" "}
                {item.organization}
              </p>
            )}
            {item.website && (
              <p>
                <span className="font-semibold">Website:</span>{" "}
                <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {item.website}
                </a>
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(shortLink)}
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:-translate-y-0.5"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={shortLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:-translate-y-0.5"
            >
              View
            </a>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="ml-auto rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <div className="mt-2 text-xs text-black/40">
            {item.clickCount} clicks
            {item.createdAt && (
              <>
                {" "}
                • {new Date(item.createdAt).toLocaleDateString()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
