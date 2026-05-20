# AGM Theme — Custom Shopify Theme

Tema landing page K-5 Math dengan section Liquid reusable dan pengaturan penuh di Theme Editor.

## Deploy

```bash
shopify theme push --path "c:\DT360 Learn\npol"
```

## Menu dari Shopify

1. Buka **Shopify Admin → Online Store → Navigation**
2. Buat atau edit menu (mis. `main-menu`, `footer`)
3. Di **Theme Editor**:
   - **Header** → pilih menu di field **Menu**
   - **Footer** → pilih menu di field **Footer menu**

## Section Sesuai Desain

| Section | Fungsi |
|---------|--------|
| **Hero — K-5 Math** | Hero split: headline + highlight, 2 tombol, gambar + blob |
| **Intro — Image & Text** | Polaroid + heading + bullet list |
| **Dark Quote Banner** | Banner biru gelap + wave divider |
| **Program Feature Cards** | 3 kartu dengan tag warna |
| **Video Showcase** | Background light blue + video YouTube/Vimeo |
| **Testimonials Slider** | Slider testimoni + tombol CTA |
| **Mosaic Feature Grid** | Grid alternating gambar/teks |
| **CTA — Teal Banner** | Banner teal + blob putih |
| **Process Steps** | 3 langkah alternating + polaroid |
| **Resources Cards** | 2 kartu resource + tombol |
| **Footer CTA** | CTA biru gelap sebelum footer |

## Semua Widget Bisa Disesuaikan

Setiap section mendukung pengaturan di Theme Editor:

- **Teks**: heading (split highlight), deskripsi, bullet list, caption
- **Gambar**: image picker + alt text SEO
- **Tombol**: label + URL
- **Warna**: background, highlight, tag, card
- **Font**: override heading/body per section
- **Layout**: arah gambar, rotasi polaroid, tape color
- **SEO**: pilihan tag H1–H4

## Theme Settings Global

**Theme settings → Colors / Typography**

- Primary `#1BCDC4`, Secondary `#0A1D3C`, Yellow `#FFC300`, Light Blue `#ADE8F6`
- H1–H6: Poppins (60/36/24px default)
- Body: Montserrat 16px
- Button: Poppins 20px medium

## Responsif

- **Tablet (≤1023px)**: grid 2 kolom, font scaled
- **Mobile (≤767px)**: 1 kolom, hamburger menu, slider 1 kartu
