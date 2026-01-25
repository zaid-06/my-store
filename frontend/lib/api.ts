const API_BASE = "http://localhost:5000/v1/api";

export async function signUp(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE}/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/users/me`, {
    credentials: "include",
  });
  return res.json();
}
