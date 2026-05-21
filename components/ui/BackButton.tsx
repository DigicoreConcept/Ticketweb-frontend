"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
  title?: string;
}

export default function BackButton({
  className = "",
  onClick,
  title = "Go back",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`p-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all text-white/80 hover:text-white cursor-pointer ${className}`}
      title={title}
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
  );
}
