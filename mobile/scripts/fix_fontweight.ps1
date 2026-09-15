# Stage 1.3 — Sweep fontWeight: "900" → "800" (the scale's actual ceiling)
$root = "D:\lawyer2lawyer\app\mobile"
$src  = Join-Path $root "src"

$files = Get-ChildItem -Path $src -Recurse -Include "*.tsx","*.ts" -File |
    Where-Object { $_.FullName -notmatch "designSystem\.ts$" }

$totalReplacements = 0
$fileCount = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if (-not $content) { continue }

    $newContent = [regex]::Replace($content, 'fontWeight:\s*"900"', 'fontWeight: "800"')
    if ($newContent -ne $content) {
        $replacements = ([regex]::Matches($content, 'fontWeight:\s*"900"')).Count
        $totalReplacements += $replacements
        $fileCount++
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "  $replacements replacements in $($file.FullName.Replace("$root\", ''))"
    }
}

Write-Host "`nTotal: $totalReplacements replacements across $fileCount files"