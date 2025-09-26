"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import ZincConnectButton from '@/components/ZincConnectButton';

export default function ZincNav() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const pathname = usePathname();

  const networkName = publicClient?.chain?.name || (chainId ? `Chain ${chainId}` : '');
  const chainIdHex = chainId ? `0x${chainId.toString(16)}` : '';

  const navLinks = [
    { href: '/register', label: 'Register' },
    { href: '/resolve', label: 'Resolve' },
    { href: '/learn', label: 'Learn' },
  ];

  const isActive = (href: string) => {
    if (href === '/register') return pathname === '/' || pathname === '/register';
    return pathname === href;
  };

  const linkCls = (href: string) =>
    `px-0.5 ${isActive(href) ? 'text-zinc-100 font-semibold' : 'text-zinc-300'} hover:text-zinc-100`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100">
            <span>ERC‑7785</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={linkCls(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}>
                {l.label}
              </Link>
            ))}
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
      {/* Mobile nav row */}
      <div className="mx-auto max-w-6xl md:hidden px-4 py-2 border-t border-zinc-800">
        <nav className="flex items-center gap-4 text-sm overflow-x-auto whitespace-nowrap">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
