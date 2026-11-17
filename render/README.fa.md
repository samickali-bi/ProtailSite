# قاب مرجع کیفیت بصری پروتیل

دامنهٔ این مرحله یک قاب داخلی قابل ارزیابی است؛ پس از توافق بر کیفیت آن، مدل‌ها، مصالح، نور و مسیر دوربین به روایت کامل ساخت گسترش پیدا می‌کنند. سایت ۲۴ مرحله‌ای فعلی جایگزین نشده است.

## فایل‌ها

- `output/protail-interior-reference.blend`: صحنهٔ سه‌بعدی قابل‌ویرایش؛ مدل و بافت‌ها داخل فایل بسته‌بندی شده‌اند.
- `output/interior-preview.png`: رندر اولیه برای بررسی کادربندی و نور.
- `output/protail-interior-reference.png`: خروجی مرجع بزرگ‌تر پس از اصلاح قاب اولیه.
- `build_reference.py`: ساخت تکرارپذیر معماری، تجهیزات، مدل‌های اسکن‌شده، مصالح و نورپردازی.
- `render_saved.py`: رندر مجدد فایل ذخیره‌شده، با امکان تنظیم دوربین، لنز، نوردهی، اندازه و تعداد نمونه‌ها.
- `assets/sources.json`: منابع مدل‌ها و نقشه‌های PBR.
- `tools/verified.json`: نسخه و SHA256 بستهٔ رسمی Blender.
- `hardware.json`: نتیجهٔ بررسی دستگاه‌های رندر.

## روش تولید

این تصویر با Blender Cycles و رهگیری مسیر نور از مدل سه‌بعدی ساخته می‌شود؛ یک تصویر تولیدشده به عنوان پس‌زمینهٔ رندر به کار نرفته است. سیب، لیمو و لیموترش مدل‌های اسکن‌شدهٔ Poly Haven هستند. چوب و کف نقشه‌های رنگ، زبری و نرمال دارند. سایر تجهیزات و معماری داخل همین پروژه مدل‌سازی شده‌اند. بافت سطح گوشت از اطلس تولیدشده در مرحلهٔ قبلی پروژه استفاده می‌کند و مدل اسکن‌شدهٔ گوشت معرفی نمی‌شود.

مدل‌های CC0: [سیب](https://polyhaven.com/a/food_apple_01)، [لیمو](https://polyhaven.com/a/lemon)، [لیموترش](https://polyhaven.com/a/food_lime_01). مصالح: [کف](https://polyhaven.com/a/terrazzo_tiles)، [بلوط روشن](https://polyhaven.com/a/oak_veneer_03).

## اجرای دوباره

نسخهٔ پرتابل Blender داخل `tools/blender-4.5.9-windows-x64` قرار دارد و روی ویندوز نصب سیستمی انجام نشده است. از پوشهٔ اصلی پروژه:

```powershell
& '.\render\tools\blender-4.5.9-windows-x64\blender.exe' --background --factory-startup --disable-autoexec --python-exit-code 1 --python '.\render\build_reference.py' -- --width 1000 --samples 32 --name interior-preview
```

رندر صحنهٔ ذخیره‌شده:

```powershell
& '.\render\tools\blender-4.5.9-windows-x64\blender.exe' --background --factory-startup --disable-autoexec --python-exit-code 1 --python '.\render\render_saved.py' -- --width 1600 --samples 64 --name protail-interior-reference
```

## معیار بررسی قاب

کادربندی در ارتفاع چشم، تشخیص واضح بخش میوه و ویترین پروتئین، جزئیات شیشه و استیل، مقیاس واقعی کالاها، تماس تجهیزات با کف، نور غیرمستقیم و سایهٔ طبیعی، حفظ جزئیات در سطوح روشن، خوانایی هویت بصری و یکپارچگی رنگ و مصالح.
