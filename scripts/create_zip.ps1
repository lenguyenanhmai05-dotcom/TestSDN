if (Test-Path QE190151.zip) {
    Remove-Item -Force QE190151.zip
}
$exclude = @('node_modules', '.next', '.git', '.env', 'QE190151.zip')
$items = Get-ChildItem -Path . | Where-Object { $exclude -notcontains $_.Name }
Compress-Archive -Path $items -DestinationPath QE190151.zip -Force
Get-Item QE190151.zip | Select-Object Name, Length, LastWriteTime
