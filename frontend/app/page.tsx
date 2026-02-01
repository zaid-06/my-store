// "use client";

// import { useState } from "react";
// import AuthCheck from "./components/AuthCheck";

// export default function Home() {
//   const [showAuth, setShowAuth] = useState(false);

//   if (showAuth) {
//     return (
//       <main className="p-8 space-y-6">
//         <button
//           onClick={() => setShowAuth(false)}
//           className="text-sm text-blue-600 underline"
//         >
//           ← Back to Home
//         </button>

//         <h1 className="text-3xl font-bold">Auth Check</h1>
//         <AuthCheck />
//       </main>
//     );
//   }

//   return (
//     <main className="p-8 space-y-6">
//       <h1 className="text-3xl font-bold">My Store</h1>

//       <button
//         onClick={() => setShowAuth(true)}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//       >
//         Go to Auth Check
//       </button>

//     </main>
//   );
// }

"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">My Store</h1>

      <div className="space-x-4">
        <button
          onClick={() => router.push("/signin")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Sign In
        </button>

        <button
          onClick={() => router.push("/signup")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </div>
    </main>
  );
}
