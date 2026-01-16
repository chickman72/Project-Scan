import Link from "next/link";

import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f9f3e7,_#f5efe9,_#f2f0ee)] px-6 py-10 text-black">
      <div className="mx-auto max-w-lg rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
        <h1 className="text-3xl font-semibold text-black">Create account</h1>
        <p className="mt-2 text-sm text-black/60">
          Start saving and tracking your QR codes.
        </p>
        <RegisterForm />
        <p className="mt-4 text-sm text-black/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-black">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
