import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import PublicQRGenerator from "@/components/PublicQRGenerator";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email ?? null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f9f3e7,_#f5efe9,_#f2f0ee)] text-black">
      <Navbar
        userEmail={userEmail}
        actionSlot={
          session ? (
            <Link
              href="/dashboard"
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5"
            >
              Log in
            </Link>
          )
        }
      />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-black/50">
            Free QR Generator
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-black">
            Generate a QR code in seconds. Save and track them when you log in.
          </h1>
          <p className="text-base text-black/60">
            Paste any destination URL to create a scannable QR instantly. Log
            in to save your codes, manage naming, and track scan counts.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5"
            >
              Log in to save
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-black/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5"
            >
              Create account
            </Link>
          </div>
        </div>
        <PublicQRGenerator />
      </main>
    </div>
  );
}
