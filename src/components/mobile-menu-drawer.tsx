'use client';

import { useState, useEffect } from 'react';
import { HambergerMenu, CloseSquare } from 'iconsax-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileMenuDrawer({
  leftPanel,
  rightPanel,
  open,
  onOpenChange,
  showTrigger = true,
}: {
  leftPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  showTrigger?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const pathname = usePathname();

  const isOpen = open ?? uncontrolledOpen;
  const setIsOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    if (open === undefined) setUncontrolledOpen(v);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {showTrigger ? (
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
        >
          <HambergerMenu size={24} variant="Outline" color="currentColor" />
        </button>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-background lg:hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <Link href="/home" className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-white">
                <Image src="/jobly_icon.jpg" alt="Jobly" width={32} height={32} />
              </div>
              <div className="text-[22px] font-bold leading-none" style={{ color: '#245BEB' }}>
                Jobly
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              aria-label="Close Menu"
            >
              <CloseSquare size={24} variant="Outline" color="currentColor" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
            {leftPanel}
            {rightPanel ? (
              <>
                <div className="my-6 h-[0.35px] w-full bg-black/15 dark:bg-white/15" />
                <div>{rightPanel}</div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
