import { defineRouting } from "next-intl/routing";

// Tambah bahasa baru: masukkan kode di sini dan buat messages/<kode>.json
export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
});
