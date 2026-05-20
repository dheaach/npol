# Creates a Shopify-importable ZIP (theme folders at archive root, not nested in a parent folder).
# Usage: powershell -ExecutionPolicy Bypass -File package-theme.ps1

$ErrorActionPreference = 'Stop'
$ThemeRoot = $PSScriptRoot
$ZipName = 'agm-theme.zip'
$ZipPath = Join-Path $ThemeRoot $ZipName
$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("agm-theme-" + [guid]::NewGuid().ToString())

$ThemeFolders = @('assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates')

try {
  New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

  foreach ($folder in $ThemeFolders) {
    $source = Join-Path $ThemeRoot $folder
    if (-not (Test-Path $source)) {
      Write-Warning "Missing folder: $folder (skipped)"
      continue
    }
    Copy-Item -Path $source -Destination (Join-Path $TempDir $folder) -Recurse -Force
  }

  if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
  }

  Compress-Archive -Path (Join-Path $TempDir '*') -DestinationPath $ZipPath -CompressionLevel Optimal

  Write-Host ""
  Write-Host "SUCCESS: Shopify theme ZIP created:" -ForegroundColor Green
  Write-Host "  $ZipPath" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Import in Shopify Admin:" -ForegroundColor Yellow
  Write-Host "  Online Store > Themes > Add theme > Upload zip file"
  Write-Host ""
}
finally {
  if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}
