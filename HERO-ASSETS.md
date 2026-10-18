# HERO-ASSETS.md — أصول الهيرو (الحضارات)

> **⚠️ تاريخي (§0–§7 أدناه تصف نظام «الغرف» المحذوف).** `heroChambersConfig` و
> `HeroChambers.tsx` و`useHeroChambers.ts` وكل أصول `public/art/hero/{egypt,intro}/**`
> **حُذفت** (§13 في `HERO-REDESIGN-PLAN.md`). الهيرو الآن شاشة ثابتة، ويليه قسم
> **الغوص السردي**.
>
> **الأصول المطلوبة حالياً:** 4 صور أفقية للحضارات **موجودة** في
> `public/art/hero/{egypt2,babel,greek,china}.png` (بالترتيب: مصر · بابل · اليونان · الصين،
> وكلها بنسبة **16:9**): `egypt2.png` 2560×1440 · `babel.png`/`greek.png`/`china.png`
> 1672×941 — تُحمَّل عبر `diveSections[].image` في `diveConfig`. (صور `public/images/sections/*.png`
> كانت مبدئية خاطئة = قواعد/زخارف، لم تُعد مستخدمة.) المقاس الأنسب للنسخ النهائية: 16:9
> عريض بصيغة WebP/JPG لخفض الحجم، مع مساحة داكنة في المركز لقراءة النص المُوسَّط (يُضاف
> عليه سكريم شفاف). لا أصول SVG/PNG شفافة مطلوبة بعد الآن.

---

> الملف المرجعي لتصميم وتسمية أصول قسم الهيرو الجديد (نمط About / momentolegal).
> **القاعدة الذهبية:** سمّي الملفات بالأسماء أدناه بالضبط وحطّها في المسار المحدّد،
> وأنا أربطها تلقائياً بلا أي تعديل منك. أي أصل اختياري غير موجود → يشتغل الهيرو
> بدونه (بتدرّج بديل).
>
> الخطة التقنية: `HERO-REDESIGN-PLAN.md`.

---

## 0. الحالة الحالية (محدّث)

**تحوّل مهم — الأصول الآن SVG أصلية داخل المشروع** (لا PNG): لأن مصادر الصور
المجانية محجوبة/محدودة (Pinterest خلف تسجيل، `upload.wikimedia.org` و`svgrepo.com`
يرجّعان 429) ولا يوجد ImageMagick للتحويل. الكود **لا يقيّد الامتداد**: يقرأ المسار
من `heroChambersConfig` كما هو، فسواء حطّيت `.svg` أو `.png` يعمل — لكن **التسمية
الأساسية** (`gate`, `decor-left`, …) هي المهمّة.

**المنجز:**
- ✅ `public/art/hero/intro/center.svg`
- ✅ `public/art/hero/egypt/gate.svg` (لوتس ذهبي، **فتحة منتصف شفافة**)
- ✅ `public/art/hero/egypt/decor-left.svg` · `decor-right.svg` (نسخة معكوسة)
- ✅ `public/art/hero/egypt/seal.svg` (شريط أنك/موج)
- ✅ `public/art/hero/egypt/emblem.svg` (شعار لوتس صغير — يظهر فوق العنوان)
- ✅ `public/art/hero/egypt/item-1.svg` (اللوتس الأزرق) · `item-2.svg` (المُرّ واللبان —
  مبخرة) · `item-3.svg` (قارورة الألابستر)
- ✅ بوابة مصر **مضمّنة في الـDOM** (`components/home/Hero/art/EgyptGate.tsx`) بطبقتَي
  بتلات `data-petals-outer` / `data-petals-inner` → المحرّك **يزهر اللوتس فعليًا** عند
  الفتح (لا مجرد scale/fade). ملف `gate.svg` يبقى كمصدر تصميم/بديل `<img>`.
- ✅ **نصوص العناصر** (`BrandStory.item1..3` + `item1Text..3Text`) في `messages/{ar,en}.json`
  → تُعرض كتسمية تتبدّل مع صعود العناصر.

**المتبقّي لمصر:** لا شيء إلزامي — جاهزة للمعاينة (`npm run dev` → `/ar`).
**بابل / اليونان / الصين:** بلا أصول بعد — كل غرفة تشتغل حالياً بعنوان + عناصر فقط
(كل الحقول الفنية اختيارية في الكونفيغ).

---

## 1. الفكرة والهيكل العام

**المحرك:** قسم واحد مثبّت (`100dvh`) + `drive(progress)`، والحضارات تصعد في
**مكدّس عمودي** (كاروسيل عمودي) بدل الحلقة الأفقية.

**المحطات (6):**
1. **الفتح** — أول viewport: مشهد مركزي + العنوان.
2. **مصر** — غرفة كاملة (عنوان + زخارف + بوابة كشف + كاروسيل).
3. **بابل** — نفس المنطق، جلد ثقافي مختلف.
4. **اليونان** — نفس المنطق.
5. **الصين** — نفس المنطق.
6. **الأيدي (Hands)** — الخاتمة (موجودة، لا تصمّم لها شيئاً).

