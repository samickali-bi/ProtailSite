# Protail Site

روایت تعاملی طراحی، ساخت، تجهیز و افتتاح فروشگاه پروتیل؛ با تصویر شناور و اسکرول هماهنگ متن و تصویر.

## اجرا

Node.js 24 و npm لازم است.

```sh
npm ci
npm run dev
```

## انتشار

گردش‌کار `.github/workflows/pages.yml` با هر push روی شاخهٔ `main` سایت را می‌سازد و روی GitHub Pages منتشر می‌کند. در Settings → Pages، منبع انتشار باید GitHub Actions باشد.

آدرس پس از فعال‌شدن انتشار: https://samickali-bi.github.io/ProtailSite/

برای ساخت محلی در PowerShell:

```powershell
$env:SITE_BASE_PATH='/ProtailSite/'
npm run build
npm run preview
```

برای میزبانی روی ریشهٔ دامنه، متغیر `SITE_BASE_PATH` را تنظیم نکنید. تصاویر، فونت‌ها و فایل‌های موردنیاز سایت در مخزن هستند؛ کش مرورگر، وابستگی‌های نصب‌شده و خروجی‌های سنگین Blender وارد مخزن نمی‌شوند. جزئیات روایت و پیاده‌سازی در [README.fa.md](README.fa.md) است.
