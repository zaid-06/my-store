// // "use client";

// // import { useState } from "react";
// // import { signUp, signIn, getMe } from "@/lib/api";

// // export default function AuthCheck() {
// //   const [output, setOutput] = useState<any>(null);

// //   async function handleSignup() {
// //     const res = await signUp(
// //       "mdzaid9149@gmail.com",
// //       "Password123!",
// //       "Test User",
// //     );
// //     setOutput(res);
// //   }

// //   async function handleSignin() {
// //     const res = await signIn("mdzaid9149@gmail.com", "Password123!");
// //     setOutput(res);
// //   }

// //   async function handleMe() {
// //     const res = await getMe();
// //     setOutput(res);
// //   }

// //   return (
// //     <main style={{ padding: 20 }}>
// //       <h1>Auth Flow Test</h1>

// //       <button
// //         onClick={handleSignup}
// //         className="w-36 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
// //       >
// //         Sign Up
// //       </button>
// //       <br />
// //       <br />

// //       <button
// //         onClick={handleSignin}
// //         className="w-36 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
// //       >
// //         Sign In
// //       </button>
// //       <br />
// //       <br />

// //       <button onClick={handleMe}>Get Current User</button>

// //       <pre>{JSON.stringify(output, null, 2)}</pre>
// //     </main>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { signUp, signIn, getMe } from "@/lib/api";

// export default function AuthCheck() {
//   const [mounted, setMounted] = useState(false);
//   const [output, setOutput] = useState<any>(null);

//   // ⬇️ ensures this renders ONLY on client
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return null; // ⛔ prevents hydration mismatch
//   }

//   async function handleSignup() {
//     const res = await signUp(
//       "mdzaid9149@gmail.com",
//       "Password123!",
//       "Test User",
//     );
//     setOutput(res);
//   }

//   async function handleSignin() {
//     const res = await signIn("mdzaid9149@gmail.com", "Password123!");
//     setOutput(res);
//   }

//   async function handleMe() {
//     const res = await getMe();
//     setOutput(res);
//   }

//   return (
//     <div className="mt-6 p-4 border rounded">
//       <h2 className="text-xl font-semibold mb-4">Auth Flow Test</h2>

//       <div className="flex gap-4 mb-4">
//         <button
//           onClick={handleSignup}
//           className="px-4 py-2 bg-blue-600 text-white rounded"
//         >
//           Sign Up
//         </button>

//         <button
//           onClick={handleSignin}
//           className="px-4 py-2 bg-green-600 text-white rounded"
//         >
//           Sign In
//         </button>

//         <button
//           onClick={handleMe}
//           className="px-4 py-2 bg-gray-700 text-white rounded"
//         >
//           Me
//         </button>
//       </div>

//       <pre className="bg-black text-green-400 p-3 text-sm rounded">
//         {JSON.stringify(output, null, 2)}
//       </pre>
//     </div>
//   );
// }

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
