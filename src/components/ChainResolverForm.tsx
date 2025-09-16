"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePublicClient } from 'wagmi';
import { type Abi } from 'viem';
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { fetchChainDataById } from '@/lib/registry';
import { buildCaip2Identifier, computeCaip2HashOnChain } from '@/lib/caip2';
import { Loader2, Search } from 'lucide-react';
const RESOLVER = CHAIN_RESOLVER_ADDRESS as string;

// ChainResolver ABI subset per provided contract
const CHAIN_RESOLVER_ABI = [
  { type: 'function', name: 'computeNode', stateMutability: 'pure', inputs: [{ name: 'chainName', type: 'string' }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'function', name: 'nodeToChainId', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: '', type: 'bytes32' }] },
] as const;


const ChainResolverForm: React.FC = () => {
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const [inputName, setInputName] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [nodeHash, setNodeHash] = useState<string>('');
  const [resolvedChainId, setResolvedChainId] = useState<string>('');
  const [resolvedChainData, setResolvedChainData] = useState<any>(null);
  const [caip2Identifier, setCaip2Identifier] = useState<string>('');
  const [caip2Hash, setCaip2Hash] = useState<string>('');
  const [chainDataExists, setChainDataExists] = useState<boolean | null>(null);
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
      setResolvedChainData(null);
      setChainDataExists(null);
      setCaip2Identifier('');
      setCaip2Hash('');
      setNodeHash('');
      setResolvedChainId('');
      setShowInlineLoading(true);
      setTimeout(() => setShowInlineLoading(false), 800);

      setIsResolving(true);
      console.debug('[Resolver] computeNode(label)', { label: name });
      const node = await (publicClient as any)!.readContract({
        address: RESOLVER as `0x${string}`,
        abi: CHAIN_RESOLVER_ABI as unknown as Abi,
        functionName: 'computeNode',
        args: [name]
      }) as string;
      console.debug('[Resolver] computeNode result', { node });
      setNodeHash(node);
      console.debug('[Resolver] nodeToChainId(node)');
      const chainId = await (publicClient as any)!.readContract({
        address: RESOLVER as `0x${string}`,
        abi: CHAIN_RESOLVER_ABI as unknown as Abi,
        functionName: 'nodeToChainId',
        args: [node]
      }) as string;
      console.debug('[Resolver] nodeToChainId result', { chainId });
      setResolvedChainId(chainId);
      toast({ title: 'Resolved', description: 'Chain ID resolved via node mapping.' });

      // Update URL so the state can be shared/bookmarked
      try {
        const params = new URLSearchParams(window.location.search);
        params.set('label', name);
        params.set('auto', '1');
        params.set('chainId', chainId);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
      } catch { }

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

            {!isResolving && !showInlineLoading && resolvedChainId && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code>
                  <span className="opacity-70">→</span>
                  <code className="font-mono break-all">{resolvedChainId}</code>
                </div>

                {!chainDataExists && chainDataExists !== null ? (
                  <div className="text-sm text-muted-foreground">No chain data found for this chainId in the registry.</div>
                ) : resolvedChainData ? (
                  <div className="text-sm space-y-1 p-4 rounded-md border border-primary/10 bg-secondary/30">
                    <div><strong>Name:</strong> {resolvedChainData.chainName}</div>
                    <div><strong>Settlement Chain ID:</strong> {resolvedChainData.settlementChainId?.toString?.() ?? String(resolvedChainData.settlementChainId)}</div>
                    <div><strong>Version:</strong> {resolvedChainData.version}</div>
                    <div><strong>Rollup Contract:</strong> {resolvedChainData.rollupContract}</div>
                    <div><strong>Namespace:</strong> {resolvedChainData.chainNamespace}</div>
                    <div><strong>Reference:</strong> {resolvedChainData.chainReference}</div>
                    <div><strong>Coin Type:</strong> {String(resolvedChainData.coinType)}</div>
                    {(caip2Identifier && caip2Hash) && (
                      <div className="pt-2 text-xs text-muted-foreground space-y-1">
                        <div>
                          CAIP-2: <code className="font-mono">{caip2Identifier}</code>
                        </div>
                        <div>
                          Hash: <code className="font-mono">{caip2Hash}</code>
                        </div>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(window.location.href);
                            toast({ title: 'Link copied', description: 'URL copied to clipboard.' });
                          } catch { }
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                ) : null}
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
