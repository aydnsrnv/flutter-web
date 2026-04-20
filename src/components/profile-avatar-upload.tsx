'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { User, Edit } from 'iconsax-react';
import { compressImageToBlob } from '@/lib/image-compress';

export function ProfileAvatarUpload({
  avatarUrl,
  fullName,
  isCandidate,
  userId,
  mainColor,
  editable = true,
}: {
  avatarUrl?: string | null;
  fullName: string;
  isCandidate: boolean;
  userId: string;
  mainColor: string;
  editable?: boolean;
}) {
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const extractAvatarObjectKey = (url: string | null) => {
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

    const cdnBase = (process.env.NEXT_PUBLIC_AVATAR_CDN_BASE_URL ?? '').trim().replace(/\/+$/, '');
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
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const blob = await compressImageToBlob(file, 5, 90, 1024);
      const supabase = createClient();
      
      const ts = Date.now();
      const objectKey = `${userId}/avatar_${ts}.jpg`;

      const { data: presignData, error: presignError } = await supabase.functions.invoke('r2-avatar-presign', {
        body: {
          key: objectKey,
          contentType: 'image/jpeg',
          contentLength: blob.size,
        },
      });

      if (presignError) {
        throw new Error(`Edge function error: ${presignError.message || JSON.stringify(presignError)}`);
      }
      
      if (!presignData?.uploadUrl) {
        throw new Error(`Missing uploadUrl. Function returned: ${JSON.stringify(presignData)}`);
      }

      const putRes = await fetch(presignData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: blob,
      });

      if (!putRes.ok) throw new Error('Upload to Cloudflare failed');

      const cdnBase = (process.env.NEXT_PUBLIC_AVATAR_CDN_BASE_URL ?? '').trim();
      const base = (cdnBase || 'https://pp.jobly.az').replace(/\/+$/, '');
      const publicUrl = `${base}/${objectKey}`;

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Clean up old avatar
      if (currentAvatar && currentAvatar !== publicUrl) {
        const oldKey = extractAvatarObjectKey(currentAvatar);
        if (oldKey) {
          await supabase.functions.invoke('r2-avatar-delete', {
            body: { key: oldKey },
          }).catch((e) => {
            // keep upload success even if cleanup fails
            // eslint-disable-next-line no-console
            console.error('r2-avatar-delete failed', e);
          });
        }
      }

      setCurrentAvatar(publicUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`grid place-items-center overflow-hidden rounded-full transition-opacity ${isUploading ? 'opacity-50' : ''}`}
          style={{ width: 110, height: 110, backgroundColor: 'var(--border)', border: '4px solid #fff' }}
        >
          {currentAvatar ? (
            <img src={currentAvatar} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <User size={60} variant="Outline" color="rgba(0,0,0,0.55)" />
          )}

          {isUploading ? (
            <div className="absolute inset-0 grid place-items-center bg-black/30 rounded-full">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            </div>
          ) : null}
        </div>

        {editable ? (
          <label
            className="absolute -bottom-1 -right-1 grid place-items-center rounded-full cursor-pointer hover:scale-105 transition-transform"
            style={{ width: 34, height: 34, backgroundColor: mainColor, border: '2px solid #fff' }}
          >
            <Edit size={16} variant="Linear" color="#fff" />
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        ) : null}
      </div>

      {errorMsg ? (
        <div className="mt-3 text-[13px] text-red-500 font-medium text-center">
          {errorMsg}
        </div>
      ) : null}
    </div>
  );
}
