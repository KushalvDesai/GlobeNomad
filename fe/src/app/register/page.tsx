"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Camera } from "lucide-react";
import { CREATE_USER } from "@/graphql/mutations";
import { CreateUserDto } from "@/graphql/types";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [createUser, { loading, error }] = useMutation(CREATE_USER);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const createUserInput: CreateUserDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
      };

      const { data: result } = await createUser({
        variables: { createUserInput },
      });

      if (result?.createUser?.id) {
        // Registration successful, redirect to login
        router.push("/login?message=Registration successful! Please log in.");
      }
    } catch (err) {
      console.error("Registration error:", err);
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
            <p className="text-[#9AA0A6]">Start your journey with us!</p>
          </div>

          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-[#0f0f17]/80 border border-[#2a2a35] rounded-2xl p-8 shadow-2xl">
            <h1 className="text-[#E6E8EB] text-2xl font-bold text-center mb-8">
              Register
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-3 bg-[#0b0b12]/50 backdrop-blur-sm border border-[#2a2a35] rounded-lg text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:border-[#27C3FF] focus:bg-[#14141c]/50 transition-all"
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-3 bg-[#0b0b12]/50 backdrop-blur-sm border border-[#2a2a35] rounded-lg text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:border-[#27C3FF] focus:bg-[#14141c]/50 transition-all"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Full Name Field */}
              <div>
                <input
                  {...register("name", {
                    required: "Display name is required",
                  })}
                  type="text"
                  placeholder="Display Name"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

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
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone and Location Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("phoneNumber")}
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                  />
                </div>
                <div>
                  <input
                    {...register("city")}
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                  />
                </div>
              </div>

              {/* Country Field */}
              <div>
                <input
                  {...register("country")}
                  type="text"
                  placeholder="Country"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                />
              </div>

              {/* Password Fields */}
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

              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3">
                  {error.message}
                </div>
              )}

              {/* Register Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Creating Account..." : "Register User"}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-white/60">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/login");
                  }}
                  className="text-white hover:text-white/80 underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
