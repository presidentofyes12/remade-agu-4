import { useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';

interface TransactionToastProps {
  hash: `0x${string}` | undefined;
}

export function TransactionToast({ hash }: TransactionToastProps) {
  // If no hash is provided, don't render anything
  if (!hash) return null;

  // Hook to watch the transaction receipt
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });

  // Show success/error toasts based on the receipt status
  useEffect(() => {
    if (isSuccess) {
      // Dismiss any existing loading toast before showing success/error
      toast.dismiss(); 
      toast.success('Transaction confirmed!');
    } else if (isError) {
      toast.dismiss();
      toast.error('Transaction failed. Check console or block explorer.');
    }
    // No dependency on isLoading, as toast.loading handles the initial state
  }, [isSuccess, isError, hash]); // Added hash dependency for safety

  // The component itself doesn't render visible elements,
  // it just manages the toast side effects.
  return null;
} 