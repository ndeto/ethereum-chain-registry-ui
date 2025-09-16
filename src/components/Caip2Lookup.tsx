"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePublicClient } from 'wagmi';
import { type Abi } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { CHAIN_REGISTRY_ABI, CAIP2_LIB_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS, CAIP2_CONTRACT_ADDRESS } from '@/lib/addresses';
import { fetchChainDataById } from '@/lib/registry';
import { Skeleton } from '@/components/ui/skeleton';

export default function Caip2Lookup() {
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const [identifier, setIdentifier] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [byIdData, setByIdData] = useState<any>(null);
  const [byIdExists, setByIdExists] = useState<boolean | null>(null);
  const [byHashData, setByHashData] = useState<any>(null);
  const [byHashExists, setByHashExists] = useState<boolean | null>(null);
  const [byHashChainId, setByHashChainId] = useState<string>('');
  // Context now lives on the Learn page
  const [loadingHash, setLoadingHash] = useState(false);
  const [loadingId, setLoadingId] = useState(false);

  const lookupByIdentifier = async () => {
    // Clear previous results while fetching new data
    setByIdExists(null);
    setByIdData(null);
    setLoadingId(true);
    const parts = identifier.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setByIdExists(null);
      setByIdData(null);
      setLoadingId(false);
      return;
    }
    const [ns, ref] = parts;
    try {
      const hash = await (publicClient as any)!.readContract({
        address: CAIP2_CONTRACT_ADDRESS as `0x${string}`,
        abi: CAIP2_LIB_ABI as unknown as Abi,
        functionName: 'computeCaip2Hash',
        args: [ns, ref]
      }) as string;
      const chainId = await (publicClient as any)!.readContract({
        address: CHAIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'caip2HashToChainId',
        args: [hash]
      }) as string;
      const data = await (publicClient as any)!.readContract({
        address: CHAIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'chainData',
        args: [chainId]
      });
      const notFound = !data?.chainName && String((data as any)?.rollupContract).toLowerCase() === '0x0000000000000000000000000000000000000000';
      setByIdExists(!notFound);
      setByIdData(data as any);
    } catch (e) {
      setByIdExists(null);
      setByIdData(null);
    } finally {
      setLoadingId(false);
    }
  };

  const lookupByHash = async () => {
    // Clear previous results while fetching new data
    setByHashChainId('');
    setByHashData(null);
    setByHashExists(null);
    setLoadingHash(true);
    const h = hashInput.trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(h)) {
      setByHashChainId('');
      setByHashData(null);
      setByHashExists(null);
      setLoadingHash(false);
      return;
    }
    try {
      const id = await (publicClient as any)!.readContract({
        address: CHAIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'caip2HashToChainId',
        args: [h]
      }) as string;
      const data = await (publicClient as any)!.readContract({
        address: CHAIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'chainData',
        args: [id]
      });
      setByHashChainId(id);
      setByHashData(data as any);
      const notFound = !data?.chainName && String((data as any)?.rollupContract).toLowerCase() === '0x0000000000000000000000000000000000000000';
      setByHashExists(!notFound);
    } catch (e) {
      setByHashChainId('');
      setByHashData(null);
      setByHashExists(null);
    } finally {
      setLoadingHash(false);
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: 'Copied', description: `${label} copied to clipboard.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Could not copy to clipboard.' });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">
            CAIP-2 Maping
          </h1>
          <p className="text-foreground/90 text-md leading-relaxed">
            Use CAIP-2 attributes to link back to chain data —
            {' '}
            <a className="underline" href="/learn">Learn more</a>
          </p>
        </div>
        {/* Hash first */}
        <Card className="border border-primary/10">
          <CardHeader>
            <CardTitle>Lookup by CAIP-2 Hash</CardTitle>
            <CardDescription>32-byte hash</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="caip2hash">CAIP-2 Hash</Label>
              <Input id="caip2hash" placeholder="0x…" value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
            </div>
            <Button type="button" onClick={lookupByHash} disabled={loadingHash} aria-busy={loadingHash}>
              {loadingHash ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching…
                </>
              ) : (
                'Fetch Chain Data'
              )}
            </Button>
            {loadingHash ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : byHashExists === false ? (
              <div className="text-sm text-muted-foreground">No chain data found for this hash.</div>
            ) : byHashData ? (
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <strong>Chain ID (bytes32):</strong>
                  <code className="font-mono flex-1 break-all">{byHashChainId}</code>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/60"
                    onClick={() => copy(byHashChainId, 'Chain ID (bytes32)')}
                    aria-label="Copy chain id"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div><strong>Name:</strong> {byHashData.chainName}</div>
                <div><strong>Settlement Chain ID:</strong> {byHashData.settlementChainId?.toString?.() ?? String(byHashData.settlementChainId)}</div>
                <div><strong>Version:</strong> {byHashData.version}</div>
                <div><strong>Rollup Contract:</strong> {byHashData.rollupContract}</div>
                <div><strong>Namespace:</strong> {byHashData.chainNamespace}</div>
                <div><strong>Reference:</strong> {byHashData.chainReference}</div>
                <div><strong>Coin Type:</strong> {String(byHashData.coinType)}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Identifier second */}
        <Card className="border border-primary/10">
          <CardHeader>
            <CardTitle>Lookup by CAIP-2 Identifier</CardTitle>
            <CardDescription>Enter namespace:reference (e.g., eip155:1)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="caip2id">Identifier</Label>
              <Input id="caip2id" placeholder="e.g., eip155:1" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </div>
            <Button type="button" onClick={lookupByIdentifier} disabled={loadingId} aria-busy={loadingId}>
              {loadingId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching…
                </>
              ) : (
                'Fetch Chain Data'
              )}
            </Button>
            {loadingId ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : byIdExists === false ? (
              <div className="text-sm text-muted-foreground">No chain data found for this identifier.</div>
            ) : byIdData ? (
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <strong>Identifier:</strong>
                  <code className="font-mono flex-1 break-all">{identifier}</code>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/60"
                    onClick={() => copy(identifier, 'CAIP-2 identifier')}
                    aria-label="Copy CAIP-2 identifier"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div><strong>Name:</strong> {byIdData.chainName}</div>
                <div><strong>Settlement Chain ID:</strong> {byIdData.settlementChainId?.toString?.() ?? String(byIdData.settlementChainId)}</div>
                <div><strong>Version:</strong> {byIdData.version}</div>
                <div><strong>Rollup Contract:</strong> {byIdData.rollupContract}</div>
                <div><strong>Namespace:</strong> {byIdData.chainNamespace}</div>
                <div><strong>Reference:</strong> {byIdData.chainReference}</div>
                <div><strong>Coin Type:</strong> {String(byIdData.coinType)}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
