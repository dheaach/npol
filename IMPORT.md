# Import theme to Shopify

This theme follows the standard Shopify OS 2.0 structure and is ready to upload.

## Option A: Upload ZIP (easiest)

1. Run in PowerShell from the theme folder:

```powershell
powershell -ExecutionPolicy Bypass -File package-theme.ps1
```

2. **`agm-theme.zip`** will be created in this folder.

3. In **Shopify Admin**:
   - **Online Store** → **Themes**
   - **Add theme** → **Upload zip file**
   - Select `agm-theme.zip`
   - Wait for upload to finish → **Publish**

> **Important:** The ZIP must contain `assets`, `config`, `layout`, etc. at the root — not an `npol` folder inside the ZIP. `package-theme.ps1` handles this.

## Option B: Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
cd "c:\DT360 Learn\npol"
shopify theme push --unpublished
```

Or for development:

```bash
shopify theme dev
```

## After import

1. **Navigation** → create `main-menu` and `footer` menus
2. **Theme Editor** → Header/Footer → assign menus
3. Upload images in each section
4. **Publish** the theme

## Theme structure (Shopify required)

```
assets/
config/          ← settings_schema.json, settings_data.json
layout/          ← theme.liquid, password.liquid
locales/         ← en.default.json
sections/
snippets/
templates/       ← index, product, collection, cart, etc.
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| ZIP rejected | Use `package-theme.ps1`; do not zip the parent folder manually |
| Empty menu | Create menus in Navigation, then select them in Header settings |
| Fonts missing | Theme settings → Typography → choose Poppins & Montserrat |
