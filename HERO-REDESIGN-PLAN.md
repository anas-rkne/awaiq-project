# خطة إعادة تصميم الهيرو بنمط قسم About (momentolegal conveyor)

> المرجع البصري/التقني: `components/home/About/AboutSection.tsx` (نسخة مطابقة لأصل
> `momentolegal.com` → `HomeExpertiseSection`).
> المرجع الحالي للهيرو: `components/home/Hero/*` + `hooks/useHeroMotion.ts`.

> **⚠️ الحالة الحالية (اقرأ §14 أولاً).** كل ما في §1–§13 **تاريخي/محذوف**:
> نمط الـconveyor والغرف (`HeroChambers`, `useHeroChambers`, `HeroConveyor`, `ConveyorPillar`)
> وقسم الغوص السردي (`ImmersiveDive`) وكل الأصول المرافقة حُذفت. الهيرو الآن **فصل البوابة**
> (§14): قسم طويل بمسرح `sticky` — غبار → صعود البوابة → غوص → كشف مصر — ويليه مباشرة
> كاروسيل الحضارات.

---

## 1. الهدف والقرارات المعتمدة
- إعادة بناء الهيرو بنفس **أسلوب About**: قسم واحد `100dvh` مثبّت، وحزام دوّار
  (conveyor) للحضارات الأربع حول زجاجة مركزية، مدفوع بدالّة **`drive(progress)`**
  النقية (لا timeline بالـtweens).
- **النطاق**: حزام دوّار كامل (نمط About).
- **العناصر الحالية**: الإبقاء على **مشهد الأيدي (Hands finale) فقط**، وإزالة
  اللوحات/الجسور/الكيميرات/الأركان الحجرية/الرادار/السحب/الضباب من مسرح الـconveyor.
  الخلفية تصير **ناڤي مصمت** مثل About (بلا سحب/ضباب/رادار).
- **النوافذ الدائرية**: صور المنتجات الحالية `/products/1..4.jpg` (لا حاجة لميداليات جديدة).
- **الكشف/التقنية**: مُحتفَظ بها حرفياً من About (انظر §5).

## 2. الفكرة البصرية (النموذج)
قسم واحد مثبّت على خلفية `#1a3350`:
- **المركز**: زجاجة البراند (`/art/hero/pixlr-bottle.webp`) — كائن ثابت بإطار + نافذة
  دائرية (بنمط `PocketWatch`) تعرض صورة الحضارة الحالية.
- **حولها**: **حزام دوّار** من 4 أعمدة (plinth)، كل عمود يحمل نافذة دائرية فيها صورة
  المنتج؛ الأعمدة تدور على دائرة موهومة وتظهر/تختفي عند مرورها.
- **التسميات**: اسم الحضارة + سطرها الشعري يتقاطعان (cross-fade) عند مركز الزجاجة
  (نفس `--watch-center-y`).
- **العلامة المائية** `PERFUMES` أسفل الشاشة (نص، بلا صورة).
- **زخارف الأركان** (`/left.png` + `/right.png`) تنزلق من الحافّتين للداخل.
- **الخاتمة**: عند نهاية التثبيت، تُدفع الأعمدة وتُسلَّم الزجاجة إلى مشهد **الأيدي**.
- **العنوان الرئيسي** (Hero headline) يظهر في البداية ثم يتقاطع مع بدء الحزام.

## 3. ما نأخذه من About حرفياً (والفرق)
| عنصر About | نستخدمه في الهيرو؟ |
|---|---|
| `100dvh` + pin | نعم |
| `pin` (`pinSpacing:true`) + `scrub` | نعم — لكن **بمشغّل واحد** (مشغّلان منفصلان على نفس العنصر يفسدان `start` الـscrub، انظر §12) |
| `drive(progress)` دالة نقية | نعم (جوهر التحويل) |
| `measure/reset/place` + `matchMedia` + `ResizeObserver` | نعم |
| `place(angle,rot)` الدائرة | نعم (نفس المعادلات) |
| `PocketWatch` (نافذة 52% دائرية) | نعم → `ConveyorPillar` |
| تقاطع التسميات عند المركز | نعم |
| زخارف الأركان | نعم |
| العلامة المائية | نعم |
| **حزام insights** في النهاية | **لا** — نُسلّم إلى مشهد الأيدي بدلاً منه |
| حادثة linear-gradient بالخلفية | مبسّطة (ناڤي مصمت) |

## 4. المعمارية والملفات
### تُنشأ
- `components/home/Hero/ConveyorPillar.tsx` — نسخة `PocketWatch` باسم مناسب
  (إطار + نافذة دائرية 52% + `data-shared-image-source`).
- `hooks/useHeroConveyor.ts` — المحرّك الجديد (measure/reset/place/drive +
  مشغّلا ScrollTrigger + matchMedia + ResizeObserver). يُستخرج المنطق من
  `useHeroMotion` الحالي ويُستبدل.
- (اختياري) `components/home/Hero/HeroWatermark.tsx` وإعادة استخدام منطق العلامة المائية.

### تُعدّل
- `config/site.ts` — استبدال/إضافة كتلة `heroConveyor` (geometry + timings) بدل
  `motionTimeline`/`bridgeBlock`/`perViewport.motion`/`radar`/`clouds`/`mist`/الألواح.
