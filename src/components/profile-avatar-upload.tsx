'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { User, Edit } from 'iconsax-react';
import { compressImageToBlob } from '@/lib/image-compress';
import { extractAvatarObjectKey } from '@/lib/r2';

export function ProfileAvatarUpload({
  avatarUrl,
  fullName,
  isCandidate,
  userId,
  editable = true,
}: {
  avatarUrl?: string | null;
  fullName: string;
  isCandidate: boolean;
  userId: string;
  editable?: boolean;
}) {
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          className={`grid place-items-center overflow-hidden rounded-full border-4 border-background transition-opacity ${isUploading ? 'opacity-50' : ''}`}
          style={{ width: 110, height: 110, backgroundColor: 'var(--border)' }}
        >
          {currentAvatar ? (
            <img src={currentAvatar} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <User size={60} variant="Outline" color="currentColor" className="text-icon-muted" />
          )}

          {isUploading ? (
            <div className="absolute inset-0 grid place-items-center bg-black/30 rounded-full">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            </div>
          ) : null}
        </div>

        {editable ? (
          <label
            className="absolute -bottom-1 -right-1 grid place-items-center rounded-full cursor-pointer hover:scale-105 transition-transform border-2 border-background bg-primary"
            style={{ width: 34, height: 34 }}
          >
            <Edit size={16} variant="Linear" color="currentColor" className="text-primary-foreground" />
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
        <div className="mt-3 text-sm text-destructive font-medium text-center">
          {errorMsg}
        </div>
      ) : null}
    </div>
  );
}
