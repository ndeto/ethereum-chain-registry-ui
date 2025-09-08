// Default Sepolia deployments. Override via env to use your own deployments.
// Deploy scripts: https://github.com/unruggable-labs/erc-7785-registry/tree/57e9aa2fab7f2c9b5efbb27ad3f56b61f68fa2e3/deploy
const envResolver = process.env.NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS;
const envRegistry = process.env.NEXT_PUBLIC_CHAIN_REGISTRY_ADDRESS;
const envSepoliaUrls = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URLS;
const envCaipLibContractAddress = process.env.NEXT_PUBLIC_CAIP2_CONTRACT_ADDRESS

export const CHAIN_REGISTRY_ADDRESS = (envRegistry || '0x12CC68707E07eC5f098119aA2F035407364F3dab') as string;
export const CHAIN_RESOLVER_ADDRESS = (envResolver || '0x15550BD44F900F4384Fec34ABCd69F675b8ED8C5') as string;
export const CAIP2_CONTRACT_ADDRESS = (envCaipLibContractAddress || '0x02C9686bfc83aAA29fc19f8Ff39887d54B4Ef57a') as string;


export const SEPOLIA_RPC_URLS = (envSepoliaUrls ? envSepoliaUrls.split(',').map(s => s.trim()).filter(Boolean) : [
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
  'https://endpoints.omniatech.io/v1/eth/sepolia/public',
]) as string[];
