import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CreateDaoForm } from '@/components/CreateDaoForm'; 
import { StateConstituent } from '@/contracts/deployments'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// DEFAULT_ADMIN_ROLE is bytes32(0)
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  const { data: isAdmin, isLoading: isLoadingRole, error: errorRole } = useReadContract({
    ...StateConstituent,
    functionName: 'hasRole',
    args: [DEFAULT_ADMIN_ROLE, address!], // Pass user's address
    query: {
      enabled: isConnected && !!address, // Only run query if connected and address is available
    },
  });

  if (!isConnected) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Not Connected</AlertTitle>
        <AlertDescription>
          Please connect your wallet to access admin functions.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoadingRole) {
    return <div>Loading admin status...</div>;
  }

  if (errorRole) {
     return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Checking Role</AlertTitle>
        <AlertDescription>
          Could not verify admin status: {errorRole.shortMessage || errorRole.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have the necessary permissions (DEFAULT_ADMIN_ROLE) to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  // If connected and is admin, show the form
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel - DAO Management</h1>
      <CreateDaoForm />
    </div>
  );
} 