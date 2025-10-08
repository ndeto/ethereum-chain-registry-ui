"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePublicClient } from 'wagmi';
import type { Abi } from 'viem';
import { Interface, AbiCoder, getBytes, dnsEncode } from 'ethers';
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { CHAIN_RESOLVER_ABI } from '@/lib/abis';

const ReverseResolverForm: React.FC = () => {
  const { toast } = useToast();
  const publicClient = usePublicClient();

  const [chainIdHex, setChainIdHex] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string>('');
  const [hasResolved, setHasResolved] = useState<boolean>(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qChainId = params.get('chainId');
      const auto = params.get('auto');
      if (qChainId) {
        setChainIdHex(qChainId);
        if (auto && auto !== '0' && auto !== 'false') void handleReverse(qChainId);
      }
    } catch { }
  }, []);

  const handleReverse = async (chainIdIn?: string) => {
    const id = (chainIdIn ?? chainIdHex).trim();
    if (!/^0x[0-9a-fA-F]+$/.test(id)) {
      toast({ variant: 'destructive', title: 'Invalid Chain ID', description: 'Provide hex bytes prefixed with 0x.' });
      return;
    }
    // Generic upper bound for 7930 chain identifier (no address): 263 bytes (8 + 255)
    if (((id.length - 2) / 2) > 263) {
      toast({ variant: 'destructive', title: 'Too Long', description: 'Chain identifier may be at most 263 bytes.' });
      return;
    }

    const reverseAddr = CHAIN_RESOLVER_ADDRESS as string;
    const validReverse = typeof reverseAddr === 'string' && /^0x[a-fA-F0-9]{40}$/.test(reverseAddr) && reverseAddr !== '0x0000000000000000000000000000000000000000';
    if (!validReverse) {
      toast({ variant: 'destructive', title: 'Missing Resolver Address', description: 'Set NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS in env.' });
      return;
    }

    try {
      setResolvedName('');
      setHasResolved(false);
      setIsResolving(true);

      // ENSIP‑10: Reverse via data(node, keyString) with keyString = "chain-name:" + raw 7930 bytes
      // Build a latin-1 string carrying raw bytes for the key
      const hexFromLatin1 = (s: string) => '0x' + Array.from(s, (c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      const keyString = (() => {
        const prefix = 'chain-name:';
        const bytes = getBytes(id);
        let raw = '';
        for (let i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
        return prefix + raw;
      })();

      const dataIface = new Interface(['function data(bytes32,string) view returns (bytes)']);
      const zeroNode = ('0x' + '00'.repeat(32)) as `0x${string}`;
      const call = dataIface.encodeFunctionData('data(bytes32,string)', [zeroNode, keyString]);
      const dnsName = dnsEncode('x.cid.eth', 255) as `0x${string}`;

      const answer = await (publicClient as any)!.readContract({
        address: reverseAddr as `0x${string}`,
        abi: CHAIN_RESOLVER_ABI as unknown as Abi,
        functionName: 'resolve',
        args: [dnsName, call as `0x${string}`]
      }) as `0x${string}`;
      console.log('[reverse] resolve answer', answer);
      const [encoded] = (new Interface(['function data(bytes32,string) view returns (bytes)']).decodeFunctionResult('data(bytes32,string)', answer) as unknown as [`0x${string}`]);
      console.log('[reverse] decoded bytes result', encoded);

      let out = '';
      try {
        const decoded = AbiCoder.defaultAbiCoder().decode(['string'], encoded) as unknown as [string];
        [out] = decoded;
      } catch {
        const hex = (encoded as string).replace(/^0x/, '');
        out = Buffer.from(hex, 'hex').toString('utf8');
      }
      console.log('[reverse] decoded name', out);
      setResolvedName(out);
      setHasResolved(true);

      toast({ title: 'Reverse Resolved', description: 'Chain name resolved from chain ID.' });
    } catch (e: any) {
      console.error('[reverse] error', e);
      toast({ variant: 'destructive', title: 'Reverse Resolve Failed', description: e?.shortMessage || e?.reason || e?.message || 'Failed to reverse resolve chain ID.' });
      setHasResolved(false);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">Reverse Resolve Chain ID</h1>
          <p className="text-foreground/90 text-md leading-relaxed">Enter a chain identifier (hex bytes) to resolve its chain name.</p>
        </div>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle>Reverse Resolution</CardTitle>
            <CardDescription>Lookup chain label by its 7930 chain identifier</CardDescription>

          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="cid">Chain Identifier (hex bytes)</Label>
                <Input id="cid" placeholder="0x…" value={chainIdHex} onChange={(e) => setChainIdHex(e.target.value)} />
                <div className="text-xs text-muted-foreground">Hex. Example: 0x000000010001010a00</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleReverse()} disabled={isResolving} className="w-full">
                {isResolving ? 'Resolving…' : 'Reverse Resolve'}
              </Button>
            </div>

            {isResolving && (
              <div className="mt-4 p-4 rounded-md border border-primary/10 bg-secondary/30">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            )}

            {hasResolved && (
              <div className="mt-4 p-4 rounded-md border border-primary/10 bg-secondary/30">
                <div className="text-sm break-all">
                  <span>{chainIdHex}</span>
                  <span className="mx-2 opacity-70">→</span>
                  <span>{resolvedName || '—'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReverseResolverForm;
