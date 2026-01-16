import { getServerSession } from "next-auth";

import { getUserQRs } from "@/app/actions/qrActions";
import { authOptions } from "@/lib/auth";
import DashboardClient from "@/components/DashboardClient";
import AuthButtons from "@/components/AuthButtons";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userEmail = session?.user?.email ?? null;

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#f8f4ef] px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-black/10 bg-white/80 p-8">
          <h1 className="text-2xl font-semibold">Dashboard unavailable</h1>
          <p className="text-sm text-black/60">
            Sign in to load your QR codes.
          </p>
          <a
            href="/login"
            className="inline-flex rounded-full border border-black/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  const initialItems = await getUserQRs(userId);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f9f3e7,_#f5efe9,_#f2f0ee)] text-black">
      <Navbar userEmail={userEmail} actionSlot={<AuthButtons />} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <DashboardClient
          userId={userId}
          baseUrl={baseUrl}
          initialItems={initialItems}
        />
      </main>
    </div>
  );
}
