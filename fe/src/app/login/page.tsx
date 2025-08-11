"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LOGIN_USER } from "@/graphql/user/mutations";
import { LoginInput } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import { GuestGuard } from "@/components/GuestGuard";
import { GlobeWrapper } from "@/components/GlobeWrapper";
import { GlobeConfig } from "@/components/Globe";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const sampleArcs = [
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -15.595412, endLng: -56.097659, arcAlt: 0.1, color: "#ffffff" },
  { order: 1, startLat: 28.638, startLng: 77.2479, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: "#ffffff" },
  { order: 1, startLat: -33.8688, startLng: 151.2093, endLat: 0.3476, endLng: 32.5825, arcAlt: 0.5, color: "#ffffff" },
  { order: 2, startLat: 19.4326, startLng: -99.1332, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.2, color: "#ffffff" },
  { order: 2, startLat: 40.7128, startLng: -74.006, endLat: 34.6937, endLng: 135.5022, arcAlt: 0.3, color: "#ffffff" },
  { order: 2, startLat: 41.8781, startLng: -87.6298, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.3, color: "#ffffff" },
  { order: 3, startLat: -15.785493, startLng: -47.909029, endLat: 36.162809, endLng: -115.119411, arcAlt: 0.3, color: "#ffffff" },
  { order: 3, startLat: 11.986597, startLng: 8.571831, endLat: -15.595412, endLng: -56.097659, arcAlt: 0.5, color: "#ffffff" },
  { order: 3, startLat: -22.908333, startLng: -43.196388, endLat: -34.9011, endLng: -56.1645, arcAlt: 0.7, color: "#ffffff" },
  { order: 4, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcAlt: 0.3, color: "#ffffff" },
  { order: 4, startLat: 21.395643, startLng: 39.883798, endLat: -1.292066, endLng: 36.821946, arcAlt: 0.5, color: "#ffffff" },
  { order: 5, startLat: -15.432563, startLng: 28.315853, endLat: 1.094136, endLng: -63.34546, arcAlt: 0.7, color: "#ffffff" },
  { order: 5, startLat: 14.599512, startLng: 120.984219, endLat: -25.363, endLng: 131.044, arcAlt: 0.2, color: "#ffffff" },
  { order: 5, startLat: 12.972442, startLng: 77.580643, endLat: 28.033886, endLng: 1.659626, arcAlt: 0.2, color: "#ffffff" },
  { order: 6, startLat: -4.038333, startLng: 21.758664, endLat: -8.543125, endLng: 179.21311, arcAlt: 0.1, color: "#ffffff" },
  { order: 6, startLat: 43.777669, startLng: 11.968054, endLat: 37.090774, endLng: -95.712891, arcAlt: 0.2, color: "#ffffff" },
  { order: 7, startLat: 30.3753, startLng: 69.3451, endLat: 52.2297, endLng: 21.0122, arcAlt: 0.2, color: "#ffffff" },
  { order: 7, startLat: 41.161758, startLng: -8.583933, endLat: 40.741895, endLng: -73.989308, arcAlt: 0.2, color: "#ffffff" },
  { order: 7, startLat: -6.792354, startLng: 39.208328, endLat: -6.716, endLng: 129.695, arcAlt: 0.1, color: "#ffffff" },
  { order: 8, startLat: 23.424076, startLng: 53.847818, endLat: 33.93911, endLng: 67.709953, arcAlt: 0.2, color: "#ffffff" },
  { order: 8, startLat: 19.077524, startLng: 72.97581, endLat: 35.67972, endLng: 139.6917, arcAlt: 0.2, color: "#ffffff" },
  { order: 8, startLat: 22.906847, startLng: 40.388783, endLat: 39.913818, endLng: 116.363625, arcAlt: 0.2, color: "#ffffff" },
  { order: 9, startLat: -27.105456, startLng: -109.285004, endLat: -9.665, endLng: 105.2394, arcAlt: 0.1, color: "#ffffff" },
  { order: 9, startLat: 26.244156, startLng: 92.537842, endLat: 38.13, endLng: -85.32, arcAlt: 0.2, color: "#ffffff" },
  { order: 9, startLat: -8.349844, startLng: 26.266667, endLat: 3.2028, endLng: 73.2207, arcAlt: 0.2, color: "#ffffff" },
  { order: 10, startLat: 1.094136, startLng: -63.34546, endLat: 46.227638, endLng: 2.213749, arcAlt: 0.2, color: "#ffffff" },
  { order: 10, startLat: 2.972442, startLng: 77.580643, endLat: -11.202692, endLng: 17.873887, arcAlt: 0.2, color: "#ffffff" },
];

const globeConfig: GlobeConfig = {
  pointSize: 4,
  globeColor: "#4B5563",               // Neutral slate gray - works with light & dark
  showAtmosphere: true,
  atmosphereColor: "#E5E7EB",          // Soft warm gray glow instead of stark white
  atmosphereAltitude: 0.08,            // Slightly lower for subtlety
  emissive: "#4B5563",                  // Same as globe for cohesion
  emissiveIntensity: 0.08,              // Low intensity to avoid overpowering
  shininess: 0.6,                       // Slightly reduced for softer highlights
  polygonColor: "rgba(255, 255, 255, 0.3)", // Very subtle polygons
  ambientLight: "#CBD5E1",              // Soft desaturated light
  directionalLeftLight: "#F3F4F6",      // Light gray for gentle highlights
  directionalTopLight: "#F3F4F6",       // Same to keep consistent lighting
  pointLight: "#F3F4F6",                // Matches highlight tone
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginUser({
        variables: {
          loginInput: data as LoginInput,
        },
      });

      if (result.data?.loginUser?.token) {
        login(result.data.loginUser.token);
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <GuestGuard>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Globe Background */}
        <div className="absolute inset-0 z-0">
          <GlobeWrapper globeConfig={globeConfig} data={sampleArcs} />
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
                    {...register("email")}
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
                    {...register("password")}
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
                    onClick={() => router.push("/register")}
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
    </GuestGuard>
  );
}
