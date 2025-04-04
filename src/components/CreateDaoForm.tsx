import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWriteContract, useWaitForTransactionReceipt, type BaseError } from 'wagmi';
import { StateConstituent } from '@/contracts/deployments'; 
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TransactionToast } from '@/components/TransactionToast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { isAddress } from 'viem';

// Zod schema for validation
const schema = z.object({
  daoAddress: z.string().refine(isAddress, { message: 'Invalid Ethereum address' }),
  level: z.coerce.number().int().min(1, 'Level must be at least 1').max(12, 'Level must be at most 12'),
  constituent1: z.coerce.bigint(),
  constituent2: z.coerce.bigint(),
  constituent3: z.coerce.bigint(),
});

type FormData = z.infer<typeof schema>;

export function CreateDaoForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      level: 1, // Sensible default
    }
  });

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
      hash, 
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const constituents: [bigint, bigint, bigint] = [
      data.constituent1,
      data.constituent2,
      data.constituent3
    ];

    console.log("Submitting DAO registration:", {
      daoAddress: data.daoAddress,
      level: data.level,
      constituents,
    });

    writeContract({
      ...StateConstituent, 
      functionName: 'registerDAO',
      args: [data.daoAddress as `0x${string}`, BigInt(data.level), constituents],
    });
  };

  useEffect(() => {
    if (isConfirmed) {
      toast.success('DAO registered successfully!');
      reset(); // Reset form fields after successful submission
    }
    if (error) {
      toast.error((error as BaseError)?.shortMessage || error.message || 'Failed to register DAO');
      console.error("DAO Registration Error:", error);
    }
  }, [isConfirmed, error, reset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New DAO</CardTitle>
        <CardDescription>Enter the details for the new DAO to register it on-chain.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
           <TransactionToast hash={hash} />
          <div className="space-y-2">
            <Label htmlFor="daoAddress">DAO Contract Address</Label>
            <Input 
              id="daoAddress" 
              placeholder="0x..." 
              {...register('daoAddress')} 
              disabled={isPending || isConfirming}
            />
            {errors.daoAddress && <p className="text-red-500 text-sm">{errors.daoAddress.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">DAO Level (1-12)</Label>
            <Input 
              id="level" 
              type="number" 
              min="1" 
              max="12" 
              {...register('level')} 
              disabled={isPending || isConfirming}
            />
            {errors.level && <p className="text-red-500 text-sm">{errors.level.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Constituents (int256)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="constituent1" className="sr-only">Constituent 1</Label>
                <Input 
                  id="constituent1" 
                  type="number" 
                  placeholder="Constituent 1" 
                  {...register('constituent1')} 
                  disabled={isPending || isConfirming}
                />
                {errors.constituent1 && <p className="text-red-500 text-sm">{errors.constituent1.message}</p>}
              </div>
              <div>
                <Label htmlFor="constituent2" className="sr-only">Constituent 2</Label>
                <Input 
                  id="constituent2" 
                  type="number" 
                  placeholder="Constituent 2" 
                  {...register('constituent2')} 
                  disabled={isPending || isConfirming}
                />
                 {errors.constituent2 && <p className="text-red-500 text-sm">{errors.constituent2.message}</p>}
             </div>
              <div>
                <Label htmlFor="constituent3" className="sr-only">Constituent 3</Label>
                <Input 
                  id="constituent3" 
                  type="number" 
                  placeholder="Constituent 3" 
                  {...register('constituent3')} 
                  disabled={isPending || isConfirming}
                />
                 {errors.constituent3 && <p className="text-red-500 text-sm">{errors.constituent3.message}</p>}
             </div>
            </div>
             <p className="text-xs text-gray-500">Enter the three constituent values (can be negative).</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending || isConfirming}>
            {isPending ? 'Confirming...' : isConfirming ? 'Registering DAO...' : 'Register DAO'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 