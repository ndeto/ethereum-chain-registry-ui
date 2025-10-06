// Addresses are provided via env. Defaults live in .env.example.
// No hardcoded fallbacks; must be set via env.

const _RES = process.env.NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS;
const envSepoliaUrls = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URLS;

if (_RES == null) throw new Error('[ENV] Missing required env var: NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS');

export const CHAIN_RESOLVER_ADDRESS = _RES as string;

export const SEPOLIA_RPC_URLS = (envSepoliaUrls ? envSepoliaUrls.split(',').map(s => s.trim()).filter(Boolean) : [
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
  'https://endpoints.omniatech.io/v1/eth/sepolia/public',
]) as string[];
