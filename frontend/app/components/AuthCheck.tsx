"use client";

import { useState } from "react";
import { signUp, signIn, getMe } from "@/lib/api";

export default function AuthCheck() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [output, setOutput] = useState<any>(null);

  async function handleSignup() {
    const res = await signUp(email, password, name);
    setOutput(res);
  }

  async function handleSignin() {
    const res = await signIn(email, password);
    setOutput(res);
  }

  async function handleMe() {
    const res = await getMe();
    setOutput(res);
  }

  return (
    <div className="max-w-md space-y-3 p-4 border rounded">
      <h2 className="text-xl font-semibold">Auth Check</h2>

      <input
        className="border p-2 w-full"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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
        onClick={handleSignup}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Sign Up
      </button>

      <button
        onClick={handleSignin}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Sign In
      </button>

      <button
        onClick={handleMe}
        className="w-full bg-gray-800 text-white py-2 rounded"
      >
        Get Me
      </button>

      <pre className="text-sm bg-black text-green-400 p-2 overflow-auto">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}
