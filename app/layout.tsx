export const metadata = {
  title: 'ERC‑7785 Registry Demo — Register, Assign, Resolve (CAIP‑2)',
  description:
    'Demo UI for the ERC‑7785 Chain Registry and Resolver. Register ChainData, assign human labels, resolve to chain IDs, and inspect CAIP‑2 identifiers and hashes.',
};

import '@/index.css';
import React from 'react';
import SiteNav from '@/components/SiteNav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
