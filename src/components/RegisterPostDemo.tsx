"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, Link2 } from 'lucide-react';
import { CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';

export default function RegisterPostDemo() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border border-primary/10 bg-background/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Registry: Deployment & Spec
          </CardTitle>
          <CardDescription>Deployment link for the Registry, source code, and the ERC‑7785 spec.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <strong>Deployment:</strong>
            <a
              href={`https://sepolia.etherscan.io/address/${CHAIN_REGISTRY_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="underline break-all"
            >
              {CHAIN_REGISTRY_ADDRESS}
            </a>
          </div>
          <div>
            Spec: {' '}
            <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md">ERC‑7785</a>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-primary/10 bg-background/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Assign & Resolve
          </CardTitle>
          <CardDescription>After registering, map a label and resolve it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The resolver maps a human‑friendly label (e.g., <code className="font-mono">optimism.cid.eth</code>) to its ERC‑7785 chain identifier. {' '}
            For this resolver, we use <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ensdomains/docs/blob/master/ens-improvement-proposals/ensip-10.md">ENSIP‑10</a> {' '}
            <code className="font-mono">resolve(name, data)</code> with {' '}
            <code className="font-mono">data = encode(text(node, "chain-id"))</code>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/assign" className="inline-block">
              <Button variant="secondary">Go to Assign</Button>
            </Link>
            <Link href="/resolve" className="inline-block">
              <Button variant="secondary">Go to Resolve</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