**بنية «الغرفة» الواحدة (مشتركة للجميع):**
1. زخارف الحافة تدخل من اليمين/اليسار (نمط About).
2. يظهر **عنوان الحضارة**.
3. يدخل **عنصر الكشف (البوابة)** → عند السكرول **يفتح**.
4. الفتح يكشف **الكاروسيل العمودي** (عناصر الغرفة تصعد، وكل عنصر يثبت في
   المركز ويظهر اسمه/سطرته عبر cross-fade).
5. **الانتقال للحضارة التالية:** البوابة تبقى ثابتة، و**ختم/فاصل** يمرّ في
   المركز، والعالم داخل البوابة يتبدّل → إحساس «تنقّل داخل مكان واحد».

**آلية الربط = دمج (1 البوابة الثابتة + 2 الفاصل المارّ).**

---

## 2. بنية المجلدات والأسماء (مهم — أنا أقرأ هذه الأسماء)

```
public/art/hero/
  intro/
    center.svg                 ← مشهد الفتح الأول
  egypt/
    gate.svg                   ← عنصر الكشف (البوابة) — إلزامي
    gate-open.svg              ← (اختياري) حالة الفتح الكامل
    decor-left.svg             ← زخرفة الحافة اليسرى
    decor-right.svg            ← زخرفة الحافة اليمنى
    emblem.svg                 ← شعار صغير للعنوان (اختياري)
    seal.svg                   ← الفاصل المارّ عند الانتقال للحضارة التالية
    item-1.jpg                 ← عنصر الكاروسيل #1 (svg/jpg/png/webp)
    item-2.jpg                 ← عنصر الكاروسيل #2
    item-3.jpg                 ← عنصر الكاروسيل #3
    texture.jpg                ← خامة/خلفية الغرفة (اختياري)
  babylon/    ← نفس الأسماء بالضبط
  greece/     ← نفس الأسماء بالضبط
  china/      ← نفس الأسماء بالضبط
```

**ملاحظة:** عدد `item-N` غير محدّد — سمّها `item-1`, `item-2`, `item-3`…
بالترتيب الذي تبيها تصعد فيه. (3 عناصر لكل غرفة مقترح؛ 2–5 مقبول.)
الامتداد حرّ (`.svg` / `.jpg` / `.png` / `.webp`)؛ المهم بادئة الاسم.

---

## 3. المواصفات التقنية لكل نوع

| الأصل | المقاس المقترح | الصيغة | الارتكاز | ملاحظات |
|---|---|---|---|---|
| `gate` | ~1600×2400 (نسبة 1:1.5) | SVG (أو PNG-32 شفاف) | **أسفل-وسط** | **فتحة منتصف شفافة** — الكاروسيل يظهر عبرها |
| `gate-open` | نفس المقاس | SVG/PNG-32 | نفس `gate` | فقط لو الفتح يحتاج طبقتين |
| `decor-left/right` | ~1400×1800 | SVG/PNG-32 | حسب الحافة | نمط About: تنزلق ثم تستقرّ بحدّ الشاشة |
| `emblem` | 512×512 | SVG/PNG-32 | وسط | optional |
| `seal` | ~2000×400 (شريط أفقي) | SVG/PNG-32 | وسط | يمرّ في المركز عند الانتقال |
| `item-N` | 1200×1500 (نسبة 4:5) | JPG/WebP (أو SVG) | وسط | عنصر الكاروسيل العمودي |
| `texture` | 2048×2048 | WebP/JPG | — | فقط لو للغرفة خلفية خاصة |
| `intro/center` | 1600×2000 | SVG/PNG-32/WebP | وسط | مشهد الفتح |

> **عند استخدام SVG:** `<img>` عادي (لا `next/image`)، والتحريك عبر GSAP على
> المجموعات الداخلية (`#petals-outer` …) يتطلب **تضمين الـ SVG في الـ DOM** إن
> أردت تحريك البتلات داخل البوابة؛ أما تحريك البوابة كوحدة (scale/rotate/fade)
> فيعمل مع `<img>` مباشرة — وهو المنفّذ حالياً.

**الهوية البصرية:**
- ذهبي `#cd9e61` · بيج `#f6e6d6` · ناڤي `#2f4e78` / `#1a3350`.
- خطوط زخرفية ذهبية رفيعة (line-art) لإحساس About.
- شفافية نظيفة حول الحافّات (لا halo أبيض).
- كل «بوابة» **تفتح بنفس حركة البراند** (انفتاح شعاعي/إزاحة) → اختلاف الجلد فقط.

---

## 4. عناصر الكشف + جمل البحث (صور/إلهام)

### 4.1 الفتح — `intro/center.png`
- `luxury perfume still life render`
- `dark navy product hero 3d render`
- `gold smoke particles on navy background`

