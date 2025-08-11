"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useMutation } from "@apollo/client";
import { FORGOT_PASSWORD } from "@/graphql/mutations";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: () => {
      setIsSubmitted(true);
      setError("");
    },
    onError: (error) => {
      console.error("Forgot password error:", error);
      setError(error.message || "Failed to send reset email. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await forgotPassword({
        variables: { email: email.trim() },
      });
    } catch (err) {
      // Error handled by onError callback
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button 
              onClick={() => router.push("/login")}
              className="text-white text-2xl font-semibold hover:opacity-90"
            >
              GlobeNomad
            </button>
          </div>

          <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Check Your Email
            </h1>
            
            <p className="text-[#9AA0A6] mb-6">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>. 
              Please check your email and follow the instructions to reset your password.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-[#27C3FF] text-white py-3 rounded-md hover:bg-[#20A8D8] transition-colors"
              >
                Try Different Email
              </button>
              
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-transparent border border-[#2a2a35] text-[#9AA0A6] py-3 rounded-md hover:bg-[#14141c] transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button 
            onClick={() => router.push("/login")}
            className="text-white text-2xl font-semibold hover:opacity-90"
          >
            GlobeNomad
          </button>
        </div>

        <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push("/login")}
              className="p-2 rounded-md hover:bg-[#14141c] text-[#9AA0A6]"
              aria-label="Back to login"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          </div>

          <p className="text-[#9AA0A6] mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9AA0A6] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA0A6]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0b12] border border-[#2a2a35] rounded-md text-white placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#27C3FF] text-white py-3 rounded-md hover:bg-[#20A8D8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/login")}
              className="text-[#9AA0A6] hover:text-white transition-colors"
            >
              Remember your password? <span className="text-[#27C3FF]">Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
