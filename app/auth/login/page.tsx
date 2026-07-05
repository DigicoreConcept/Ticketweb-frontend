"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Ticket, Zap, Users, TrendingUp } from "lucide-react";

import { toast } from "@/lib/store/toastStore";

const loginSchema = z.object({
  username: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const PERKS = [
  { icon: Zap, text: "Create events in under 5 minutes" },
  { icon: Ticket, text: "QR-coded tickets delivered instantly" },
  { icon: TrendingUp, text: "Real-time sales & analytics dashboard" },
  { icon: Users, text: "Manage attendees with ease" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    try {
      const response = await api.post("/auth/login/access-token", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const loggedInUser = await login(response.data.access_token);

      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get("_r");

      if (redirectPath && redirectPath.startsWith("/")) {
        if (loggedInUser.role === "ATTENDEE" && redirectPath.startsWith("/dashboard")) {
          toast.error("You do not have permission to access the Organizer Dashboard");
          router.push("/attendee/dashboard");
        } else {
          router.push(redirectPath);
        }
      } else {
        if (loggedInUser.role === "SUPER_ADMIN" || loggedInUser.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (loggedInUser.role === "ATTENDEE") {
          router.push("/attendee/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-[#0D0D0D] border-r border-white/5">
        {/* Background glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Logo */}
        <a href="/">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(251,45,0,0.4)]">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Ticket<span className="text-primary">web</span>
            </span>
          </div>
        </a>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Your events.<br />
              Your <span className="text-primary">audience.</span>
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-sm">
              The fastest way to create, sell, and manage event tickets.
              Built for organizers who mean business.
            </p>
          </div>

          <ul className="space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-neutral-300">
                <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-neutral-600">
          © {new Date().getFullYear()} Ticketweb. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <a href="/">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Ticket<span className="text-primary">web</span>
            </span>
          </div>
        </a>

        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-neutral-400 text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-primary font-semibold hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Email
              </label>
              <input
                {...register("username")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                defaultValue={'xamewec643@nriza.com'}
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,45,0,0.1)] ${
                  errors.username ? "border-red-500/50" : "border-white/10"
                }`}
              />
              {errors.username && (
                <p className="text-red-400 text-xs">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  defaultValue={'Password@123'}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-neutral-600 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,45,0,0.1)] ${
                    errors.password ? "border-red-500/50" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm shadow-[0_0_25px_rgba(251,45,0,0.25)] hover:shadow-[0_0_35px_rgba(251,45,0,0.4)] transition-all mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-neutral-600">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <p className="text-center text-xs text-neutral-600">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}