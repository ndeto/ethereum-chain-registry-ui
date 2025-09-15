import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Link2, Hash, ArrowRight, Database, ShieldCheck } from 'lucide-react'
import ChainDataForm from '@/components/ChainDataForm'

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/10">
            <Hash className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Learn & References</span>
          </div>
          <h1 className="text-4xl font-bold text-primary">
            ERC‑7785: Reference Hub
          </h1>
          <p className="text-foreground/90 text-md leading-relaxed">
            Key specs, resolver docs, and interop resources mentioned across the app.
          </p>
        </div>

        {/* Overview (full‑width content) */}
        <section id="overview" className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Overview of the chain registration system
          </h2>
          <p className="text-sm text-muted-foreground">
            <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md">ERC‑7785</a>
            {' '}defines a deterministic 32‑byte chain identifier derived from a chain’s name and supporting attributes.
          </p>
          <p className="text-sm text-muted-foreground">
            This on‑chain Registry aims to replace
            {' '}<a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ethereum-lists/chains/tree/master/_data/chains">ethereum‑lists/chains</a>
            {' '}as the canonical source of chain metadata.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-primary/10 bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-primary" />
                <strong>Registry (IChainRegistry)</strong>
              </div>
              <div className="text-sm text-muted-foreground">
                Stores chain metadata (chain id, name); computes deterministic <code className="font-mono">bytes32</code> identifier.
                Functions: <code className="font-mono">register</code>, <code className="font-mono">demoRegister</code>, <code className="font-mono">chainData(bytes32)</code>.
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
            </div>
          </div>
          {/* Contracts & Repos placed before flow */}
          <div>
            <div className="font-medium mb-2">Contracts & Repos</div>
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
          </div>
          <div>
            <div className="font-medium mb-2">Flow through the contracts</div>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground/80">
              <li>
                Provide <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/interfaces/IChainRegistry.sol#L4">ChainData</a> (name, settlement chain ID, version, rollup contract, CAIP‑2 namespace/reference, coin type).
              </li>
              <li>
                Send a transaction to <code className="font-mono">register(ChainData)</code>; or use <code className="font-mono">demoRegister</code> to simulate.
              </li>
              <li>
                The Registry derives <code className="font-mono">bytes32 chainId</code> via <code className="font-mono">keccak256(abi.encode(...fields))</code>. Read via <code className="font-mono">chainData(chainId)</code>.
              </li>
              <li>
                In the Resolver, map a label to <code className="font-mono">chainId</code> using <code className="font-mono">assign</code>. Helpers: <code className="font-mono">computeNode</code> → <code className="font-mono">nodeToChainId</code>.
              </li>
              <li>
                Resolve reads: call <code className="font-mono">resolve(bytes,bytes)</code> (ENSIP‑10) with <code className="font-mono">text(node, "chain-id")</code>.
              </li>
            </ol>
          </div>
        </section>

        {/* CAIP-2 Context & Mapping */}
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              CAIP‑2 Context & Mapping
            </CardTitle>
            <CardDescription>How CAIP‑2 ties human names, identifiers, and registry data together.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md">CAIP‑2</a> identifier is the chain selector in the form
                <code className="font-mono"> namespace:reference </code>
                (for example, <code className="font-mono">eip155:1</code> for Ethereum mainnet). This page lets you:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Resolve a CAIP‑2 identifier to its ChainData via the registry.</li>
                <li>Reverse‑lookup from a CAIP‑2 hash to the chainId and ChainData.</li>
              </ul>
              <p>
                The <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md">CAIP‑2</a> identifier is already present in <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-7930">ERC‑7930</a> chain‑aware addresses. By incorporating it into the ERC‑7785 chain identifier, we get a direct way to map an <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-7930">ERC‑7930</a> binary address back to its network using the chain’s CAIP‑2 identifier, and then fetch the authoritative ChainData from the registry.
              </p>
              <p>
                Reference: <a
                  href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md#caip-2-and-caip-350-integration-in-erc-7785-chain-identifier"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  ERC‑7785: CAIP‑2 and CAIP‑350 integration
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Core specs */}
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

        {/* ENS */}
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

        {/* Interop */}
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


      </div>
    </main>
  )
}
