# Animora – Anime Hub

Portal anime multi bahasa: jadwal rilis, katalog, dan tautan tonton resmi.
Bukan situs bajakan: video hanya diputar di web kalau legal untuk di-embed
(rencana: YouTube embed dari kanal resmi), sisanya lewat tombol ke platform resmi.

## Stack
- Next.js (App Router) + TypeScript
- next-intl, URL per bahasa (`/id`, `/en`)
- Data: [AniList GraphQL API](https://docs.anilist.co) (tanpa API key)

## Jalankan
```bash
npm install
npm run dev
```
Buka http://localhost:3000 (otomatis diarahkan ke `/id`).

## Struktur
```
messages/            teks per bahasa (id.json, en.json)
src/i18n/            routing, request config, navigation
src/middleware.ts    pengalihan bahasa
src/lib/anilist.ts   query AniList (jadwal, katalog, detail)
src/lib/youtube.ts   cek embeddable (belum dipakai di UI)
src/components/      Schedule (zona waktu pengguna), AnimeCard, LangSwitcher
src/app/[locale]/    beranda dan halaman detail /anime/[id]
```

## Tambah bahasa
1. Tambahkan kode di `src/i18n/routing.ts`.
2. Salin `messages/en.json` jadi `messages/<kode>.json` dan terjemahkan.

## Deploy
- **Netlify**: paling mudah untuk Next.js, paket gratis boleh untuk situs komersial.
- **Cloudflare Pages**: Next.js dengan fitur server butuh adapter OpenNext
  (`@opennextjs/cloudflare`); cek dokumentasi Cloudflare terbaru sebelum memilih.
- Vercel Hobby tidak boleh dipakai untuk situs beriklan.

## Berikutnya
1. Pemutar YouTube embed di halaman detail (pakai `src/lib/youtube.ts`, isi `YOUTUBE_API_KEY`).
2. Supabase: login, komentar per episode, jam tonton dan level.
3. Kebijakan privasi, syarat layanan, moderasi komentar.
4. Atribusi TMDB Watch Providers kalau ketersediaan per negara dipakai.
