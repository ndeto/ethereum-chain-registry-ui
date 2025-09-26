// Addresses are provided via env. Defaults live in .env.example.
// Deploy scripts: https://github.com/unruggable-labs/erc-7785-registry/tree/57e9aa2fab7f2c9b5efbb27ad3f56b61f68fa2e3/deploy

const _REG = process.env.NEXT_PUBLIC_CHAIN_REGISTRY_ADDRESS;
const _RES = process.env.NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS;
const _CAIP = process.env.NEXT_PUBLIC_CAIP2_CONTRACT_ADDRESS;
const _REV = process.env.NEXT_PUBLIC_REVERSE_RESOLVER_ADDRESS;
const envSepoliaUrls = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URLS;

if (_REG == null) throw new Error('[ENV] Missing required env var: NEXT_PUBLIC_CHAIN_REGISTRY_ADDRESS');
if (_RES == null) throw new Error('[ENV] Missing required env var: NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS');
if (_CAIP == null) throw new Error('[ENV] Missing required env var: NEXT_PUBLIC_CAIP2_CONTRACT_ADDRESS');
if (_REV == null) throw new Error('[ENV] Missing required env var: NEXT_PUBLIC_REVERSE_RESOLVER_ADDRESS');

export const CHAIN_REGISTRY_ADDRESS = _REG as string;
export const CHAIN_RESOLVER_ADDRESS = _RES as string;
export const CAIP2_CONTRACT_ADDRESS = _CAIP as string;
export const REVERSE_RESOLVER_ADDRESS = _REV as string;

export const SEPOLIA_RPC_URLS = (envSepoliaUrls ? envSepoliaUrls.split(',').map(s => s.trim()).filter(Boolean) : [
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
  'https://endpoints.omniatech.io/v1/eth/sepolia/public',
]) as string[];
