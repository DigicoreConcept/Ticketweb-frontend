"use client";

import { List } from "lucide-react";

export default function WaitlistsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Waitlists</h1>
      </div>

      <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <List className="w-8 h-8 text-neutral-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-neutral-400 max-w-sm mx-auto">
          Waitlist functionality is currently under development. Check back later!
        </p>
      </div>
    </div>
  );
}
