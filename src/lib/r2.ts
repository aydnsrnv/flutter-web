export function extractAvatarObjectKey(url: string | null): string | null {
  if (!url) return null;
  const raw = url.trim();

  // Normalize to pathname (strip query/hash) when possible
  let normalized = raw;
  try {
    normalized = new URL(raw).pathname;
  } catch {
    // ignore
  }
  normalized = normalized.trim();
  while (normalized.startsWith('/')) normalized = normalized.substring(1);

  const cdnBase = (process.env.NEXT_PUBLIC_AVATAR_CDN_BASE_URL ?? '')
    .trim()
    .replace(/\/+$/, '');
  if (cdnBase && raw.startsWith(cdnBase)) {
    let key = raw.substring(cdnBase.length);
    while (key.startsWith('/')) key = key.substring(1);
    if (key.startsWith('avatars/')) key = key.substring('avatars/'.length);
    return key || null;
  }

  const ppBase = 'https://pp.jobly.az';
  if (raw.startsWith(ppBase)) {
    let key = raw.substring(ppBase.length);
    while (key.startsWith('/')) key = key.substring(1);
    if (key.startsWith('avatars/')) key = key.substring('avatars/'.length);
    return key || null;
  }

  const idx = raw.indexOf('/avatars/');
  if (idx !== -1) {
    const key = raw.substring(idx + '/avatars/'.length);
    return key || null;
  }

  if (normalized.startsWith('avatars/')) {
    const key = normalized.substring('avatars/'.length);
    return key || null;
  }
  if (normalized.includes('/')) {
    return normalized || null;
  }
  return null;
}
