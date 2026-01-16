import type { ReactNode } from "react";

type NavbarProps = {
  userEmail?: string | null;
  actionSlot?: ReactNode;
};

export default function Navbar({ userEmail, actionSlot }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between gap-4 border-b border-black/10 bg-white/60 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-black text-white">
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
            Q
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-black/60">
            Project Scan
          </p>
          <p className="text-xl font-semibold text-black">QR Manager</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {userEmail ? (
          <span className="text-xs uppercase tracking-[0.2em] text-black/50">
            {userEmail}
          </span>
        ) : (
          <span className="text-sm text-black/60">Dashboard</span>
        )}
        {actionSlot}
      </div>
    </nav>
  );
}
