import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Database, Link2Icon } from 'lucide-react'
import { CHAIN_REGISTRY_ADDRESS, CHAIN_RESOLVER_ADDRESS, REVERSE_RESOLVER_ADDRESS } from '@/lib/addresses'

export default function LearnPage() {
  return (
    <main className="bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">Register & Resolve — Reference Hub</h1>
          <p className="text-foreground/90 text-md leading-relaxed">A minimal on‑chain system that maps human labels to chain identifiers and back, using a Registry and ENSIP‑10 resolvers.</p>
        </div>

        {/* Docs layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
          <aside className="md:sticky md:top-16 h-max border border-primary/10 rounded-lg bg-background/50 p-3 text-sm">
            <div className="font-semibold text-foreground/90 mb-2">On this page</div>
            <nav className="space-y-1">
              <a href="#overview" className="block rounded px-2 py-1 hover:bg-primary/10 hover:text-primary">Overview</a>
              <a href="#deployments" className="block rounded px-2 py-1 hover:bg-primary/10 hover:text-primary">Deployments</a>
              <a href="#core-specs" className="block rounded px-2 py-1 hover:bg-primary/10 hover:text-primary">Core Specs</a>
              <a href="#ens" className="block rounded px-2 py-1 hover:bg-primary/10 hover:text-primary">ENS Resolvers</a>
              <a href="#interop" className="block rounded px-2 py-1 hover:bg-primary/10 hover:text-primary">Interop</a>
            </nav>
          </aside>
          <div className="space-y-8">
        {/* Overview */}
        <section id="overview" className="space-y-4 scroll-mt-24">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Overview
          </h2>
          <p className="text-sm text-muted-foreground">Three contracts work together to provide forward and reverse lookups:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-primary/10 bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-primary" />
                <strong>Registry (IChainRegistry)</strong>
              </div>
              <div className="text-sm text-muted-foreground">
                Minimal read surface for resolution. Keys by <code className="font-mono">labelhash</code> (keccak256(bytes(label))).
                Exposed reads:
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li><code className="font-mono">chainId(bytes32 labelHash)</code> → <code className="font-mono">bytes</code></li>
                  <li><code className="font-mono">chainName(bytes chainIdBytes)</code> → <code className="font-mono">string</code></li>
                </ul>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-primary/10 bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <Link2Icon className="h-4 w-4 text-primary" />
                <strong>Forward Resolver (ChainResolver)</strong>
              </div>
              <div className="text-sm text-muted-foreground">
                Resolves a label’s node to its chain‑id via <code className="font-mono">resolve(bytes name, bytes data)</code> (ENSIP‑10).
                Two paths: <code className="font-mono">text(node,"chain-id")</code> (hex string) and <code className="font-mono">data(node,bytes("chain-id"))</code> (raw bytes).
              </div>
            </div>
            <div className="p-3 rounded-lg border border-primary/10 bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <Link2Icon className="h-4 w-4 text-primary" />
                <strong>Reverse Resolver (ReverseChainResolver)</strong>
              </div>
              <div className="text-sm text-muted-foreground">
                Resolves a chain‑id back to the chain name using <code className="font-mono">"chain-name:"</code> keys with <code className="font-mono">resolve</code>. Binary‑safe path: <code className="font-mono">data(node, abi.encode("chain-name:") || chainIdBytes)</code>.
              </div>
            </div>
          </div>
        </section>


        {/* Deployments (single source of truth) */}
        <section id="deployments" className="scroll-mt-24">
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle>Deployments (Sepolia)</CardTitle>
            <CardDescription>Canonical deployment addresses used across this app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <strong>Registry:</strong>
                <a
                  href={`https://sepolia.etherscan.io/address/${CHAIN_REGISTRY_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {CHAIN_REGISTRY_ADDRESS}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <strong>Forward Resolver:</strong>
                <a
                  href={`https://sepolia.etherscan.io/address/${CHAIN_RESOLVER_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {CHAIN_RESOLVER_ADDRESS}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <strong>Reverse Resolver:</strong>
                <a
                  href={`https://sepolia.etherscan.io/address/${REVERSE_RESOLVER_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {REVERSE_RESOLVER_ADDRESS}
                </a>
              </div>
              {/* CAIP-2 removed in this demo */}
            </div>
          </CardContent>
        </Card>
        </section>

        {/* Core specs */}
        <section id="core-specs" className="scroll-mt-24">
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Core Specs & Proposals
            </CardTitle>
            <CardDescription>Standards that underpin the registry, resolver, and identifiers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                ERC‑7785 Proposal — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7785.md">Spec</a>
              </li>
              <li>
                Modified ERC‑7785 Proposal. This registry is based on this <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/ERCs/blob/1ecc8b7195af98804c45f2c8c669571e11f288b5/ERCS/erc-7785.md">Spec</a> — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/ERCs/pull/1">Pull Request</a>
              </li>
              <li>
                EIP‑155 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-155">Settlement chain IDs</a>
              </li>
              {/* CAIP‑2 removed */}
              <li>
                ERC‑7930 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-7930">Chain‑aware addresses</a>
              </li>
            </ul>
          </CardContent>
        </Card>
        </section>

        {/* ENS */}
        <section id="ens" className="scroll-mt-24">
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
        </section>

        {/* Interop */}
        <section id="interop" className="scroll-mt-24">
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
        </section>
          </div>
        </div>

      </div>
    </main>
  )
}