- `hooks/useHeroMotion.ts` — يُقلَّص إلى المُخرجات + بقايا مشهد الأيدي، أو يُستبدل بـ
  `useHeroConveyor` (نفضّل الاستبدال مع إبقاء أسماء المُخرجات تحتاجها المكوّنات).
- `components/home/Hero/HeroScene.tsx` — إعادة بناء المشهد: الحزام + الزجاجة + التسميات.
- `components/home/Hero/HeroSection.tsx` — الربط + نسخة reduced-motion الجديدة.
- `components/home/Hero/HeroStage.tsx` — تبسيط (بلا perspective/zoom camera إن لم يحتج الحزام).

### تُحذف (بعد التأكد من عدم استخدامها)
- `PlateImage.tsx` · `HeroBackdrop.tsx` · `HeroClouds.tsx` + `heroCloudsShader.ts` ·
  `HeroMist.tsx` + `heroMistShader.ts` · `HeroRadar.tsx` · الـStatic
  (`EgyptStatic/BabylonStatic/GreeceStatic/ChinaStatic`) · الـCopy الجانبي
  (`EgyptCopy/BabylonCopy/GreeceCopy/ChinaCopy`) — تُستبدل بتسميات الحزام.
- `config`: كتل `egyptConfig/babylonConfig/greeceConfig/chinaConfig` + الألواح.

### تبقى كما هي
- `HeroLoader.tsx` (يفضّل إبقاؤه) · `Hands/*` (مشهد الأيدي) · `SmoothScroll` (Lenis) ·
  `useHeroResponsive` (يُعاد استخدام منطق الاستجابة للـmatchMedia).

## 5. آلة `drive(progress)` — المراحل والمعادلات
> منقولة من `AboutSection.tsx` (§`build` → `measure/reset/place/drive`).

- `d = clamp01(progress / 0.82)` — أول 82% تدير الحزام، والباقي للخاتمة.
- **القياسات** (`measure`): `base = min(stageH, 9/16·w)` ديسكتوب / `min(h,w)` جوال؛
  `band = 0.42·base`؛ `colH = (2500/768)·band`؛ `watchTop = 0.18·base`؛
  `step = 0.391111·base`؛ `stepFar/stepBack`.
- **`place(angle, rot)`**: `dist = stageH + (angle/100)·colH`؛
  `inner = stageH − colH·(1 − angle/100) − dist`؛
  `x = −inner·sin(rad)`، `y = dist + inner·cos(rad) − watchTop·s`، `rotation=rot`.
- **مؤشّر الحزام الكسري**: `e = clamp01((d − e0)/(...) )·(count−1)`؛ لكل عمود
  `r = i − e`، `a = |r|`؛ الخفوت `fade(a)`، الدوران `±12°`، `yPercent 68→78`.
- **عمودان إضافيان** (lead/trail) لحسم «الدرزة» عند الالتفاف (يحملان آخر/أول حضارة).
- **التسميات**: تُظهر العمود الأقرب للمركز فقط عبر `1 − 2a` عند `--watch-center-y`.
- **الخاتمة** (بدل insights): عند `d > 0.85` دفع الأعمدة للخارج + تكبير الزجاجة →
  تسليم لمشهد الأيدي (نافذة `hands`).
- **زخارف الأركان**: `rt = clamp01(progress/0.12)` انزلاق للداخل ثم خفوت.

## 6. التجاوب + reduced-motion
- نقطتا انكسار: `mm.add("(max-width: 1023px)", …)` و`(min-width: 1024px)`.
- القياسات تُصدَّر كـCSS vars: `--hero-band`, `--hero-watch-top`, `--watch-center-y`.
- `prefers-reduced-motion`: قسم واحد `100svh` ثابت بلا ScrollTrigger — الزجاجة + عمود
  واحد + العنوان (نسخة Static مبسّطة)، ثم مشهد الأيدي الثابت (`HandsSection` الحالي).

## 7. التكامل مع الأيدي و Lenis
- **Lenis**: جذره `display:flex` → **`pinSpacing:true` إجباري** وإلا يصير مسافة التمرير صفر
  (نفس درس About §`ScrollTrigger.create`).
- **الأيدي**: تبقى ذروة نهائية. عند نهاية `drive` نستدعي نفس منطق التسليم الحالي
  (`handsStageRef`, `handsHandleRef.setBaseZoom`, `bottleHandoff`) أو نُبقيها قسمًا تاليًا.
- التحقق: `npx tsc -p tsconfig.check.json --noEmit` + `npx eslint .`.

## 8. الصور المطلوب تصميمها
> بعد القرارات (نوافذ = صور المنتجات، وإزالة اللوحات)، القائمة قصيرة:

| # | الأصل | المقاس/الصيغة | إلزامي؟ | ملاحظات |
|---|---|---|---|---|
| 1 | **العمود/البلوك** `heroBlock.png` | 768×2500 PNG شفاف | **نعم (الأهم)** | نقطة الارتكاز **أسفل الوسط**؛ مادة البراند (حجر/أونيكس + حدّ ذهبي). مؤقتاً: `blockv2.png` الموجود |
| 2 | نوافذ الحضارات (4) | `/products/1..4.jpg` (1:1) | لا | **موجودة** — تدخل النافذة الدائرية 52% |
| 3 | الزجاجة المركزية | `/art/hero/pixlr-bottle.webp` 1152×2048 | لا | موجودة — نسخة أنظف اختيارية |
| 4 | زخرفتا الأركان | `/left.png` + `/right.png` (~1200 عرض) | لا | موجودتان — تصميم جديد اختياري |
| 5 | العلامة المائية | نص فقط | لا | «PERFUMES» / اسم البراند |
| 6 | لوحات الحضارات | `egypt2/babel/greek/china.png` | **لا حاجة** | أُزيلت مع نمط الألواح |
| 7 | الرادار/السحب/الضباب | — | **لا حاجة** | أُزيلت (ناڤي مصمت) |

