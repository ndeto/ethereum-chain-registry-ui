"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  const [resStatus, setResStatus] = useState<StepStatus>('idle');
  const [showSteps, setShowSteps] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [resSubmitting, setResSubmitting] = useState(false);
  const [inputsLocked, setInputsLocked] = useState(false);
  const [regTxHash, setRegTxHash] = useState<string>('');
  const [resTxHash, setResTxHash] = useState<string>('');
  const ETHERSCAN_BASE = 'https://sepolia.etherscan.io';

  const handleEditInputs = () => {
    setShowSteps(false);
    setInputsLocked(false);
    setSubmitting(false);
    setRegSubmitting(false);
    setResSubmitting(false);
    setRegStatus('idle');
    setResStatus('idle');
    setRegTxHash('');
    setResTxHash('');
    setResult(null);
  };

  const validAddr = (x?: string) => !!x && /^0x[a-fA-F0-9]{40}$/.test(x) && x !== '0x0000000000000000000000000000000000000000';
  // ERC‑7930 identifiers are variable-length bytes. Accept 1–64 bytes (2–128 hex chars) with 0x prefix.
  const validHexBytes = (x: string) => /^0x(?:[0-9a-fA-F]{2}){1,64}$/.test(x);

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
    if (!validHexBytes(cid)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Chain Identifier',
        description: 'Provide 0x-prefixed hex bytes (even-length), up to 64 bytes.',
      });
      return;
    }
    if (!account) {
      toast({ variant: 'destructive', title: 'Wallet Required', description: 'Connect a wallet to submit transactions.' });
      return;
    }

    try {
      // Preflight: ensure label is unique in the registry
      const preLabelHash = keccak256(toUtf8Bytes(name)) as `0x${string}`;
      try {
        const existingCid = await (publicClient as any)!.readContract({
          address: registry,
          abi: CHAIN_REGISTRY_ABI as unknown as Abi,
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

      // Reveal step controls (no auto-submission)
      setShowSteps(true);
      setInputsLocked(true);
      setResult(null);
      setRegStatus('idle');
      setResStatus('idle');
      // Optional network hint
      try { await switchChain({ chainId: TARGET_CHAIN_ID }); } catch { }
    } catch (e: any) {
      const msg = e?.shortMessage || e?.reason || e?.message || 'Transaction failed.';
      toast({ variant: 'destructive', title: 'Register Failed', description: msg });
      if (regStatus === 'pending') setRegStatus('error');
      if (resStatus === 'pending') setResStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegistryRegister = async () => {
    const registry = CHAIN_REGISTRY_ADDRESS as `0x${string}`;
    const resolver = CHAIN_RESOLVER_ADDRESS as `0x${string}`;
    const name = label.trim().toLowerCase();
    const cid = chainIdHex.trim();
    try {
      setRegSubmitting(true);
      setRegStatus('pending');
      const tx1 = await writeContractAsync({
        address: registry,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'demoRegister',
        args: [name, account as `0x${string}`, cid],
      } as any);
      setRegTxHash(tx1 as string);
      {
        const rcpt: any = await publicClient!.waitForTransactionReceipt({ hash: tx1 });
        if (rcpt?.status !== 'success') throw new Error('Registry transaction reverted');
      }
      setRegStatus('confirmed');
      toast({ title: 'Registry: Confirmed', description: 'Chain registered on registry.' });
    } catch (e: any) {
      setRegStatus('error');
      toast({ variant: 'destructive', title: 'Registry Failed', description: e?.shortMessage || e?.reason || e?.message || 'Registry transaction failed.' });
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleResolverAssign = async () => {
    const resolver = CHAIN_RESOLVER_ADDRESS as `0x${string}`;
    const name = label.trim().toLowerCase();
    const cid = chainIdHex.trim();
    try {
      setResSubmitting(true);
      setResStatus('pending');
      const labelHash = keccak256(toUtf8Bytes(name)) as `0x${string}`;
      const tx2 = await writeContractAsync({
        address: resolver,
        abi: CHAIN_RESOLVER_ABI as unknown as Abi,
        functionName: 'demoRegister',
        args: [labelHash, account as `0x${string}`],
      } as any);
      setResTxHash(tx2 as string);
      {
        const rcpt: any = await publicClient!.waitForTransactionReceipt({ hash: tx2 });
        if (rcpt?.status !== 'success') throw new Error('Resolver transaction reverted');
      }
      setResStatus('confirmed');
      toast({ title: 'Resolver: Confirmed', description: 'Label registered with resolver.' });
      setResult({ label: name, chainId: cid });
      try { sessionStorage.setItem('justRegisteredLabel', name); } catch {}
    } catch (e: any) {
      setResStatus('error');
      toast({ variant: 'destructive', title: 'Assignment Failed', description: e?.shortMessage || e?.reason || e?.message || 'Resolver transaction failed.' });
    } finally {
      setResSubmitting(false);
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
            <div className="text-xs text-muted-foreground">Example: <code className="font-mono">0x01</code>, <code className="font-mono">0xa4b1</code>, or longer (up to 64 bytes)</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={submitting || switching || showSteps} className="w-full">
            {submitting
              ? regStatus === 'pending' || (regStatus === 'confirmed' && resStatus === 'idle')
                ? 'Registering…'
                : resStatus === 'pending'
                  ? 'Assigning…'
                  : 'Submitting…'
              : 'Register'}
          </Button>
        </div>

        {showSteps && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={handleEditInputs}>
                Change inputs
              </Button>
            </div>
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <span className={
                regStatus === 'confirmed' ? 'inline-block h-2.5 w-2.5 rounded-full bg-emerald-500' :
                regStatus === 'pending' ? 'inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse' :
                regStatus === 'error' ? 'inline-block h-2.5 w-2.5 rounded-full bg-red-500' :
                'inline-block h-2.5 w-2.5 rounded-full bg-muted'
              } />
              <span className="flex-1">
                1) Register {label?.trim() ? <code className="font-mono">{label.trim()}.cid.eth</code> : 'label.cid.eth'} in the
                {' '}<a className="underline" href={`${ETHERSCAN_BASE}/address/${CHAIN_REGISTRY_ADDRESS}`} target="_blank" rel="noreferrer">chain identifier registry</a>
              </span>
              <Button
                type="button"
                variant={regStatus === 'confirmed' ? 'secondary' : 'default'}
                disabled={regSubmitting || regStatus === 'confirmed'}
                onClick={handleRegistryRegister}
              >
                {regSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>) : regStatus === 'confirmed' ? 'Confirmed' : 'Submit'}
              </Button>
            </div>
            {regTxHash && (
              <div className="pl-6 text-xs text-muted-foreground">
                <a className="underline" href={`${ETHERSCAN_BASE}/tx/${regTxHash}`} target="_blank" rel="noreferrer">View registry transaction on Etherscan</a>
              </div>
            )}
            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <span className={
                resStatus === 'confirmed' ? 'inline-block h-2.5 w-2.5 rounded-full bg-emerald-500' :
                resStatus === 'pending' ? 'inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse' :
                resStatus === 'error' ? 'inline-block h-2.5 w-2.5 rounded-full bg-red-500' :
                'inline-block h-2.5 w-2.5 rounded-full bg-muted'
              } />
              <span className="flex-1">2) Assign on ENS Resolver</span>
              <Button
                type="button"
                variant={resStatus === 'confirmed' ? 'secondary' : 'default'}
                disabled={resSubmitting || regStatus !== 'confirmed' || resStatus === 'confirmed'}
                onClick={handleResolverAssign}
              >
                {resSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>) : resStatus === 'confirmed' ? 'Confirmed' : 'Submit'}
              </Button>
            </div>
            {resTxHash && (
              <div className="pl-6 text-xs text-muted-foreground">
                <a className="underline" href={`${ETHERSCAN_BASE}/tx/${resTxHash}`} target="_blank" rel="noreferrer">View resolver transaction on Etherscan</a>
              </div>
            )}
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
              <Link href={`/resolve?label=${encodeURIComponent(result.label)}`} className="inline-block">
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
