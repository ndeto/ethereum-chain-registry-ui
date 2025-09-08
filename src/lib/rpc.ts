import { ethers } from 'ethers';
import { SEPOLIA_RPC_URLS } from '@/lib/addresses';

export async function withSepoliaProvider<T>(runner: (provider: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
  let lastErr: any;
  for (const url of SEPOLIA_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      return await runner(provider);
    } catch (e: any) {
      lastErr = e;
      // eslint-disable-next-line no-console
      console.warn('[RPC] sepolia failed', url, e?.code || e?.message || e);
    }
  }
  throw lastErr;
}

