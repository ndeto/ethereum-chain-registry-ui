"use client";

import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export default function ZincConnectButton({ className = '' }: { className?: string }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const label = isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet';
  return (
    <button
      type="button"
      onClick={() => open()}
      className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium 
      bg-zinc-900 text-zinc-100 border-zinc-800 hover:bg-zinc-800 transition-colors ${className}`}
    >
      {label}
    </button>
  );
}

