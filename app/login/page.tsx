import Link from "next/link";

import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f9f3e7,_#f5efe9,_#f2f0ee)] px-6 py-10 text-black">
      <div className="mx-auto max-w-lg rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
        <h1 className="text-3xl font-semibold text-black">Sign in</h1>
        <p className="mt-2 text-sm text-black/60">
          Use the demo credentials you configured in your environment variables.
        </p>
        <LoginForm />
        <p className="mt-4 text-sm text-black/60">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-black">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
