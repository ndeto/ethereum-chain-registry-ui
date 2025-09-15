import React from 'react'
import ZincNav from '@/components/ZincNav'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
// Uses global ContextProvider from root layout; avoid double providers here

export const metadata = {
  title: 'ERC‑7785 — Zinc Layout',
  description: 'Zinc (gray) themed layout with Reown integration.'
}

export default function ZincLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <TooltipProvider>
        <ZincNav />
        <main className="min-h-[calc(100vh-56px)]">
          {children}
        </main>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </div>
  )
}