**الخلاصة**: الأصل الوحيد الواجب تصميمه هو **العمود (plinth)**. الباقي موجود أو نص/CSS.

## 9. خطوات التنفيذ (مرتبة)
1. إضافة كتلة `heroConveyor` في `config/site.ts` (geometry + timings + landing).
2. إنشاء `useHeroConveyor.ts` (نسخ `measure/reset/place/drive` من AboutSection + مشغّلا ScrollTrigger + matchMedia).
3. إنشاء `ConveyorPillar.tsx`.
4. إعادة بناء `HeroScene.tsx` (حزام + زجاجة + تسميات + زخارف + علامة مائية).
5. تحديث `HeroSection.tsx` (ربط + reduced-motion) وتبسيط `HeroStage.tsx`.
6. وصل الخاتمة بمشهد الأيدي (نافذة `hands`).
7. حذف الملفات/الكتل غير المستخدمة (List §4) بعد التحقق.
8. `tsc` + `eslint`، ثم معاينة بشرية للضبط (سماكة/سرعة/كثافة).

## 10. المخاطر والحسم
- **التشابه مع About**: الهيرو سيقرأ كقسمين متشابهين متتاليين. الحسم: تمييز الهيرو
  بـ(زجاجة مركزية + هالة + نصوص الافتتاحية) وتغيير تسلسل About لاحقًا إن لزم.
- **فقدان الجوّ**: إزالة السحب/الضباب تُبسّط المشهد (كما About) — مقصود.
- **إزالة الألواح**: تفقد «مناظر الحضارات»؛ compensations: تسميات + علامة مائية + عمود.
- **reduced-motion**: يجب بناء نسخة ثابتة قبل حذف الـStatic القديمة.
- **Lenis/pinSpacing**: خطأ شائع يوقف التمرير — يجب `pinSpacing:true`.
- **نقطة ارتكاز العمود**: أسفل الوسط — وإلا انحرفت `place()`.

---

## 11. حالة التنفيذ — الحزام الأفقي (سابقة، مُستبدلة بـ§12)
> هذا القسم يوثّق النسخة **الأفقية** القديمة (`HeroConveyor`). المستخدم غيّر
> الرؤية إلى **مكدّس عمودي بغرف** → انظر §12. ملفات §11 (`useHeroConveyor.ts`,
> `HeroConveyor.tsx`, `ConveyorPillar.tsx`) **حُذفت** ولم تعد موجودة.

**منجز** — الهيرو الجديد مبني ومربوط، وكل الفحوص خضراء
(`npx tsc -p tsconfig.check.json --noEmit` · `npx eslint components hooks config app` · `npm run build`).

الملفات:
- **أُنشئت**: `hooks/useHeroConveyor.ts` (measure/reset/place/drive + `matchMedia` +
  مشغّلا `pin`/`scrub` + `ResizeObserver`) · `components/home/Hero/ConveyorPillar.tsx` ·
  `components/home/Hero/HeroConveyor.tsx` (المشهد الكامل: الزخارف + العلامة المائية +
  الحزام + التسميات + العنوان + CTA + نافذة الأيدي).
- **عُدّلت**: `config/site.ts` (+`heroConveyorConfig`) · `HeroSection.tsx`
  (يعرض `HeroConveyor` للحركة، والـStatic للأيدي/`reduced-motion`).
- **حُذفت (12 ملفًا ميتًا، مؤكَّد أنه لا يستوردها شيء)**:
  `HeroScene.tsx` · `HeroStage.tsx` · `HeroBackdrop.tsx` · `HeroClouds.tsx` ·
  `HeroMist.tsx` · `HeroRadar.tsx` · `HeroCopy.tsx` · `hooks/useHeroMotion.ts` ·
  `EgyptCopy.tsx` · `BabylonCopy.tsx` · `GreeceCopy.tsx` · `ChinaCopy.tsx`.

### تصحيحات على قائمة الحذف الأصلية (§4 — كانت مغلوطة)
تُركت هذه لأنها **حيّة**:
- `heroCloudsShader.ts` → يستورده `components/home/Sky/GlobalSkyLayer.tsx`.
- `heroMistShader.ts` → يستورده `components/home/Hands/handsScene.ts`.
- `PlateImage.tsx` → تستورده فصول `*Static` (تبقى لـ`reduced-motion`).
- `*Static.tsx` → تبقى كنُسَخ `reduced-motion` (لا تُحذف).

