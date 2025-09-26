"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import ModeToggle from '@/components/mode-toggle';

export default function SiteNav() {
  const pathname = usePathname();
  if (pathname?.startsWith('/zinc')) return null;
  const isActive = (href: string) => pathname === href;
  return (
    <header className="w-full border-b border-primary/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3 gap-4">
        <Link href="/" className="font-semibold tracking-tight">
          ERC‑7785
        </Link>
        <div className="flex items-center gap-3">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive('/') && 'bg-primary/10 text-primary'
                  )}
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  Register
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/resolve" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive('/resolve') && 'bg-primary/10 text-primary'
                  )}
                  aria-current={isActive('/resolve') ? 'page' : undefined}
                >
                  Resolve
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/learn" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive('/learn') && 'bg-primary/10 text-primary'
                  )}
                  aria-current={isActive('/learn') ? 'page' : undefined}
                >
                  Learn
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle />
        </div>
      </div>
    </header>
  );
}
