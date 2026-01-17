"use client";

import { signOut } from "next-auth/react";

type AuthButtonsProps = {
  userEmail?: string | null;
};

export default function AuthButtons({ userEmail }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      {userEmail ? (
        <span className="text-xs uppercase tracking-[0.2em] text-black/50">
          {userEmail}
        </span>
      ) : null}
      <button
        onClick={async () => {
          const result = await signOut({ callbackUrl: "/", redirect: false });
          if (result?.url) {
            window.location.href = "/";
          }
        }}
        className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:-translate-y-0.5"
      >
        Sign out
      </button>
    </div>
  );
}
