# Aether World-Web (Babylon.js 3D Sanctuary)

Eksplorasi dunia 3D **Aetheria** berbasis **Babylon.js PBR**, **Yuka Autonomous Game AI**, **4 Musim Dinamis**, **Siklus Siang–Malam Real-Time (1 Hari = 20 Menit)**, **Kustomisasi Karakter 3D**, serta **4 Alat & Senjata Tempur (Pedang Kombo 3 Arah, Tombak Terjang, Busur Recurve 3D + Panah Menancap, dan Bola Salju)**.

---

## Panduan Deploy ke Vercel (Rekomendasi Utama)

Proyek ini sudah dilengkapi konfigurasi **`vercel.json`**, **`.npmrc`**, dan pemisahan *chunk* otomatis (**`babylon-engine`**, **`game-ai-math`**, **`react-vendor`**) agar proses *build* di Vercel cepat dan bebas *Out-Of-Memory*.

1. **Push kode ke repositori GitHub Anda.**
2. Buka [Vercel Dashboard](https://vercel.com/new) lalu pilih **Import Git Repository**.
3. Pilih repositori **Aether World-Web** Anda:
   - **Framework Preset**: `Vite` (otomatis terdeteksi dari `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
4. Klik **Deploy**. Aplikasi akan langsung aktif di domain `.vercel.app` Anda.

---

## Panduan Deploy ke GitHub Pages (Otomatis via GitHub Actions)

Proyek ini juga sudah menyertakan workflow **`.github/workflows/deploy.yml`** dengan konfigurasi `base: './'` (path relatif) sehingga aset 3D tetap termuat dengan benar baik di domain utama maupun di *subpath* repositori GitHub Pages (`https://username.github.io/nama-repo/`).

1. Buka repositori GitHub Anda -> klik tab **Settings** -> **Pages**.
2. Pada bagian **Build and deployment** -> **Source**, pilih **GitHub Actions**.
3. Setiap kali Anda melakukan `git push` ke branch `main` atau `master`, workflow **Deploy Aether World-Web to GitHub Pages** akan otomatis menjalankan *build* dan mempublikasikan game Anda.

---

## Menjalankan Secara Lokal

```bash
npm install --legacy-peer-deps
npm run dev
```

Untuk menguji hasil *build* produksi secara lokal:

```bash
npm run build
npm run preview
```
