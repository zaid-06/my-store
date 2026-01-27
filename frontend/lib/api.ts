const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Sign up with email & password
 */
export async function signUp(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE}/v1/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password, name }),
  });

  return res.json();
}

/**
 * Sign in with email & password
 */
export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_BASE}/v1/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

/**
 * Get current authenticated user
 */
export async function getMe() {
  const res = await fetch(`${API_BASE}/v1/api/users/me`, {
    credentials: "include",
  });

  return res.json();
}
