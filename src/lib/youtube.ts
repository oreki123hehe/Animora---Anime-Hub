// BELUM DIPAKAI di UI. Dasar untuk langkah "filter YouTube embeddable".
// Perlu YOUTUBE_API_KEY di environment (server saja, jangan diekspos ke browser).
//
// Aturan yang dipakai: video hanya diputar di web kalau
//  - status.embeddable === true
//  - negara pengguna tidak ada di regionRestriction.blocked
//  - dan, kalau ada regionRestriction.allowed, negara pengguna ada di daftarnya

export type EmbedCheck = { embeddable: boolean; reason?: string };

export async function checkEmbeddable(
  videoId: string,
  country?: string,
): Promise<EmbedCheck> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { embeddable: false, reason: "no-api-key" };

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "status,contentDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", key);

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return { embeddable: false, reason: `http-${res.status}` };

  const json = await res.json();
  const item = json.items?.[0];
  if (!item) return { embeddable: false, reason: "not-found" };
  if (!item.status?.embeddable) return { embeddable: false, reason: "not-embeddable" };

  const rr = item.contentDetails?.regionRestriction;
  if (country && rr) {
    if (rr.blocked?.includes(country)) return { embeddable: false, reason: "region-blocked" };
    if (rr.allowed && !rr.allowed.includes(country)) return { embeddable: false, reason: "region-not-allowed" };
  }
  return { embeddable: true };
}

/** Parameter embed dengan subtitle sesuai bahasa pengguna. */
export function embedUrl(videoId: string, lang: string) {
  const p = new URLSearchParams({ cc_load_policy: "1", cc_lang_pref: lang, rel: "0" });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${p}`;
}
