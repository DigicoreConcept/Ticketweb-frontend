import { render, screen, fireEvent, within } from '@testing-library/react';
import TicketSelection from './TicketSelection';
import { TicketType } from '@/lib/schema/eventTied';
import { PublicEvent } from '@/lib/api';

const mockEvent: PublicEvent = {
  id: 'evt-1',
  title: 'Test Event',
  slug: 'test-event',
  description: 'Test Desc',
  location: 'Test Loc',
  start_time: '2023-01-01',
  end_time: '2023-01-01',
  status: 'PUBLISHED' as any,
  country: 'Nigeria',
  banner_image_url: "",
  image_url: "",
  ticket_tiers: [
    { id: 't1', name: 'VIP Section', type: 'VIP' as TicketType, base_price: 10000, quantity_available: 10 },
    { id: 't2', name: 'General Admission', type: 'GENERAL_ADMISSION' as TicketType, base_price: 5000, quantity_available: 100 }
  ]
};

describe('TicketSelection', () => {
    it('selects tier when clicking seat map section', () => {
        render(<TicketSelection event={mockEvent} onCheckout={jest.fn()} />);
        
        // Find VIP section in SVG (mapped by our getTierId logic using 'VIP')
        // We look for 'VIP Section' which appears in both Map and List. 
        // We find the one that is inside an SVG
        const vipLabels = screen.getAllByText('VIP Section');
        const vipLabel = vipLabels.find(el => el.closest('svg'));
        const vipGroup = vipLabel?.closest('g');
        
        if (vipGroup) {
            fireEvent.click(vipGroup);
        }

        // Check if the corresponding list item is highlighted (we added bg-blue-50 class)
        const vipListItem = screen.getByText('VIP Section', { selector: 'p' }).closest('.flex.justify-between');
        expect(vipListItem).toHaveClass('bg-blue-50');
    });

    it('updates total when selecting quantity', () => {
        render(<TicketSelection event={mockEvent} onCheckout={jest.fn()} />);
        
        const generalTierSelect = screen.getAllByRole('combobox')[1]; // Second select for General
        fireEvent.change(generalTierSelect, { target: { value: '2' } });

        // 2 * 5000 = 10000 cents => $100.00
        expect(screen.getByTestId('total-price')).toHaveTextContent('$100.00');
    });
});