### مخالفات مقصودة عن الخطة
- **`d = clamp01(progress / 0.57)`** وليس `/0.82` — لتطابق About حرفيًا (بدلًا من §5).
- **تنتهي الخاتمة عند** `hp = clamp01((progress − 0.55) / 0.35)` (نافذة الأيدي) بدل `d > 0.85`.
- **لم يُنشأ** `HeroWatermark.tsx` (العلامة المائية نص داخل `HeroConveyor` = `siteConfig.name`).
- **لم يُبسَّط** `HeroStage.tsx` — حُذف بالكامل (لم يعد له دور).
- كتل config القديمة (`bridgeBlock`/`motionTimeline`/`perViewport.motion`) لم تُحذف بعد
  لأنها ما زالت مستوردة من `useHeroResponsive`/`handsScene` — تنظيف لاحق اختياري.

### متبقٍّ
- تحقّق بشري بصري للضبط الجمالي (سماكة/سرعة/كثافة نافذة الزجاجة والتسميات) — لا معاينة آلية.
- إثراء مفاتيح `prefers-reduced-motion` الفرعية (غير موجودة أصلًا، حتى في About).

---

## 12. التنفيذ الحالي — الغرف العمودية (Chambers) — **تاريخي، حُذف**

> **محذوف بالكامل** (§13). هذا القسم يوثّق نسخةً سابقة أُلغيت بطلب المستخدم؛
> `HeroChambers.tsx` و`useHeroChambers.ts` و`config.heroChambersConfig` والأصول
> (`public/art/hero/egypt/**`, `public/art/hero/intro/**`) **لم تعد موجودة**.

**الرؤية:** قسم واحد مثبّت `100dvh` + `drive(progress)` (نفس تقنية About)، لكن بدل
حلقة أفقية → **كاروسيل عمودي من غرف**، غرفة لكل حضارة، كلها بنفس الأربع إيقاعات:
**ARRIVE** (زخارف الحافة تدخل + العنوان يظهر) → **OPEN** (البوابة/عنصر الكشف يهبط +
قزحية `clip-path` تفتح الكاروسيل خلفه) → **SCROLL** (العناصر تصعد عبر فتحة البوابة) →
**DEPART** (البوابة ترتفع + **الختم** يمرّ في المركز) → ثم الخاتمة **HANDS**.
**الربط = دمج** (بوابة ثابتة + فاصل مارّ).

### الملفات (الحالة الراهنة)
- **أُنشئت**: `hooks/useHeroChambers.ts` (المحرّك: `measure` + `drive(t)` لكل غرفة +
  **مشغّل ScrollTrigger واحد** يثبّت ويشغّل `scrub` معاً + `ResizeObserver` + كشف تفعيل الأيدي) ·
  `components/home/Hero/HeroChambers.tsx` (المشهد: إطار الفتح + الغرف الأربع + نافذة الأيدي).
- **عُدّلت**: `config/site.ts` (`heroConveyorConfig` → `heroChambersConfig` بأنواع
  `HeroChamber`/`HeroChamberItem`؛ كل حقل فني **اختياري**) · `HeroSection.tsx`
  (يعرض `HeroChambers` للحركة، و`*Static` لـ`reduced-motion`) ·
  `eslint.config.mjs` (استثناء `components/home/Hero/**` من `no-img-element` +
  تجاهل `public/**`).
- **حُذفت** (النسخة الأفقية): `HeroConveyor.tsx` · `ConveyorPillar.tsx` · `useHeroConveyor.ts`.
- **أصول** (SVG أصلية): `public/art/hero/intro/center.svg` ·
  `public/art/hero/egypt/{gate,decor-left,decor-right,seal,emblem}.svg`.

### المعايرة (تُقرأ كلها من ثوابت أعلى `useHeroChambers.ts`)
- `INTRO = 0.07` · `HANDS = 0.13` · `SEG = (1 − INTRO − HANDS)/N` غرفة.
- داخل الغرفة: `A_ARRIVE = 0.14` · `A_OPEN = 0.30` · `A_DEPART = 0.84`.
- `DECOR_CLIP = 55` (نسبة إزاحة زخرفة الحافة عن حافّتها).
- `stride = stageH × 0.6` (تباعد الكاروسيل العمودي).
- مدى التثبيت/الـscrub (قيمة واحدة للاثنين): `heroChambersConfig.scroll.scrub`
  (ديسكتوب 1800% · جوال 400%).

### قرارات فنية
- **`<img>` عادي** لأصول الغرف (لا `next/image`) — لتفادي تعقيد `dangerouslyAllowSVG`
  وللسيطرة الكاملة على تحويلات GSAP؛ لذلك استُثني مسار الهيرو من قاعدة ESLint.
- **تحريك البوابة كوحدة** (scale/rotate/fade) + **قزحية `clip-path`** على الكاروسيل
  لإيحاء «الفتح» — بدل تحريك بتلات الـSVG (يتطلب تضمين الـSVG في الـDOM؛ ممكن لاحقًا).
- **`pinSpacing: true`** إجباري (جذر Lenis `display:flex`).
- **كل الحقول الفنية اختيارية**: الغرفة بلا `gate`/`decor`/`seal` تلعب بعنوان + عناصر.

