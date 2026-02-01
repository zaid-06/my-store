"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getMe } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState<any>(null);

  async function handleSignin() {
    const res = await signIn(email, password);
    setOutput(res);
  }

  async function handleMe() {
    const res = await getMe();
    setOutput(res);
  }

  return (
    <main className="p-8 space-y-6">
      {/* ✅ Back to Home button */}
      <button
        onClick={() => router.push("/")}
        className="text-sm text-blue-600 underline"
      >
        ← Back to Home
      </button>

      <div className="max-w-md space-y-4 p-4 border rounded">
        <h1 className="text-2xl font-bold">Sign In</h1>

        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignin}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Sign In
        </button>

        <pre className="text-sm bg-black text-green-400 p-2 overflow-auto">
          {JSON.stringify(output, null, 2)}
        </pre>
      </div>
    </main>
  );
}
