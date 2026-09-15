$file = "D:\lawyer2lawyer\app\mobile\src\components\Sidebar.js"
$lines = Get-Content -Path $file -Encoding UTF8

$newBlock = @(
  '        {navItems.map((item) => {',
  '          const isActive = pathname === item.route;',
  '          return (',
  '            <NavItem',
  '              key={item.label}',
  '              item={item}',
  '              isActive={isActive}',
  '              onPress={async () => {',
  '                if (item.label === "Logout" || item.label === "Lawyer Logout") {',
  '                  await logout();',
  '                  setIsAdmin(false);',
  '                  setIsLawyer(false);',
  '                  if (onClose) onClose();',
  '                  blurActiveElement();',
  '                  router.replace(item.label === "Lawyer Logout" ? "/lawyer-login" : "/login");',
  '                  return;',
  '                }',
  '                handlePress(item.route);',
  '              }}',
  '            />',
  '          );',
  '        })}'
)

# Lines 181..218 inclusive -> zero-based indices 180..217
$before = $lines[0..179]
$after = $lines[218..($lines.Count - 1)]
$result = $before + $newBlock + $after
Set-Content -Path $file -Value $result -Encoding UTF8
Write-Output ("Old lines: " + $lines.Count + " -> New lines: " + $result.Count)