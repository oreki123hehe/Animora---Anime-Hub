const ENDPOINT = "https://graphql.anilist.co";

export type ExternalLink = { site: string; url: string; type: string };

export type Media = {
  id: number;
  title: { romaji: string | null; english: string | null };
  coverImage: { large: string | null; color: string | null };
  genres: string[];
  episodes: number | null;
  isAdult: boolean;
};

export type AiringItem = { airingAt: number; episode: number; media: Media };

export type MediaDetail = Media & {
  description: string | null;
  bannerImage: string | null;
  externalLinks: ExternalLink[];
  nextAiringEpisode: { airingAt: number; episode: number } | null;
};

async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  revalidate = 600,
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "AniList error");
  return json.data as T;
}

export const titleOf = (m: Pick<Media, "title">) =>
  m.title.english || m.title.romaji || "—";

const MEDIA_FIELDS = `
  id
  isAdult
  genres
  episodes
  title { romaji english }
  coverImage { large color }
`;

/** Jadwal tayang 7 hari ke depan (epoch detik). */
export async function getSchedule(): Promise<AiringItem[]> {
  const start = Math.floor(Date.now() / 1000);
  const end = start + 7 * 24 * 3600;
  const query = `
    query ($start: Int, $end: Int, $page: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo { hasNextPage }
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
          airingAt
          episode
          media { ${MEDIA_FIELDS} }
        }
      }
    }`;

  const all: AiringItem[] = [];
  for (let page = 1; page <= 4; page++) {
    const data = await gql<{
      Page: {
        pageInfo: { hasNextPage: boolean };
        airingSchedules: AiringItem[];
      };
    }>(query, { start, end, page });
    all.push(...data.Page.airingSchedules);
    if (!data.Page.pageInfo.hasNextPage) break;
  }
  return all.filter((a) => !a.media.isAdult);
}

export async function getCatalog(opts: {
  search?: string;
  genre?: string;
}): Promise<Media[]> {
  const query = `
    query ($search: String, $genre: String, $sort: [MediaSort]) {
      Page(page: 1, perPage: 24) {
        media(type: ANIME, isAdult: false, search: $search, genre: $genre, sort: $sort) {
          ${MEDIA_FIELDS}
        }
      }
    }`;
  const search = opts.search?.trim() || undefined;
  const data = await gql<{ Page: { media: Media[] } }>(query, {
    search,
    genre: opts.genre || undefined,
    sort: [search ? "SEARCH_MATCH" : "POPULARITY_DESC"],
  });
  return data.Page.media;
}

export async function getAnime(id: number): Promise<MediaDetail | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        description(asHtml: false)
        bannerImage
        externalLinks { site url type }
        nextAiringEpisode { airingAt episode }
      }
    }`;
  try {
    const data = await gql<{ Media: MediaDetail | null }>(query, { id });
    return data.Media && !data.Media.isAdult ? data.Media : null;
  } catch {
    return null;
  }
}
