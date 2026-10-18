"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { Link } from "@/i18n/navigation";
import { footerLinks } from "@/config/site";

const REVEAL =
  "opacity-0 translate-y-3 transition-[opacity,transform] duration-700 ease-out data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none";

const LINK =
  "text-[18px] leading-[44px] transition-opacity duration-200 hover:opacity-50 lg:text-[1.25vw] lg:leading-[2.75vw]";
const LINK_EN = "tracking-[36%] uppercase";

/**
 * Site footer (home only) — ported from `momentolegal.com`'s `<footer>`:
 * a link column, a center "back to top" + product scene band, and a contact
 * column. Reveals on scroll; anchors and back-to-top ride Lenis when present.
 *
 * The footer is `relative` so it can carry its own backdrop: `footer_bg` (the
 * Morocco artwork, the hero's own image) parked at the BOTTOM-LEFT at the
 * hero wall's `opacity-[0.04]`, behind both columns (`z-0` under their `z-30`).
 *
 * The scene band is scaled to the footer, not to the viewport: it used to be a
 * `w-screen scale-[2]` (≈200vw wide and 84svh tall on a phone) which spilled
 * out of the footer on every side — the band is now `w-full` with a
 * half-height bottle (`42svh` phone, `36svh` desktop), so the footer's
 * silhouette stays inside its own box.
 */
