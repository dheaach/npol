# AGM Theme — Custom Shopify Theme

K-5 Math landing page theme with reusable Liquid sections and full Theme Editor controls.

## Deploy

```bash
shopify theme push --path "c:\DT360 Learn\npol"
```

## Menus from Shopify

1. Open **Shopify Admin → Online Store → Navigation**
2. Create or edit menus (e.g. `main-menu`, `footer`)
3. In **Theme Editor**:
   - **Header** → select a menu in **Menu**
   - **Footer** → select a menu in **Footer menu**

## Design sections

| Section | Purpose |
|---------|---------|
| **Hero — K-5 Math** | Split hero: headline + highlight, 2 buttons, image + blob |
| **Intro — Image & Text** | Polaroid + heading + bullet list |
| **Dark Quote Banner** | Dark blue banner + wave divider |
| **Program Feature Cards** | 3 cards with colored tags |
| **Video Showcase** | Light blue background + YouTube/Vimeo video |
| **Testimonials Slider** | Testimonial slider + CTA button |
| **Mosaic Feature Grid** | Alternating image/text grid |
| **CTA — Teal Banner** | Teal banner + white blob |
| **Process Steps** | 3 alternating steps + polaroid |
| **Resources Cards** | 2 resource cards + button |
| **Footer CTA** | Dark blue CTA before footer |

## Customizable widgets

Every section supports Theme Editor settings:

- **Text**: heading (split highlight), description, bullet list, caption
- **Text & heading typography** (required for new fields): every heading or text input must include **font size**, **font weight**, and **font color** in the schema — see `.cursor/rules/section-typography.mdc` and `snippets/typography-settings-reference.liquid`
- **Images**: image picker + SEO alt text
- **Buttons**: label + URL
- **Colors**: background, highlight, tag, card
- **Fonts**: per-section heading/body override
- **Layout**: image side, polaroid rotation, tape color
- **SEO**: H1–H4 tag choice

## Global theme settings

**Theme settings → Colors / Typography**

- Primary `#1BCDC4`, Secondary `#0A1D3C`, Yellow `#FFC300`, Light Blue `#ADE8F6`
- H1–H6: Poppins (60/36/24px default)
- Body: Montserrat 16px
- Button: Poppins 20px medium

## Responsive

- **Tablet (≤1023px)**: 2-column grid, scaled fonts
- **Mobile (≤767px)**: 1 column, hamburger menu, 1 card per slider slide
