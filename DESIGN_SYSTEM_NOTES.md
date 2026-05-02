# Jobly Design System Notları

> Bu doküman, web tarafında yapılan tüm tasarım iyileştirmelerinin özeti ve Flutter tarafında da uygulanması için rehber niteliğindedir.

---

## 1. Renk Paleti

### Marka Rengi
- **Primary**: `#245BEB` (`var(--jobly-main)`)
- **Primary Soft / 10%**: `rgba(36, 91, 235, 0.10)` (`var(--jobly-main-10)`)
- **Primary 45%**: `rgba(36, 91, 235, 0.45)` (`var(--jobly-main-45)`)

> **Flutter eşdeğeri**: `Color(0xFF245BEB)` ve `Color(0xFF245BEB).withOpacity(0.10)`

### Gri Tonları (İkonlar & Metinler)
- **Muted / İkon Gri**: `#9CA3AF` (`var(--icon-muted)`)
- Light mode: `#9CA3AF`
- Dark mode: `rgba(255, 255, 255, 0.50)`

> **Flutter eşdeğeri**: `Color(0xFF9CA3AF)` — dark mode'da `Colors.white.withOpacity(0.50)`

> **ÖNEMLİ**: Artık hiçbir yerde hardcoded `#9CA3AF` veya `rgba(36,91,235,0.10)` kullanılmıyor. Tümü CSS variable üzerinden yönetiliyor.

### Temel Renkler (shadcn/ui token'ları)
| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#f6f6f6` | `#181828` |
| `--foreground` | `#111827` | `rgba(255,255,255,0.88)` |
| `--card` | `#ffffff` | `#222231` |
| `--muted-foreground` | `#6b7280` | `rgba(255,255,255,0.6)` |
| `--border` | `rgba(17,24,39,0.12)` | `rgba(255,255,255,0.14)` |
| `--destructive` | `#ff6b6b` | `#ff6b6b` |

---

## 2. Spacing Scale (Boşluk Sistemi)

| Token | Değer | Kullanım Alanı |
|-------|-------|----------------|
| `space-1` | `4px` | İkon-mesafe, küçük gap |
| `space-2` | `8px` | İçerik gap'leri |
| `space-3` | `12px` | Kart içi padding |
| `space-4` | `16px` | Standart padding (px-4, py-4) |
| `space-5` | `20px` | Kart içi boşluklar |
| `space-6` | `24px` | Bölüm boşlukları |
| `space-8` | `32px` | Büyük section gap'leri |

> **Flutter eşdeğeri**: `SizedBox(height: 4)`, `SizedBox(height: 8)`, `EdgeInsets.all(16)` vb.

---

## 3. Typography Scale (Yazı Sistemi)

| Token | Değer | Kullanım Alanı |
|-------|-------|----------------|
| `font-xs` | `12px` | Alt label, tarih, badge metni |
| `font-sm` | `14px` | Buton, input, açıklama metni |
| `font-base` | `16px` | Standart metin, RowContainer başlığı |
| `font-lg` | `18px` | SectionHeader başlığı, AppHeader başlığı |
| `font-xl` | `20px` | Büyük başlıklar |
| `font-2xl` | `24px` | Sayfa başlıkları |
| `font-3xl` | `28px` | Marka adı (desktop) |

> **Flutter eşdeğeri**: `TextStyle(fontSize: 12)`, `TextStyle(fontSize: 14)` vb.

> **ÖNEMLİ**: Artık `text-[11.7px]`, `text-[8px]`, `text-[22px]` gibi rastgele değerler kullanılmıyor.

---

## 4. Border Radius Scale (Köşe Yuvarlaklığı)

| Token | Değer | Kullanım Alanı |
|-------|-------|----------------|
| `radius-button` | `10px` | Butonlar |
| `radius-input` | `16px` | Input, Textarea |
| `radius-card` | `16px` | Kartlar, listeler, bottom-nav |
| `radius-pill` | `9999px` | Avatar, icon butonlar, badge'ler |

> **Flutter eşdeğeri**: `BorderRadius.circular(10)`, `BorderRadius.circular(16)`, `BorderRadius.circular(999)`

> **ÖNEMLİ**: `rounded-[21px]`, `rounded-[14px]`, `rounded-xl` gibi karışık değerler yerine bu 4 tier kullanılıyor.

---

## 5. Shadow Scale

| Token | Değer | Kullanım Alanı |
|-------|-------|----------------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Kartlar |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Dialog, dropdown |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modal overlay |

> **Flutter eşdeğeri**: `BoxShadow` widget'ları ile aynı değerler.

---

## 6. Component Standartları

### IconButton
```tsx
// Tek tip icon buton — AppHeader, BottomNav, vb.
<IconButton href="/profile" label="Profil" size="md" variant="default">
  <User size={24} variant="Linear" color="currentColor" />
</IconButton>
```
> **Flutter eşdeğeri**: `IconButton` widget'ı ile tutarlı padding, size ve shape.

### PremiumBadge
```tsx
// Marka rengine uyumlu premium etiketi
<PremiumBadge showIcon />
```
> **Önceki**: Altın sarısı gradient (`#FFD700 → #FFC107`)
> **Yeni**: `bg-primary text-primary-foreground` — marka rengiyle uyumlu, daha ciddi

> **Flutter eşdeğeri**: `Container(decoration: BoxDecoration(color: primaryColor, borderRadius: BorderRadius.circular(999)))` içinde `Text("PREMIUM")`

