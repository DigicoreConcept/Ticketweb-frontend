"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type TicketKind = "virtual" | "physical";

export type TicketData = {
  kind: TicketKind;
  event_name: string;
  poster_image_url: string | null;
  event_date_display: string;
  event_time_display: string;       // event start time
  doors_open_display?: string | null; // physical only — e.g. "Doors: 7:00 PM"

  // virtual-only
  platform_name?: string | null;
  join_url?: string | null;

  // physical-only
  venue_name?: string | null;
  venue_address?: string | null;
  map_url?: string | null;          // screen-only "Get Directions" link
  gate?: string | null;
  section?: string | null;
  row?: string | null;
  seat?: string | null;

  ticket_type: string;
  is_group_ticket: boolean;
  group_seat_count: number | null;
  group_label: string | null;
  ticket_index: number;
  ticket_count: number;
  attendee_name: string;
  order_id: string;
  qr_payload: string;
};

/**
 * Gates print-button visibility on viewport width, as a proxy for form factor.
 * This is NOT print-capability detection (no such API exists reliably) — it's
 * "hide the button on phones, since gate entry accepts a QR on-screen anyway."
 * Default false avoids a flash of the button on mobile before the effect runs;
 * the tradeoff is the button also briefly doesn't appear on desktop until
 * measured (unavoidable — window is undefined during SSR).
 */
function useCanPrint(breakpointPx = 768): boolean {
  const [canPrint, setCanPrint] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const update = () => setCanPrint(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);

  return canPrint;
}

function hasSeatInfo(t: TicketData) {
  return Boolean(t.gate || t.section || t.row || t.seat);
}

