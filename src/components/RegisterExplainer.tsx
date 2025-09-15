"use client";

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function RegisterExplainer() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Register: Learn → Simulate → Submit</span>
        </div>
        <h1 className="text-4xl font-bold text-primary">Register a chain</h1>
        <div className="pt-1">
          <Link href="/learn#overview" className="text-sm underline text-primary">
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}
