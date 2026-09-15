# Stage 1.3 — Map ad-hoc fontSize values to the nearest typography scale step
# 11 → 12 (caption), 13 → 12 (caption)
# 22, 26, 28, 32 are left unchanged (serve real purposes: headers, stats, logos)
$root = "D:\lawyer2lawyer\app\mobile"
$src  = Join-Path $root "src"

$files = Get-ChildItem -Path $src -Recurse -Include "*.tsx","*.ts" -File |
    Where-Object { $_.FullName -notmatch "designSystem\.ts$" }

$totalReplacements = 0
$fileCount = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if (-not $content) { continue }

    $newContent = $content
    $newContent = [regex]::Replace($newContent, 'fontSize:\s*11,', 'fontSize: 12,')
    $newContent = [regex]::Replace($newContent, 'fontSize:\s*13,', 'fontSize: 12,')

    if ($newContent -ne $content) {
        $replacements = ([regex]::Matches($content, 'fontSize:\s*11,')).Count + ([regex]::Matches($content, 'fontSize:\s*13,')).Count
        $totalReplacements += $replacements
        $fileCount++
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "  $replacements replacements in $($file.FullName.Replace("$root\", ''))"
    }
}

Write-Host "`nTotal: $totalReplacements replacements across $fileCount files"