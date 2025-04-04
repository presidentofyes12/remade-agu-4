import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BidForm } from '../BidForm'
import { useAccount } from 'wagmi'
import { BidValidator } from '../../utils/bidValidator'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn()
}))

// --- Revised Mocking Strategy ---
// Define mock methods once
const mockValidateBidLimits = vi.fn();
const mockValidateBid = vi.fn();
const mockSimulateBid = vi.fn();
const mockValidateConceptualBid = vi.fn();

// Mock BidValidator module
vi.mock('../../utils/bidValidator', () => ({
  BidValidator: vi.fn().mockImplementation(() => ({
    validateBidLimits: mockValidateBidLimits,
    validateBid: mockValidateBid,
    simulateBid: mockSimulateBid,
    validateConceptualBid: mockValidateConceptualBid
  }))
}))
// --- End Revised Mocking Strategy ---

describe('BidForm', () => {
  const mockOnSubmit = vi.fn()
  const mockAddress = '0x123'
  // Removed the test-scope mockBidValidator instance

  beforeEach(() => {
    vi.clearAllMocks() // Clears all mocks including the ones above
    ;(useAccount as any).mockReturnValue({ address: mockAddress })
    
    // Set default resolved values for the shared mocks
    mockValidateBidLimits.mockResolvedValue({ isValid: true });
    mockValidateBid.mockResolvedValue({ isValid: true, impact: 100n, dailyAllocation: 1000n });
    mockSimulateBid.mockResolvedValue({ success: true });
    mockValidateConceptualBid.mockResolvedValue({ isValid: true });

    mockOnSubmit.mockReset()
  })

  const renderBidForm = () => {
    return render(<BidForm onSubmit={mockOnSubmit} />)
  }

  const fillForm = async (amount: string, price: string, locationId = '1', slotId = '0', patternValue = '1', durationMs = '1000') => {
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: amount } });
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: price } });
    fireEvent.change(screen.getByLabelText(/Location ID/i), { target: { value: locationId } });
    fireEvent.change(screen.getByLabelText(/Slot ID/i), { target: { value: slotId } });
    fireEvent.change(screen.getByLabelText(/Pattern Value/i), { target: { value: patternValue } });
    fireEvent.change(screen.getByLabelText(/Duration \(ms\)/i), { target: { value: durationMs } });
    
    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.queryByText('Validating and simulating bid...')).toBeNull();
    });
  }

  it('renders form inputs correctly', () => {
    renderBidForm()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Price')).toBeInTheDocument()
    expect(screen.getByLabelText(/Location ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Slot ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Pattern Value/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Duration \(ms\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('validates and simulates bid on input change', async () => {
    mockValidateBid.mockResolvedValueOnce({ isValid: true, impact: 100n, dailyAllocation: 1000n });

    renderBidForm()
    await fillForm('100', '50', '10', '3', '4', '1000')

    expect(mockValidateBidLimits).toHaveBeenCalledWith(100n, 50n)
    expect(mockValidateConceptualBid).toHaveBeenCalledWith(10, 3, 4n, 1000n)
    expect(mockValidateBid).toHaveBeenCalledWith(100n, 50n)
    expect(mockSimulateBid).toHaveBeenCalledWith(100n, 50n)

    expect(screen.getByText('Bid Impact: 100')).toBeInTheDocument()
    expect(screen.getByText('Daily Allocation: 1000')).toBeInTheDocument()
    expect(screen.getByText('✓ Simulation successful')).toBeInTheDocument()
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('shows error when bid limits validation fails', async () => {
    const errorMessage = 'Bid amount exceeds daily limit'
    mockValidateBidLimits.mockResolvedValueOnce({ 
      isValid: false, 
      error: errorMessage 
    })

    renderBidForm()
    await fillForm('999999', '50')

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows error when conceptual validation fails', async () => {
    const errorMessage = 'Bid patternValue deviates too much'
    mockValidateConceptualBid.mockResolvedValueOnce({ 
      isValid: false, 
      error: errorMessage 
    })

    renderBidForm()
    await fillForm('100', '50', '10', '3', '999', '1000')

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    expect(mockValidateBid).not.toHaveBeenCalled()
    expect(mockSimulateBid).not.toHaveBeenCalled()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows error when bid validation fails', async () => {
    mockValidateBid.mockResolvedValueOnce({
      isValid: false,
      impact: 0n,
      dailyAllocation: 0n,
      error: 'Invalid bid parameters'
    })

    renderBidForm()
    await fillForm('100', '50')

    expect(screen.getByText('Error: Invalid bid parameters')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows error when simulation fails', async () => {
    mockSimulateBid.mockResolvedValueOnce({ 
      success: false, 
      error: 'Simulation failed' 
    })

    renderBidForm()
    await fillForm('100', '50')

    expect(screen.getByText('Error: Simulation failed')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('handles successful bid submission', async () => {
    mockValidateBid.mockResolvedValueOnce({ isValid: true, impact: 100n, dailyAllocation: 1000n })

    renderBidForm()
    await fillForm('100', '50')

    const submitButton = screen.getByRole('button')
    expect(submitButton).not.toBeDisabled()
    
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(100n, 50n)
    })

    expect(screen.getByLabelText('Amount')).toHaveValue('')
    expect(screen.getByLabelText('Price')).toHaveValue('')
  })

  it('handles submission errors gracefully', async () => {
    mockValidateBid.mockResolvedValueOnce({ isValid: true, impact: 100n, dailyAllocation: 1000n })
    mockOnSubmit.mockRejectedValue(new Error('Submission failed'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderBidForm()
    await fillForm('100', '50')

    const submitButton = screen.getByRole('button')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting bid:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('disables validation when no wallet is connected', async () => {
    (useAccount as any).mockReturnValue({ address: null })
    
    renderBidForm()
    await fillForm('100', '50', '10', '3', '4', '1000')

    expect(mockValidateBidLimits).not.toHaveBeenCalled()
    expect(mockValidateConceptualBid).not.toHaveBeenCalled()
    expect(mockValidateBid).not.toHaveBeenCalled()
    expect(mockSimulateBid).not.toHaveBeenCalled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
}) 