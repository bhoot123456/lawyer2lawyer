# Fix remaining rgba(181,141,61,X) values with shortened opacity formats
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

    # Use a regex with a replacement script that maps opacity → closest token
    $content = [regex]::Replace($content, 'rgba\(181, ?141, ?61, ?(0(?:\.\d+)?)\)', {
        param($m)
        $opacity = [double]::Parse($m.Groups[1].Value)
        if ($opacity -le 0.08)       { return "colors.accent.goldSubtle" }
        elseif ($opacity -le 0.18)   { return "colors.accent.goldLight" }
        elseif ($opacity -le 0.22)   { return "colors.border.goldLight" }
        elseif ($opacity -le 0.5)    { return "colors.border.gold" }
        else                         { return "colors.accent.gold" }
    })
    if ($content -ne $original) { $changed = $true }

    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $fixedCount++
        Write-Host "  Fixed: $($file.FullName.Replace("$root\", ''))"
    }
}
Write-Host "`nTotal files fixed: $fixedCount"