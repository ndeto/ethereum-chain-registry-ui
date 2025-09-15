"use client"

import Link from 'next/link'
import { AppKitButton } from '@reown/appkit/react'

export default function ZincNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight text-zinc-100">
            ERC‑7785
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
          <AppKitButton />
        </div>
      </div>
    </header>
  )
}
