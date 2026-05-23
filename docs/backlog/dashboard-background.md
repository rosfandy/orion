# Feature: Dashboard Layout — Muted Background for Content Area

## Overview

Saat ini area konten utama (`<main>`) di dashboard layout menggunakan warna `bg-background` (putih di light mode, sangat gelap di dark mode) yang sama dengan warna kartu-kartu di dalamnya, sehingga card tidak memiliki kontras visual yang cukup. Feature ini mengubah background area `<main>` menjadi warna *muted/subtle* — lebih terang dari card di light mode (`--muted` ≈ `oklch(0.97 0 0)`) dan lebih gelap dari card di dark mode (`--background` ≈ `oklch(0.145 0 0)`) — agar setiap card yang dirender di dalam area konten terlihat menonjol dan kontras secara konsisten di kedua tema.

---

## User Stories

- **Sebagai pengguna dashboard (light mode)**, saya ingin area konten di belakang card-card memiliki warna abu-abu muda, agar card tampak seperti "mengambang" di atas permukaan dan mudah dibedakan secara visual.
- **Sebagai pengguna dashboard (dark mode)**, saya ingin area konten di belakang card-card memiliki warna gelap yang sedikit lebih dalam dari warna card itu sendiri, agar hierarki visual tetap terjaga dan card tidak berbaur dengan background.
- **Sebagai developer**, saya ingin perubahan background menggunakan CSS custom property yang sudah ada di design system (`--muted`), agar tidak menambah token baru atau konfigurasi tambahan.

---

## Acceptance Criteria

### AC-1 — Background `<main>` menggunakan token `muted`
- [ ] Elemen `<main>` di `app/dashboard/layout.tsx` memiliki class `bg-muted` (bukan `bg-background` atau warna hardcoded).
- [ ] Tidak ada inline style atau class Tailwind arbitrary value (`bg-[...]`) yang digunakan untuk warna background.

### AC-2 — Light mode menampilkan warna muted yang tepat
- [ ] Di light mode, area `<main>` berwarna `oklch(0.97 0 0)` (sesuai `--muted` di `:root` pada `app/globals.css`), yang secara perseptual lebih gelap dari putih murni sehingga card putih (`--card: oklch(1 0 0)`) tampak kontras.

### AC-3 — Dark mode menampilkan warna muted yang tepat
- [ ] Di dark mode, area `<main>` berwarna `oklch(0.269 0 0)` (sesuai `--muted` di `.dark` pada `app/globals.css`), yang secara perseptual lebih gelap dari warna card (`--card: oklch(0.205 0 0)`) — **catatan:** karena di dark mode `--muted` (`0.269`) justru *lebih terang* dari `--card` (`0.205`), engineer harus memverifikasi apakah ini cukup kontras atau perlu token alternatif.
- [ ] Card-card yang dirender di dalam `<main>` di dark mode masih terlihat berbeda dari background area konten.

### AC-4 — Sidebar dan Navbar tidak berubah
- [ ] `components/fragments/sidebar.tsx` tidak dimodifikasi — tetap menggunakan `bg-sidebar`.
- [ ] `components/fragments/navbar.tsx` tidak dimodifikasi — tetap menggunakan `bg-background`.

### AC-5 — Perubahan hanya di layout, bukan di halaman child
- [ ] Perubahan dilakukan hanya pada `app/dashboard/layout.tsx`, tidak menyentuh halaman-halaman child (`app/dashboard/page.tsx`, `app/dashboard/settings/page.tsx`, dsb.).
- [ ] Child page tidak perlu menambahkan override background sendiri.

### AC-6 — Tidak ada regresi layout
- [ ] Overflow scroll pada `<main>` (`overflow-y-auto`) tetap berfungsi — konten panjang masih bisa di-scroll.
- [ ] Padding `p-6` pada `<main>` tetap ada dan tidak hilang.
- [ ] Layout `flex h-screen overflow-hidden` pada wrapper terluar tidak berubah.

### AC-7 — Build dan lint bersih
- [ ] `npm run lint` tidak menghasilkan error atau warning baru.
- [ ] `npm run build` berhasil tanpa error.

---

## Test Scenarios

