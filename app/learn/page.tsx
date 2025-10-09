import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses'

export default function LearnPage() {
  return (
    <main className="bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">
            Chain Resolver — Reference Hub
          </h1>
          <p className="text-foreground/90 text-sm leading-relaxed">
            This app demos a unified resolver that maps a short label (like{" "}
            <code className="font-mono">base</code>) to an{" "}
            <a
              className="underline"
              href="https://eips.ethereum.org/EIPS/eip-7930"
              target="_blank"
              rel="noreferrer"
            >
              ERC-7930
            </a>{" "}
            chain identifier and back again via{" "}
            <a
              className="underline"
              href="https://docs.ens.domains/ensip/10"
              target="_blank"
              rel="noreferrer"
            >
              ENSIP-10
            </a>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Looking for a deeper dive? Read the contracts README{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/unruggable-labs/chain-resolver#readme"
            >
              on GitHub
            </a>
            .
          </p>
        </div>

        {/* Contracts – simplified cards */}
        <div className="space-y-6"> {/* Unified Resolver */}
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Unified Resolver (ChainResolver.sol)
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                The unified resolver stores chain identifiers and label mappings (
                <a className="underline" href="#eip-7930">see 7930 chain identifier</a>
                ).
              </p>
              <p>
                It implements{" "}
                <a
                  className="underline"
                  href="https://docs.ens.domains/ensip/10"
                  target="_blank"
                  rel="noreferrer"
                >
                  ENSIP-10
                </a>, meaning read operations use the extended resolver entrypoint{" "}
                <code className="font-mono">resolve(bytes name, bytes data)</code>.
              </p>
              <p>
                Mappings are keyed by labelhash, computed as{" "}
                <code className="font-mono">labelhash = keccak256(bytes(label))</code>{" "}
                for the left‑most label (e.g., <code className="font-mono">label = "optimism"</code>).
              </p>

              {/* Combined forward + reverse flow diagram */}
              <div className="w-full overflow-hidden rounded-lg border border-primary/10 bg-muted/10 flex justify-center">
                <img
                  src="/learn/resolutionflow.png"
                  alt="Forward and Reverse Resolution Flow"
                  loading="lazy"
                  className="h-auto w-full sm:w-[80%] lg:w-[60%] xl:w-[50%]"
                />
              </div>

              {/* Forward */}
              <section className="space-y-2">
                <div className="font-semibold text-foreground">Forward Resolution</div>
                <p className="text-muted-foreground">
                  The ENS field <code className="font-mono">text(..., "chain-id")</code> (see{" "}
                  <a
                    className="underline"
                    href="https://docs.ens.domains/ensip/5"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ENSIP-5
                  </a>
                  ) returns the chain’s 7930 ID as a hex string. This value is written at registration by the
                  contract owner (e.g., a multisig) and the resolver ignores any user-set text under that key. To
                  resolve a chain ID:
                </p>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>
                    DNS-encode the ENS name (e.g.,{" "}
                    <code className="font-mono">optimism.cid.eth</code>).
                  </li>
                  <li>
                    Compute{" "}
                    <code className="font-mono">
                      labelhash = keccak256(bytes(label))
                    </code>{" "}
                    (e.g., <code className="font-mono">label = "optimism"</code>).
                  </li>
                  <li>
                    Calls{" "}
                    <ul>
                      <li>
                        <code className="font-mono">
                          resolve(name, encode(text(labelhash,"chain-id")))
                        </code>
                      </li>
                      <li>
                        <code className="font-mono">
                          resolve(name, encode(data(labelhash,"chain-id")))
                        </code>
                      </li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* Reverse */}
              <section className="space-y-2">
                <div className="font-semibold text-foreground">Reverse Resolution</div>
                <p className="text-muted-foreground">
                  Reverse lookups use ENS text records. Build a key prefixed with
                  <code className="font-mono">"chain-name:"</code> and suffixed with the 7930 hex, then call
                  <code className="font-mono"> text(bytes32,string) </code> via the Extended Resolver. This
                  follows service key parameters per{" "}
                  <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-17.md">ENSIP‑TBD‑17</a>.
                  For example:
                </p>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>
                    textKey (string):{" "}
                    <code className="font-mono">"chain-name:" + &lt;7930-hex&gt;</code>
                  </li>
                  <li>
                    Calls:
                    <div className="mt-1 pl-4">
                      <div>
                        •{" "}
                        <code className="font-mono">
                          resolve(name, encode(text(labelhash, serviceKey)))
                        </code>
                      </div>
                    </div>
                  </li>
                </ul>
              </section>

              <div className="text-xs text-muted-foreground">
                Repo:{" "}
                <a
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/unruggable-labs/chain-resolver"
                >
                  unruggable-labs/chain-resolver
                </a>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* 7930 Chain Identifier */}
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle id="eip-7930" className="flex items-center gap-2">
              7930 Chain Identifier
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              We use the chain identifier with a zero address from{" "}
              <a
                className="underline"
                href="https://eips.ethereum.org/EIPS/eip-7930"
                target="_blank"
                rel="noreferrer"
              >
                ERC-7930
              </a>
              . It’s a compact blob that includes a chain type and a short reference.
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>
                EVM chains: the reference is the{" "}
                <a
                  className="underline"
                  href="https://chainagnostic.org/CAIPs/caip-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  CAIP-2
                </a>{" "}
                <code className="font-mono">eip155:&lt;id&gt;</code> chain number, written as bytes. We
                treat that number as ≤ 32 bytes, so the total identifier is ≤ 40 bytes (8 bytes
                overhead + up to 32 for the ID).
              </li>
              <li>
                Most non-EVM chains: their CAIP-2 references are also short in practice, so
                identifiers are typically ≤ 40 bytes too.
              </li>
              <li>
                Full spec limit: the generic ERC-7930 format allows up to 263 bytes in total.
              </li>
            </ul>

            <p className="text-xs text-muted-foreground">
              More details and examples: {" "}
              <a
                className="underline"
                target="_blank"
                rel="noreferrer"
                href="https://github.com/unruggable-labs/chain-resolver"
              >
                chain-resolver README
              </a>
            </p>
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
                ERC‑7930 — <a className="underline" target="_blank" rel="noreferrer" href="https://eips.ethereum.org/EIPS/eip-7930">Chain‑aware addresses (used here for chain identifiers)</a>
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
                ENSIP‑TBD‑19 — <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/nxt3d/ensips/blob/ensip-ideas/ensips/ensip-TBD-19.md"><code className="font-mono">data()</code> records</a>
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