### باغ مُصلَح — «لا يظهر إلا العنوان»
الأعراض: تظهر الافتتاحية فقط، ولا يظهر أي شيء عند التمرير. السبب: كان يُنشأ
**مشغّلان منفصلان** على نفس `<section>` بنفس `start: "top top"` — مشغّل `pin`
ومشغّل `scrub`. عند التثبيت يُدرج ScrollTrigger الـ`pin-spacer` أولاً، فيُحسب
`start` للمشغّل الثاني (الـscrub) **عند نهاية الـpin** (مثلاً 11936 بدل 0)،
فيبقى `progress` صفراً عبر كامل المدى المثبّت ولا يُستدعى `drive()` إطلاقاً.
الإصلاح: **مشغّل واحد** يملك الـ`pin` والـ`scrub` معاً (`onUpdate → drive`).
(About يعمل لأن `start` الـscrub عنده يطابق `start` الـpin.)

### المتبقّي
- **قسم مصر منفَّذ بالكامل** (`gate` مضمّن يزهر · `item-1..3` · `decor` · `seal` ·
  `emblem` · تسميات العناصر من `messages`) — **ويظهر فعلاً** بعد إصلاح باغ المشغّل
  المزدوج (تحقّق آلي: intro → egypt → babylon → greece → china → hands أثناء التثبيت).
- أصول **بابل/اليونان/الصين** (بوابات + زخارف + أختام + عناصر) — حالياً بلا أصول
  (غرفها تعمل بعنوان + عناصر placeholder).
- تحقّق بشري بصري (لا معاينة آلية).

---

## 13. هيرو ثابت + «الغوص السردي» (Immersive Dive) — **تاريخي، حُذف (§14)**

> **محذوف بالكامل** (§14): `components/home/ImmersiveDive/**` و`diveConfig`/`diveSections`
> لم تعد مستخدمة؛ مكانها الآن **فصل البوابة** ثم كاروسيل الحضارات.

**الرؤية (قرار المستخدم — مُنقَّحة):** الهيرو = **شاشة واحدة ثابتة** بصورة رئيسية. تحته
مباشرة قسم **الغوص السردي** المستوحى من `valentime.noomoagency.com`. **النموذج ليس
«صورة بعيدة تقترب»**؛ بل: أنت **ثابت داخل المشهد**، و**الضباب والغيوم تتدفق وتتبدّل
أشكالها مع التمرير** (حركة لا استعراض)، وكل حضارة **تنكشف من الضباب** عند محطتها ثم
تعود تتلاشى فيه. **بلا تغيير لون الضباب** (جوّ واحد navy طوال الطريق). إحساس الـ3D يأتي من
**تعدد طبقات العمق (parallax)** لا من صورة مسطّحة قادمة من بعيد. **استلهام لا نسخ.**

### ترتيب الصفحة
`SiteHeader → <div class="relative isolate">[ HeroSection (sticky) + ImmersiveDive ] → HandsSection → About → Gallery → SiteFooter`.

### الملفات (الحالة الراهنة)
- **الهيرو** `components/home/Hero/HeroSection.tsx`: قسم واحد `h-[100dvh]`،
  `sticky top-0 z-0` (الصورة `heroConfig.image` + `Hero.headline` + CTA→`/store` + `HeroLoader`).
  بلا GSAP/ScrollTrigger/غرف. يبقى: `HeroLoader.tsx` · `heroCloudsShader.ts` (يستورده
  `GlobalSkyLayer`) · `heroMistShader.ts` (يستورده `handsScene`).
- **الغوص** `components/home/ImmersiveDive/ImmersiveDive.tsx` + `diveScene.ts`.
- **config**: `heroConfig` + `diveConfig` + `diveSections` + `DiveSectionId` (بعد `rippleConfig`).
- **حُذف**: `Hero/{HeroChambers,HandsCopy,HandsStageOverlay,EgyptStatic,BabylonStatic,GreeceStatic,ChinaStatic,PlateImage,StoryEmblem}.tsx`
  · `hooks/useHeroChambers.ts` · مجلدات `components/home/Hero/art` · `public/art/hero/egypt` · `public/art/hero/intro`.
  (كتل `config` للحضارات/الأختام بقيت dead بلا خطأ — تنظيف لاحق اختياري.)

### كيف يعمل الغوص (النموذج الحالي: ثابت داخل الجو)
- **لا pin بـGSAP** — بدلاً منه **CSS `sticky top-0`** داخل قسم بارتفاع
  `diveConfig.scrollVh` (400vh). يتفادى باغ الـpin-spacer (انظر §12) ويُبقي مرساة
  `display:contents` لقسم About صالحة.
- **مشغّل واحد** `ScrollTrigger.create` (`start: top top` → `end: bottom bottom`) يستدعي
  `handle.setProgress(self.progress)` + يباعد شفافية النصوص. التمرير ناعم عبر Lenis.
