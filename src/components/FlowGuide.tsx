"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash, ShieldCheck, Search } from 'lucide-react';

export default function FlowGuide() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">ERC-7785 Flow</h1>
          <p className="text-sm text-muted-foreground">Register → Assign → Resolve (optionally with CAIP‑2)</p>
        </div>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              1) Register ChainData
            </CardTitle>
            <CardDescription>
              Submit ChainData to compute the ERC‑7785 chainId (bytes32).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register" className="inline-block">
              <Button>Go to Register</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              2) Assign Label → ID
            </CardTitle>
            <CardDescription>
              Map a human label (e.g., base) to the chainId in the resolver.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/assign" className="inline-block">
              <Button>Go to Assign</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              3) Resolve + CAIP‑2
            </CardTitle>
            <CardDescription>
              Resolve a label to its chainId and ChainData; inspect CAIP‑2.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/resolve" className="inline-block">
              <Button variant="secondary">Go to Resolve</Button>
            </Link>
            <Link href="/caip2" className="inline-block">
              <Button variant="secondary">Go to CAIP‑2</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
