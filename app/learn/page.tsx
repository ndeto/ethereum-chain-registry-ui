import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses'

export default function LearnPage() {
  return (
    <main className="bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">Ethereum Chain Resolver — Reference Hub</h1>
          <p className="text-foreground/90 text-s leading-relaxed">
            This app demos a unified resolver that maps a short label (like <code className="font-mono">base</code>)
            to an <a className="underline" href="https://eips.ethereum.org/EIPS/eip-7930" target="_blank" rel="noreferrer">ERC‑7930</a> chain ID and back again via <a className="underline" href="https://docs.ens.domains/ensip/10" target="_blank" rel="noreferrer">ENSIP‑10</a>.
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

        {/* Contracts – simplified cards */}
        <div className="space-y-6">
          {/* Unified Resolver overview */}
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Unified Resolver (ChainResolver.sol)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The unified resolver stores chain identifiers and label mappings and serves ENS records via <a className="underline" href="https://docs.ens.domains/ensip/10" target="_blank" rel="noreferrer">ENSIP‑10</a>.
                The mappings are keyed by the labelhash, where labelhash = keccak("optimism"). Read operations use the extended resolver entrypoint <code className="font-mono">resolve(bytes name, bytes data)</code>.
              </p>
              <div className="text-xs text-muted-foreground">
                Repo: <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/chain-resolver">unruggable-labs/chain-resolver</a>
              </div>
            </CardContent>
          </Card>

          {/* Forward Resolver */}
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Forward Resolver (ChainResolver.sol)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Read operations use <a className="underline" href="https://docs.ens.domains/ensip/10" target="_blank" rel="noreferrer">ENSIP‑10</a> <code className="font-mono">resolve(bytes name, bytes data)</code> so clients can call standard ENS selectors and pull chain metadata directly from the ENS name.
              </p>

              <ul className="list-disc pl-5 space-y-0.5">
                <li>Resolve function: <code className="font-mono">resolve(bytes name, bytes data) returns (bytes)</code></li>

                <li>
                  Reads (selectors):
                  <div className="mt-1 pl-4">
                    <div>
                      • <a className="underline" href="https://docs.ens.domains/ensip/5" target="_blank" rel="noreferrer">ENSIP‑5</a> <code className="font-mono">text(bytes32,string)</code> — special key <code className="font-mono">"chain-id"</code> returns the on‑chain 7930 bytes as a hex string (no <span className="font-mono">0x</span>), ignoring any user‑set text under that key (see also <a className="underline" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-18.md" target="_blank" rel="noreferrer">ENSIP‑TBD‑18</a>).
                    </div>
                    <div>
                      • <a className="underline" href="https://docs.ens.domains/ensip/9" target="_blank" rel="noreferrer">ENSIP‑9</a> <code className="font-mono">addr</code> — multi‑coin addresses (coinType 60 = ETH)
                    </div>
                    <div>
                      • <a className="underline" href="https://docs.ens.domains/ensip/7" target="_blank" rel="noreferrer">ENSIP‑7</a> <code className="font-mono">contenthash</code>
                    </div>
                    <div>
                      • Early draft <a className="underline" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-19.md" target="_blank" rel="noreferrer">ENSIP‑TBD‑19</a> <code className="font-mono">data(bytes32,bytes)</code> — used here for reverse with the <code className="font-mono">"chain-name:"</code> service key.
                    </div>
                  </div>
                </li>
                <li>Labelhash: compute <code className="font-mono">labelHash = keccak256(bytes(label))</code> for the left‑most label.</li>
                <li>Source of truth: values come from the resolver’s internal storage.</li>
                <li>Supports <code className="font-mono">addr</code>, <code className="font-mono">contenthash</code>, <code className="font-mono">text</code>, and <code className="font-mono">data</code>.</li>
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

          {/* Reverse path — same resolver */}
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Reverse (same resolver)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Reverse lookups use a service key (<a className="underline" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-17.md" target="_blank" rel="noreferrer">ENSIP‑TBD‑17</a>):
                <code className="font-mono"> key = bytes('chain-name:') || chainIdBytes</code> passed via <code className="font-mono">data(node, key)</code> (<a className="underline" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-19.md" target="_blank" rel="noreferrer">ENSIP‑TBD‑19</a>). The <code className="font-mono">text</code> path is also supported with <code className="font-mono">"chain-name:&lt;7930hex&gt;"</code>.
              </p>
              <p>Reverse resolution flow:</p>
              <div className="w-full overflow-hidden rounded-lg border border-primary/10 bg-muted/10 flex justify-center">
                <img src="/learn/reverseresolve.png" alt="Reverse Chain Resolution Flow" className="h-auto w-full sm:w-[80%] lg:w-[50%] xl:w-[40%]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Identifier size & demo limits */}
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Identifier Size & Demo Limits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>7930 theoretical maximum: 263 bytes total (8 bytes overhead + up to 255‑byte ChainRef; no address payload). See <a className="underline" href="https://eips.ethereum.org/EIPS/eip-7930" target="_blank" rel="noreferrer">EIP‑7930</a>.</li>
              <li>EVM maximum: 40 bytes (8 + 32). This aligns with <a className="underline" href="https://chainagnostic.org/CAIPs/caip-2" target="_blank" rel="noreferrer">CAIP‑2</a> (<code className="font-mono">eip155:&lt;id&gt;</code>), treating the chain ID integer as ≤ 32 bytes.</li>
              <li>Non‑EVM common case: most <a className="underline" href="https://chainagnostic.org/CAIPs/caip-2" target="_blank" rel="noreferrer">CAIP‑2</a> references are ≤ 32 bytes, so ≤ 40‑byte 7930 IDs are typical; 7930 still allows up to 263 bytes.</li>
              <li>Demo cap: this demo caps <code className="font-mono">chainId</code> at 40 bytes total for simplicity and interop.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Deployments */}
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle>Deployments (Sepolia)</CardTitle>
            <CardDescription>Canonical deployment addresses used across this app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <strong>ChainResolver:</strong>
                <a
                  href={`https://sepolia.etherscan.io/address/${CHAIN_RESOLVER_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {CHAIN_RESOLVER_ADDRESS}
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
                Chain Resolver — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/chain-resolver">GitHub repo</a>
              </li>
              <li>
                EIP‑7930 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-7930">Chain‑aware identifiers</a>
              </li>
              <li>
                CAIP‑2 — <a className="underline" target="_blank" rel="noreferrer" href="https://chainagnostic.org/CAIPs/caip-2">Blockchain ID mapping</a>
              </li>
              <li>
                ENSIP‑5 — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.ens.domains/ensip/5">Text record conventions</a>
              </li>
              <li>
                ENSIP‑7 — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.ens.domains/ensip/7">Contenthash records</a>
              </li>
              <li>
                ENSIP‑9 — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.ens.domains/ensip/9">Multi‑coin addresses</a>
              </li>
              <li>
                ENSIP‑10 — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.ens.domains/ensip/10">Extended resolver</a>
              </li>
              <li>
                ENSIP‑TBD‑17 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-17.md">Service Key Parameters (e.g., <code className="font-mono">chain-name:</code>)</a>
              </li>
              <li>
                ENSIP‑TBD‑18 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-18.md">Global <code className="font-mono">chain-id</code> text record</a>
              </li>
              <li>
                ENSIP‑TBD‑19 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-19.md"><code className="font-mono">data()</code> binary records</a>
              </li>
              <li>
                ENSIP‑11 — <a className="underline" target="_blank" rel="noreferrer" href="https://docs.ens.domains/ensip/11">Coin types and formats</a>
              </li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </main>

  )
}
