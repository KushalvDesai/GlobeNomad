"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      token
      user {
        id
        email
        name
        firstName
        lastName
      }
    }
  }
`;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const { data } = await login({ variables: { email, password } });
      const token: string | undefined = data?.login?.token;
      if (!token) throw new Error("Invalid response from server");
      // Store token for subsequent requests
      try { localStorage.setItem("gn_token", token); } catch {}
      document.cookie = `gn_token=${encodeURIComponent(token)}; path=/; max-age=86400; samesite=lax`;
      // Force hard navigation to ensure middleware sees the cookie
      window.location.assign("/admin");
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b12] text-[#E6E8EB] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a35] bg-[#0f0f17] p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0b0b12] border border-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0b0b12] border border-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[#27C3FF] text-black font-medium hover:brightness-110 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}


