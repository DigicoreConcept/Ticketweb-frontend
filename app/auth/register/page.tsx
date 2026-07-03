"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Ticket, Zap, Users, TrendingUp, CheckCircle2 } from "lucide-react";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const STEPS = [
  "Create your free account",
  "Set up your first event",
  "Start selling tickets",
];

function RegisterForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialRole = searchParams.get("tab") === "organizer" ? "ORGANIZER" : "ATTENDEE";
  const [role, setRole] = useState<"ATTENDEE" | "ORGANIZER">(initialRole);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "ORGANIZER" || tab === "ATTENDEE") {
      setRole(tab);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: role,
      });
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
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
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Three steps to<br />
              your first <span className="text-primary">sell-out.</span>
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-sm">
              Join organizers who are growing their audience and selling
              tickets — all without the complexity.
            </p>
          </div>

          {/* Step list */}
          <ol className="space-y-5 relative">
            {/* Vertical connector line */}
            <div className="absolute left-[15px] top-8 bottom-8 w-px bg-white/5" />

            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-4">
                <span className="relative z-10 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-black text-primary shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-neutral-300">{step}</span>
              </li>
            ))}
          </ol>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {["Free to start", "No credit card", "Cancel anytime"].map(
              (badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-neutral-400"
                >
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  {badge}
                </span>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-neutral-600">
          © {new Date().getFullYear()} Ticketweb. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            Ticket<span className="text-primary">web</span>
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Role Selector Tabs */}
          <div className="flex p-1 bg-white/5 rounded-xl mb-8 border border-white/10">
            <button
              type="button"
              onClick={() => setRole("ATTENDEE")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === "ATTENDEE" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Attendee
            </button>
            <button
              type="button"
              onClick={() => setRole("ORGANIZER")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === "ORGANIZER" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Organizer
            </button>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Create {role === "ORGANIZER" ? "Organizer" : "Attendee"} Account
            </h1>
            <p className="text-neutral-400 text-sm">
              Already have one?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Full Name
              </label>
              <input
                {...register("full_name")}
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,45,0,0.1)] ${
                  errors.full_name ? "border-red-500/50" : "border-white/10"
                }`}
              />
              {errors.full_name && (
                <p className="text-red-400 text-xs">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,45,0,0.1)] ${
                  errors.email ? "border-red-500/50" : "border-white/10"
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
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
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-neutral-600 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,45,0,0.1)] ${
                    errors.password ? "border-red-500/50" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-neutral-600 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,45,0,0.1)] ${
                    errors.confirmPassword ? "border-red-500/50" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
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
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-neutral-600">free forever</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <p className="text-center text-xs text-neutral-600">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}