- **المشهد** `diveScene.ts` (three.js خام بنمط `handsScene.ts`، يُستورد ديناميكياً):
  - **كاميرا ثابتة** عند الأصل + **تمايل بطيء** (`camera.swayX/swayY/swaySpeed`) يحرّك
    الهندسة القريبة بينما تبقى طبقات الضباب مثبّتة → **parallax = إحساس 3D**.
  - **طبقة الجو** (نفس نمط `handsScene`): `bgScene` فيه gradient ثابت (بلا tint) + غيوم
    (`heroCloudsFragment`) + ضباب خلفي (`heroMistBackgroundFragment`) → تُرسم في `bgRT`
    وتُستخدم `scene.background`. ولأن الـbackground **صورة شاشة ثابتة**، لا تتحرك مع
    الكاميرا — وهذا مصدر تباين العمق.
  - **المشهد** (الحضارة): `PlaneGeometry` واحد عند **عمق قريب ثابت** `scene.z=-11`
    (لا يقترب أبداً)، مقاس من `visibleHeight(11)` بنسبة `16/9`، مع **تَفْتِيل** `rotation.y`
    بمقدار `scene.twist` أثناء العبور، وتحريض أفقي `scene.drift`. الشفافية = نافذة
    `reveal.window` حول محطة الحضارة (تظهر عندها وحدها، تتلاشى بين المحطات).
    الصور: `diveSections[].image` = `/art/hero/{egypt2,babel,greek,china}.png` (16:9، إنجليزي).
  - **ضباب أمامي** (fullscreen quad في المشهد، `renderOrder=100`, `depthTest:false`):
    `heroMistBackgroundFragment` بكثافة `mist.base` عند المحطة → `mist.near` في الفجوة،
    ووقته يدفعه التمرير (`mist.flow`) → «أغوص عبر السحاب». يخفي تبديل المشاهد.
  - **جزيئات ذهبية** موزّعة عبر العمق (`particles.depth`) → parallax تحت التمايل،
    تتضخم في الفجوات (`opacityRest→opacityPeak`).
  - **الزجاجة** `bottle.glb` (GLTF+DRACO+RoomEnvironment) عند `bottle.z=-8.5` تنكشف
    بنافذة حول `bottle.revealAt=0.94`.
  - **لا تغيير لون**: `FogExp2` ثابت (`fog.density=0.02`, `fog.color=background`)، والـgradient ثابت — الجو navy طوال الطريق.
- **القيم الحالية في `diveConfig`**: `camera{fov:52,swayX:0.55,swayY:0.3,swaySpeed:0.2}` ·
  `scene{z:-11,height:0.72,aspect:16/9,twist:0.16,drift:0.5}` · `reveal.window:0.13` ·
  `mist{near:0.95,base:0.28,nearSpeed:1,farSpeed:0.5,farBase:0.22,farGain:0.5,flow:6}` ·
  `clouds{opacity:0.22,drift:0.7}` · `particles{count:1200,countMobile:400,...}` · `fog.density:0.02`.
- **طبقة النصوص**: HTML أوفرلاي (z-10) — لكل حضارة كتلة مُوسَّطة تظهر/تختفي
  (`opacity` + `translateY` + `scale`) بنافذة حول محطتها (`halfGap=(0.5)/(N+1)=0.1`)،
  مع سكريم `radial-gradient` (z-[5]). النص من `messages`:
  `BrandStory/BabylonStory/GreeceStory/ChinaStory` (headline + body، عربي/إنجليزي).
- **الأداء**: حلقة رسم واحدة تُشغَّل/تُوقف بـ`IntersectionObserver` (rootMargin 200px)؛
  خفض الجزيئات (1200 → 400 جوال) والـDPR (2 → 1.5 جوال).
- **reduced-motion**: نسخة ثابتة = 4 كتل مرصوصة (`h-svh`) بصورة (`next/image`) + عنوان + نص.

### الفحوص (خضراء)
`npx tsc -p tsconfig.check.json --noEmit` = 0 · `npx eslint components/home/ImmersiveDive …` = 0
· `npx next build` = 0. تحقّق آلي على `ar.html` المُولَّد: `id="immersive-dive"` ·
`dive-active-title` · `height:400vh` · `sticky top-0 h-svh` · 4 كتل نصوص.

### المتبقّي / الخطوات التالية
- **تحقّق بشري بصري** (لا معاينة آلية): ضبط قوة التمايل/الـparallax، كثافة الضباب الأمامي
  (`mist.base`/`mist.near`)، سرعة التدفق (`mist.flow`/`nearSpeed`)، حجم المشهد وتَفْتِيله،
  ومدى ارتفاع القسم (400vh).
- إمكانية إثراء المشهد لاحقاً: عناصر 3D فعلية (أعمدة/رمال/ماء) حول الصورة، وربط الـCTA
  لكل حضارة (`*.cta` → صفحات المتجر) داخل الأوفلاي.

---

## 14. التنفيذ الحالي — «فصل البوابة + كشف مصر» (Gate Chapter) — **مُنجَز، آليّاً أخضر**

> §13 (الغوص السردي) و§14 السابقة (الغلالة + فصل مصر المنفصل) **تاريخيان**. المسار الحالي:
> **فصل واحد** — بوابة تصعد، الكاميرا تغوص عبر فتحتها، ومن خلف الحجر **يُكشف مشهد مصر كطبقة
> داخل الهيرو نفسه**. لا WebGL في الهيرو إطلاقاً، ولا وسم `<section>` ثانٍ.

**الرؤية (قرار المستخدم، نهائية):** «البوابة تكشف مصر بكل بساطة مباشرة… لأن هاد جزء من الهيرو
مو قسم جديد». وعند الكشف: «الأنيمشن يوزّع العناصر بمكانها الصحيح حيث أنها في البداية **خارج
الشاشة**… ويجب أن يحصل الأنيميشن واليوزر قادر **يلحق يشوفه**» ⇒ الأنيميشن **مدفوع بالتمرير**
(`drive(progress)`) لا one-shot، وكل عنصر يبدأ off-screen ويهبط إلى موضعه.

