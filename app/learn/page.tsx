import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Database, Link2Icon } from 'lucide-react'
import { CHAIN_REGISTRY_ADDRESS, CHAIN_RESOLVER_ADDRESS, REVERSE_RESOLVER_ADDRESS } from '@/lib/addresses'

export default function LearnPage() {
  return (
    <main className="bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">Ethereum Chain Registry — Reference Hub</h1>
          <p className="text-foreground/90 text-s leading-relaxed">
            This app demos an on-chain registry for mapping a short label (like <code className="font-mono">base</code>)
            to an ERC‑7930 chain identifier and back again. It uses a Registry for storage and two ENSIP‑10 resolvers for reads.
          </p>
          <p className="text-xs text-muted-foreground">
            Looking for a deeper dive? Read the contracts README{' '}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/unruggable-labs/chain-registry#readme"
            >
              on GitHub
            </a>
            .
          </p>
        </div>

        {/* Architecture overview */}
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" /> Architecture Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden rounded-lg border border-primary/10 bg-muted/10 flex justify-center">
              <img
                src="/learn/contractflow.png"
                alt="Chain Resolving Topology"
                className="h-auto w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contracts – simplified cards */}
        <div className="space-y-6">
          {/* Registry */}
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Registry (ChainRegistry.sol)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>The chain registry stores chain IDs and their label mappings. Its interface must expose two functions to interoperate with the resolvers.</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li><code className="font-mono">chainId(bytes32 labelHash)</code> → <code className="font-mono">bytes</code></li>
                <li><code className="font-mono">chainName(bytes chainIdBytes)</code> → <code className="font-mono">string</code></li>
              </ul>
              <p className="opacity-80">That’s all the Registry needs to support forward and reverse lookups.</p>
              <div className="text-xs text-muted-foreground">
                Repo: <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/chain-registry">unruggable-labs/chain-registry</a>
              </div>
            </CardContent>
          </Card>

          {/* Forward Resolver */}
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Forward Resolver (ChainResolver.sol)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
                          <p>This is a fully featured ENS resolver that can resolve chain IDs from chain labels. In accordance with ENSIP-10, it implements the resolve () function.</p>

              <ul className="list-disc pl-5 space-y-0.5">
                <li>Resolve function: <code className="font-mono">resolve(bytes name, bytes data) returns (bytes)</code></li>
                
                <li>
                  Reads:
                  <div className="mt-1 pl-4">
                    <div>
                      • <code className="font-mono">text(labelhash, 'chain-id')</code> → <span className="font-mono">string</span> hex (no <span className="font-mono">0x</span>) — introduced by
                      <a className="underline ml-1" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-18.md" target="_blank" rel="noreferrer">ENSIP‑TBD‑18</a>
                    </div>
                    <div>
                      • <code className="font-mono">data(labelhash, bytes('chain-id'))</code> → raw <span className="font-mono">bytes</span> — introduced by
                      <a className="underline ml-1" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-19.md" target="_blank" rel="noreferrer">ENSIP‑TBD‑19</a>
                    </div>
                  </div>
                </li>
                <li>Labelhash: <code className="font-mono">labelhash = keccak256(bytes('&lt;label&gt;'))</code></li>
                <li>Source of truth: values always come from the Registry (stored records ignored).</li>
                <li>Also supports the full suite of ENS selectors like addresses, multi-coin addresses, content hashes, text records.</li>
              </ul>
              <p>Forward resolution flow:</p>
              <div className="w-full overflow-hidden rounded-lg border border-primary/10 bg-muted/10 flex justify-center">
                <img
                  src="/learn/resolve.png"
                  alt="Forward Chain Resolution Flow"
                  className="h-auto w-full sm:w-[80%] lg:w-[50%] xl:w-[40%]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reverse Resolver */}
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Reverse Resolver (ReverseChainResolver.sol)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                In the ReverseChainResolver (ENSIP‑10 wildcard), clients call
                <code className="font-mono"> resolve(bytes name, bytes data)</code> using the text record
                <code className="font-mono"> "chain-name:&lt;chainId&gt;"</code> to reverse an ERC‑7930 chain identifier into its human‑readable label.
              </p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  Text path: <code className="font-mono">"chain-name:" + ascii(chainIdString)</code> — adopts Service Key Parameters from
                  <a className="underline ml-1" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-17.md" target="_blank" rel="noreferrer">ENSIP‑TBD‑17</a>
                </li>

              </ul>
              <p>Reverse resolution flow:</p>
              <div className="w-full overflow-hidden rounded-lg border border-primary/10 bg-muted/10 flex justify-center">
                <img
                  src="/learn/reverseresolve.png"
                  alt="Reverse Chain Resolution Flow"
                  className="h-auto w-full sm:w-[80%] lg:w-[50%] xl:w-[40%]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deployments */}
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
            </div>
          </CardContent>
        </Card>

        {/* References */}
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle>References</CardTitle>
            <CardDescription>Standards that underpin the registry and resolvers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                Chain Registry — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/chain-registry">GitHub repo</a>
              </li>
              <li>
                ENSIP‑5 — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.ens.domains/ens-improvement-proposals/ensip-5-text-records">Text record conventions</a>
              </li>
              <li>
                EIP‑155 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-155">Settlement chain IDs</a>
              </li>
              <li>
                ERC‑7930 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-7930">Chain‑aware addresses</a>
              </li>
              <li>
                ENSIP‑TBD‑17 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-17.md">Service Key Parameters (reverse)</a>
              </li>
              <li>
                ENSIP‑TBD‑18 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-18.md">Global chain‑id text record</a>
              </li>
              <li>
                ENSIP‑TBD‑19 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-19.md">Binary data() for chain IDs</a>
              </li>
              <li>
                ENSIP‑10 — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.ens.domains/ens-improvement-proposals/ensip-10-multi-coin-support">resolve(bytes name, bytes data)</a>
              </li>
              <li>
                ENSIP‑11 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ensdomains/docs/blob/master/ens-improvement-proposals/ensip-11.md">Coin types and formats</a>
              </li>
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