### 4.2 مصر — بوابة اللوتس الذهبي
| الأصل | عنصر | جمل البحث |
|---|---|---|
| `gate.png` | لوتس ذهبي تتفتّح بتلاته | `egyptian blue lotus gold vector transparent` · `golden lotus emblem png` · `lotus petals layered ornament` |
| `decor-left/right.png` | زخارف مصرية | `papyrus hieroglyph border png` · `winged sun disk egypt gold` · `egyptian column capital png` |
| `seal.png` | فاصل هيروغليفي | `egyptian hieroglyph band pattern` |
| `item-N.png` | إناء ألابرست/نقوش | `alabaster perfume vessel egypt png` · `egyptian lotus relief png` |

### 4.3 بابل — بوابة عشتار
| الأصل | عنصر | جمل البحث |
|---|---|---|
| `gate.png` | بوابة عشتار المزجّجة | `ishtar gate illustration blue glazed` · `babylonian gate facade png` · `winged sun disk assyrian` |
| `decor-left/right.png` | زخارف بابلية | `cuneiform clay tablet texture png` · `lamassu winged bull png` · `mesopotamian ziggurat drawing` |
| `seal.png` | فاصل مسماري | `cuneiform script band pattern` |
| `item-N.png` | أختام/أواني | `babylonian cylinder seal png` · `mesopotamian perfume jar png` |

### 4.4 اليونان — إكليل الغار / بوابة المعبد
| الأصل | عنصر | جمل البحث |
|---|---|---|
| `gate.png` | إكليل غار دائري | `laurel wreath gold ring vector png` · `greek temple portico illustration` · `ionic column capital png` |
| `decor-left/right.png` | زخارف يونانية | `greek meander key pattern svg` · `olive branch gold png` · `ancient greek amphora perfume vase png` |
| `seal.png` | فاصل مياندر | `greek key meander border` |
| `item-N.png` | جَرّة/فخّار | `grecian urn silhouette png` · `greek amphora png` |

### 4.5 الصين — بوابة القمر
| الأصل | عنصر | جمل البحث |
|---|---|---|
| `gate.png` | بوابة القمر الدائرية | `chinese moon gate illustration` · `paifang chinese gate png` · `jade bi disc png` |
| `decor-left/right.png` | زخارف صينية | `chinese cloud ruyi pattern svg` · `dougong bracket drawing` · `dragon gold line art png` |
| `seal.png` | فاصل سحابي | `chinese cloud border pattern` |
| `item-N.png` | بورسلين/يشم | `blue and white porcelain vase png` · `jade ornament png` |

### 4.6 عناصر الكاروسيل (عام، لو ما عندك خاص)
- `luxury perfume bottle 3d render transparent`
- `product macro gold beige`
- أو 3 عناصر لكل غرفة تمثّل فصول قصتها (الأفضل).

---

## 5. قائمة التصميم (Checklist)

**إلزامي لكل حضارة:** `gate.png` · `decor-left.png` · `decor-right.png` · `seal.png` · `item-1..3.png`
**إلزامي مرة واحدة:** `intro/center.png`
**اختياري:** `gate-open.png` · `emblem.png` · `texture.png`

أولوية التنفيذ: **مصر** أولاً (نضبط الحسّ عليها) → ثم بابل/اليونان/الصين بنفس القالب.

---

## 6. كيف سأربطها

الربط **منفّذ فعلاً** عبر `heroChambersConfig` في `config/site.ts` (والمشهد
`components/home/Hero/HeroChambers.tsx` + المحرّك `hooks/useHeroChambers.ts`).
كل غرفة بهذا الشكل:

```ts
{
  id: "egypt",
  messages: "BrandStory",       // نصوص العنوان + العناصر من messages
  href: "/store/egypt",
  gate: "/art/hero/egypt/gate.svg",
  decor: { left: "...", right: "..." },
  emblem: "/art/hero/egypt/emblem.svg",
  seal: "...",
  items: [{ image: "/art/hero/egypt/item-1.svg",
            titleKey: "BrandStory.item1",
            captionKey: "BrandStory.item1Text" }, ...],
}
```

> **باب مصر المضمّن:** لتحريك فتح البوابة (زهر اللوتس)، الغرفة تُسجَّل في
> `INLINE_GATES` داخل `HeroChambers.tsx`. أي حضارة بلا تسجيل تلقائيًا تستخدم
> `gate` كـ`<img>` (تُحرَّك كوحدة: scale/rotate/fade).

بمجرد ما تحطّ الملفات بالأسماء أعلاه، غيّر المسار في الكونفيغ (أو استخدم نفس
الأسماء) والربط يصير مباشر. **كل حقل فني اختياري**: غياب `gate`/`decor`/`seal`
يعني أن الغرفة تلعب بدونها.

---

## 7. ملاحظات تصميم
- **فتحة البوابة**: اتركيها شفافة في `gate.png` حتى يظهر الكاروسيل عبرها (مهم للكشف).
- **الاتجاه الموحّد**: كل البوابات تفتح بنفس المنطق ليتوحّد «إحساس الحركة».
- **لا halo أبيض**: نظّفي حافّات PNG على الخلفية الناڤي.
- **RTL**: النصوص عربية — لا تستخدمي SplitText/وحدات حروف منفصلة.
