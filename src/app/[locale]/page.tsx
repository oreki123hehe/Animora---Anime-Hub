import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AnimeCard from "@/components/AnimeCard";
import Schedule, { type ScheduleItem } from "@/components/Schedule";
import { getCatalog, getSchedule, titleOf, type AiringItem, type Media } from "@/lib/anilist";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural",
];

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const { locale } = await params;
  const { q, genre } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  let airing: AiringItem[] = [];
  let catalog: Media[] = [];
  let failed = false;
  try {
    [airing, catalog] = await Promise.all([
      getSchedule(),
      getCatalog({ search: q, genre }),
    ]);
  } catch {
    failed = true;
  }

  const items: ScheduleItem[] = airing.map((a) => ({
    airingAt: a.airingAt,
    episode: a.episode,
    id: a.media.id,
    title: titleOf(a.media),
    genres: a.media.genres,
    color: a.media.coverImage.color,
    cover: a.media.coverImage.large,
  }));

  return (
    <div className="page">
      {failed && <p className="error" role="alert">{t("loadError")}</p>}

      <section>
        <h2>
          {t("schedule")} <small>{t("scheduleHint")}</small>
        </h2>
        <Schedule items={items} />
      </section>

      <section>
        <h2>
          {t("catalog")} <small>{t("count", { n: catalog.length })}</small>
        </h2>

        <form method="get" className="search" role="search">
          {genre && <input type="hidden" name="genre" value={genre} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
          />
          <button className="btn" type="submit">{t("search")}</button>
        </form>

        <div className="chips">
          <Link
            href={{ pathname: "/", query: q ? { q } : {} }}
            className="chip"
            aria-pressed={!genre}
          >
            {t("all")}
          </Link>
          {GENRES.map((g) => (
            <Link
              key={g}
              href={{ pathname: "/", query: q ? { q, genre: g } : { genre: g } }}
              className="chip"
              aria-pressed={genre === g}
            >
              {g}
            </Link>
          ))}
        </div>

        {catalog.length === 0 && !failed ? (
          <p className="empty">{t("noResults")}</p>
        ) : (
          <div className="grid">
            {catalog.map((m) => (
              <AnimeCard key={m.id} media={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
