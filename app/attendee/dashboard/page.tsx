"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AttendeeDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/attendee/my-tickets");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}
