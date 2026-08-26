$project = 'C:\Users\76114\Documents\Codex\2026-08-18\referenced-chatgpt-conversation-this-is-an-2\weekly-rhythm-site'
$node = 'C:\Users\76114\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$pnpm = 'C:\Users\76114\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
$env:PATH = 'C:\Users\76114\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\76114\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;' + $env:PATH

$listening = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
    Start-Process -FilePath $pnpm -ArgumentList 'dev' -WorkingDirectory $project -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

$syncRunning = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*obsidian-sync.mjs*' }
if (-not $syncRunning) {
    $env:JOHN_WORKBENCH_URL = 'http://localhost:3000'
    Start-Process -FilePath $node -ArgumentList '.\sync\obsidian-sync.mjs' -WorkingDirectory $project -WindowStyle Hidden
}
