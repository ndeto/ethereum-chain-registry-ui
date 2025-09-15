"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Database, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function RegisterExplainer() {
  const [showOverview, setShowOverview] = useState(false);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Register: Learn → Simulate → Submit</span>
        </div>
        <h1 className="text-4xl font-bold text-primary">Register a chain</h1>
        <p className="text-foreground/90 text-lg leading-relaxed"><a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md">ERC‑7785</a> defines a deterministic 32‑byte chain identifier derived from a chain’s name (e.g., optimism) and supporting attributes. This page walks through how that identifier is computed during registration from the chain name and auxiliary inputs.</p>
        <p className="text-foreground/90 text-lg leading-relaxed">This on‑chain Registry is intended to replace decentralized chainlist repository <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ethereum-lists/chains/tree/master/_data/chains">ethereum‑lists/chains</a> and serve as the official, canonical source of chain metadata.</p>
      </div>

      {/* Overview */}
      <Card className="border border-primary/10 bg-background/50 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Overview of the chain registration system
            </CardTitle>
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={() => setShowOverview((v) => !v)}
              aria-expanded={showOverview}
              aria-controls="overview-content"
            >
              {showOverview ? 'Hide' : 'Learn more'}
            </Button>
          </div>
          <CardDescription>Two contracts power this system: the Registry (stores ChainData, computes ID) and the Resolver (maps names to IDs).</CardDescription>
        </CardHeader>
        <CardContent id="overview-content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-primary/10 bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-primary" />
                <strong>Registry (IChainRegistry)</strong>
              </div>
              <div className="text-sm text-muted-foreground">
                Stores chain metadata (chain id, name); computes deterministic <code className="font-mono">bytes32</code> identifier.
                Functions: <code className="font-mono">register</code>, <code className="font-mono">demoRegister</code>,
                <code className="font-mono"> chainData(bytes32)</code>.
              </div>
              <div className="text-xs mt-2 space-x-2">
                <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/ChainRegistry.sol">ChainRegistry.sol</a>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-primary/10 bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <strong>Resolver (ChainResolver)</strong>
              </div>
              <div className="text-sm text-muted-foreground">
                Maps human labels to identifiers; supports <code className="font-mono">resolve(bytes,bytes)</code> for reads.
                Helpers: <code className="font-mono">computeNode</code>, <code className="font-mono">nodeToChainId</code>, <code className="font-mono">assign</code>.
              </div>
              <div className="text-xs mt-2">
                <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/ChainResolver.sol">ChainResolver.sol</a>
              </div>
            </div>
          </div>

          {showOverview && (
            <div className="pt-1">
              <div className="font-medium mb-2">Flow through the contracts</div>
              <p className="text-sm text-muted-foreground mb-2">
                This page will cover the registration and registry process only. You can find more details on the resolver in the
                {' '}<Link href="/resolve" className="underline">Resolve</Link> section.
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground/80">
                <li>
                  Provide <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/interfaces/IChainRegistry.sol#L4">ChainData</a>
                  {' '}inputs (name, settlement chain ID, version, rollup contract, CAIP‑2 namespace/reference, coin type). More on these fields in the next section.
                </li>
                <li>
                  Send a transaction to <code className="font-mono">register(ChainData)</code>; the Registry will derive the
                  {' '}<code className="font-mono">chainId</code> for you. If you don’t want to register, use the
                  {' '}<code className="font-mono">Simulate</code> button to preview the identifier without a write.
                </li>
                <li>
                  The Registry derives <code className="font-mono">bytes32 chainId</code> via
                  {' '}<code className="font-mono">keccak256(abi.encode(...fields))</code>. Read back stored data with
                  {' '}<code className="font-mono">chainData(chainId)</code>.
                </li>
                <li>
                  In the Resolver, map a human label to the <code className="font-mono">chainId</code> using
                  {' '}<code className="font-mono">assign(label, chainId)</code>. Helpers:
                  {' '}<code className="font-mono">computeNode(label)</code> → <code className="font-mono">nodeToChainId(node)</code>.
                </li>
                <li>
                  Resolve reads: call <code className="font-mono">resolve(bytes,bytes)</code> (ENSIP‑10) with
                  {' '}<code className="font-mono">text(node, "chain-id")</code> to fetch the identifier. References:
                  {' '}<a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md">CAIP‑2</a>,
                  {' '}<a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-155">EIP‑155</a>.
                </li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Moved post-demo content to RegisterPostDemo */}
    </div>
  );
}
