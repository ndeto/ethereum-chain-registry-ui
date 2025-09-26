import { ethers } from 'ethers';
import { CHAIN_REGISTRY_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';
import { withSepoliaProvider } from '@/lib/rpc';

export function getRegistry(provider: ethers.Provider) {
  return new ethers.Contract(CHAIN_REGISTRY_ADDRESS, CHAIN_REGISTRY_ABI, provider);
}

export async function fetchChainDataById(chainId: string) {
  return withSepoliaProvider(async (provider) => {
    const registry = getRegistry(provider);
    const data = await registry.chainData(chainId);
    const notFound = !data?.chainName && String(data?.rollupContract).toLowerCase() === '0x0000000000000000000000000000000000000000';
    return { exists: !notFound, data };
  });
}

// CAIP-2 support removed