export default function TicketCard({ ticket }: { ticket: TicketData }) {
  const canPrint = useCanPrint();

  return (
    <div className="page-wrap">
      <div className="actions no-print">
        {canPrint && (
          <button className="print-btn" onClick={() => window.print()}>
            Print Ticket
          </button>
        )}
      </div>

      <div className="ticket-card">
        <div className="poster-wrap">
          {ticket.poster_image_url ? (
            <img src={ticket.poster_image_url} alt={ticket.event_name} />
          ) : (
            <div className="poster-fallback">{ticket.event_name}</div>
          )}
          <div className={`kind-badge ${ticket.kind}`}>
            {ticket.kind === "virtual" ? "Virtual Event" : "In-Person"}
          </div>
        </div>

        <div className="datetime-pill">
          <span>{ticket.event_date_display}</span>
          <span className="divider">•</span>
          <span>
            {ticket.kind === "physical" && ticket.doors_open_display
              ? `Doors ${ticket.doors_open_display} · Starts ${ticket.event_time_display}`
              : ticket.event_time_display}
          </span>
        </div>

        <div className="body">
          <div className="event-name">{ticket.event_name}</div>

          {ticket.kind === "virtual" ? (
            <div className="meta-line">
              {ticket.platform_name ? (
                <>
                  Hosted on <span className="accent">{ticket.platform_name}</span>
                </>
              ) : (
                "Access link will be confirmed before the event"
              )}
            </div>
          ) : (
            <>
              {ticket.venue_name && <div className="meta-line accent">{ticket.venue_name}</div>}
              {ticket.venue_address && (
                <div className="meta-line">{ticket.venue_address}</div>
              )}
              {ticket.map_url && (
                <a className="map-link no-print" href={ticket.map_url} target="_blank" rel="noopener noreferrer">
                  Get Directions
                </a>
              )}
            </>
          )}

          <div className="divider-line" />

          {ticket.is_group_ticket && (
            <div className="group-banner">
              <div className="title">
                Group Ticket{ticket.group_label ? ` · ${ticket.group_label}` : ""}
              </div>
              <div className="desc">
                This single ticket covers {ticket.group_seat_count} attendee
                {ticket.group_seat_count !== 1 ? "s" : ""}. One entry admits the whole
                group — no need to check in separately.
              </div>
            </div>
          )}

          {ticket.kind === "physical" && hasSeatInfo(ticket) && (
            <div className="seat-row">
              {ticket.gate && <SeatChip label="Gate" value={ticket.gate} />}
              {ticket.section && <SeatChip label="Section" value={ticket.section} />}
              {ticket.row && <SeatChip label="Row" value={ticket.row} />}
              {ticket.seat && <SeatChip label="Seat" value={ticket.seat} />}
            </div>
          )}

          <div className="qr-wrap">
            <div className="qr-box">
              <QRCodeSVG value={ticket.qr_payload} size={168} />
            </div>
          </div>
          <div className="join-note">
            {ticket.kind === "virtual"
              ? "Scan to verify and join, or use the button below"
              : "Present this QR code at entry"}
          </div>

          {ticket.kind === "virtual" && ticket.join_url && (
            <a className="join-button no-print" href={ticket.join_url} target="_blank" rel="noopener noreferrer">
              Join Event
            </a>
          )}

          <div className="ticket-type-row">
            <span className="type">{ticket.ticket_type}</span>
            {!ticket.is_group_ticket && (
              <>
                &nbsp;·&nbsp;Ticket {ticket.ticket_index} of {ticket.ticket_count}
              </>
            )}
          </div>
          <div className="attendee-row">{ticket.attendee_name}</div>

          <div className="footer">
            <span>Order #{ticket.order_id}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background: #0a0a0a;
          margin: 0;
        }
        .page-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 16px;
          font-family: "Inter", -apple-system, sans-serif;
        }
        .actions {
          width: 400px;
          min-height: 44px; /* reserve space so layout doesn't jump when button mounts */
          margin-bottom: 16px;
        }
        .print-btn {
          width: 100%;
          background: #fb2d00;
          color: #0a0a0a;
          font-weight: 800;
          font-size: 14px;
          padding: 12px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        .ticket-card {
          width: 400px;
          background: #0a0a0a;
          border: 1px solid #262626;
          border-radius: 20px;
          overflow: hidden;
          color: #ededed;
        }
        .poster-wrap {
          position: relative;
          width: 100%;
          height: 190px;
          background: #171717;
          overflow: hidden;
        }
        .poster-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .poster-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #171717 0%, #262626 100%);
          color: #fb2d00;
          font-size: 22px;
          font-weight: 800;
          text-align: center;
          padding: 0 24px;
        }
        .kind-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          color: #ededed;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 5px 10px;
          border-radius: 999px;
        }
        .kind-badge.virtual {
          background: #713aed;
        }
        .kind-badge.physical {
          background: #fb2d00;
          color: #0a0a0a;
        }
        .datetime-pill {
          position: relative;
          margin: -18px auto 0;
          width: fit-content;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 999px;
          padding: 8px 18px;
          display: flex;
          gap: 14px;
          font-size: 13px;
          font-weight: 600;
        }
        .divider {
          color: #262626;
        }
        .body {
          padding: 24px 22px 20px;
        }
        .event-name {
          font-size: 21px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .meta-line {
          font-size: 13.5px;
          color: #a3a3a3;
          margin-bottom: 3px;
        }
        .accent {
          color: #fb2d00;
          font-weight: 600;
        }
        .map-link {
          display: inline-block;
          font-size: 12.5px;
          color: #713aed;
          font-weight: 600;
          margin-top: 4px;
          text-decoration: none;
        }
        .divider-line {
          height: 1px;
          background: #262626;
          margin: 18px 0;
        }
        .group-banner {
          background: #262626;
          border: 1px solid #713aed;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 18px;
        }
        .group-banner .title {
          font-size: 12.5px;
          font-weight: 700;
          color: #713aed;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .group-banner .desc {
          font-size: 12.5px;
          color: #d4d4d4;
          line-height: 1.4;
        }
        .seat-row {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .seat-chip {
          background: #171717;
          border: 1px solid #262626;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 11.5px;
        }
        .seat-chip .label {
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-right: 4px;
        }
        .seat-chip .value {
          color: #ededed;
          font-weight: 700;
        }
        .qr-wrap {
          display: flex;
          justify-content: center;
          margin: 6px 0 14px;
        }
        .qr-box {
          background: #ffffff;
          padding: 14px;
          border-radius: 12px;
        }
        .join-note {
          text-align: center;
          font-size: 11.5px;
          color: #737373;
          margin-bottom: 18px;
        }
        .join-button {
          display: block;
          text-align: center;
          background: #fb2d00;
          color: #0a0a0a;
          font-weight: 800;
          font-size: 14px;
          padding: 13px;
          border-radius: 10px;
          text-decoration: none;
          margin-bottom: 16px;
        }
        .ticket-type-row {
          text-align: center;
          font-size: 13px;
          color: #a3a3a3;
          margin-bottom: 4px;
        }
        .ticket-type-row .type {
          color: #ededed;
          font-weight: 700;
        }
        .attendee-row {
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .footer {
          display: flex;
          justify-content: center;
          font-size: 10.5px;
          color: #525252;
          border-top: 1px dashed #262626;
          padding-top: 12px;
        }

        @media print {
          @page {
            size: auto;
            margin: 0.25in;
          }
          body {
            background: #ffffff;
          }
          .no-print {
            display: none !important;
          }
          .page-wrap {
            padding: 0;
          }
          .ticket-card {
            border: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function SeatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="seat-chip">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}
