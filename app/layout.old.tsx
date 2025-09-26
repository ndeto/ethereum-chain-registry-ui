export const metadata = {
  title: 'Ethereum Chain Registry — Register, Assign, Resolve',
  description:
    'Demo UI for the Chain ID Registry and Resolver. Register ChainData, assign human labels, resolve to chain IDs.',
};

import '@/index.css';
import React from 'react';
import SiteNav from '@/components/SiteNav';
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
