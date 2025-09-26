"use client";

import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900/80">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-zinc-400">
        <div className="inline-flex items-center gap-3">
          <a href="https://unruggable.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
            <Image src="/full-logo-white.svg" alt="Unruggable — Ethereum Chain Registry" width={108} height={19} className="h-5 w-auto" />
          </a>
          <span className="opacity-50">•</span>
          <a
            href="https://github.com/unruggable-labs/chain-registry"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-zinc-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
