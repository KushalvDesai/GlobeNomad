"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { LOGIN } from "@/graphql/mutations";
import { LoginInput } from "@/graphql/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const loginInput: LoginInput = { email, password };
      const { data } = await login({ variables: { loginInput } });
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">GlobeNomad</h1>
            <p className="text-white/60">Admin Portal</p>
          </div>

          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-white text-2xl font-bold text-center mb-8">
              Admin Login
            </h1>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3">
                  {errorMessage}
                </div>
              )}

              {/* Login Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Signing in..." : "Admin Sign In"}
                </button>
              </div>
            </form>

            {/* Back to User Login */}
            <div className="text-center mt-6">
              <p className="text-white/60">
                Not an admin?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/login");
                  }}
                  className="text-white hover:text-white/80 underline font-medium"
                >
                  User Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


