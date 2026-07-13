"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEventBuilderStore } from "@/lib/store/eventBuilderStore";
import { getEventById } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Import the step components
import StepBasics from "../../create/_components/StepBasics";
import StepTicketing from "../../create/_components/StepTicketing";
import StepQuestions from "../../create/_components/StepQuestions";
import StepMedia from "../../create/_components/StepMedia";
import StepPreview from "../../create/_components/StepPreview";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const { step, loadEventData, reset } = useEventBuilderStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load event details into standard builder store on mount
  useEffect(() => {
    async function fetchAndLoadEvent() {
      try {
        if (!params.id) return;
        const eventId = params.id as string;
        
        // Ensure we are starting completely fresh
        reset();

        const data = await getEventById(eventId);
        console.log(data)
        loadEventData(data);
      } catch (err: any) {
        console.error("Failed to fetch event:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAndLoadEvent();
    
    // Optional cleanup on unmount
    return () => {
       reset();
    };
  }, [params.id, loadEventData, reset]);

  const steps = [
    { number: 1, label: "Basics" },
    { number: 2, label: "Ticketing" },
    { number: 3, label: "Questions" },
    { number: 4, label: "Media" },
    { number: 5, label: "Preview" },
  ];

  if (loading || authLoading) {
    return (
      <div className="flex flex-col h-full min-h-[500px] items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-white/40 text-sm font-medium tracking-wide animate-pulse">Loading Event Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/dashboard/events">
          <button className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 container mx-auto sm:px-4 pt-4 pb-12 w-full">
        {/* Header & Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => {
                reset();
                router.push("/dashboard/events");
            }} 
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Event</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 w-full px-2 md:px-6">
          {steps.map((s, i) => (
            <div key={s.number} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                  style={
                    step >= s.number
                      ? {
                          backgroundColor: "var(--primary)",
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  {step > s.number ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  className="text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap hidden sm:block"
                  style={{
                    color:
                      step === s.number
                        ? "var(--primary)"
                        : step > s.number
                          ? "var(--secondary)"
                          : "rgba(255,255,255,0.3)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="h-px flex-1 mx-2 sm:mx-4 mb-5 sm:mb-6"
                  style={{
                    backgroundColor:
                      step > s.number
                        ? "var(--secondary)"
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && <StepBasics />}
          {step === 2 && <StepTicketing />}
          {step === 3 && <StepQuestions />}
          {step === 4 && <StepMedia />}
          {step === 5 && <StepPreview />}
        </div>
      </div>
    </div>
  );
}