export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations("Footer");
  const isAr = locale === "ar";
  const lenis = useLenis();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.setAttribute("data-shown", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute("data-shown", "true");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const linkClass = `${LINK} ${isAr ? "" : LINK_EN}`;

  const goTo = (href: string) => (event: React.MouseEvent) => {
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (!el) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const backToTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      className="relative w-full overflow-x-clip overflow-y-clip lg:overflow-x-visible lg:overflow-y-visible"
    >
      {/* The footer's own wall: the hero's Morocco artwork at the BOTTOM-LEFT,
          held at the SAME `opacity-[0.04]` the hero's pattern wall uses, so the
          footer closes the page on the brand's wallpaper. `z-0` keeps it under
          both link columns (`z-30`). */}
      <Image
        src="/images/sections/footer_bg.png"
        alt=""
        aria-hidden="true"
        width={848}
        height={1264}
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[70%] w-auto object-contain object-left-bottom opacity-[0.04] select-none"
      />

      <div className="flex w-full flex-col items-center px-4 pb-[env(safe-area-inset-bottom)] lg:flex-row lg:items-start lg:px-[clamp(1.6rem,3.5vw,13rem)]">
        <div
          data-reveal
          className={`mb-20 h-px w-full bg-white/18 lg:hidden ${REVEAL}`}
        />

        {/* Left column — links, tagline, copyright */}
        <div className="relative z-30 flex w-full flex-col gap-12 lg:w-1/5 lg:-translate-y-[2vw] lg:gap-[1vw] lg:self-stretch">
          <div
            data-reveal
            className={`flex flex-col items-center lg:items-start ${REVEAL}`}
          >
            {footerLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.key} href={link.href} className={linkClass}>
                  {t(`links.${link.key}`)}
                </Link>
              ) : (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={goTo(link.href)}
                  className={linkClass}
                >
                  {t(`links.${link.key}`)}
                </a>
              )
            )}
          </div>

          <div
            data-reveal
            className={`flex items-center justify-center lg:block ${REVEAL}`}
          >
            <p className="w-[85%] text-center text-[12px] leading-[16px] tracking-normal text-white/58 lg:w-auto lg:text-start lg:text-[0.833vw] lg:leading-[1.35vw]">
              {t("tagline")}
            </p>
          </div>

          <div
            data-reveal
            className={`hidden lg:mt-auto lg:block lg:pt-[0.4vw] ${REVEAL}`}
          >
            <p className="text-[0.729vw] leading-[2.083vw] text-white/71">
              {t("copyright")}
            </p>
          </div>
        </div>

        {/* Center + right */}
        <div className="flex w-full flex-1 flex-col-reverse lg:flex-row lg:self-stretch">
          {/* Center — back-to-top + product scene band */}
          <div className="flex flex-1 flex-col items-center justify-end lg:overflow-y-clip">
            <div className="flex w-full flex-col items-center justify-end will-change-transform">
              <button
                type="button"
                onClick={backToTop}
                className="z-[20] mb-[75px] flex min-h-[2.292vw] cursor-pointer flex-col items-center gap-[16px] py-[12px] text-[14px] uppercase tracking-[0.25em] text-white/91 transition-opacity duration-200 hover:opacity-50 lg:-mb-[4.3vw] lg:gap-[0.7vw] lg:py-[0.75vw] lg:text-[0.938vw]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 38 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[3vw] w-[28px] lg:w-[1.75vw]"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.49421 19.5558L17.9667 3.48082C18.5367 2.8886 19.4633 2.8886 20.0333 3.48082L35.5058 19.5558C36.0758 20.1481 37.0025 20.1481 37.5725 19.5558C38.1425 18.9636 38.1425 18.0009 37.5725 17.4086C37.5725 17.4086 26.7391 6.15341 22.1 1.33364C20.3885 -0.444545 17.6115 -0.444545 15.9 1.33364L0.427516 17.4086C-0.142506 18.0009 -0.142506 18.9636 0.427516 19.5558C0.997538 20.1481 1.92419 20.1481 2.49421 19.5558Z"
                    fill="white"
                    fillOpacity="0.88"
                  />
                </svg>
                <span>{t("backToTop")}</span>
              </button>

              <div className="relative isolate w-full">
                <Image
                  src="/art/hero/pixlr-bottle.webp"
                  alt=""
                  aria-hidden="true"
                  width={1152}
                  height={2048}
                  className="relative mx-auto h-[42svh] w-auto object-contain lg:h-[36svh]"
                />
              </div>
            </div>
          </div>

          {/* Right column — contact + socials + credit */}
          <div className="relative z-30 flex w-full flex-col items-center gap-[45px] lg:w-1/4 lg:-translate-y-[2vw] lg:items-start lg:gap-[3vw] lg:self-stretch">
            <div className="flex w-full flex-col pt-[45px] lg:w-full lg:pt-[0.7vw]">
              {(
                [
                  ["emailLabel", "emailValue"],
                  ["phoneLabel", "phoneValue"],
                  ["addressLabel", "addressValue"],
                ] as const
              ).map(([label, value], index) => (
                <div
                  key={label}
                  data-reveal
                  className={`flex flex-col gap-[6px] py-[20px] lg:gap-[1.1vw] lg:py-[1.1vw] lg:border-t lg:border-white/18 ${
                    index === 0 ? "" : "border-t border-white/18"
                  } ${REVEAL}`}
                >
                  <p className="text-center text-[10px] text-white/93 lg:text-start lg:text-[0.833vw]">
                    {t(label)}
                  </p>
                  <p className="text-center text-[14px] tracking-[5%] text-white/61 lg:text-start lg:text-[0.938vw]">
                    {t(value)}
                  </p>
                </div>
              ))}
              <div className="h-px w-full bg-white/18" />
            </div>

            <div
              data-reveal
              className={`flex w-[85%] flex-col items-center lg:w-full lg:items-start ${REVEAL}`}
            >
              {(
                [
                  ["instagram", "https://www.instagram.com/"],
                  ["linkedin", "https://www.linkedin.com/"],
                ] as const
              ).map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="z-[20] py-[10px] lg:block lg:w-full lg:border-t lg:border-white/18 lg:py-[0.65vw]"
                >
                  <p className="text-[14px] text-white/61 tracking-[36%] transition-opacity duration-200 hover:opacity-50 lg:text-[0.833vw]">
                    {t(label)}
                  </p>
                </a>
              ))}
              <div className="hidden h-px w-full bg-white/18 lg:block" />
              <div className="flex flex-col items-center justify-center gap-[12px] pt-[45px] lg:hidden">
                <p className="text-center text-[10px] leading-[14px] text-white/71">
                  {t("copyright")}
                </p>
              </div>
            </div>

            <div
              data-reveal
              className={`hidden w-full justify-end lg:mt-auto lg:flex ${REVEAL}`}
            >
              <Link
                href="/"
                aria-label={t("links.home")}
                className="transition-opacity duration-200 hover:opacity-50"
              >
                <Image
                  src="/art/hero/logo-11.png"
                  alt="3WEEQ"
                  width={4501}
                  height={4501}
                  className="h-auto w-[5vw] object-contain"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
