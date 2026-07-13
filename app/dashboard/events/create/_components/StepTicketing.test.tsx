import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepTicketing from './StepTicketing';
import { useEventBuilderStore } from '@/lib/store/eventBuilderStore';
import { TicketType } from '@/lib/schema/eventTied';

// Mock the store
jest.mock('@/lib/store/eventBuilderStore');

describe('StepTicketing', () => {
  const mockAddTicketTier = jest.fn();
  const mockRemoveTicketTier = jest.fn();
  const mockSetStep = jest.fn();

  const defaultStore = {
    ticketTiers: [],
    addTicketTier: mockAddTicketTier,
    removeTicketTier: mockRemoveTicketTier,
    setStep: mockSetStep,
  };

  beforeEach(() => {
    (useEventBuilderStore as unknown as jest.Mock).mockReturnValue(defaultStore);
    mockAddTicketTier.mockClear();
    mockRemoveTicketTier.mockClear();
    mockSetStep.mockClear();
  });

  it('renders correctly', () => {
    render(<StepTicketing />);
    expect(screen.getByText('Ticketing & Seats')).toBeInTheDocument();
  });

  it('opens modal when clicking Add Ticket Tier', async () => {
    render(<StepTicketing />);
    const addButton = screen.getByText('Add Ticket Tier');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Create Ticket Tier')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<StepTicketing />);
    fireEvent.click(screen.getByText('Add Ticket Tier')); // Open modal
    
    const submitButton = screen.getByText('Add Tier');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Name is required, Price must be clear or show error if touched? Or just error on submit
      // Based on implementation, errors should appear
      // However, name input is empty by default so it should error
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('adds a valid General Admission ticket', async () => {
    const user = userEvent.setup();
    render(<StepTicketing />);
    fireEvent.click(screen.getByText('Add Ticket Tier'));

    const nameInput = screen.getByPlaceholderText('e.g. VIP Access');
    const priceInput = screen.getByLabelText(/Price/i);
    const qtyInput = screen.getByLabelText(/Quantity/i);

    await user.type(nameInput, 'Early Bird');
    await user.clear(priceInput);
    await user.type(priceInput, '10');
    await user.clear(qtyInput);
    await user.type(qtyInput, '50');

    await user.click(screen.getByText('Add Tier'));

    await waitFor(() => {
        expect(mockAddTicketTier).toHaveBeenCalledWith({
            name: 'Early Bird',
            type: TicketType.GENERAL_ADMISSION,
            base_price: 1000,
            quantity_available: 50,
            config: undefined,
        });
    });
  });

  it('requires seatsPerTable for TABLE ticket type', async () => {
    const user = userEvent.setup();
    render(<StepTicketing />);
    fireEvent.click(screen.getByText('Add Ticket Tier'));

    // Select TABLE type
    const typeSelect = screen.getByLabelText('Type');
    await user.selectOptions(typeSelect, TicketType.TABLE);

    // Should see seats per table input
    const seatsInput = screen.getByLabelText('Seats per Table');
    expect(seatsInput).toBeInTheDocument();

    // Try to submit with invalid seats
    await user.clear(seatsInput);
    await user.type(seatsInput, '0'); // Invalid

    // Fill other required fields
    await user.type(screen.getByPlaceholderText('e.g. VIP Access'), 'VIP Table');
    const priceInput = screen.getByLabelText(/Price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '100');

    await user.click(screen.getByText('Add Tier'));

    // Should show error
    await waitFor(() => {
        expect(screen.getByText('Seats per table is required and must be at least 1')).toBeInTheDocument(); // Wait, specific error message was "Seats per table is required and must be at least 1" or similar?
        // Let's check the code: "Seats per table is required and must be at least 1"
        // Zod sometimes returns default messages for number.min(1) if not customized properly in refinements or schema
    });
  });
  
  it('adds a valid TABLE ticket', async () => {
    const user = userEvent.setup();
    render(<StepTicketing />);
    fireEvent.click(screen.getByText('Add Ticket Tier'));

    // Select TABLE type
    const typeSelect = screen.getByLabelText('Type');
    await user.selectOptions(typeSelect, TicketType.TABLE);

    // Fill fields
    await user.type(screen.getByPlaceholderText('e.g. VIP Access'), 'VIP Table');
     const priceInput = screen.getByLabelText(/Price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '100');
    
    const seatsInput = screen.getByLabelText('Seats per Table');
    await user.clear(seatsInput);
    await user.type(seatsInput, '6');

    await user.click(screen.getByText('Add Tier'));

    await waitFor(() => {
        expect(mockAddTicketTier).toHaveBeenCalledWith(expect.objectContaining({
            type: TicketType.TABLE,
            config: { seats_per_table: 6 }
        }));
    });
  });
});
