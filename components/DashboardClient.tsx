"use client";

import { useEffect, useState, useTransition } from "react";

import { getUserQRs } from "@/app/actions/qrActions";
import { getContactQRs } from "@/app/actions/contactActions";
import QRCard from "@/components/QRCard";
import QRGenerator from "@/components/QRGenerator";
import ContactQRGenerator from "@/components/ContactQRGenerator";
import ContactQRCard from "@/components/ContactQRCard";

type QRItem = {
  id: string;
  userId: string;
  shortCode: string;
  originalUrl: string;
  name: string | null;
  clickCount: number;
  createdAt: string;
};

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

type DashboardClientProps = {
  userId: string;
  initialItems: QRItem[];
};

export default function DashboardClient({
  userId,
  initialItems,
}: DashboardClientProps) {
  const [items, setItems] = useState<QRItem[]>(initialItems);
  const [contactItems, setContactItems] = useState<ContactQRItem[]>([]);
  const [origin, setOrigin] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showContactGenerator, setShowContactGenerator] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        const updated = await getUserQRs(userId);
        setItems(updated);
        const updatedContact = await getContactQRs(userId);
        setContactItems(updatedContact);
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [userId, startTransition]);

  useEffect(() => {
    startTransition(async () => {
      const initialContact = await getContactQRs(userId);
      setContactItems(initialContact);
    });
  }, [userId, startTransition]);

  const handleCreated = (item: QRItem) => {
    setItems((prev) => [item, ...prev]);
  };

  const handleContactCreated = (item: ContactQRItem) => {
    setContactItems((prev) => [item, ...prev]);
  };

  const handleDeleted = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleContactDeleted = (id: string) => {
    setContactItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdated = (
    id: string,
    name: string,
    url: string,
    createdAt: string,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name, originalUrl: url, createdAt } : item,
      ),
    );
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const updated = await getUserQRs(userId);
      setItems(updated);
      const updatedContact = await getContactQRs(userId);
      setContactItems(updatedContact);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Your QR Vault</h1>
          <p className="text-sm text-black/60">
            Generate, track, and organize every scan.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="rounded-full border border-black/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">URL QR Codes</h2>
          </div>
          <QRGenerator userId={userId} onCreated={handleCreated} />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">
              Contact QR Codes
            </h2>
            {!showContactGenerator && (
              <button
                onClick={() => setShowContactGenerator(true)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5"
              >
                + Create Contact QR
              </button>
            )}
          </div>
          {showContactGenerator && (
            <ContactQRGenerator
              userId={userId}
              onCreated={(item) => {
                handleContactCreated(item);
                setShowContactGenerator(false);
              }}
            />
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-black">
          Your QR Codes
        </h3>
        <div className="space-y-6">
          {contactItems.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-black/70">
                Contact Information ({contactItems.length})
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {contactItems.map((item) => (
                  <ContactQRCard
                    key={item.id}
                    item={item}
                    origin={origin}
                    onDeleted={handleContactDeleted}
                  />
                ))}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-black/70">
                URL Redirects ({items.length})
              </h4>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <QRCard
                    key={item.id}
                    item={item}
                    onDeleted={handleDeleted}
                    onUpdated={handleUpdated}
                  />
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && contactItems.length === 0 && (
            <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-8 text-center text-black/60">
              No QR codes yet. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
