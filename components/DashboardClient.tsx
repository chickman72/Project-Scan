"use client";

import { useEffect, useState, useTransition } from "react";

import { getUserQRs } from "@/app/actions/qrActions";
import QRCard from "@/components/QRCard";
import QRGenerator from "@/components/QRGenerator";

type QRItem = {
  id: string;
  userId: string;
  shortCode: string;
  originalUrl: string;
  name: string | null;
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        const updated = await getUserQRs(userId);
        setItems(updated);
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [userId, startTransition]);

  const handleCreated = (item: QRItem) => {
    setItems((prev) => [item, ...prev]);
  };

  const handleDeleted = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdated = (id: string, name: string, url: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name, originalUrl: url } : item
      )
    );
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const updated = await getUserQRs(userId);
      setItems(updated);
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

      <QRGenerator userId={userId} onCreated={handleCreated} />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? (
          items.map((item) => (
            <QRCard
              key={item.id}
              item={item}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-8 text-center text-black/60">
            No QR codes yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
