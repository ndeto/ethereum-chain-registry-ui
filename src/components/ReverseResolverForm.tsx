"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePublicClient } from 'wagmi';
import type { Abi } from 'viem';
import { Interface, AbiCoder, getBytes, hexlify, concat } from 'ethers';
import { REVERSE_RESOLVER_ADDRESS } from '@/lib/addresses';

// Minimal ENSIP-10 surface
const REVERSE_ABI = [
  { type: 'function', name: 'resolve', stateMutability: 'view', inputs: [{ name: 'name', type: 'bytes' }, { name: 'data', type: 'bytes' }], outputs: [{ name: '', type: 'bytes' }] },
] as const;

const ReverseResolverForm: React.FC = () => {
  const { toast } = useToast();
  const publicClient = usePublicClient();

  const [chainIdHex, setChainIdHex] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string>('');

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

    const reverseAddr = REVERSE_RESOLVER_ADDRESS as string;
    const validReverse = typeof reverseAddr === 'string' && /^0x[a-fA-F0-9]{40}$/.test(reverseAddr) && reverseAddr !== '0x0000000000000000000000000000000000000000';
    if (!validReverse) {
      toast({ variant: 'destructive', title: 'Missing Reverse Resolver', description: 'Set NEXT_PUBLIC_REVERSE_RESOLVER_ADDRESS in env.' });
      return;
    }

    try {
      setResolvedName('');
      setIsResolving(true);

      // ENSIP‑10: Reverse via data(node=0x00, key = abi.encode('chain-name:') || chainIdBytes)
      const dataIface = new Interface(['function data(bytes32,bytes) view returns (bytes)']);
      const prefix = AbiCoder.defaultAbiCoder().encode(['string'], ['chain-name:']);
      const keyBytes = hexlify(concat([getBytes(prefix), getBytes(id)]));
      const call = dataIface.encodeFunctionData('data', ['0x' + '00'.repeat(32), keyBytes]);
      const answer = await (publicClient as any)!.readContract({
        address: reverseAddr as `0x${string}`,
        abi: REVERSE_ABI as unknown as Abi,
        functionName: 'resolve',
        args: ['0x00' as `0x${string}`, call as `0x${string}`]
      }) as `0x${string}`;
      const [encoded] = (new Interface(['function data(bytes32,bytes) view returns (bytes)']).decodeFunctionResult('data', answer) as unknown as [`0x${string}`]);

      let out = '';
      try {
        const decoded = AbiCoder.defaultAbiCoder().decode(['string'], encoded) as unknown as [string];
        [out] = decoded;
      } catch {
        const hex = (encoded as string).replace(/^0x/, '');
        out = Buffer.from(hex, 'hex').toString('utf8');
      }
      setResolvedName(out);

      // Do not modify URL params

      toast({ title: 'Reverse Resolved', description: 'Chain name resolved from chain ID.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Reverse Resolve Failed', description: e?.shortMessage || e?.reason || e?.message || 'Failed to reverse resolve chain ID.' });
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
            <CardTitle>Reverse Resolver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="cid">Chain Identifier (hex bytes)</Label>
                <Input id="cid" placeholder="0x…" value={chainIdHex} onChange={(e) => setChainIdHex(e.target.value)} />
                <div className="text-xs text-muted-foreground">Hex. Example: 0xb713303629cef791d2ec8cf052dcd6ce63ba8c6633290fe1cb82af3575375f22</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleReverse()} disabled={isResolving} className="w-full">
                {isResolving ? 'Resolving…' : 'Reverse Resolve'}
              </Button>
            </div>

            {resolvedName && (
              <div className="mt-4 p-4 rounded-md border border-primary/10 bg-secondary/30 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono break-all">{chainIdHex}</code>
                  <span className="opacity-70">→</span>
                  <code className="font-mono">{resolvedName || '—'}</code>
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
