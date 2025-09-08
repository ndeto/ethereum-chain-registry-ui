export const metadata = {
  title: 'ChainData Hash Computer - Solidity Struct Hash Generator',
  description:
    'Professional tool for computing 32-byte hashes from Solidity ChainData struct parameters. Enter blockchain data and get cryptographic hash results.',
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
