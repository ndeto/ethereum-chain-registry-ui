# Ethereum Chain Resolver — Demo

Minimal UI to register labels and resolve them via the unified ENSIP‑10 resolver.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Create `.env.local` from the example and set your contract address:

```
NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS=0x...
```

All envs are client‑visible; do not put secrets here.

## Pages

- Register (`/` or `/register`)
  - Calls `resolver.register(name, owner, chainIdBytes)`.
- Resolve (`/resolve`)
  - Enter a label (e.g., `optimism`) to read the chain identifier.
  - Result includes a link to “Reverse Resolve”.
- Reverse (`/reverse`)
  - Enter a hex chain identifier to look up its label.
- Learn (`/learn`)
  - Pointers to ENS/IP specs used by the demo.

## Deployments

Use the deploy scripts in the Chain Resolver repo, then set the env var above:
https://github.com/unruggable-labs/chain-resolver
