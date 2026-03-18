import Link from "next/link";
import { Container } from "@/components/Container";
import { GuidePager } from "@/components/GuidePager";
import { getGuideNeighbors, getGuides } from "@/lib/guides";
import type { LangCode } from "@/lib/i18n";

type GuideSection = {
  title: string;
  body: string;
};

type RelatedLink = {
  href: string;
  label: string;
};

function sectionAnchor(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function GuideArticleShell(props: {
  slug: string;
  lang: LangCode;
  title: string;
  intro: string;
  sections: GuideSection[];
  relatedLinks: RelatedLink[];
}) {
  const isEs = props.lang === "es";
  const guides = getGuides(props.lang);
  const currentGuide = guides.find((guide) => guide.slug === props.slug);
  const neighbors = getGuideNeighbors(props.lang, props.slug);
  const sections = props.sections.map((section) => ({
    ...section,
    anchor: sectionAnchor(section.title),
  }));

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_18%_12%,rgba(89,255,168,0.12),transparent_30%),radial-gradient(circle_at_82%_4%,rgba(132,180,255,0.08),transparent_22%),linear-gradient(180deg,rgba(6,7,8,0.96),rgba(6,6,6,0))]" />
      <Container className="relative py-12 sm:py-16">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr),260px] xl:items-start">
          <div>
            <div className="rounded-[28px] border border-[#233126] bg-[linear-gradient(145deg,rgba(11,16,13,0.95),rgba(8,10,11,0.95))] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.28)] sm:p-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#223428] bg-[#0d1411] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8de0b0]">
                <span className="h-2 w-2 rounded-full bg-[#1AD76F]" />
                {currentGuide?.category}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c8d95]">
                <span>{currentGuide?.kicker}</span>
                <span className="h-1 w-1 rounded-full bg-[#345043]" />
                <span>{currentGuide?.readTime}</span>
              </div>

              <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {props.title}
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-[#b7c0c5] sm:text-base">
                {props.intro}
              </p>
            </div>

            <div className="mt-8 space-y-8">
              {sections.map((section) => (
                <section key={section.title} id={section.anchor} className="border-l border-[#26352c] pl-5 sm:pl-6">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">{section.title}</h2>
                  <p className="mt-4 max-w-3xl text-sm leading-8 text-[#b0bac0] sm:text-base">{section.body}</p>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-[24px] border border-[#2d3336] bg-[linear-gradient(180deg,rgba(17,18,20,0.9),rgba(12,13,15,0.9))] p-5 sm:p-6">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#90a6c2]">
                {isEs ? "Sigue explorando" : "Keep exploring"}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {props.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-[#2e3439] bg-[#14171a] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#4f719b] hover:bg-[#181c20]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <GuidePager isEs={isEs} previous={neighbors.previous} next={neighbors.next} />
          </div>

          <aside className="xl:sticky xl:top-24">
            <div className="rounded-[24px] border border-[#2b3135] bg-[linear-gradient(180deg,rgba(17,19,21,0.9),rgba(12,14,16,0.9))] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8fa0ac]">
                {isEs ? "En esta guia" : "In this guide"}
              </div>
              <div className="mt-4 grid gap-2">
                {sections.map((section) => (
                  <a key={section.title} href={`#${section.anchor}`} className="rounded-2xl border border-[#272c2f] bg-[#131618] px-4 py-3 text-sm font-medium text-[#d5dde2] transition hover:border-[#365341] hover:text-white">
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-[#2b3135] bg-[linear-gradient(180deg,rgba(17,19,21,0.9),rgba(12,14,16,0.9))] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8fa0ac]">
                {isEs ? "Mas guias" : "More guides"}
              </div>
              <div className="mt-4 grid gap-3">
                {guides.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className={`rounded-2xl border px-4 py-4 transition ${guide.slug === props.slug ? "border-[#385f49] bg-[#121a15]" : "border-[#272c2f] bg-[#131618] hover:border-[#40505b] hover:bg-[#171b1f]"}`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f7e88]">{guide.category}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{guide.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}