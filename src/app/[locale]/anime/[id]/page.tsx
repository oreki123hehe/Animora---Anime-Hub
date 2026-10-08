import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAnime, titleOf } from "@/lib/anilist";

const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default async function AnimePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Detail");

  const anime = Number.isInteger(Number(id)) ? await getAnime(Number(id)) : null;

  if (!anime) {
    return (
      <div className="page">
        <Link href="/" className="back">{t("back")}</Link>
        <p className="empty">{t("notFound")}</p>
      </div>
    );
  }

  const streaming = anime.externalLinks.filter((l) => l.type === "STREAMING");
  const next = anime.nextAiringEpisode;

  return (
    <div className="page detail">
      <Link href="/" className="back">{t("back")}</Link>

      <div className="d-head">
        <div className="d-cover" style={{ background: anime.coverImage.color ?? "var(--chip)" }}>
          {anime.coverImage.large && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anime.coverImage.large} alt="" />
          )}
        </div>
        <div>
          <h1>{titleOf(anime)}</h1>
          <p className="meta">
            {anime.genres.join(", ")}
            {anime.genres.length > 0 && " – "}
            {anime.episodes ? t("episodes", { n: anime.episodes }) : t("unknownEpisodes")}
          </p>
          {next && (
            <p className="meta">
              {t("nextEpisode", { n: next.episode })}:{" "}
              {new Date(next.airingAt * 1000).toLocaleString(locale, {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              })}{" "}
              UTC
            </p>
          )}
          {anime.description && <p className="desc">{stripTags(anime.description)}</p>}
        </div>
      </div>

      <section>
        <h2>{t("watchHeading")}</h2>
        {streaming.length === 0 ? (
          <p className="empty">{t("noLinks")}</p>
        ) : (
          <div className="links">
            {streaming.map((l) => (
              <a
                key={l.url}
                className="btn"
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("watchOn", { site: l.site })}
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
