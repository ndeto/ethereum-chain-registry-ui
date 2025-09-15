import { ethers } from 'ethers';
import { SEPOLIA_RPC_URLS } from '@/lib/addresses';

export async function withSepoliaProvider<T>(runner: (provider: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
  let lastErr: any;
  for (const url of SEPOLIA_RPC_URLS) {
    try {
      // Hint the network and make it static so ethers doesn’t perform
      // an initial eth_chainId for detection (avoids long retries when
      // an endpoint is CORS-blocked). This makes failures fast so we
      // can iterate to the next URL.
      const provider = new ethers.JsonRpcProvider(
        url,
        { name: 'sepolia', chainId: 11155111 },
        { staticNetwork: true },
      );
      return await runner(provider);
    } catch (e: any) {
      lastErr = e;
      // eslint-disable-next-line no-console
      console.warn('[RPC] sepolia failed', url, e?.code || e?.message || e);
    }
  }
  throw lastErr;
}
