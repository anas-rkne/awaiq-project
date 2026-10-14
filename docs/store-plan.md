# خطة بناء المتجر — 3WEEQ Store

> المخرجات، القرارات، الأسئلة المعلّقة

## المخرجات

متجر كامل داخل نفس الموقع (Next.js 16 App Router + next-intl)، بواجهة عربية/إنجليزية
(المسار `/ar/store` و `/en/store`)، يحافظ على هوية «عويق» الفاخرة: الألوان
`#2f4e78` / `#cd9e61` / `#f6e6d6`، الخطوط Reem Kufi + Tajawal، RTL عبر
الخصائص المنطقية، وبدون لمس صور المنتجات الأصلية.

### الملفات المنشأة

| الملف | الدور |
|------|------|
| `config/store.ts` | المصدر الوحيد للحقيقة: المنتجات، الأحجام، الأسعار، العملة، الشحن، واتساب |
| `lib/format.ts` | تنسيق السعر بأرقام لاتينية ثابتة عبر اللغتين |
| `components/store/cart/CartProvider.tsx` | حالة السلة (Context + localStorage) تُغلّف الموقع في `[locale]/layout.tsx` |
| `components/store/StoreCatalog.tsx` | شبكة المنتجات (صفحة `/store`) |
| `components/store/ProductCard.tsx` | بطاقة منتج → رابط لصفحة التفاصيل |
| `components/store/ProductDetail.tsx` | صفحة تفاصيل المنتج (الحجم + الكمية + إضافة) + قسم «أكمل المجموعة» بباقي العطور |
| `components/store/QuantityStepper.tsx` | متحكّم الكمية (− / +) — الحد الأقصى من `storeConfig.maxQty` |
| `components/store/AddToCartButton.tsx` | زر الإضافة مع تأكيد بصري |
| `components/store/CartItems.tsx` | بنود السلة داخل الدرج |
| `components/store/CheckoutForm.tsx` | نموذج الطلب (اسم/جوال/مدينة/عنوان/ملاحظات) + ملخص + نجاح |
| `components/store/StoreShell.tsx` | غلاف مشترك لصفحات المتجر (خلفية متدرّجة + توهّج ذهبي + ترويسة/تذييل) |
| `app/[locale]/store/page.tsx` | صفحة المتجر (Server) |
| `app/[locale]/store/[slug]/page.tsx` | صفحة المنتج (Server، `generateStaticParams` من 4 منتجات) |
| `app/[locale]/store/checkout/page.tsx` | صفحة إتمام الطلب (Server) |

### تعديلات الملفات القائمة

- `app/[locale]/layout.tsx`: تغليف بشرة `<CartProvider>`.
- `components/layout/SiteHeader.tsx`: يقرأ عدّاد السلة من `useCart`.
- `components/layout/Navbar.tsx`: وشاح العدّاد يظهر فقط عند عدد > 0 مع حركة نبض.
- `components/layout/CartDrawer.tsx`: بنود حقيقية من السلة + زر «تصفّح المجموعة» → `/store`.
- `components/layout/MenuOverlay.tsx`: رابط «المتجر» (يستخدم `<Link>` للمسارات، `<a>` للمقاطع).
- `config/site.ts`: إضافة `{ index:"05", key:"item5", href:"/store" }` إلى `menuLinks`.
- `components/home/Collection/CollectionSection.tsx`: CTA المغناطيسي → `/store` + رابط «اكتشف» في كل بطاقة.
- `components/home/Craft/CraftNumbers.tsx`: CTA → `/store`.
- `components/home/Ripple/RippleSection.tsx`: CTA → `/store`.
- `components/home/Hero/{HeroCopy,EgyptCopy,BabylonCopy,GreeceCopy,ChinaCopy}.tsx` + `{Egypt,Babylon,Greece,China}Static.tsx`: CTA كان يشير إلى `#bottle` غير الموجود (رابط ميت) → أصبح `<Link href="/store">` عبر كل نسخ الهيرو (9 ملفات).
- `messages/ar.json` + `en.json`: إضافة نطاق `Store` كامل + `Menu.item5`.

### المسارات

- `/{locale}/store` — الكتالوج.
- `/{locale}/store/{egypt|babylon|greece|china}` — التفاصيل.
- `/{locale}/store/checkout` — الطلب.

### نموذج البيانات

```
StoreVariant = { id: "50ml" | "100ml"; sizeMl: number; price: number }
StoreProduct = { id; image; gallery; variants }
storeConfig  = { currency; locale labels; whatsapp; freeShippingThreshold; products[] }
```

الأسعار (ريال سعودي): 50مل = 350، 100مل = 520 (تُثبّت في `config/store.ts` ويقرؤها الكل من مكان واحد).

### السلة

- تخزين `localStorage["3weeq.cart.v1"]` على صورة `{productId, variantId, qty}[]`.
- تُفلتر عند التحميل مقابل `config/store.ts` (تجاهل أي منتج/حجم غير معروف، تثبيت الكمية 1–99).
- `hydrated` يمنع عدم تطابق SSR/CSR (تظهر الأعداد بعد التحميل فقط).
- واجهة `useCart`: `lines, count, hydrated, add, setQty, remove, clear`.

### الطلب (بدون خادم/دفع)

- نموذج على الواجهة → ملخّص نصي للطلب → زر «نسخ الطلب» (Clipboard) + رابط واتساب
  اختياري (يظهر فقط إذا مُلئ `storeConfig.whatsapp`).
