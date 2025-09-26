# Ethereum Chain ID Registry — Demo

Minimal UI to register labels and resolve them via ENSIP‑10 resolvers.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Create `.env.local` from the example and set your contract addresses:

```
NEXT_PUBLIC_CHAIN_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS=0x...
NEXT_PUBLIC_REVERSE_RESOLVER_ADDRESS=0x...

# Optional, comma‑separated
NEXT_PUBLIC_SEPOLIA_RPC_URLS=https://ethereum-sepolia.publicnode.com,https://rpc.sepolia.org
```

All envs are client‑visible; do not put secrets here.

## Pages

- Register (`/` or `/register`)
  - Demo: calls `registry.demoRegister(...)` and `resolver.demoRegister(...)`.
- Resolve (`/resolve`)
  - Enter a label (e.g., `optimism`) to read the chain identifier.
  - Result includes a link to “Reverse Resolve”.
- Reverse (`/reverse`)
  - Enter a hex chain identifier to look up its label.
- Learn (`/learn`)
  - Pointers to ENS/IP specs used by the demo.

## Deployments

Use the deploy scripts in the Chain Registry repo, then set the env vars above:
https://github.com/unruggable-labs/chain-registry
