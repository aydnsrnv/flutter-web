'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/client';
import { Add } from 'iconsax-react';
import { Building, Global } from 'iconsax-react';

export function RequestCompanyFab() {
  const { t } = useI18n();
  const [userType, setUserType] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [companyName, setCompanyName] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      supabase
        .from('users')
        .select('user_type')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: userRow }) => {
          if (userRow?.user_type) {
            setUserType(userRow.user_type.toString().toLowerCase());
          }
        });
    });
  }, []);

  if (userType !== 'employer') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (!companyName.trim() || !socialMedia.trim()) {
      setErrorText(t('enter_request') || 'Please fill all fields');
      return;
    }

    const lastRequestStr = window.localStorage.getItem('last_company_request_time');
    if (lastRequestStr) {
      const lastTime = parseInt(lastRequestStr, 10);
      if (!isNaN(lastTime)) {
        const timeDiff = Date.now() - lastTime;
        if (timeDiff < 24 * 60 * 60 * 1000) {
          setErrorText('Spam aşkarlandı. Yenidən cəhd etmək üçün 24 saat gözləyin.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('request_company').insert({
        company_name: companyName.trim(),
        social_media: socialMedia.trim(),
      });

      if (error) throw error;

      window.localStorage.setItem('last_company_request_time', Date.now().toString());

      setSuccessText(t('request_company_sent_message'));
      setTimeout(() => {
        setIsOpen(false);
        setCompanyName('');
        setSocialMedia('');
        setSuccessText(null);
      }, 2000);
    } catch (err: any) {
      setErrorText(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="z-[90] fixed bottom-[85px] right-4 lg:sticky lg:bottom-[95px] lg:self-end lg:h-0 lg:overflow-visible flex justify-end">
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 lg:absolute lg:bottom-0 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label={t('request_company_title')}
        >
          <Add size={28} color="currentColor" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="mb-6 text-center text-xl font-bold text-foreground">
              {t('request_company_title')}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-muted-foreground">
                  <Building size={20} variant="Outline" color="currentColor" />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('request_company_name_hint')}
                  className="w-full rounded-[21px] border border-border bg-background py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-muted-foreground">
                  <Global size={20} variant="Outline" color="currentColor" />
                </div>
                <input
                  type="text"
                  value={socialMedia}
                  onChange={(e) => setSocialMedia(e.target.value)}
                  placeholder={t('request_company_social_media_hint')}
                  className="w-full rounded-[21px] border border-border bg-background py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>

              {errorText ? (
                <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500 text-center">
                  {errorText}
                </div>
              ) : null}

              {successText ? (
                <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm font-medium text-green-500 text-center">
                  {successText}
                </div>
              ) : null}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-[21px] bg-muted py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
                >
                  {t('report_dialog_cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-[21px] bg-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : null}
                  {t('report_dialog_send') || 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