- نجاح صادق: «سنتواصل معك لتأكيد الطلب وترتيب الدفع والتوصيل» — لا ادّعاء دفع إلكتروني.
- يُفرَّغ محتوى السلة بعد الإرسال.

### الصور

- تُستخدم صور `/products/1..4.jpg` كما هي (لا تعديل، لا اقتصاص) عبر `next/image` مع `sizes`.

### SEO والبيانات المنظمة

- `app/sitemap.ts`: يبني `sitemap.xml` لكل اللغات (الرئيسية + المتجر + 4 منتجات) مع `hreflang` بين العربية والإنجليزية. صفحة الطلب مستثناة.
- `app/robots.ts`: يسمح بالزحف، ويستثني `/ar|en/store/checkout`، ويشير إلى الـ sitemap.
- `components/seo/JsonLd.tsx`: يحقن `<script type="application/ld+json">` مع تهريب `<` إلى `\u003c`.
- البيانات المنظمة: `Product` + `BreadcrumbList` (صفحة المنتج)، `ItemList` (الكتالوج)، `Organization` (التخطيط الجذري).
- صفحة الطلب تحمل `robots: { index: false }` (لا فهرسة).
- `metadataBase` مضبوط من `lib/site-url.ts`.
- **مطلوب للنشر:** ضبط `NEXT_PUBLIC_SITE_URL` (مثل `https://3weeq.com`) قبل البناء، وإلّا فستحمل الروابط والبيانات المنظمة `localhost`.

## القرارات

1. **ماذا:** متجر ذاتي داخل الموقع لا منصة خارجية.
   **لماذا:** حفاظ على القصة والهوية والتجربة الواحدة. **متى نراجع:** عند الحاجة لبوابة دفع/مخزون.
   **من يملك:** صاحب المشروع.
2. **ماذا:** حالة السلة في Context + localStorage. **لماذا:** لا خادم بعد؛ تجربة فورية وبقاء بين الجلسات.
   **متى نراجع:** عند ربط بوابة دفع/API. **من يملك:** المطوّر.
3. **ماذا:** أرقام لاتينية ثابتة عبر اللغتين (تفادي أرقام عربية في `next-intl`).
   **لماذا:** اتساق بصري مع الموقع الحالي. **متى نراجع:** إن طلب العميل أرقاماً عربية. **من يملك:** مصمّم الواجهة.
4. **ماذا:** الطلب «طلب شراء» لا «دفع». **لماذا:** لا بوابة دفع بعد؛ الصدق أساس الثقة.
   **متى نراجع:** عند إضافة الدفع. **من يملك:** صاحب المشروع.
5. **ماذا:** إعادة توجيه كل أزرار الشراء الحالية إلى المتجر. **لماذا:** لم يعد للمتجر وجود مفقود.
   **متى نراجع:** لا. **من يملك:** المطوّر.

## الأسئلة المعلّقة

- رقم واتساب الطلبات (يترك فارغاً حتى يُزوَّد → يختفي الزر تلقائياً).
- هل الأسعار نهائية أم مبدئية للمراجعة؟
- سياسة الشحن الفعلية ومدة التوصيل (حالياً: مجاني فوق حد يُضبط، ومدة تُذكر في الطلب).
- **النطاق الحقيقي:** ضبط `NEXT_PUBLIC_SITE_URL` قبل بناء الإنتاج (الافتراضي `http://localhost:3000`).

## التحقق

- `npx tsc --noEmit` نظيف، و`eslint` على ملفات المتجر نظيف (الأخطاء المتبقّية في `public/draco/*` سابقة ولا علاقة لها).
- `npm run build` أخضر: 19 صفحة ثابتة (+ `/robots.txt` و`/sitemap.xml`)، ومسارات المتجر (`/ar|/en/store`، 4 منتجات × لغتين، checkout ×2) مُولَّدة مسبقاً.
- فحص وقت التشغيل عبر CDP (Chrome headless) — **11/11** نجحت:
  إضافة للسلة تكتب `localStorage`، وشاح العدّاد = 1، الدرج يعرض البند واتجاهه RTL،
  نموذج الطلب (4 حقول + textarea + زر)، منع الإرسال الفارغ، نجاح الإرسال الصحيح،
  توليد مرجع الطلب `3W-YYYYMMDD-XXXX`، تفريغ السلة بعده، 4 روابط منتجات في الكتالوج،
  وصفحة المنتج الإنجليزية LTR.
- فحص التخطيط — نجحت: العدّاد مخفي عند الفراغ، لا تمرير أفقي على 375px في الكتالوج/التفاصيل/الطلب،
  شبكة التفاصيل عمودان على 1440، المحتوى يتجاوز الترويسة الثابتة (بطاقة أعلى 309px > ترويسة 80px)،
  و`prefers-reduced-motion` يُبقي المحتوى ظاهراً.
- قسم «أكمل المجموعة» في صفحة المنتج يعرض العطور الثلاثة الأخرى (تحقّق عبر HTML: عنوان القسم + 3 روابط منتجات).
- CTA الهيرو (نسخ الحركة وتجريبية `prefers-reduced-motion`) تحوّل من `#bottle` الميت إلى `/ar/store` (تحقّق CDP: الرابط + النقر ينقل إلى `/ar/store`، بلا أخطاء في الكونسول).
- SEO — تحقّق عبر HTTP: `/sitemap.xml` (12 رابطاً + `hreflang`) و`/robots.txt` (استثناء الـ checkout)، وحقن `Product`+`BreadcrumbList` في صفحة المنتج، و`ItemList` في الكتالوج، و`Organization` في التخطيط، و`noindex` على صفحة الطلب.
