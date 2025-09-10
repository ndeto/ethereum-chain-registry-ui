# ERC‑7785 Registry Demo

This is a Next.js demo for working with the ERC‑7785 Chain Registry and a Chain Resolver, with CAIP‑2/CAIP‑350 integration. It lets you:

- Register ChainData on the registry (owner‑only) and get the ERC‑7785 chainId (bytes32)
- Assign a human label to an ERC‑7785 chainId in the resolver (owner‑only)
- Resolve a label to its chainId and ChainData, and view CAIP‑2 identifier and hash
- Look up ChainData by CAIP‑2 identifier or hash

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Create `.env.local` with your deployed contract addresses (defaults provided below):

```
# Sepolia registry address (IChainRegistry)
NEXT_PUBLIC_CHAIN_REGISTRY_ADDRESS=0x12CC68707E07eC5f098119aA2F035407364F3dab

# Sepolia resolver address (ChainResolver)
NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS=0x15550BD44F900F4384Fec34ABCd69F675b8ED8C5

# CAIP‑2 hasher contract address
NEXT_PUBLIC_CAIP2_CONTRACT_ADDRESS=0x02C9686bfc83aAA29fc19f8Ff39887d54B4Ef57a

# Optional: comma‑separated RPC URLs used for read calls
NEXT_PUBLIC_SEPOLIA_RPC_URLS=https://ethereum-sepolia.publicnode.com,https://rpc.sepolia.org
```

These vars are client‑visible; do not put secrets here. To use your own contracts on this UI, use the scripts [here](https://github.com/unruggable-labs/erc-7785-registry/tree/57e9aa2fab7f2c9b5efbb27ad3f56b61f68fa2e3/deploy) and then set the `env.local` vars:


## Pages & Flow

### Register — `/`

Owner‑only UI to call `registry.register(ChainData)` on Sepolia. Fields:

- chainName: lowercase slug, e.g., `optimism`, `base`, `arbitrum`, testnets like `optimism-sepolia`
- settlementChainId: L1 chain id (decimal), e.g., `1` for Ethereum mainnet
- version: free‑form tag, e.g., `v1`
- rollupContract: canonical L1 contract (portal/bridge)
- chainNamespace: CAIP‑2 namespace, for EVM use `eip155`
- chainReference: CAIP‑2 reference, for EVM use the decimal chain id string of the chain, e.g., `10`, `8453`
- coinType: SLIP‑44 coin type; for EVM use `60` (ABI expects `uint256`)

Notes:
- Requires wallet connection and Sepolia. Only the registry owner can register.
- After confirmation, the page shows the emitted chainId (bytes32).

### Assign — `/assign`

Owner‑only UI to call `resolver.assign(label, chainId)`:

- Label: human label (lowercase). Full name is `<label>.cid.eth`.
- Chain ID: 32‑byte hex string (0x + 64 hex) produced by registering ChainData.
- Extras: “Check Current Mapping” uses `computeNode(label)` + `nodeToChainId(node)` to show existing assignment.

Requires wallet connection and Sepolia. Only the resolver owner can assign.

### Resolve — `/resolve`

Resolve a human label to an ERC‑7785 chainId and ChainData:

- Computes node via `computeNode(label)` then `nodeToChainId(node)` on the resolver.
- Fetches ChainData from the registry.
- Computes CAIP‑2 identifier and hash (on‑chain hasher) from ChainData.
- Shows a Contracts card with the resolver address.

Reference: [CAIP‑2 and CAIP‑350 in ERC‑7785](https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md#caip-2-and-caip-350-integration-in-erc-7785-chain-identifier)

### CAIP‑2 — `/caip2`

Two lookups:

- By CAIP‑2 Hash (first): calls `registry.caip2HashToChainId(hash)` then `registry.chainData(chainId)`
- By CAIP‑2 Identifier: computes hash using the on‑chain hasher, then same as above

## Typical Process

1) Register ChainData on the registry (owner)
2) Copy the emitted chainId (bytes32). Displayed on the UI
3) Assign `<label>` to that chainId in the resolver (owner)
4) Resolve `<label>.cid.eth` to verify mapping, and view ChainData + CAIP‑2

## Scripts

```bash
npm run dev       # next dev
npm run build     # next build
npm run start     # next start
```
