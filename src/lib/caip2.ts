import { ethers, keccak256, toUtf8Bytes } from 'ethers';
import { withSepoliaProvider } from '@/lib/rpc';
import { CAIP2_CONTRACT_ADDRESS } from './addresses';
import { CAIP2_LIB_ABI } from './abis';

export function buildCaip2Identifier(namespace: string, reference: string) {
  return `${namespace}:${reference}`;
}

export function caip2Hash(identifier: string) {
  return keccak256(toUtf8Bytes(identifier));
}

export async function computeCaip2HashOnChain(namespace: string, reference: string) {
  return withSepoliaProvider(async (provider) => {
    const hasher = new ethers.Contract(CAIP2_CONTRACT_ADDRESS, CAIP2_LIB_ABI, provider);
    return hasher.computeCaip2Hash(namespace, reference) as Promise<string>;
  });
}
