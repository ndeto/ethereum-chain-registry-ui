"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { fetchChainDataById } from '@/lib/registry';
import { buildCaip2Identifier, computeCaip2HashOnChain } from '@/lib/caip2';
import { Loader2, Search, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
const RESOLVER = CHAIN_RESOLVER_ADDRESS as string;

// ChainResolver ABI subset per provided contract
const CHAIN_RESOLVER_ABI = [
  { type: 'function', name: 'computeNode', stateMutability: 'pure', inputs: [{ name: 'chainName', type: 'string' }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'function', name: 'nodeToChainId', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: '', type: 'bytes32' }] },
] as const;


const ChainResolverForm: React.FC = () => {
  const { toast } = useToast();
  const [inputName, setInputName] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [nodeHash, setNodeHash] = useState<string>('');
  const [resolvedChainId, setResolvedChainId] = useState<string>('');
  const [resolvedChainData, setResolvedChainData] = useState<any>(null);
  const [caip2Identifier, setCaip2Identifier] = useState<string>('');
  const [caip2Hash, setCaip2Hash] = useState<string>('');
  const [chainDataExists, setChainDataExists] = useState<boolean | null>(null);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      console.debug('[Resolver] copied', label, value);
      toast({ title: 'Copied', description: `${label} copied to clipboard.` });
    } catch (e) {
      console.error('[Resolver] copy failed', e);
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Could not copy to clipboard.' });
    }
  };

  // No wallet connect logic needed on Resolver page.

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
    } catch {}
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
      setIsResolving(true);
      const { withSepoliaProvider } = await import('@/lib/rpc');
      const node: string = await withSepoliaProvider(async (provider) => {
        const resolver = new ethers.Contract(RESOLVER, CHAIN_RESOLVER_ABI, provider);
        console.debug('[Resolver] computeNode(label)', { label: name });
        return resolver.computeNode(name);
      });
      console.debug('[Resolver] computeNode result', { node });
      setNodeHash(node);
      console.debug('[Resolver] nodeToChainId(node)');
      const chainId: string = await withSepoliaProvider(async (provider) => {
        const resolver = new ethers.Contract(RESOLVER, CHAIN_RESOLVER_ABI, provider);
        return resolver.nodeToChainId(node);
      });
      console.debug('[Resolver] nodeToChainId result', { chainId });
      setResolvedChainId(chainId);
      toast({ title: 'Resolved', description: 'Chain ID resolved via node mapping.' });

      // Fetch chain data from Sepolia registry
      try {
        console.debug('[Resolver] registry.chainData for chainId', { chainId });
        const { data, exists } = await fetchChainDataById(chainId);
        console.debug('[Resolver] chainData (mapping getter)', data);
        setChainDataExists(exists);
        setResolvedChainData(data);
        if (exists) {
          const id = buildCaip2Identifier(data.chainNamespace, data.chainReference);
          const hash = await computeCaip2HashOnChain(data.chainNamespace, data.chainReference);
          setCaip2Identifier(id);
          setCaip2Hash(hash);
          console.debug('[Resolver] CAIP-2', { id, hash });
        } else {
          setCaip2Identifier('');
          setCaip2Hash('');
        }
      } catch (regErr: any) {
        console.error('[Resolver] chainDataFromId error', {
          code: regErr?.code,
          reason: regErr?.reason,
          shortMessage: regErr?.shortMessage,
          message: regErr?.message,
          data: regErr?.data,
          error: regErr,
        });
        if (regErr?.code === 'BAD_DATA' && (regErr?.value === '0x' || regErr?.info?.signature?.includes('chainData'))) {
          setChainDataExists(false);
          setResolvedChainData(null);
        } else {
          setChainDataExists(null);
        }
      }
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full">
            <Search className="h-5 w-5" />
            <span className="text-primary-foreground font-medium">Chain Name Resolver</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Resolve Chain Name</h1>
          <p className="text-muted-foreground text-lg">Enter a chain reference (e.g., base) to resolve its ERC-7785 chain ID. The full name will be label.cid.eth. Tip: Full flow starts with Register → Assign; this page is a quick resolver.</p>
        </div>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Popular Chains
            </CardTitle>
            <CardDescription>Quickly resolve common networks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { text: 'optimism', value: 'optimism' },
                { text: 'arbitrum one', value: 'arb1' },
                { text: 'base', value: 'base' },
              ].map((c) => (
                <Button
                  key={c.text}
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setInputName(c.value);
                    void handleResolve(c.value);
                  }}
                >
                  {c.text}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Resolver Input
            </CardTitle>
            <CardDescription>Lookup chain ID by label via computeNode + nodeToChainId.</CardDescription>
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

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Quick lookup:</strong> Uses public Sepolia RPCs (no wallet). Full flow: Register → Assign → Resolve.
              </div>
            </div>

            <Button type="button" onClick={() => handleResolve()} disabled={!inputName.trim() || isResolving} className="w-full bg-gradient-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3">
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

            {/* Wallet connection removed — public RPC resolve only */}
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Contracts</CardTitle>
            <CardDescription>Addresses used by this page (Sepolia).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <strong>Resolver:</strong>
                <a
                  href={`https://sepolia.etherscan.io/address/${CHAIN_RESOLVER_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {CHAIN_RESOLVER_ADDRESS}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {resolvedChainId && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Human Name → ERC-7785 Identifier
              </CardTitle>
              <CardDescription>Resolves human-friendly names to an ERC‑7785 chain identifier.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code>
                  <span className="opacity-70">→</span>
                  <code className="font-mono break-all">{resolvedChainId}</code>
                </div>
                <Badge variant="secondary" className="">Hash Length: 66 characters (0x + 64 hex)</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {nodeHash && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Namehash Result
              </CardTitle>
              <CardDescription>ENS-encoded node for <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="secondary" className="mb-2">Hash Length: 66 characters (0x + 64 hex)</Badge>
                <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg border border-primary/10">
                  <code className="flex-1 text-sm font-mono break-all text-foreground">{nodeHash}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {resolvedChainId && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Chain Data (from Registry)
              </CardTitle>
              <CardDescription>Fetched from Sepolia registry.</CardDescription>
            </CardHeader>
            <CardContent>
              {!chainDataExists && chainDataExists !== null ? (
                <div className="text-sm text-muted-foreground">No chain data found for this chainId in the registry.</div>
              ) : resolvedChainData ? (
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {resolvedChainData.chainName}</div>
                  <div><strong>Settlement Chain ID:</strong> {resolvedChainData.settlementChainId?.toString?.() ?? String(resolvedChainData.settlementChainId)}</div>
                  <div><strong>Version:</strong> {resolvedChainData.version}</div>
                  <div><strong>Rollup Contract:</strong> {resolvedChainData.rollupContract}</div>
                  <div><strong>Namespace:</strong> {resolvedChainData.chainNamespace}</div>
                  <div><strong>Reference:</strong> {resolvedChainData.chainReference}</div>
                  <div><strong>Coin Type:</strong> {String(resolvedChainData.coinType)}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Loading chain data…</div>
              )}
            </CardContent>
          </Card>
        )}

        {caip2Identifier && caip2Hash && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                CAIP-2 Attributes
              </CardTitle>
              <CardDescription>
                Derived from the resolved ChainData. See the reference:
                {' '}
                <a
                  href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md#caip-2-and-caip-350-integration-in-erc-7785-chain-identifier"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  CAIP-2 and CAIP-350 integration in ERC-7785
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <strong>Identifier:</strong>
                  <code className="font-mono break-all flex-1">{caip2Identifier}</code>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/60"
                    onClick={() => copy(caip2Identifier, 'CAIP-2 identifier')}
                    aria-label="Copy CAIP-2 identifier"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <strong>Hash:</strong>
                  <code className="font-mono break-all flex-1">{caip2Hash}</code>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/60"
                    onClick={() => copy(caip2Hash, 'CAIP-2 hash')}
                    aria-label="Copy CAIP-2 hash"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChainResolverForm;
