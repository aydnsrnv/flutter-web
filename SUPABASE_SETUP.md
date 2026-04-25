# Supabase Setup Guide

## Problem Fixed
- Kullanıcılar kaydolurken auth'ta veri oluşuyor ama `users` tablosunda kayıt yapılmıyordu
- Bunun sebebi: email confirmation öncesi insert yapılmaya çalışılması

## Solution: Database Trigger

Supabase'de aşağıdaki trigger'ı oluşturun:

### 1. Supabase Console → SQL Editor'e gidin

### 2. Aşağıdaki SQL'i çalıştırın:

```sql
-- Create trigger function to automatically create user record when auth user confirms email
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    user_id,
    email,
    full_name,
    user_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate'),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when user is created in auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();
```

### 3. Doğrulama:

Yeni bir kullanıcı kaydolduktan ve email'ini onayladıktan sonra:
1. `Supabase Console → Authentication → Users` sekmesinde kullanıcı görünsün
2. `Supabase Console → SQL Editor → users` tablosunda aynı kullanıcı görünsün

### 4. RLS Policies Kontrolü

`users` tablosunun RLS policy'lerinin aşağıdaki işlemlere izin verdiğini doğrulayın:

```sql
-- Service Role yazma izni (trigger için)
-- Users sadece kendi bilgilerini görebilsin
SELECT: (auth.uid() = user_id)
UPDATE: (auth.uid() = user_id)
DELETE: (auth.uid() = user_id)
INSERT: false (sadece trigger yapabilsin)
```

## Alternatif: Email Confirmation Callback (İsteğe bağlı)

Eğer trigger yerine API endpoint kullanmak istiyorsanız, confirmation email link'inde callback URL ayarlayabilirsiniz.
Ancak trigger çözüsü daha güvenilir ve otomatiktir.

## Flutter Comparison

Flutter uygulamasında sorun yoktu çünkü:
- Muhtemelen email confirmation sonrası user kaydını yapan ayrı bir step var
- Veya Supabase trigger zaten setp 2'den itibaren çalışıyordu
