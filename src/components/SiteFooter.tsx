"use client";

import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900/80">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-zinc-400">
        <div className="inline-flex items-center gap-2">
          <span>Built by</span>
          <a href="https://unruggable.com" target="_blank" rel="noreferrer" className="underline hover:text-zinc-200 inline-flex items-center gap-2">
            <Image src="/unruggable.jpg" alt="Unruggable" width={16} height={16} className="h-4 w-4 rounded-sm" />
            <span>unruggable.com</span>
          </a>
          <span className="opacity-50">•</span>
          <a
            href="https://github.com/ndeto/erc-7785-demo-ui"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-zinc-200"
          >
            UI repo
          </a>
        </div>
      </div>
    </footer>
  );
}
