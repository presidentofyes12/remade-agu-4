import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

const PLATFORM_AGREEMENT_KEY = 'platformAgreementAccepted';

interface PlatformAgreementModalProps {
  onAccept: () => void;
}

export function PlatformAgreementModal({ onAccept }: PlatformAgreementModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(PLATFORM_AGREEMENT_KEY);
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(PLATFORM_AGREEMENT_KEY, 'true');
    setIsOpen(false);
    onAccept(); // Optional: Callback for parent component
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Platform User Agreement and Disclaimer</DialogTitle>
          <DialogDescription>
            Please read and accept the terms before proceeding.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 space-y-4 text-sm">
          <p>By joining this platform, you acknowledge and agree to the following terms:</p>
          
          <h3 className="font-semibold">Non-Investment Acknowledgment</h3>
          <p>You hereby acknowledge that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You have neither been asked to provide, nor have you offered, received, or given anything of value in connection with your use of this platform.</li>
            <li>This platform explicitly does not offer or provide any of the elements that would constitute an "investment contract" under applicable securities laws, specifically:
              <ul className="list-circle pl-6 mt-1">
                <li>No opportunity for investment of money</li>
                <li>No common enterprise structure</li>
                <li>No expectation of profits</li>
                <li>No profits derived from the efforts of others</li>
              </ul>
            </li>
          </ul>

          <h3 className="font-semibold">User Verification and Accountability</h3>
          <p>You certify that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You personally know the individual who invited you to this platform or the individual whom you are inviting.</li>
            <li>You understand that failure to identify such person(s) when legally required to do so by authorized authorities shall constitute sufficient and reasonable grounds to determine that you are the owner of the account in question.</li>
          </ul>

          <p className="font-medium pt-2">By proceeding to use this platform, you confirm that you have read, understood, and agree to be bound by all terms of this disclaimer.</p>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button onClick={handleAccept}>Accept and Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 