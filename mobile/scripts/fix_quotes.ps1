# Fix Stage 1.1 quoting issues — removes quotes around "colors.xxx" token references
$root = "D:\lawyer2lawyer\app\mobile"
$src  = Join-Path $root "src"

$files = Get-ChildItem -Path $src -Recurse -Include "*.tsx","*.ts" -File |
    Where-Object { $_.FullName -notmatch "designSystem\.ts$|appTheme\.ts$" }

$fixedCount = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if (-not $content) { continue }
    $original = $content
    $changed = $false

    # Step 1: Fix JSX attribute: ="colors.xxx" → ={colors.xxx}
    $content = [regex]::Replace($content, '="(colors\.[a-zA-Z]+\.[a-zA-Z]+)"', '={$1}')
    if ($content -ne $original) { $changed = $true; $original = $content }

    # Step 2: Fix style/variable: "colors.xxx" → colors.xxx
    $content = [regex]::Replace($content, '"(colors\.[a-zA-Z]+\.[a-zA-Z]+)"', '$1')
    if ($content -ne $original) { $changed = $true }

    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $fixedCount++
        Write-Host "  Fixed: $($file.FullName.Replace("$root\", ''))"
    }
}
Write-Host "`nTotal files fixed: $fixedCount"