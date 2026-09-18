# Rebuild styles.css after changing classes in index.html.
# Uses the standalone Tailwind CLI in .tools/ (gitignored).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$cli = Join-Path $root '.tools\tailwindcss.exe'
if (-not (Test-Path $cli)) {
    New-Item -ItemType Directory -Force -Path (Join-Path $root '.tools') | Out-Null
    Invoke-WebRequest -Uri 'https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe' -OutFile $cli -UseBasicParsing
}

$tmp = Join-Path $env:TEMP 'yakunavi-styles.css'
& $cli -i (Join-Path $root 'input.css') -o $tmp --minify
Copy-Item -Force $tmp (Join-Path $root 'styles.css')
Write-Host "Wrote styles.css"
