'use client';

import { useEffect, useRef } from 'react';

export function InfiniteScrollSentinel({
  onVisible,
  disabled,
  rootMargin,
  className,
}: {
  onVisible: () => void;
  disabled?: boolean;
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const cbRef = useRef(onVisible);
  cbRef.current = onVisible;

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
        if (ent?.isIntersecting) cbRef.current();
      },
      { rootMargin: rootMargin ?? '300px' },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [disabled, rootMargin]);

  return <div ref={ref} className={className} />;
}
