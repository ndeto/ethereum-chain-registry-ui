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
          <h1 className="text-3xl font-semibold">Chain ID Registry Flow</h1>
          <p className="text-sm text-muted-foreground">Resolve first. Register/Assign when contributing.</p>
        </div>
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Resolve Popular Chains
            </CardTitle>
            <CardDescription>Jump in by resolving a known chain to its Chain ID.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href={`/resolve?label=${encodeURIComponent('optimism')}`} className="inline-block">
              <Button variant="secondary">optimism</Button>
            </Link>
            <Link href={`/resolve?label=${encodeURIComponent('arb1')}`} className="inline-block">
              <Button variant="secondary">arbitrum one</Button>
            </Link>
            <Link href={`/resolve?label=${encodeURIComponent('base')}`} className="inline-block">
              <Button variant="secondary">base</Button>
            </Link>
            <Link href="/resolve" className="inline-block ml-auto">
              <Button className="bg-primary text-primary-foreground">Go to Resolve</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Register ChainData
            </CardTitle>
            <CardDescription>
              Submit ChainData to compute the chain ID (bytes32).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="inline-block">
              <Button variant="secondary">Go to Register</Button>
            </Link>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
