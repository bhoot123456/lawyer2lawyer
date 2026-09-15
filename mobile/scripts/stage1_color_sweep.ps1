# Stage 1.1 — Color consistency sweep
# Replaces alternate gold/black hexes and rgba gold variants with designSystem tokens.
# Excludes designSystem.ts and appTheme.ts (token definitions / re-exports).

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = "D:\lawyer2lawyer\app\mobile"
$src  = Join-Path $root "src"

# 1. Get all .tsx/.ts files in src/
$files = Get-ChildItem -Path $src -Recurse -Include "*.tsx","*.ts" -File |
    Where-Object {
        $_.FullName -notmatch "designSystem\.ts$" -and
        $_.FullName -notmatch "appTheme\.ts$" -and
        $_.FullName -notmatch "UI_UX_AUDIT"
    }

# 2. Define replacements — ORDER MATTERS (longer/specific patterns first)
$replacements = @(
    # --- 8-digit hex (gold + alpha) — replace whole token ---
    @{ p = '"#B58D3D55"';  r = '"colors.border.gold"' }
    @{ p = '"#B58D3D30"';  r = '"colors.border.gold"' }
    @{ p = '"#B58D3D25"';  r = '"colors.border.goldLight"' }
    @{ p = '"#B58D3D22"';  r = '"colors.border.goldLight"' }
    @{ p = '"#B58D3D18"';  r = '"colors.accent.goldLight"' }
    @{ p = '"#B58D3D15"';  r = '"colors.accent.goldLight"' }
    @{ p = '"#B58D3D12"';  r = '"colors.border.goldLight"' }
    @{ p = '"#B58D3D10"';  r = '"colors.accent.goldLight"' }

    # --- Standard 6-digit hex ---
    @{ p = '"#B58D3D"';  r = '"colors.accent.gold"' }
    @{ p = '"#C9A227"';  r = '"colors.accent.gold"' }
    @{ p = '"#B8942A"';  r = '"colors.accent.gold"' }
    @{ p = '"#0B0B0B"';  r = '"colors.bg.primary"' }
    @{ p = '"#0B1526"';  r = '"colors.bg.primary"' }

    # --- rgba(181, 141, 61, X) — both spaced and non-spaced ---
    @{ p = 'rgba\(181, ?141, ?61, ?0\.06\)';  r = 'colors.accent.goldSubtle' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.08\)';  r = 'colors.accent.goldSubtle' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.10\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.12\)';  r = 'colors.border.goldLight' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.14\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.15\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.16\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.18\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.20\)';  r = 'colors.border.goldLight' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.25\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.30\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.35\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.50\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.55\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181, ?141, ?61, ?0\.95\)';  r = 'colors.accent.gold' }

    # --- rgba(181,141,61,X) without spaces ---
    @{ p = 'rgba\(181,141,61,0\.06\)';  r = 'colors.accent.goldSubtle' }
    @{ p = 'rgba\(181,141,61,0\.08\)';  r = 'colors.accent.goldSubtle' }
    @{ p = 'rgba\(181,141,61,0\.10\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181,141,61,0\.12\)';  r = 'colors.border.goldLight' }
    @{ p = 'rgba\(181,141,61,0\.14\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181,141,61,0\.15\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181,141,61,0\.16\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181,141,61,0\.18\)';  r = 'colors.accent.goldLight' }
    @{ p = 'rgba\(181,141,61,0\.20\)';  r = 'colors.border.goldLight' }
    @{ p = 'rgba\(181,141,61,0\.25\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181,141,61,0\.30\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181,141,61,0\.35\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181,141,61,0\.50\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181,141,61,0\.55\)';  r = 'colors.border.gold' }
    @{ p = 'rgba\(181,141,61,0\.95\)';  r = 'colors.accent.gold' }
)

$modifiedCount = 0

foreach ($file in $files) {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if (-not $content) { continue }

    $changed = $false

    foreach ($r in $replacements) {
        if ($content -match $r.p) {
            $content = $content -replace $r.p, $r.r
            $changed = $true
        }
    }

    if (-not $changed) { continue }

    # Ensure colors is imported from designSystem
    $hasImport = $content -match 'import\s*\{[^}]*\bcolors\b[^}]*\}\s*from\s*"@/theme/designSystem"'
    if (-not $hasImport -and $content -match 'colors\.') {
        # Add import after the first import line or at the top
        $lines = $content -split "`n"
        $importAdded = $false

        # Try to find an existing import from @/theme or @/constants
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match 'from\s+["@]/theme/') {
                # Insert after this import group
                $lines = $lines[0..$i] + "import { colors } from ""@/theme/designSystem"";" + $lines[($i+1)..($lines.Count-1)]
                $importAdded = $true
                break
            }
        }

        if (-not $importAdded) {
            # Find the first import line and insert after it
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match '^import\s') {
                    $lines = $lines[0..$i] + "import { colors } from ""@/theme/designSystem"";" + $lines[($i+1)..($lines.Count-1)]
                    $importAdded = $true
                    break
                }
            }
        }

        if (-not $importAdded) {
            # Fallback: insert at the very top
            $lines = @("import { colors } from ""@/theme/designSystem"";") + $lines
        }

        $content = $lines -join "`n"
    }

    # Write back
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    $modifiedCount++
    Write-Host "  Modified: $($file.FullName.Replace("$root\", ''))"
}

Write-Host "`nTotal files modified: $modifiedCount"