**لماذا حُذف WebGL:** الغلالة طلب المستخدم حذفها؛ وبوابة النور أُعيد بناؤها بلا تكسشر في جولة
سابقة فلم يبقَ لها وظيفة بعد أن صار الكشف صورة مباشرة. **صورة البوابة نفسها (`1.png`) هي
«البوابة»** المقصودة في الطلب.

**لماذا لا فصل مصر منفصل:** كان `EgyptSection` جاهزاً ومُدرجاً في `page.tsx`، ثم أُلغي هذا
القرار: الكشف يجب أن يكون **متصلاً بحركة البوابة** لا تسليماً لقسم آخر.

### الملفات (الحالة الراهنة)
- **`hooks/useHeroGate.ts`** — المحرّك: `clamp01/span/settle/smooth` + `build(isMobile)` بدالة
  `drive(progress)` نقية + **مشغّل واحد** + `gsap.matchMedia` + `SplitText` + shear. **بلا أي
  WebGL**: أُزيلت `portalRef/veilRef/notifyPortalReady/measureDoor/setVeil/setReveal`.
- **`components/home/Hero/HeroSection.tsx`** — markup فقط (صفر GSAP): `<section>` طويل
  (`h-[280vh] min-[1024px]:h-[440vh]`) + مسرح `sticky` + الطبقات + فرع `reduced`.
- **`components/home/Hero/EgyptReveal.tsx`** — **جديد**: طبقة مشهد مصر (الفن + `cheta` + النص
  + ومضة النجم)، markup فقط، تستقبل الـrefs كـprops وتقرأ `useTranslations("EgyptReveal")`.
- **`config/site.ts`** — `heroGateConfig` (المصدر الوحيد للنوافذ والأصول): `phases.egypt`
  + `egypt{hero,cheta,ctaHref,entrance}` + `gate{src,origin,rise,scaleTo}` + `hero{scaleTo,fade}`.
- **حُذف فعلياً**: `heroVeilShader.ts` · `veilScene.ts` · `VeilCanvas.tsx` ·
  `gatePortalShader.ts` · `gateScene.ts` · `GateCanvas.tsx` · `components/home/Egypt/EgyptSection.tsx`
  (والمجلد) · `public/art/hero/egypt2.png` · `egyptSectionConfig` · مفتاح `heroSceneConfig.images.egypt2`.
- **لم يُمَس**: `CinematicParallaxCarousel.tsx`.

### المعمارية (القرارات ولماذا)
- **لا GSAP `pin`**: ارتفاع القسم Tailwind literal (لا يرى القيم المُولّدة) + مسرح
  `sticky top-0 h-[100svh] isolate overflow-hidden`؛ تجنّباً لباغ الـpin-spacer (§12).
- **الطبقات (بلا غلالة)**: `z-0` صورة الهيرو (`object-contain` متمركزة) · **`z-10` مشهد مصر —
  تحت البوابة عمداً** · `z-20` البوابة · `z-40` النص. الفتحة في `1.png` **عمود شفاف فعلي**
  (`x 350–651`، صفريّة ألفا عند (50%,72%)) ⇒ المشهد يُرى **عبر الفتحة** أثناء الصعود، قبل أن
  يتزحزح الحجر — حركة واحدة متصلة، لا تسليم.
- **أصلان للبوابة لا عنصر واحد**: `.rise` (خارجي، `transformOrigin: 50% 100%`، `yPercent` +
  `rotation`) و`.zoom` (الصورة الداخلية، `transform-origin` عند `gate.origin`، `scale` فقط).
  الموقع يُقاس بالارتفاع لا العرض: `h-[112svh] w-[88svh]` (`w = 0.781·h` نسبة الفن) ← `rise.to: 0`
  يجعل قاعدة البوابة على قاعدة المسرح بلا seam.
- **لا Tailwind transforms على عناصر تملكها GSAP**: تمركز البوابة بـ`inset-x-0 mx-auto`؛
  وومضة النجم تُمركز بحاوية `relative` بدل `-translate-x-1/2` (وإلا محاها GSAP أول مرة يكتب
  `transform`).
- **`drive(progress)` نقية**: كل خاصية تُحسب من الصفر كل إطار من `heroGateConfig.phases`.
  الملكية: `image{scale,yPercent,autoAlpha}` · `words{autoAlpha,yPercent}` · `cta{autoAlpha,
  yPercent}` · `rise{yPercent,rotation,autoAlpha}` · `zoom{scale}` · `title{skewX}` ·
  `egyptRoot{autoAlpha}` · `egyptArt/cheta{xPercent|yPercent}` · `egyptCopy{children}` ·
  `egyptStar{autoAlpha,scale,rotate}`.
- **البيتس**: `phases.egypt = {start:0.64, end:1, art, cheta, copy, star}` ومفاتيحها **حصص داخل
  نافذة مصر** (لا من الفصل) فيتسلسل: الفن من اليمين (`artFrom:110%`) → الشيتا من الأسفل
  (`chetaFrom:115%`) → النص سطراً سطراً (`copySpread`) → ومضة النجم خلف الزر.
- **`EGYPT_IN_SHARE = 0.25`**: نسبة التقدّم التي تنكشف عبرها طبقة مصر داخل نافذة الكشف،
  فالتصميم يقرأ «فتحة ثم مشهد» لا انقلاباً لحظياً.
