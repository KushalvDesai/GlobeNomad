"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { Eye, EyeOff } from "lucide-react";
import { LOGIN } from "@/graphql/mutations";
import { LoginInput, LoginResponse } from "@/graphql/types";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);
  const router = useRouter();

  const [loginMutation, { loading }] = useMutation<{ login: LoginResponse }>(LOGIN, {
    onCompleted: (data) => {
      // Store token and user info in localStorage
      localStorage.setItem('token', data.login.token);
      localStorage.setItem('user', JSON.stringify(data.login.user));
      
      // Redirect to dashboard or home page
      router.push("/");
    },
    onError: (error) => {
      setError({ message: error.message });
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    
    try {
      await loginMutation({
        variables: {
          loginInput: {
            email: data.email,
            password: data.password
          }
        }
      });
    } catch (err) {
      // Error is handled by onError callback
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
        {/* Floating orbs for visual interest */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Login Form Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-white text-2xl font-bold text-center mb-8">
              Login
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Email Field */}
              <div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email"
                    }
                  })}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
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
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  type={showPassword ? "text" : "password"}
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
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-white/60">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Navigating to register page...");
                    router.push("/register");
                  }}
                  className="text-white hover:text-white/80 underline font-medium"
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
