"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type ScheduleItem = {
  airingAt: number; // epoch detik
  episode: number;
  id: number;
  title: string;
  genres: string[];
  color: string | null;
  cover: string | null;
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Pengelompokan hari dan jam dihitung di browser supaya mengikuti
 * zona waktu pengguna (server tidak tahu zona waktu pengguna).
 */
export default function Schedule({ items }: { items: ScheduleItem[] }) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => setMounted(true), []);

  const days = useMemo(() => {
    if (!mounted) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, [mounted]);

  if (!mounted) return <div className="sched-skeleton" aria-hidden />;

  const tz =
    new Intl.DateTimeFormat(locale, { timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  const key = dayKey(days[selected]);
  const list = items.filter(
    (it) => dayKey(new Date(it.airingAt * 1000)) === key,
  );

  return (
    <div>
      <div className="days" role="tablist">
        {days.map((d, i) => (
          <button
            key={i}
            role="tab"
            className="day"
            aria-selected={i === selected}
            onClick={() => setSelected(i)}
          >
            {d.toLocaleDateString(locale, { weekday: "short" })}
            <em>{d.getDate()}</em>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="empty">{t("noAiring")}</p>
      ) : (
        <div className="sched">
          {list.map((it) => (
            <Link key={`${it.id}-${it.episode}`} href={`/anime/${it.id}`} className="sc">
              <div className="th" style={{ background: it.color ?? "var(--chip)" }}>
                {it.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.cover} alt="" loading="lazy" />
                )}
              </div>
              <div>
                <b>{it.title}</b>
                <span>{t("episode", { n: it.episode })}</span>
                <span className="when">
                  {new Date(it.airingAt * 1000).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  {tz}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
