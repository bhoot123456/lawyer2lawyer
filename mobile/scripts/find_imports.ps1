$root = "D:\lawyer2lawyer\app\mobile\src"
$files = Get-ChildItem -Path $root -Recurse -Include *.ts, *.tsx, *.js
$patterns = @('LoginScreen', 'RegisterScreen', 'SearchLawyerScreen', 'LawyerCard')
$hits = 0
foreach ($f in $files) {
  $c = Get-Content -LiteralPath $f.FullName
  for ($i = 0; $i -lt $c.Count; $i++) {
    foreach ($p in $patterns) {
      if ($c[$i] -match "import.*$p|require.*$p") {
        $rel = $f.FullName.Replace($root, "")
        Write-Output "$rel`t$($i + 1)`t$($c[$i].Trim())"
        $hits++
      }
    }
  }
}
Write-Output "TOTAL IMPORT SITES: $hits"