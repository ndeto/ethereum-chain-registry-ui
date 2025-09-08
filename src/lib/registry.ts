import { ethers } from 'ethers';
import { CHAIN_REGISTRY_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';
import { withSepoliaProvider } from '@/lib/rpc';
import { buildCaip2Identifier } from '@/lib/caip2';
import { CAIP2_LIB_ABI } from '@/lib/abis';
import { CAIP2_CONTRACT_ADDRESS } from '@/lib/addresses';

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

export async function fetchChainDataFromCaip2(namespace: string, reference: string) {
  // Implement via on-chain CAIP2 hasher + caip2HashToChainId + chainData
  return withSepoliaProvider(async (provider) => {
    const identifier = buildCaip2Identifier(namespace, reference);
    // Compute hash using the on-chain library to ensure parity
    const hasher = new ethers.Contract(CAIP2_CONTRACT_ADDRESS, CAIP2_LIB_ABI, provider);
    const hash: string = await hasher.computeCaip2Hash(namespace, reference);
    const registry = new ethers.Contract(CHAIN_REGISTRY_ADDRESS, [
      { type: 'function', name: 'caip2HashToChainId', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: '', type: 'bytes32' }] },
      ...CHAIN_REGISTRY_ABI,
    ] as const, provider);
    const id: string = await registry.caip2HashToChainId(hash);
    const data = await registry.chainData(id);
    const notFound = !data?.chainName && String(data?.rollupContract).toLowerCase() === '0x0000000000000000000000000000000000000000';
    return [!notFound, data] as const;
  });
}
