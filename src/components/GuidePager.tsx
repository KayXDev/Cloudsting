import Link from "next/link";

type PagerGuide = {
  href: string;
  category: string;
  title: string;
};

export function GuidePager(props: {
  isEs: boolean;
  previous: PagerGuide | null;
  next: PagerGuide | null;
}) {
  const items = [
    props.previous
      ? {
          href: props.previous.href,
          category: props.previous.category,
          title: props.previous.title,
          direction: props.isEs ? "Guia anterior" : "Previous guide",
          arrow: "<",
          align: "left",
        }
      : null,
    props.next
      ? {
          href: props.next.href,
          category: props.next.category,
          title: props.next.title,
          direction: props.isEs ? "Siguiente guia" : "Next guide",
          arrow: ">",
          align: "right",
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    category: string;
    title: string;
    direction: string;
    arrow: string;
    align: "left" | "right";
  }>;

  if (items.length === 0) return null;

  return (
    <div className={`mt-12 grid gap-4 ${items.length === 2 ? "lg:grid-cols-2" : "grid-cols-1"}`}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group rounded-[24px] border border-[#313844] bg-[linear-gradient(180deg,rgba(25,28,32,0.94),rgba(19,21,25,0.94))] p-5 shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition hover:border-[#49658f] hover:bg-[linear-gradient(180deg,rgba(29,32,37,0.98),rgba(21,23,28,0.98))]"
        >
          <div className={`flex items-center justify-between gap-6 ${item.align === "right" ? "text-right" : "text-left"}`}>
            <div className={`min-w-0 ${item.align === "right" ? "order-2" : "order-1"}`}>
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#91a4c8]">{item.category}</div>
              <div className="mt-2 text-xl font-extrabold leading-tight text-white sm:text-2xl">{item.title}</div>
              <div className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d8cc0]">{item.direction}</div>
            </div>
            <div className={`${item.align === "right" ? "order-1" : "order-2"} flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#374353] bg-[#1a2029] text-2xl font-light text-[#7fa2dc] transition group-hover:translate-x-1 group-hover:border-[#4d77b4] group-hover:text-[#b8d1ff]`}>
              {item.arrow}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}