"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CHAIN_REGISTRY_ABI, CHAIN_RESOLVER_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS, CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import type { Abi } from 'viem';
import { keccak256, toUtf8Bytes } from 'ethers';
import { Skeleton } from '@/components/ui/skeleton';

const TARGET_CHAIN_ID = 11155111; // Sepolia

const RegisterMinimalForm: React.FC = () => {
  const { address: account } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const [label, setLabel] = useState<string>('');
  const [chainIdHex, setChainIdHex] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ label: string; chainId: string } | null>(null);
  type StepStatus = 'idle' | 'pending' | 'confirmed' | 'error';
  const [regStatus, setRegStatus] = useState<StepStatus>('idle');
  const [resStatus, setResStatus] = useState<StepStatus>('idle');

  const validAddr = (x?: string) => !!x && /^0x[a-fA-F0-9]{40}$/.test(x) && x !== '0x0000000000000000000000000000000000000000';
  const validBytes32 = (x: string) => /^0x[0-9a-fA-F]{64}$/.test(x);

  const onSubmit = async () => {
    const registry = CHAIN_REGISTRY_ADDRESS as `0x${string}`;
    const resolver = CHAIN_RESOLVER_ADDRESS as `0x${string}`;
    if (!validAddr(registry) || !validAddr(resolver)) {
      toast({ variant: 'destructive', title: 'Missing Addresses', description: 'Set NEXT_PUBLIC_CHAIN_REGISTRY_ADDRESS and NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS.' });
      return;
    }
    const name = label.trim().toLowerCase();
    const cid = chainIdHex.trim();
    if (!name) {
      toast({ variant: 'destructive', title: 'Invalid Label', description: 'Enter a non-empty label (e.g., base).' });
      return;
    }
    if (!validBytes32(cid)) {
      toast({ variant: 'destructive', title: 'Invalid Chain ID', description: 'Chain ID must be 0x + 64 hex (bytes32).' });
      return;
    }
    if (!account) {
      toast({ variant: 'destructive', title: 'Wallet Required', description: 'Connect a wallet to submit transactions.' });
      return;
    }

    try {
      setSubmitting(true);
      setResult(null);
      setRegStatus('pending');
      setResStatus('idle');
      // Optional network hint
      try { await switchChain({ chainId: TARGET_CHAIN_ID }); } catch {}

      // Heads-up toast: two transactions
      toast({ title: 'Action Required', description: 'You will sign 2 transactions: (1) Registry.register, (2) Resolver.register.' });

      // 1) Registry.register(name, owner=account, chainId=bytes32)
      const tx1 = await writeContractAsync({
        address: registry,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'register',
        args: [name, account as `0x${string}`, cid],
      });
      toast({ title: 'Registry: Submitted', description: 'Waiting for confirmation…' });
      await publicClient!.waitForTransactionReceipt({ hash: tx1 });
      toast({ title: 'Registry: Confirmed', description: 'Chain registered.' });
      setRegStatus('confirmed');

      // 2) Resolver.register(labelHash, owner=account)
      setResStatus('pending');
      const labelHash = keccak256(toUtf8Bytes(name)) as `0x${string}`;
      const tx2 = await writeContractAsync({
        address: resolver,
        abi: CHAIN_RESOLVER_ABI as unknown as Abi,
        functionName: 'register',
        args: [labelHash, account as `0x${string}`],
      });
      toast({ title: 'Resolver: Submitted', description: 'Waiting for confirmation…' });
      await publicClient!.waitForTransactionReceipt({ hash: tx2 });
      toast({ title: 'Resolver: Confirmed', description: 'Label registered with resolver.' });
      setResStatus('confirmed');

      setResult({ label: name, chainId: cid });
      setLabel('');
      setChainIdHex('');
    } catch (e: any) {
      const msg = e?.shortMessage || e?.reason || e?.message || 'Transaction failed.';
      toast({ variant: 'destructive', title: 'Register Failed', description: msg });
      if (regStatus === 'pending') setRegStatus('error');
      if (resStatus === 'pending') setResStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-primary/10 bg-background/50 shadow-none">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Owner is the connected wallet. Chain ID must be bytes32 hex. This flow will prompt for two signatures: Registry then Resolver.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" placeholder="e.g., base" value={label} onChange={(e) => setLabel(e.target.value)} />
            <div className="text-xs text-muted-foreground">Full name will be <code className="font-mono">{(label || '<label>')}.cid.eth</code></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cid">Chain ID (bytes32)</Label>
            <Input id="cid" placeholder="0x…64 hex…" value={chainIdHex} onChange={(e) => setChainIdHex(e.target.value)} />
            <div className="text-xs text-muted-foreground">Example: <code className="font-mono">0x2121…(64 hex)…</code></div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={submitting || switching} className="w-full">
            {submitting
              ? regStatus === 'pending' || (regStatus === 'confirmed' && resStatus === 'idle')
                ? 'Registering…'
                : resStatus === 'pending'
                  ? 'Assigning…'
                  : 'Submitting…'
              : 'Register'}
          </Button>
        </div>

        {(submitting || regStatus !== 'idle' || resStatus !== 'idle') && (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={
                regStatus === 'confirmed' ? 'inline-block h-2.5 w-2.5 rounded-full bg-emerald-400' :
                regStatus === 'pending' ? 'inline-block h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse' :
                regStatus === 'error' ? 'inline-block h-2.5 w-2.5 rounded-full bg-red-500' :
                'inline-block h-2.5 w-2.5 rounded-full bg-muted'
              } />
              <span>Register on Registry</span>
              <span className="ml-auto text-xs opacity-70">
                {regStatus === 'confirmed' ? 'Confirmed' : regStatus === 'pending' ? 'Submitting' : regStatus === 'error' ? 'Failed' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={
                resStatus === 'confirmed' ? 'inline-block h-2.5 w-2.5 rounded-full bg-emerald-400' :
                resStatus === 'pending' ? 'inline-block h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse' :
                resStatus === 'error' ? 'inline-block h-2.5 w-2.5 rounded-full bg-red-500' :
                'inline-block h-2.5 w-2.5 rounded-full bg-muted'
              } />
              <span>Assign on Resolver</span>
              <span className="ml-auto text-xs opacity-70">
                {resStatus === 'confirmed' ? 'Confirmed' : resStatus === 'pending' ? 'Submitting' : resStatus === 'error' ? 'Failed' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Result mapping */}
        {submitting ? (
          <div className="mt-4 p-4 rounded-md border border-primary/10 bg-secondary/30">
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3 bg-muted/60" />
              <Skeleton className="h-3 w-1/2 bg-muted/50" />
            </div>
          </div>
        ) : result ? (
          <div className="mt-4 p-4 rounded-md border border-primary/10 bg-secondary/30 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <code className="font-mono">{result.label}.cid.eth</code>
              <span className="opacity-70">→</span>
              <code className="font-mono break-all">{result.chainId}</code>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default RegisterMinimalForm;
