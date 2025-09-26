"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePublicClient } from 'wagmi';
import { type Abi } from 'viem';
import { ethers } from 'ethers';
import { CHAIN_RESOLVER_ADDRESS, CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';
import { Loader2, Search } from 'lucide-react';
const RESOLVER = CHAIN_RESOLVER_ADDRESS as string;

// ENSIP-10 resolve() surface and registry reads
const CHAIN_RESOLVER_ABI = [
  { type: 'function', name: 'resolve', stateMutability: 'view', inputs: [{ name: 'name', type: 'bytes' }, { name: 'data', type: 'bytes' }], outputs: [{ name: '', type: 'bytes' }] },
] as const;

const REGISTRY_ABI = [
  { type: 'function', name: 'chainId', stateMutability: 'view', inputs: [{ name: '_labelHash', type: 'bytes32' }], outputs: [{ name: '_chainId', type: 'bytes' }] },
  { type: 'function', name: 'chainName', stateMutability: 'view', inputs: [{ name: '_chainIdBytes', type: 'bytes' }], outputs: [{ name: '_chainName', type: 'string' }] },
] as const;


const ChainResolverForm: React.FC = () => {
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const [inputName, setInputName] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedChainIdHex, setResolvedChainIdHex] = useState<string>('');
  const [resolvedName, setResolvedName] = useState<string>('');
  const [showInlineLoading, setShowInlineLoading] = useState<boolean>(false);

  // Removed legacy copy helpers and sections for a leaner UI
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qLabel = params.get('label');
      const auto = params.get('auto');
      if (qLabel) {
        setInputName(qLabel.toLowerCase());
        if (auto && auto !== '0' && auto !== 'false') {
          void handleResolve(qLabel);
        }
      }
    } catch { }
  }, []);

  const handleResolve = async (label?: string) => {
    const name = (label ?? inputName).trim().toLowerCase();
    if (!name) {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a chain name, e.g., base' });
      return;
    }

    const isZero = typeof CHAIN_RESOLVER_ADDRESS === 'string' && CHAIN_RESOLVER_ADDRESS.toLowerCase() === '0x0000000000000000000000000000000000000000';
    const isValidAddr = typeof CHAIN_RESOLVER_ADDRESS === 'string' && /^0x[a-fA-F0-9]{40}$/.test(CHAIN_RESOLVER_ADDRESS) && !isZero;
    if (!isValidAddr) {
      toast({ variant: 'destructive', title: 'Missing Resolver Address', description: 'Set CHAIN_RESOLVER_ADDRESS in ChainResolverForm.tsx' });
      return;
    }

    try {
      // Clear old results and briefly hide to emphasize reload
      setResolvedName('');
      setResolvedChainIdHex('');
      setShowInlineLoading(true);
      setTimeout(() => setShowInlineLoading(false), 800);

      setIsResolving(true);
      // Forward mapping via ChainRegistry: label -> chainId (bytes)
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(name));
      const chainIdBytes = await (publicClient as any)!.readContract({
        address: (CHAIN_REGISTRY_ADDRESS as string) as `0x${string}`,
        abi: REGISTRY_ABI as unknown as Abi,
        functionName: 'chainId',
        args: [labelHash]
      }) as `0x${string}`;
      const chainIdHex = chainIdBytes; // already 0x-prefixed bytes
      setResolvedChainIdHex(chainIdHex);
      toast({ title: 'Resolved', description: 'Chain ID resolved from registry.' });

      // Update URL so the state can be shared/bookmarked
      try {
        const params = new URLSearchParams(window.location.search);
        params.set('label', name);
        params.set('auto', '1');
        params.set('chainId', chainId);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
      } catch { }

      // Reverse resolve chainId -> chainName from registry
      try {
        const chainName = await (publicClient as any)!.readContract({
          address: (CHAIN_REGISTRY_ADDRESS as string) as `0x${string}`,
          abi: REGISTRY_ABI as unknown as Abi,
          functionName: 'chainName',
          args: [chainIdBytes]
        }) as string;
        setResolvedName(chainName);
      } catch {}
    } catch (e: any) {
      console.error('[Resolver] resolution error', {
        code: e?.code,
        reason: e?.reason,
        shortMessage: e?.shortMessage,
        message: e?.message,
        data: e?.data,
        revert: e?.error?.message,
        error: e,
      });
      toast({ variant: 'destructive', title: 'Resolve Failed', description: e?.shortMessage || e?.reason || e?.message || 'Failed to resolve chain name.' });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">Resolve Chain Name</h1>
          <p className="text-foreground/90 text-md leading-relaxed">Enter a chain reference (e.g., base) to resolve its ERC-7785 chain ID.</p>
        </div>

        {/* Legacy quick-picks removed */}

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resolver Input
            </CardTitle>
            <CardDescription>Lookup chain ID by label</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chainRef" className="text-sm font-medium">Chain Reference</Label>
                <div className="relative">
                  <Input id="chainRef" placeholder="e.g., base" value={inputName} onChange={(e) => setInputName(e.target.value)} className="pr-20" />
                  <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground pointer-events-none">.cid.eth</span>
                </div>
                <div className="text-xs text-muted-foreground">Full name: <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code></div>
              </div>
            </div>
            <Button type="button" onClick={() => handleResolve()} disabled={!inputName.trim() || isResolving} className="w-full bg-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3">
              {isResolving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Resolve Chain ID
                </>
              )}
            </Button>
            {(isResolving || showInlineLoading) && (
              <div className="mt-4 p-4 rounded-md border border-primary/10 bg-secondary/30 animate-pulse">
                <div className="h-4 bg-secondary/60 rounded w-1/3 mb-3" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="h-3 bg-secondary/60 rounded w-full" />
                  <div className="h-3 bg-secondary/60 rounded w-5/6" />
                  <div className="h-3 bg-secondary/60 rounded w-2/3" />
                </div>
              </div>
            )}

            {!isResolving && !showInlineLoading && resolvedChainIdHex && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code>
                  <span className="opacity-70">→</span>
                  <code className="font-mono break-all">{resolvedChainIdHex}</code>
                </div>
                {resolvedName && (
                  <div className="text-sm text-muted-foreground">Name: <code className="font-mono">{resolvedName}</code></div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Legacy result sections removed */}
      </div >
    </div >
  );
};

export default ChainResolverForm;
