function addSidebarHover() {
    $content = Get-Content -Path "D:\lawyer2lawyer\app\mobile\src\components\Sidebar.js" -Raw

    # Add hoveredClose state after hovered state in nav items
    $old1 = 'const [hovered, setHovered] = useState(false);' -replace 'useState', 'React.useState'
    $new1 = 'const [hovered, setHovered] = React.useState(false);' + [Environment]::NewLine + '          const [hoveredClose, setHoveredClose] = React.useState(false);'
    $content = $content.Replace($old1, $new1)

    # Add close button hover handlers
    $old2 = '              style={styles.closeBtn}' + [Environment]::NewLine + '              onPress={() => {' + [Environment]::NewLine + '                setSidebarVisible(false);' + [Environment]::NewLine + '                blurActiveElement();' + [Environment]::NewLine + '              }}'
    $new2 = '              style={[styles.closeBtn, hoveredClose && isWeb && styles.closeBtnHovered]}' + [Environment]::NewLine + '              onPress={() => {' + [Environment]::NewLine + '                setSidebarVisible(false);' + [Environment]::NewLine + '                blurActiveElement();' + [Environment]::NewLine + '              }}' + [Environment]::NewLine + '              onMouseEnter={isWeb ? () => setHoveredClose(true) : undefined}' + [Environment]::NewLine + '              onMouseLeave={isWeb ? () => setHoveredClose(false) : undefined}'
    $content = $content.Replace($old2, $new2)

    Set-Content -Path "D:\lawyer2lawyer\app\mobile\src\components\Sidebar.js" -Value $content -NoNewline
    Write-Output "Done"
}

addSidebarHover