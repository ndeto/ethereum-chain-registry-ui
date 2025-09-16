"use client";

import Link from 'next/link';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import ZincConnectButton from '@/components/ZincConnectButton';

export default function ZincNav() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const networkName = publicClient?.chain?.name || (chainId ? `Chain ${chainId}` : '');
  const chainIdHex = chainId ? `0x${chainId.toString(16)}` : '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100">
            <span>ERC‑7785</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-zinc-300 md:flex">
            <Link href="/" className="hover:text-zinc-100">Register</Link>
            <Link href="/assign" className="hover:text-zinc-100">Assign</Link>
            <Link href="/resolve" className="hover:text-zinc-100">Resolve</Link>
            <Link href="/caip2" className="hover:text-zinc-100">CAIP‑2</Link>
            <Link href="/learn" className="hover:text-zinc-100">Learn</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200">
              {networkName}
              {chainIdHex && <span className="opacity-60">({chainIdHex})</span>}
            </span>
          )}
          <ZincConnectButton />
        </div>
      </div>
    </header>
  );
}