### Card
```tsx
<Card className="rounded-2xl border border-border bg-card">
  <CardHeader className="p-5">
    <CardTitle className="text-base font-semibold">Başlık</CardTitle>
  </CardHeader>
  <CardContent className="p-5 pt-0">İçerik</CardContent>
</Card>
```

### List Item (FlutterJobItem standardı)
- Logo: `44px` yuvarlak
- Başlık: `text-lg font-medium`
- Alt bilgi: `text-sm text-muted-foreground`
- Tarih: `text-xs text-muted-foreground`
- Gap: `gap-3`

---

## 7. Yapılan Değişiklikler Özeti

### globals.css
- Yeni token'lar eklendi: `--icon-muted`, `--icon-muted-dark`, `--radius-input`, `--radius-button`, `--radius-card`
- Yeni utility class'ları: `.text-icon-muted`, `.bg-jobly-soft`, `.text-jobly`
- `jobly-input` class'ı `rounded-[21px]` → `rounded-[var(--radius-input)]`

### app-header.tsx
- `style={{ color: "#245BEB" }}` → `className="text-primary"`
- `text-[30px]` → `text-[28px]` (daha ciddi)
- `text-[22px]` → `text-xl`
- `text-[18px]` → `text-lg`
- Icon butonlar `IconButton` component'ine çevrildi

### bottom-nav.tsx
- `style={{ backgroundColor: "rgba(36, 91, 235, 0.10)" }}` → `className="bg-jobly-soft"`
- `style={{ color: "#245BEB" }}` → `className="text-primary"`
- `text-[rgba(0,0,0,0.54)] dark:text-[rgba(255,255,255,0.70)]` → `className="text-icon-muted"`

### desktop-left-panel.tsx
- `const iconBg = "rgba(36,91,235,0.10)"` kaldırıldı → `className="bg-jobly-soft"`
- `const iconColor = "var(--jobly-main, #245BEB)"` kaldırıldı → `className="text-primary"`
- `style={{ color: "#9CA3AF" }}` → `className="text-icon-muted"`
- `style={{ backgroundColor: "rgba(0,0,0,0.55)" }}` → `className="bg-black/55"`
- Theme toggle switch inline style'ları → Tailwind class'ları

### flutter-job-item.tsx
- `style={{ color: '#9CA3AF' }}` → `className="text-muted-foreground"`
- `color="#9CA3AF"` → `color="currentColor"` + `className="text-muted-foreground"`
- `text-[11.7px]` → `text-xs`
- Altın sarısı premium badge → `PremiumBadge` component'i

### section-header.tsx
- `style={{ backgroundColor: 'rgba(36, 91, 235, 0.10)', color: '#245BEB' }}` → `className="bg-jobly-soft text-primary"`

### empty-state.tsx
- `style={{ backgroundColor: "rgba(36, 91, 235, 0.10)" }}` → `className="bg-jobly-soft"`
- `color="var(--jobly-main, #245BEB)"` → `color="currentColor"` + `className="text-primary"`

### input.tsx & textarea.tsx
- `rounded-[21px]` → `rounded-[var(--radius-input)]`

---

## 8. Flutter'a Aktarım Rehberi

### Renkler
```dart
class AppColors {
  static const primary = Color(0xFF245BEB);
  static const primarySoft = Color(0x1A245BEB); // %10 opacity
  static const iconMuted = Color(0xFF9CA3AF);
  static const iconMutedDark = Colors.white.withOpacity(0.50);
  // ... diğerleri
}
```

### Spacing
```dart
class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 20.0;
  static const xxl = 24.0;
}
```

### Border Radius
```dart
class AppRadius {
  static const button = 10.0;
  static const input = 16.0;
  static const card = 16.0;
  static const pill = 999.0;
}
```

### Typography
```dart
class AppTextStyles {
  static const xs = TextStyle(fontSize: 12);
  static const sm = TextStyle(fontSize: 14);
  static const base = TextStyle(fontSize: 16);
  static const lg = TextStyle(fontSize: 18, fontWeight: FontWeight.bold);
  static const xl = TextStyle(fontSize: 20, fontWeight: FontWeight.bold);
  static const xxl = TextStyle(fontSize: 24, fontWeight: FontWeight.bold);
}
```

### Premium Badge
```dart
Container(
  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
  decoration: BoxDecoration(
    color: AppColors.primary,
    borderRadius: BorderRadius.circular(AppRadius.pill),
  ),
  child: Text(
    "PREMIUM",
    style: TextStyle(
      fontSize: 10,
      fontWeight: FontWeight.bold,
      color: Colors.white,
      letterSpacing: 0.6,
    ),
  ),
)
```

---

## 9. Kural: Artık Kullanılmayacaklar

- ❌ `style={{ color: "#245BEB" }}` → ✅ `className="text-primary"`
- ❌ `style={{ backgroundColor: "rgba(36, 91, 235, 0.10)" }}` → ✅ `className="bg-jobly-soft"`
- ❌ `color="#9CA3AF"` → ✅ `color="currentColor"` + `className="text-muted-foreground"`
- ❌ `text-[11.7px]`, `text-[8px]`, `text-[22px]` → ✅ `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`
- ❌ `rounded-[21px]`, `rounded-[14px]` → ✅ `rounded-[var(--radius-input)]`, `rounded-2xl`
- ❌ Altın sarısı gradient premium badge → ✅ `PremiumBadge` component'i (marka rengi)
- ❌ Inline style kullanımı → ✅ Tailwind utility class'ları
