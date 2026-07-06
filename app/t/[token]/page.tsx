"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TicketCard, { TicketData } from "@/components/ui/TicketCard";
import { api } from "@/lib/api";

export default function TicketViewPage() {
  const params = useParams();
  const token = params.token as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "invalid">("loading");

  useEffect(() => {
    if (!token) return;
    api.get(`/public/tickets/${token}`)
      .then((res) => {
        setTicket(res.data);
        setStatus("ok");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  if (status === "loading") {
    return <CenteredMessage text="Loading your ticket..." />;
  }

  if (status === "invalid" || !ticket) {
    return (
      <CenteredMessage
        text="This ticket link is no longer valid."
        subtext="If you believe this is a mistake, contact the event organizer for a new link."
      />
    );
  }

  return <TicketCard ticket={ticket} />;
}

function CenteredMessage({ text, subtext }: { text: string; subtext?: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#ededed",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <p style={{ fontSize: 16, fontWeight: 600 }}>{text}</p>
      {subtext && <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 8 }}>{subtext}</p>}
    </div>
  );
}
