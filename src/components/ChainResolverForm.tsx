"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePublicClient } from 'wagmi';
import { type Abi } from 'viem';
import { ethers, Interface, dnsEncode, keccak256, toUtf8Bytes, AbiCoder, getBytes, hexlify, concat } from 'ethers';
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { CHAIN_RESOLVER_ABI } from '@/lib/abis';
import { Loader2, Search } from 'lucide-react';
const RESOLVER = CHAIN_RESOLVER_ADDRESS as string;

const ChainResolverForm: React.FC = () => {
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const [inputName, setInputName] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedChainIdHex, setResolvedChainIdHex] = useState<string>('');
  const [resolvedName, setResolvedName] = useState<string>('');
  const [showInlineLoading, setShowInlineLoading] = useState<boolean>(false);
  const [forwardTried, setForwardTried] = useState<boolean>(false);

  // Removed legacy copy helpers and sections for a leaner UI
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qLabel = params.get('label');
      const auto = params.get('auto');
      if (qLabel) {
        setInputName(qLabel.toLowerCase());
        if (auto && auto !== '0' && auto !== 'false') {
          // auto‑resolve when coming from Register/Test Resolution
          setTimeout(() => handleResolve(qLabel), 0);
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
      setForwardTried(false);
      // Forward mapping via ENSIP-10: resolver.resolve(dnsEncode, encode(text(node,"chain-id")))
      const labelHash = keccak256(toUtf8Bytes(name));
      const textIface = new Interface(['function text(bytes32,string) view returns (string)']);
      const callData = textIface.encodeFunctionData('text', [labelHash, 'chain-id']);
      const dnsName = dnsEncode(`${name}.cid.eth`, 255);
      const chainIdAnswer = await (publicClient as any)!.readContract({
        address: RESOLVER as `0x${string}`,
        abi: CHAIN_RESOLVER_ABI as unknown as Abi,
        functionName: 'resolve',
        args: [dnsName as unknown as `0x${string}`, callData as `0x${string}`]
      }) as `0x${string}`;
      // ethers v6 returns a Result type; cast via unknown to satisfy TS
      const [hexNo0x] = (textIface.decodeFunctionResult('text', chainIdAnswer) as unknown as [string]);
      // Treat empty, '0x', or non-hex strings as not registered
      const isHex = typeof hexNo0x === 'string' && /^[0-9a-fA-F]+$/.test(hexNo0x);
      if (!hexNo0x || hexNo0x.length === 0 || !isHex) {
        // No record found for this label
        setResolvedChainIdHex('');
        setForwardTried(true);
        setIsResolving(false);
        return;
      }
      const chainIdHex = `0x${hexNo0x}`;
      setResolvedChainIdHex(chainIdHex);
      setForwardTried(true);
      toast({ title: 'Resolved', description: 'Chain ID resolved via resolver.' });

      // Do not mutate URL; params are only used when arriving from Register

      // Reverse mapping via the same resolver: data(bytes32,bytes) with key = abi.encode("chain-name:") || chainIdBytes
      try {
        const reverseAddr = RESOLVER as string;
        if (reverseAddr && /^0x[a-fA-F0-9]{40}$/.test(reverseAddr) && reverseAddr !== '0x0000000000000000000000000000000000000000') {
          const prefix = AbiCoder.defaultAbiCoder().encode(['string'], ['chain-name:']);
          const keyBytes = hexlify(concat([getBytes(prefix), getBytes(chainIdHex)]));
          const dataIface = new Interface(['function data(bytes32,bytes) view returns (bytes)']);
          const call = dataIface.encodeFunctionData('data', ['0x' + '00'.repeat(32), keyBytes]);
          const revAns = await (publicClient as any)!.readContract({
            address: reverseAddr as `0x${string}`,
            abi: CHAIN_RESOLVER_ABI as unknown as Abi,
            functionName: 'resolve',
            args: ['0x00' as `0x${string}`, call as `0x${string}`]
          }) as `0x${string}`;
          const [encoded] = (new Interface(['function data(bytes32,bytes) view returns (bytes)']).decodeFunctionResult('data', revAns) as unknown as [`0x${string}`]);
          let nameOut = '';
          try {
            const decodedName = AbiCoder.defaultAbiCoder().decode(['string'], encoded) as unknown as [string];
            [nameOut] = decodedName;
          } catch {
            const hex = (encoded as string).replace(/^0x/, '');
            nameOut = Buffer.from(hex, 'hex').toString('utf8');
          }
          setResolvedName(nameOut);
        }
      } catch { }
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
    <div className="bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">Resolve Chain Name</h1>
          <p className="text-foreground/90 text-md leading-relaxed">Enter a chain reference (e.g., base) to resolve its chain ID.</p>
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
                  <Input
                    id="chainRef"
                    placeholder="e.g., base"
                    value={inputName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setInputName(v);
                      if (resolvedChainIdHex || resolvedName) {
                        setResolvedChainIdHex('');
                        setResolvedName('');
                      }
                    }}
                    className="pr-20"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground pointer-events-none">.cid.eth</span>
                </div>
                <div className="text-xs text-muted-foreground">Full name: <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code></div>
              </div>
            </div>
            <Button type="button" onClick={() => handleResolve()} disabled={!inputName.trim() || isResolving} className="w-full bg-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3 disabled:cursor-not-allowed">
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

            {!isResolving && !showInlineLoading && forwardTried && (
              <div className="mt-4 space-y-4">
                {resolvedChainIdHex && resolvedChainIdHex !== '0x' ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code>
                      <span className="opacity-70">→</span>
                      <Link href={`/reverse?chainId=${encodeURIComponent(resolvedChainIdHex)}&auto=1`} className="underline">
                        <code className="font-mono break-all">{resolvedChainIdHex}</code>
                      </Link>
                    </div>
                    {resolvedName && (
                      <div className="text-sm text-muted-foreground">Name: <code className="font-mono">{resolvedName}</code></div>
                    )}
                    <div className="pt-1 space-y-1">
                      <Link href={`/reverse?chainId=${encodeURIComponent(resolvedChainIdHex)}&auto=1`} className="inline-block">
                        <Button variant="secondary">Reverse Resolve</Button>
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        Opens the Reverse page to look up the human‑readable label from this chain identifier.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">This isn’t a registered label.</div>
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
