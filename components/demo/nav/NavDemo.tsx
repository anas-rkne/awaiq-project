"use client";

import { useLocale, useTranslations } from "next-intl";

import { ElasticTabsNavbar } from "./ElasticTabsNavbar";
import { FloatingDock, type DockEntry } from "./FloatingDock";
import { MagneticSidebar } from "./MagneticSidebar";

/**
 * Navigation Motion Lab — a self-contained harness for Motion's layout engine.
 *
 * It deliberately renders nothing from the real site chrome so the three
 * navigation patterns can be judged side by side on their motion alone.
 * Every demo is wrapped in its own `LayoutGroup` with a unique `layoutId`
 * namespace; see the block hints for what each one is meant to prove.
 */
export function NavDemo() {
  const t = useTranslations("NavDemo");
  const locale = useLocale();

  const labels = t.raw("tabs") as string[];
  const dockItems: DockEntry[] = labels.map((label, index) => ({
    label,
    href: `#tab-${index}`,
  }));

  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-navy-ink px-6 pt-28 pb-32 text-beige sm:px-8"
    >
      <div className="mx-auto flex max-w-[920px] flex-col gap-14">
        <header className="max-w-[640px]">
          <p className="font-primary text-[11px] font-medium tracking-[0.28em] text-gold uppercase">
            {locale === "ar" ? "مختبر" : "Lab"}
          </p>
          <h1 className="font-primary mt-3 text-[clamp(1.9rem,5vw,3rem)] leading-[1.15] font-medium">
            {t("title")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-beige/70">{t("subtitle")}</p>
        </header>

        <Block name={t("elastic.name")} hint={t("elastic.hint")}>
          <div className="flex justify-center">
            <ElasticTabsNavbar labels={labels} ariaLabel={t("elastic.name")} />
          </div>
        </Block>

        <Block name={t("dock.name")} hint={t("dock.hint")}>
          <div className="flex justify-center">
            <FloatingDock items={dockItems} ariaLabel={t("dock.name")} />
          </div>
        </Block>

        <Block name={t("sidebar.name")} hint={t("sidebar.hint")}>
          <div className="flex justify-center">
            <MagneticSidebar items={dockItems} ariaLabel={t("sidebar.name")} />
          </div>
        </Block>
      </div>
    </main>
  );
}

function Block({
  name,
  hint,
  children,
}: {
  name: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-beige/12 bg-white/[0.03] p-6 sm:p-9">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[380px]">
          <h2 className="font-primary text-lg font-medium text-beige">{name}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-beige/55">{hint}</p>
        </div>
        <div className="flex min-h-[140px] flex-1 items-center justify-center sm:min-h-[170px]">
          {children}
        </div>
      </div>
    </section>
  );
}
