import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutForm from './CheckoutForm';
import { checkoutOrder } from '@/lib/api';
import { redirectTo } from './utils';

// Mock the API module
jest.mock('@/lib/api', () => ({
  checkoutOrder: jest.fn(),
}));

// Mock utils module
jest.mock('./utils', () => ({
  redirectTo: jest.fn(),
}));

describe('CheckoutForm', () => {
  const mockReservation = {
    reservation_id: 'res-123',
    expires_at: new Date(Date.now() + 600000).toISOString(), // 10 mins from now
    total_amount: 5000,
    items: [],
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(
      <CheckoutForm 
        reservation={mockReservation} 
        onSuccess={mockOnSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // 5000 cents = $50.00
  });

  it('submits form and redirects to Paystack on success', async () => {
    // Setup mock response
    (checkoutOrder as jest.Mock).mockResolvedValue({
      authorization_url: 'https://paystack.com/checkout/mock-ref',
      access_code: 'code-123',
      reference: 'ref-123',
    });

    render(
      <CheckoutForm 
        reservation={mockReservation} 
        onSuccess={mockOnSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Pay Here/i }));
    
    // Verify loading state (optional, might be too fast)
    expect(screen.getByRole('button', { name: /Pay Here/i })).toBeDisabled();

    await waitFor(() => {
      expect(checkoutOrder).toHaveBeenCalledWith('res-123', {
        name: 'John Doe',
        email: 'john@example.com',
        paymentToken: 'paystack',
      });
    });

    // Verify redirection via mock
    await waitFor(() => {
        expect(redirectTo).toHaveBeenCalledWith('https://paystack.com/checkout/mock-ref');
    });
  });

  it('displays error message on API failure', async () => {
    // Setup mock failure
    (checkoutOrder as jest.Mock).mockRejectedValue({
      response: {
        data: {
          detail: 'Payment failed'
        }
      }
    });

    render(
      <CheckoutForm 
        reservation={mockReservation} 
        onSuccess={mockOnSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Pay Here/i }));

    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });
    
    // Should NOT redirect
    expect(redirectTo).not.toHaveBeenCalled();
  });
});
