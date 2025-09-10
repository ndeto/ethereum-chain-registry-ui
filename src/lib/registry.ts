import { ethers } from 'ethers';
import { CHAIN_REGISTRY_ABI, CAIP2_LIB_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS, CAIP2_CONTRACT_ADDRESS } from '@/lib/addresses';
import { withSepoliaProvider } from '@/lib/rpc';
import { buildCaip2Identifier } from '@/lib/caip2';

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
  return withSepoliaProvider(async (provider) => {
    buildCaip2Identifier(namespace, reference); // kept for consistency
    const hasher = new ethers.Contract(CAIP2_CONTRACT_ADDRESS, CAIP2_LIB_ABI, provider);
    const hash: string = await hasher.computeCaip2Hash(namespace, reference);
    const registry = new ethers.Contract(
      CHAIN_REGISTRY_ADDRESS,
      [
        { type: 'function', name: 'caip2HashToChainId', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: '', type: 'bytes32' }] },
        ...CHAIN_REGISTRY_ABI,
      ] as const,
      provider,
    );
    const id: string = await registry.caip2HashToChainId(hash);
    const data = await registry.chainData(id);
    const notFound = !data?.chainName && String(data?.rollupContract).toLowerCase() === '0x0000000000000000000000000000000000000000';
    return [!notFound, data] as const;
  });
}
