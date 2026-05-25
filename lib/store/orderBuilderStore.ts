import { Event, TableTicketConfig, TicketType } from "../schema/eventTied";

function buildAttendeeSlots(
  event: Event,
  quantities: Record<string, number>,
  selectedSeats?: Record<string, string[]>,
) {
  const slots = [];

  for (const tier of event.ticket_tiers || []) {
    const qty = quantities[tier.id] || 0;
    if (!qty) continue;

    if (tier.type === TicketType.TABLE) {
      const config = tier.config as TableTicketConfig;
      const seats = config?.seats_per_table || 1;

      for (let t = 0; t < qty; t++) {
        const table_id = `${tier.id}_table_${t}`;
        for (let s = 0; s < seats; s++) {
          slots.push({
            tier_id: tier.id,
            label: `${tier.name} — Table ${t + 1}, Seat ${s + 1}`,
            table_id,
            table_number: t + 1,
            seat_number: s + 1,
            allow_combined_names: tier.allow_combined_names,
          });
        }
      }
    } else if (tier.type === TicketType.ASSIGNED_SEATING) {
      const seats = selectedSeats?.[tier.id] || [];
      seats.forEach((seatLabel) => {
        slots.push({
          tier_id: tier.id,
          label: `${tier.name} — ${seatLabel}`,
          seat_number: seatLabel,
        });
      });
    } else {
      for (let i = 0; i < qty; i++) {
        slots.push({
          tier_id: tier.id,
          label: `${tier.name} — Ticket ${i + 1}`,
        });
      }
    }
  }

  return slots;
}

export default buildAttendeeSlots;
