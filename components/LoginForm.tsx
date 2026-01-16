"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials.");
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex w-full flex-col gap-4"
    >
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-black/50">
          Email
        </label>
        <input
          type="email"
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-black/50">
          Password
        </label>
        <input
          type="password"
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
