"use client";

import { useEffect, useState, useTransition } from "react";
import { createContactQR } from "@/app/actions/contactActions";

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

type ContactQRGeneratorProps = {
  userId: string;
  onCreated?: (item: ContactQRItem) => void;
};

export default function ContactQRGenerator({
  userId,
  onCreated,
}: ContactQRGeneratorProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    website: "",
  });

  const [generatedItem, setGeneratedItem] = useState<ContactQRItem | null>(
    null
  );
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
      ? `${origin}/c/${generatedItem.shortCode}`
      : `/c/${generatedItem.shortCode}`
    : "";

  const qrImageSrc = shortLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
        shortLink
      )}`
    : "";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    startTransition(async () => {
      try {
        const item = await createContactQR({
          userId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          organization: formData.organization.trim() || undefined,
          website: formData.website.trim() || undefined,
        });
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          organization: "",
          website: "",
        });
        setGeneratedItem(item);
        onCreated?.(item);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to create contact QR code."
        );
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur"
    >
      <h2 className="mb-6 text-xl font-semibold text-black">
        Create Contact QR Code
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            First Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="John"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Last Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Email
          </label>
          <input
            type="email"
            name="email"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Organization
          </label>
          <input
            type="text"
            name="organization"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="UAB"
            value={formData.organization}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Website
          </label>
          <input
            type="url"
            name="website"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
            placeholder="https://example.com"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Generating..." : "Create Contact QR"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {generatedItem ? (
        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-4 shadow-[0_15px_40px_-30px_rgba(0,0,0,0.45)] md:p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div className="flex items-center justify-center rounded-2xl bg-black/5 p-4">
              <img
                src={qrImageSrc}
                alt={`QR code for ${generatedItem.firstName} ${generatedItem.lastName}`}
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
                  Contact Information
                </p>
                <div className="mt-2 space-y-1 text-sm text-black/70">
                  <p className="font-semibold">
                    {generatedItem.firstName} {generatedItem.lastName}
                  </p>
                  {generatedItem.email && (
                    <p>{generatedItem.email}</p>
                  )}
                  {generatedItem.phone && (
                    <p>{generatedItem.phone}</p>
                  )}
                  {generatedItem.organization && (
                    <p>{generatedItem.organization}</p>
                  )}
                  {generatedItem.website && (
                    <p>{generatedItem.website}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
