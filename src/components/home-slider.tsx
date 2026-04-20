'use client';

import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';

export type HomeSlide = {
  id: string;
  photo_url: string;
  url: string;
};

export function HomeSlider({ slides }: { slides: HomeSlide[] }) {
  const { t } = useI18n();
  const items = useMemo(() => slides.filter((s) => !!s.photo_url), [slides]);
  const [index, setIndex] = useState(0);

  const derivedIndex = items.length > 0 ? index % items.length : 0;

  useEffect(() => {
    if (items.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 3000);
    return () => window.clearInterval(t);
  }, [items.length]);

  if (items.length === 0) {
    return <div className="aspect-[5/2] w-full rounded-xl bg-muted" />;
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="flex w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${derivedIndex * 100}%)` }}
        >
          {items.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="w-full shrink-0"
            >
              <div className="aspect-[5/2] w-full bg-muted">
                <img
                  src={s.photo_url}
                  alt={t('home_slide_alt')}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </a>
          ))}
        </div>
      </div>

      {items.length > 1 ? (
        <div className="mt-2">
          <div className="flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t('home_slide_dot_aria').replace('{index}', String(i + 1))}
                onClick={() => setIndex(i)}
                className="h-2 rounded-full"
                style={{
                  width: derivedIndex === i ? 18 : 8,
                  backgroundColor:
                    derivedIndex === i ? '#245BEB' : 'rgba(0,0,0,0.25)',
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
