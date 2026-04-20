'use client';

import { useState, useEffect } from 'react';
import { HambergerMenu, CloseSquare } from 'iconsax-react';
import { usePathname } from 'next/navigation';

export function MobileMenuDrawer({
  leftPanel,
  rightPanel,
}: {
  leftPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open Menu"
      >
        <HambergerMenu size={24} variant="Outline" color="currentColor" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-background lg:hidden">
          <div className="flex items-center justify-end border-b border-border p-4">
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
