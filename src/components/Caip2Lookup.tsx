"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { CHAIN_REGISTRY_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';
import { withSepoliaProvider } from '@/lib/rpc';
import { fetchChainDataById, fetchChainDataFromCaip2 } from '@/lib/registry';

export default function Caip2Lookup() {
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [byIdData, setByIdData] = useState<any>(null);
  const [byIdExists, setByIdExists] = useState<boolean | null>(null);
  const [byHashData, setByHashData] = useState<any>(null);
  const [byHashExists, setByHashExists] = useState<boolean | null>(null);
  const [byHashChainId, setByHashChainId] = useState<string>('');

  const lookupByIdentifier = async () => {
    const parts = identifier.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setByIdExists(null);
      setByIdData(null);
      return;
    }
    const [ns, ref] = parts;
    try {
      const [exists, data] = await fetchChainDataFromCaip2(ns, ref);
      setByIdExists(Boolean(exists));
      setByIdData(data);
    } catch (e) {
      setByIdExists(null);
      setByIdData(null);
    }
  };

  const lookupByHash = async () => {
    const h = hashInput.trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(h)) {
      setByHashChainId('');
      setByHashData(null);
      setByHashExists(null);
      return;
    }
    try {
      const { chainId, data } = await withSepoliaProvider(async (provider) => {
        const registry = new ethers.Contract(
          CHAIN_REGISTRY_ADDRESS,
          [
            { type: 'function', name: 'caip2HashToChainId', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: '', type: 'bytes32' }] },
            ...CHAIN_REGISTRY_ABI,
          ] as const,
          provider
        );
        const id: string = await registry.caip2HashToChainId(h);
        const { data } = await fetchChainDataById(id);
        return { chainId: id, data };
      });
      setByHashChainId(chainId);
      setByHashData(data);
      const notFound = !data?.chainName && String(data?.rollupContract).toLowerCase() === '0x0000000000000000000000000000000000000000';
      setByHashExists(!notFound);
    } catch (e) {
      setByHashChainId('');
      setByHashData(null);
      setByHashExists(null);
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
        {/* Hash first */}
        <Card className="bg-gradient-card shadow-card border border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Lookup by CAIP-2 Hash</CardTitle>
            <CardDescription>Enter 32-byte hash (0x + 64 hex)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="caip2hash">CAIP-2 Hash</Label>
              <Input id="caip2hash" placeholder="0x…" value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
            </div>
            <Button type="button" onClick={lookupByHash}>Fetch Chain Data</Button>
            {byHashExists === false ? (
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
        <Card className="bg-gradient-card shadow-card border border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Lookup by CAIP-2 Identifier</CardTitle>
            <CardDescription>Enter namespace:reference (e.g., eip155:1)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="caip2id">Identifier</Label>
              <Input id="caip2id" placeholder="e.g., eip155:1" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </div>
            <Button type="button" onClick={lookupByIdentifier}>Fetch Chain Data</Button>
            {byIdExists === false ? (
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

        <Card className="bg-gradient-card shadow-card border border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              CAIP‑2 Context & Mapping
            </CardTitle>
            <CardDescription>
              How CAIP‑2 ties human names, identifiers, and registry data together.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The CAIP‑2 identifier is the chain selector in the form
                <code className="font-mono"> namespace:reference </code>
                (for example, <code className="font-mono">eip155:1</code> for Ethereum mainnet). This page lets you:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Resolve a CAIP‑2 identifier to its ChainData via the registry.</li>
                <li>Reverse‑lookup from a CAIP‑2 hash to the chainId and ChainData.</li>
              </ul>
              <p>
                The CAIP‑2 identifier is already present in ERC‑7930 chain‑aware addresses. By incorporating
                it into the ERC‑7785 chain identifier, we get a direct way to map an ERC‑7930 binary
                address back to its network using the chain’s CAIP‑2 identifier, and then fetch the
                authoritative ChainData from the registry.
              </p>
              <p>
                Reference:
                {' '}
                <a
                  href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md#caip-2-and-caip-350-integration-in-erc-7785-chain-identifier"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  ERC-7785: CAIP-2 and CAIP-350 integration
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