| # | Given | When | Then | Type |
|---|-------|------|------|------|
| 1 | Pengguna terautentikasi membuka `/dashboard` di light mode | Halaman selesai dirender | Area `<main>` menampilkan warna abu-abu muda (`oklch(0.97 0 0)`) yang kontras dengan card putih di dalamnya | Happy path |
| 2 | Pengguna terautentikasi membuka `/dashboard` di dark mode | Halaman selesai dirender | Area `<main>` menampilkan warna lebih gelap dari warna card, card masih terlihat berbeda dari background | Happy path |
| 3 | Pengguna berada di light mode lalu klik toggle dark mode | Dark mode aktif | Warna `<main>` berubah secara langsung mengikuti token `--muted` untuk dark mode, tanpa flash atau delay | Happy path |
| 4 | Pengguna berada di dark mode lalu klik toggle light mode | Light mode aktif | Warna `<main>` berubah kembali ke `--muted` untuk light mode, konsisten | Happy path |
| 5 | Pengguna membuka halaman `/dashboard/settings` (child route) | Halaman dirender dalam layout yang sama | `<main>` tetap memiliki background muted, layout tidak rusak | Edge case |
| 6 | Konten di dalam `<main>` melebihi tinggi viewport | Pengguna melakukan scroll ke bawah | Background muted mengisi seluruh area scroll, tidak terpotong atau berubah warna di tengah | Edge case |
| 7 | Pengguna membuka dashboard di mobile (viewport < 768px) | Sidebar terlipat/tersembunyi | Area `<main>` tetap menampilkan background muted tanpa artefak visual dari sidebar | Edge case |
| 8 | Developer menginspeksi elemen `<main>` di DevTools | — | Computed background color sesuai `--muted`, bukan `--background` atau nilai default browser | Edge case |
| 9 | `--muted` CSS variable tidak terdefinisi (hypothetical — misconfiguration) | Halaman dirender | Browser fallback ke warna default (transparan/putih), tidak ada crash JS | Negative |
| 10 | File `app/globals.css` di-revert ke versi yang menghapus `--muted` | Build dijalankan | `npm run build` masih berhasil (class `bg-muted` tetap valid secara Tailwind), tampilan mungkin fallback | Negative |

---

## Out of Scope

- Perubahan warna sidebar (`bg-sidebar`) — sudah punya token tersendiri, tidak termasuk iterasi ini.
- Perubahan warna navbar (`bg-background`) — navbar memiliki border-b sebagai pemisah visual yang cukup.
- Penambahan CSS token baru (`--dashboard-bg` atau sejenisnya) — iterasi ini hanya memakai token yang sudah ada.
- Animasi atau transisi warna background saat tema berganti (sudah ditangani oleh next-themes secara global).
- Perubahan warna background pada halaman-halaman di luar `/dashboard` (misalnya `/auth/login`).
- Modifikasi tampilan card (shadow, border, radius) — hanya background area konten yang menjadi scope.
- Responsivitas atau layout breakdown selain perubahan class background.

---

## Open Questions

1. **Kontras dark mode:** Di dark mode, `--muted` (`oklch(0.269 0 0)`) lebih *terang* dari `--card` (`oklch(0.205 0 0)`). Ini berarti card akan tampak *lebih gelap* dari background area konten — apakah ini efek yang diinginkan (card "tenggelam"), atau sebaiknya background menggunakan `--background` (`oklch(0.145 0 0)`) yang lebih gelap agar card terlihat "mengambang"? **Perlu konfirmasi stakeholder / desainer sebelum implementasi.**

2. **Token alternatif:** Jika `--muted` tidak menghasilkan kontras yang cukup di dark mode (lihat poin 1), apakah perlu menambahkan token baru `--surface` atau `--dashboard-surface` di `globals.css`, atau cukup menambahkan CSS custom property inline di layout?

3. **Konsistensi dengan halaman non-dashboard:** Apakah halaman lain yang mungkin akan dibuat (misalnya `/admin`) harus mengikuti pola background yang sama, atau cukup di-scope ke dashboard saja?

---

## Feature Module Mapping

```
Implements in: app/dashboard/
  layout.tsx — tambahkan class `bg-muted` pada elemen <main>

Tidak membutuhkan:
  - Perubahan skema database Supabase
  - Perubahan RLS policy
  - Komponen baru
  - Service function baru
  - TypeScript type baru

Referensi token (read-only):
  app/globals.css — --muted (light: oklch(0.97 0 0), dark: oklch(0.269 0 0))
                  — --card  (light: oklch(1 0 0),    dark: oklch(0.205 0 0))
```

---

## Implementation Note for Engineer

Perubahan minimal yang dibutuhkan ada di satu baris pada `app/dashboard/layout.tsx`:

```diff
- <main className="flex-1 overflow-y-auto p-6">
+ <main className="flex-1 overflow-y-auto p-6 bg-muted">
```

Token `bg-muted` sudah terdaftar di `app/globals.css` via `@theme inline { --color-muted: var(--muted) }` dan sudah memiliki nilai berbeda untuk light dan dark mode. Tidak diperlukan konfigurasi tambahan.

> ⚠️ Selesaikan Open Question #1 sebelum deploy ke production.
