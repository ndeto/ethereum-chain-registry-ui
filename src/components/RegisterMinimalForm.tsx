"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CHAIN_RESOLVER_ABI } from '@/lib/abis';
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import type { Abi } from 'viem';
import { keccak256, toUtf8Bytes } from 'ethers';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

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
  const [inputsLocked, setInputsLocked] = useState(false);
  const [regTxHash, setRegTxHash] = useState<string>('');
  const ETHERSCAN_BASE = 'https://sepolia.etherscan.io';

  const handleEditInputs = () => {
    // Unlock and reset state
    setInputsLocked(false);
    setSubmitting(false);
    setRegStatus('idle');
    setRegTxHash('');
    setResult(null);
    // Clear form inputs
    setLabel('');
    setChainIdHex('');
  };

  const validAddr = (x?: string) => !!x && /^0x[a-fA-F0-9]{40}$/.test(x) && x !== '0x0000000000000000000000000000000000000000';
  // 7930 chain identifier (no address): allow generic range; validate even-length hex and cap at 263 bytes (8+255) per spec
  const isHexBytes = (x: string) => /^0x(?:[0-9a-fA-F]{2})+$/.test(x);

  const onSubmit = async () => {
    const resolver = CHAIN_RESOLVER_ADDRESS as `0x${string}`;
    if (!validAddr(resolver)) {
      toast({ variant: 'destructive', title: 'Missing Address', description: 'Set NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS.' });
      return;
    }
    const name = label.trim().toLowerCase();
    const cid = chainIdHex.trim();
    if (!name) {
      toast({ variant: 'destructive', title: 'Invalid Label', description: 'Enter a non-empty label (e.g., base).' });
      return;
    }
    if (!isHexBytes(cid)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Chain Identifier',
        description: 'Provide 0x‑prefixed hex bytes (even‑length).',
      });
      return;
    }
    const byteLen = (cid.length - 2) / 2;
    if (byteLen > 263) {
      toast({
        variant: 'destructive',
        title: 'Too Long',
        description: 'Chain identifier may be at most 263 bytes (8 + ChainRefLen, ChainRefLen ≤ 255).',
      });
      return;
    }
    if (!account) {
      toast({ variant: 'destructive', title: 'Wallet Required', description: 'Connect a wallet to submit transactions.' });
      return;
    }

    try {
      // Preflight: ensure label is unique in the resolver
      const preLabelHash = keccak256(toUtf8Bytes(name)) as `0x${string}`;
      try {
        const existingCid = await (publicClient as any)!.readContract({
          address: resolver,
          abi: CHAIN_RESOLVER_ABI as unknown as Abi,
          functionName: 'chainId',
          args: [preLabelHash],
        }) as `0x${string}`;
        if (existingCid && typeof existingCid === 'string' && existingCid !== '0x') {
          toast({
            variant: 'destructive',
            title: 'Label Already Registered',
            description: `Labels must be unique.`,
          });
          return;
        }
      } catch {}

      // Optional network switch
      try { await switchChain({ chainId: TARGET_CHAIN_ID }); } catch {}

      // Directly submit registration (single step)
      setSubmitting(true);
      setInputsLocked(true);
      setRegStatus('pending');
      const tx = await writeContractAsync({
        address: resolver,
        abi: CHAIN_RESOLVER_ABI as unknown as Abi,
        functionName: 'demoRegister',
        args: [name, account as `0x${string}`, cid],
      } as any);
      setRegTxHash(tx as string);
      {
        const rcpt: any = await publicClient!.waitForTransactionReceipt({ hash: tx });
        if (rcpt?.status !== 'success') throw new Error('Register transaction reverted');
      }
      setRegStatus('confirmed');
      toast({ title: 'Registered', description: 'Label registered with resolver.' });
      setResult({ label: name, chainId: cid });
      try { sessionStorage.setItem('justRegisteredLabel', name); } catch {}
    } catch (e: any) {
      const msg = e?.shortMessage || e?.reason || e?.message || 'Transaction failed.';
      toast({ variant: 'destructive', title: 'Register Failed', description: msg });
      setRegStatus('error');
      // hide any previous tx link on failure
      setRegTxHash('');
      setInputsLocked(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-primary/10 bg-background/50 shadow-none">
      <CardHeader>
        <CardDescription>
          The owner of this label will be the connected wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" placeholder="e.g., base" value={label} disabled={inputsLocked} onChange={(e) => setLabel(e.target.value)} />
            <div className="text-xs text-muted-foreground">Full name will be <code className="font-mono">{(label || '<label>')}.cid.eth</code></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cid">Chain Identifier (hex bytes)</Label>
            <Input id="cid" placeholder="0x…" value={chainIdHex} disabled={inputsLocked} onChange={(e) => setChainIdHex(e.target.value)} />
            <div className="text-xs text-muted-foreground">Example: <code className="font-mono">0x000000010001010a00</code></div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={onSubmit} disabled={submitting || switching || regStatus === 'pending' || inputsLocked} className="w-full disabled:cursor-not-allowed">
            {submitting || regStatus === 'pending' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering…
              </>
            ) : (
              'Register'
          )}
          </Button>
          {/* inline status message for quick visibility */}
          {regStatus === 'pending' && (
            <div className="text-xs text-foreground/80">Submitting transaction…</div>
          )}
          {regStatus === 'confirmed' && (
            <div className="text-xs text-green-600 dark:text-green-400">Success: label registered.</div>
          )}
          {regStatus === 'error' && (
            <div className="text-xs text-red-600 dark:text-red-400">Failed to register. Please check your wallet and try again.</div>
          )}
        </div>

        {regTxHash && regStatus === 'confirmed' && (
          <div className="pl-0 text-xs text-muted-foreground">
            <a className="underline" href={`${ETHERSCAN_BASE}/tx/${regTxHash}`} target="_blank" rel="noreferrer">View transaction on Etherscan</a>
          </div>
        )}

        {(regStatus === 'confirmed' || regStatus === 'error') && (
          <div className="pt-2">
            <Button variant="outline" onClick={handleEditInputs} className="w-full">Register Another</Button>
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
            <div className="mt-3 space-y-1">
              <Link href={`/resolve?label=${encodeURIComponent(result.label)}&auto=1`} className="inline-block">
                <Button variant="secondary">Test Resolution</Button>
              </Link>
              <div className="text-xs text-muted-foreground">
                Opens the Resolve page and looks up <code className="font-mono">{result.label}.cid.eth</code> via the ENS resolver.
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default RegisterMinimalForm;
