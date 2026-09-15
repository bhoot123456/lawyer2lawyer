$root = "D:\lawyer2lawyer\app\mobile\src"
$files = Get-ChildItem -Path $root -Recurse -Include *.ts, *.tsx, *.js
$bad = @()
foreach ($f in $files) {
  $c = Get-Content -LiteralPath $f.FullName
  for ($i = 0; $i -lt $c.Count; $i++) {
    $ln = $c[$i]
    if ($ln -match '=colors\.[a-zA-Z0-9_.]+' -or $ln -match '"colors\.') {
      $rel = $f.FullName.Replace($root, "")
      $bad += "$rel`t$($i + 1)`t$($ln.Trim())"
    }
  }
}
Write-Output "Broken patterns found: $($bad.Count)"
$bad | ForEach-Object { Write-Output $_ }