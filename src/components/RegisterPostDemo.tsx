"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';

export default function RegisterPostDemo() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Deployment moved to Learn page: Deployments */}

      <Card className="border border-primary/10 bg-background/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Resolve
          </CardTitle>
          <CardDescription>After registering, resolve your label to verify the mapping.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/resolve" className="inline-block">
              <Button variant="secondary">Go to Resolve</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
