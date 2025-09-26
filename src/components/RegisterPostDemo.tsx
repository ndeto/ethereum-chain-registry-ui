"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterPostDemo() {
  const sp = useSearchParams();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = sp?.get('label');
    if (fromQuery) {
      setLabel(fromQuery);
      return;
    }
    try {
      const fromStorage = localStorage.getItem('lastRegisteredLabel');
      if (fromStorage) setLabel(fromStorage);
    } catch {}
  }, [sp]);

  const href = label ? `/resolve?label=${encodeURIComponent(label)}&auto=1` : '/resolve';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border border-primary/10 bg-background/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Resolve</CardTitle>
          <CardDescription>
            After registering, resolve your label to verify the mapping.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={href} className="inline-block">
              <Button variant="secondary">Go to Resolve</Button>
            </Link>
            {label && (
              <span className="text-xs text-muted-foreground">
                Will resolve: <code className="font-mono">{label}.cid.eth</code>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
