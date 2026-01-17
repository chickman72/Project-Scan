"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

import { registerUser } from "@/app/actions/authActions";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        await registerUser({ email, password });
        const result = await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
          redirect: false,
        });
        if (result?.ok) {
          window.location.href = "/dashboard";
        }
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to create account."
        );
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
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-black/50">
          Confirm password
        </label>
        <input
          type="password"
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition focus:border-black"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
