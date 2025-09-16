"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';

export default function RegisterPostDemo() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Deployment moved to Learn page: Deployments */}

      <Card className="border border-primary/10 bg-background/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
