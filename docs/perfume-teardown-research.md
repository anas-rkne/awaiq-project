# بحث: تفكيك مواقع العطور الفاخرة (Agent A)

بحث حقيقي عبر `webfetch`. أداة البحث المدمجة محجوبة (403). كل ادعاء مُسنَد إلى ملف/رابط تم جلبه فعلاً؛ المواقع التي فشل جلبها مُدرجة صراحةً. **لا بيانات مُختلقة.**

## 1. جدول المقارنة

| الموقع | الخطوط | اللوحة (hex) | التخطيط | الهيرو | بطاقة المنتج | CTA | التنقل | إشارات الحركة |
|---|---|---|---|---|---|---|---|---|
| **Byredo** | `byredoSans`, `byredoStencil`, `Inter` | `#FFFFFF`, `#000000`, `#111827`, `#374151`, `#e5e7eb`, `#9ca3af` | Next.js، حاويات عريضة (~90rem) | كتل صور كبيرة عبر الشاشة | اسم/سعر ظاهران افتراضياً | `Discover` (×200)، `Signature` (×172)، `Explore` (×76)، `Add to cart` (×4) | شريط علوي | Next.js؛ انتقالات CSS؛ لا GSAP/Lenis في المقتطف |
| **Le Labo** | `Bell Gothic Std`, `Magda`, `Helvetica`, `Arial Narrow`, `Noto Sans` | `#ebebeb`, `#e5e5e5`, `#f6f8f6`, `#262626`, `#424242`, `#595959` | شبكة تقليدية (jQuery) | بانرات/كاروسيل | اسم+سعر ظاهران عادةً | `Discover` (×77)، `Add to Cart` (×12)، `Explore` (×2) | تنقّل علوي كلاسيكي | **Owl Carousel + Slick**؛ لا Lenis/GSAP |
| **Penhaligon's** | `Cormorant Garamond`, `Montserrat`, `Goudy`, `Balmoral`, `Cormorant Infant`, `Libre Baskerville`, `Knockout`, `Proxima Nova` | `--wl-color-primary:#3d4454`, `--wl-color-text-primary:#222`, `--pen-brand:#9f9d88`, `--pen-black:#20201f`, `#f0f0f0` | حاوية `max-width:90rem` (1440px)، Bootstrap | منطقة Hero (`role="region"`) | مراجع منتجات موجودة؛ التفاصيل غير مؤكدة | يتباين (SPA) | تثبيت عبر `z-index` | Angular؛ لا GSAP/Lenis في الـ head |
| **Snif** | `GrandSlang Roman`, `Moneta`, `Sharp Grotesk`, `Impact` | `#000000`, `#ffffff`, `#B47559`, `#fff7f0`, `#252121`, `#e32c2b` | Shopify Dawn-like؛ `max-width` 652–1024px | كتلة `.hero` + `.hero__cta` (صورة كاملة + نص/زر) | عناوين/روابط موجودة؛ الـ`price-item` متوقّع | `add to cart` في الثيم | هيدر/ماقي ميجا | **Swiper**؛ `loading="lazy"` |
| **Tom Ford** | — | — | صفحة اختيار منطقة | نصّي/شاشة بداية | — | — | — | — |

## 2. ملاحظات تفصيلية

**Byredo** ([byredo.com](https://www.byredo.com/)): خطوط Sans/Stencil مخصّصة + Inter للواجهة. لوحة أبيض/أسود + رمادي أردوازي (تأكيد من CSS). CTA المتكرر `Discover` و`Signature` — أي **فعل استكشافي لا بيعي**. حركة محدودة في المقتطف.
- **ممتاز:** تايبوغرافي تحريري نظيف + لوحة مقيّدة تبرز المنتج.
- **ضعيف:** سرد تمرير خفيف؛ كثافة معلومات بطاقة محافظة.

**Le Labo** ([lelabofragrances.com](https://www.lelabofragrances.com/)): خط عرض `Magda` + `Bell Gothic` يمنح صوتاً قوياً. لوحة رمادية تحتstated. **Owl Carousel + Slick**.
- **ممتاز:** خطوط مخصّصة = هوية صوتية قوية.
- **ضعيف:** حركة كاروسيل تقليدية، لا سرد مدفوع بالتمرير.

**Penhaligon's** ([penhaligons.com](https://www.penhaligons.com/)): أغنى مجموعة خطوط (Cormorant/Goudy/Balmoral/Baskerville) + UI. متغيرات CSS موسّعة (`--pen-*`). حاوية 90rem. SPA أنغولار.
- **ممتاز:** تايبوغرافي سيرِف متعدد الطبقات + لوحة تُشعر بالتراث والفخامة.
- **ضعيف:** لا مكتبات حركة مربوطة بالتمرير ظاهرة.

**Snif** ([snif.co](https://snif.co/) — نسخة Wayback 2024): عرض `GrandSlang`/`Moneta`/`Sharp Grotesk`. تباين أسود/أبيض + لهجات دافئة (`#B47559`, `#fff7f0`, `#e32c2b`). **Swiper** + `loading="lazy"`.
- **ممتاز:** تحريري جسور بخط قوي وتباين عالٍ.
- **ضعيف:** الحركة محصورة بـ Swiper؛ وصف الروائح غير ظاهر في مقتطف الواجهة.

## 3. مواقع فائزة (مراجع قابلة للتحقق)

تعذّر استخراج تواريخ SOTD/FWA آلياً (CAPTCHA في محرّكات البحث). أدناه مراجع صفحات Awwwards قابلة للبحث، **دون اختلاق تواريخ**:
1. Aesop — https://www.awwwards.com/websites/aesop/
2. Byredo — https://www.awwwards.com/websites/byredo/
- Maison Francis Kurkdjian، Amouage، Diptyque، Parfums de Marly، Xerjoff، Creed — صفحات مرجعية على awwwards.com/websites/<slug>/.

## 3. المواقع التي فشل جلبها + السبب
Aesop، Diptyque، Amouage، MFK، Creed، Xerjoff، Parfums de Marly، Ormonde Jayne، Ellis Brooklyn، Abbott NYC — **HTTP 403** (حماية بوت/تحدي JS)، وWayback رجع **429** (طلبات كثيرة). DuckDuckGo رجع CAPTCHA.

## 5. تخليق — 12 قراراً تصميمياً متكرراً في أفضل مواقع العطور

1. **الخط هو البطل** — سيرِف عرضي مخصّص فوق الطيّة + UI نظيف.
2. **انضباط تحريري** — أحادي/محايد مع لهجة أو اثنتين فقط.
3. **تصوير جوي كبير** — ملء الشاشة، إضاءة ناعمة، ملمس.
4. **مساحات تنفّس** — حاويات عريضة (~90rem) لا مزدحمة.
5. **CTA استكشافي** — `Discover/Explore` لا `Buy`.
6. **حركة هادئة** — انتقالات CSS، كاروسيل محدود، سرد تمرير نادراً.
7. **بطاقة تُظهر الاسم على الأقل افتراضياً** (لا hover-only حصراً).
8. **إشارات تراث** — سيرِف، حفر، ملمس زجاج/حجر.
9. **تنقّل لاصق خفيف** — حاضر لكن غير مزعج.
10. **صور مستجيبة** — srcset + lazy + صيغ حديثة.
11. **PDP غامرة** — سرد مكوّنات بدل شبكة كثيفة.
12. **CTA بأفعال قليلة ومحدّدة**.
