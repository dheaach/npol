# Import tema ke Shopify

Tema ini sudah memenuhi struktur standar Shopify OS 2.0 dan siap di-upload.

## Opsi A: Upload ZIP (paling mudah)

1. Jalankan di PowerShell dari folder tema:

```powershell
powershell -ExecutionPolicy Bypass -File package-theme.ps1
```

2. File **`agm-theme.zip`** akan dibuat di folder ini.

3. Di **Shopify Admin**:
   - **Online Store** → **Themes**
   - **Add theme** → **Upload zip file**
   - Pilih `agm-theme.zip`
   - Tunggu hingga upload selesai → **Publish**

> **Penting:** ZIP harus berisi folder `assets`, `config`, `layout`, dll. langsung di root — bukan folder `npol` di dalam ZIP. Script `package-theme.ps1` sudah menangani ini.

## Opsi B: Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
cd "c:\DT360 Learn\npol"
shopify theme push --unpublished
```

Atau untuk development:

```bash
shopify theme dev
```

## Setelah import

1. **Navigation** → buat menu `main-menu` dan `footer`
2. **Theme Editor** → Header/Footer → pilih menu
3. Upload gambar di setiap section
4. **Publish** tema

## Struktur tema (wajib Shopify)

```
assets/
config/          ← settings_schema.json, settings_data.json
layout/          ← theme.liquid, password.liquid
locales/         ← en.default.json
sections/
snippets/
templates/       ← index, product, collection, cart, dll.
```

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| ZIP ditolak | Pastikan pakai `package-theme.ps1`, jangan zip folder induk manual |
| Menu kosong | Buat menu di Navigation, lalu pilih di Header settings |
| Font tidak muncul | Di Theme settings → Typography, pilih Poppins & Montserrat |
