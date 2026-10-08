import { Link } from "@/i18n/navigation";
import { titleOf, type Media } from "@/lib/anilist";

export default function AnimeCard({ media }: { media: Media }) {
  const title = titleOf(media);
  return (
    <Link href={`/anime/${media.id}`} className="card">
      <div
        className="poster"
        style={{ background: media.coverImage.color ?? "var(--chip)" }}
      >
        {media.coverImage.large && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.coverImage.large} alt="" loading="lazy" />
        )}
      </div>
      <div className="info">
        <b title={title}>{title}</b>
        <span>{media.genres.slice(0, 2).join(", ")}</span>
      </div>
    </Link>
  );
}
