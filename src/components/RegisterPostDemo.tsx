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
            Resolve
          </CardTitle>
          <CardDescription>After registering, resolve your label to verify the mapping.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The resolver maps a human‑friendly label (e.g., <code className="font-mono">optimism.cid.eth</code>) to its 32‑byte chain identifier using {' '}
            <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ensdomains/docs/blob/master/ens-improvement-proposals/ensip-10.md">ENSIP‑10</a> <code className="font-mono">resolve(name, data)</code>. Examples:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc pl-6 space-y-1">
            <li>
              Text path (hex string): <code className="font-mono">data = encode(text(node, "chain-id"))</code>
            </li>
            <li>
              Data path (raw bytes): <code className="font-mono">data = encode(data(node, bytes("chain-id")))</code>
            </li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link href="/resolve" className="inline-block">
              <Button variant="secondary">Go to Resolve</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
