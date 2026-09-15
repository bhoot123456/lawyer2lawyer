# Fixes "(quoted token)" artifacts from the Stage 1 color sweep:
#   `"colors.accent.goldLight"` -> `colors.accent.goldLight`
# A quoted "colors.x" string is an invalid color value in React Native.
$root = "D:\lawyer2lawyer\app\mobile\src"
$files = Get-ChildItem -Path $root -Recurse -Include *.ts,*.tsx,*.js
$fixed = 0
foreach ($file in $files) {
  $text = [System.IO.File]::ReadAllText($file.FullName)
  $newText = [regex]::Replace($text, '"colors\.([a-zA-Z0-9_\.]+)"', 'colors.$1')
  if ($newText -ne $text) {
    [System.IO.File]::WriteAllText($file.FullName, $newText)
    $count = ([regex]::Matches($text, '"colors\.')).Count
    Write-Output ("FIXED {0} ({1})" -f $file.FullName.Replace($root, ""), $count)
    $fixed += $count
  }
}
Write-Output "Total artifacts fixed: $fixed"