- **تنسيق RTL**: الأغلفة الفيزيائية `dir="ltr"` والعربية تُعطى بعمود النص وحده — التكوين لا
  ينعكس، النص فقط.
- **`prefers-reduced-motion`**: `enabled:false` ⇒ لا بوابة ولا مشهد مصر ولا sticky — مسرح
  `100dvh` واحد ثابت (قرار: المشهد بلا داعٍ لمستخدمي reduced-motion).
- **مفتاح `key={locale}` على `<h1>`**: SplitText يستبدل محتوى العنوان فيُفصل text node الذي
  يتابعه React؛ المفتاح يجعل React يستبدل العنصر كاملاً ثم يُعاد تقسيمه.
- **`<img>` عادي**: مسار الهيرو مستثنى من `no-img-element` (`eslint.config.mjs:8-13`) ✓.

### الفحوص (خضراء)
`npx tsc -p tsconfig.check.json --noEmit` = 0 · `npx eslint components/home/Hero hooks config app i18n` = 0 ·
`npx next build` = 0 (21/21 صفحة). تحقّق آلي على `.next/server/app/{ar,en}.html`:
`egypt_hero` و`cheta_section` موجودان (×2: markup + flight payload)، نص `EgyptReveal` بلغته
الصحيحة، و**صفر ظهور** لـ`GateCanvas`/`VeilCanvas`/`EgyptSection`.

### المتبقّي
- **ضبط بصري بشري (لا معاينة آلية)**: `entrance.copyRise/copySpread/starScale/starSettle` ·
  مقاسات الشيتا (`clamp(150px,15vw,230px)`) · `gate.scaleTo.desktop = 9`.
- **قرار معلَّق (اختياري)**: إطالة الفصل قليلاً (مقترح `300vh`/`460vh`) لتوسيع نافذة الكشف
  البصرية — الآن `0.36` من التقدّم ≈ 108svh على الديسكتوب.
- **خطوة أداء**: تحويل `public/images/egypt/1.png` (1.9MB) إلى WebP/AVIF — أصل LCP.
- `public/images/egypt/2.png` (الغبار القديم) على القرص بلا استخدام — يُحذف متى شئت.

## 15. رسم بياني للمشهد داخل الهيرو (EgyptReveal)

**هندسة الفن (مقيسة بـ`sharp`، لا مقدّرة):** `egypt_hero.png` لوحته 1376×768 لكن **معظمها
مبطّن شفاف** — الصورة الحقيقية تبدأ عند `x 524` (38.1%) و`y 59` (7.7%) ⇒ نسبة المحتوى
`852×709 ≈ 1.202` لا 1.79. لذلك إطار الديسكتوب يحمل **نسبة المحتوى** و`object-cover` يقصّ
المبطّن: القص ثابت **33% من عرض اللوحة** أبداً — داخل حزام الـ38.1% على كل الشاشات، فالصورة
لا تُقتطع أبداً، وتُعرض كاملة على يمين وأسفل الشاشة بحجم `80svh` (بسقف `53vw` حتى لا تزحف تحت
عمود النص: `h-[min(80svh,53vw)]`, `w-[calc(min(80svh,53vw)*1.2017)]`). أمّا الجوال فيُبقي
نسبة اللوحة و`object-contain` (بلا قصّ وبلا هدر شفافية).

```
مسرح sticky 100svh  (isolate, overflow-hidden)
├─ z-0   <img heroConfig.image>            محاذاة مركزية m-auto, object-contain
├─ z-10  <EgyptReveal>                     autoAlpha 0 حتى 0.64
│        ├─ إطار الفن   absolute bottom-0 right-0   (الركن الأسفل-الأيمن دائماً)
│        │              h-[min(80svh,53vw)] w-[calc(min(80svh,53vw)*1.2017)]
│        │              <img egypt_hero>  object-cover object-right object-bottom
│        │              xPercent 110 → 0   (beat art 0 → 0.3)  ← من خارج الشاشة يميناً
│        └─ عمود النص   dir=قارئ · absolute left-0 top-0 h-full w-[34%] max-w-[520px]
│                       داخل px-8 (سطر المحاذاة = gutter القارئ)
│           ├─ h2 / p / span(CTA+star)   data-egypt-line  (copyLines)
│           │              autoAlpha 0 + y 20 → 1 + 0  بـcopySpread 0.5  (beat copy)
│           │              └─ <span star>   autoAlpha/scale 1.7 → 0.42/rotate  (beat star)
│           └─ <img cheta> absolute bottom-0 start-8   ← داخل العمود عمداً
│                          yPercent 115 → 0   (beat cheta 0.22 → 0.5)
├─ z-20  <div rise> → <img zoom>           البوابة (تختفي بعد الكشف)
└─ z-40  النص الرئيسي (h1 + CTA)
```

**لماذا الشيتا داخل عمود النص:** `start-8` على طفل `absolute` تُقاس من **صندوق الحشو** لعمود
النص، و`px-8` تُزحزح النص `2rem` من نفس الحدّ ⇒ **النص والشيتا على سطر واحد بالبناء**، وينقلب
السطر تلقائياً مع اتجاه القارئ (يمين في العربية، يسار في الإنجليزية) بلا شرط. ولأن الشيتا صارت
طفلاً في العمود، صار التتابع يختار `[data-egypt-line]` لا `children` (وإلا دخلت الشيتا في
تشابك النص).
