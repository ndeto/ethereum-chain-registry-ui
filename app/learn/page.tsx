import Providers from '@/providers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Link2, Hash } from 'lucide-react';

export default function LearnPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-5xl grid gap-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Learn & References</span>
            </div>
            <h1 className="text-3xl font-semibold">ERC‑7785: Reference Hub</h1>
            <p className="text-sm text-muted-foreground">Key specs, resolver docs, and interop resources mentioned across the app.</p>
          </div>

          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Core Specs & Proposals
              </CardTitle>
              <CardDescription>Standards that underpin the registry, resolver, and identifiers.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  ERC‑7785 Proposal — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md">Spec</a>
                </li>
                <li>
                  EIP‑155 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-155">Settlement chain IDs</a>
                </li>
                <li>
                  CAIP‑2 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md">Chain namespace and reference</a>
                </li>
                <li>
                  ERC‑7930 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-7930">Chain‑aware addresses</a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                ENS Resolvers
              </CardTitle>
              <CardDescription>Standards and patterns used for reads via ENS.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  ENSIP‑10 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ensdomains/docs/blob/master/ens-improvement-proposals/ensip-10.md">resolve(bytes name, bytes data)</a>
                </li>
                <li>
                  ENSIP‑11 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ensdomains/docs/blob/master/ens-improvement-proposals/ensip-11.md">Coin types and formats</a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Interop & OP Stack
              </CardTitle>
              <CardDescription>Optimism interop explainer.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  OP Docs — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.optimism.io/interop/explainer">Superchain interoperability</a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle>Contracts & Repos</CardTitle>
              <CardDescription>Reference implementations and sources used in this demo.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  Registry implementation — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry">erc-7785-registry</a>
                </li>
                <li>
                  ChainRegistry.sol — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/ChainRegistry.sol">source</a>
                </li>
                <li>
                  ChainResolver.sol — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/ChainResolver.sol">source</a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </Providers>
  );
}
