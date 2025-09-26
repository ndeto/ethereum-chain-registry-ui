export const metadata = {
  title: 'Ethereum Chain Registry',
  description: 'Demo UI for the Ethereum Chain Registry.',
};

import '@/index.css';
import React from 'react';
import { headers } from 'next/headers'
import ContextProvider from '../context'
import ZincNav from '@/components/ZincNav'
import SiteFooter from '@/components/SiteFooter'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookies = headers().get('cookie');

  return (
    <html lang="en">
      <body className="zinc-theme min-h-screen bg-zinc-950 text-zinc-100 antialiased flex flex-col">
        <ContextProvider cookies={cookies}>
          <TooltipProvider>
            <ZincNav />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
