"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { LOGIN } from "@/graphql/mutations";
import { LoginInput } from "@/graphql/types";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { loading, error }] = useMutation(LOGIN);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginInput: LoginInput = {
        email: data.email,
        password: data.password,
      };

      const { data: result } = await login({
        variables: { loginInput },
      });

      if (result?.login?.token) {
        // Store token
        localStorage.setItem("gn_token", result.login.token);
        document.cookie = `gn_token=${encodeURIComponent(result.login.token)}; path=/; max-age=86400; samesite=lax`;
        
        // Redirect to home page
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b0b12]">
      {/* Background with subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b12] via-[#14141c] to-[#1a1a26]"></div>
      
      {/* Animated background elements with theme colors */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#27C3FF]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c7a14a]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8b6e3c]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#E6E8EB] mb-2">GlobeNomad</h1>
            <p className="text-[#9AA0A6]">Welcome back, explorer!</p>
          </div>

          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-[#0f0f17]/80 border border-[#2a2a35] rounded-2xl p-8 shadow-2xl">
            <h1 className="text-[#E6E8EB] text-2xl font-bold text-center mb-8">
              Login
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-[#0b0b12]/50 backdrop-blur-sm border border-[#2a2a35] rounded-lg text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:border-[#27C3FF] focus:bg-[#14141c]/50 transition-all"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 bg-[#0b0b12]/50 backdrop-blur-sm border border-[#2a2a35] rounded-lg text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:border-[#27C3FF] focus:bg-[#14141c]/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9AA0A6] hover:text-[#E6E8EB] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3">
                  {error.message}
                </div>
              )}

              {/* Login Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#27C3FF]/20 backdrop-blur-sm border border-[#27C3FF]/30 rounded-lg text-[#E6E8EB] hover:bg-[#27C3FF]/30 hover:border-[#27C3FF]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-[#9AA0A6] hover:text-[#27C3FF] transition-colors text-sm"
              >
                Forgot your password?
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-[#9AA0A6]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/register");
                  }}
                  className="text-[#27C3FF] hover:text-[#27C3FF]/80 underline font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
