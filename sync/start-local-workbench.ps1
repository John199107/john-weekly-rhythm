# 启动 Obsidian 同步：读 Supabase 云端工作台数据，写入 Obsidian md
# 使用方式：开机自启（start-john-sync.vbs 调用）或手动运行

$project = 'D:\Resourse\WorkBuddy\2026-08-04-09-20-50\workbench-codex\john-weekly-rhythm'

# 显式定位 node（不依赖 PATH），优先系统 node
$nodeExe = $null
$candidates = @(
    'C:\Program Files\nodejs\node.exe',
    'C:\Users\76114\.workbuddy\binaries\node\versions\22.22.2-2\node.exe'
)
foreach ($c in $candidates) {
    if (Test-Path $c) { $nodeExe = $c; break }
}
if (-not $nodeExe) {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) { $nodeExe = $cmd.Source }
}
if (-not $nodeExe) {
    Write-Host '未找到 node，请先安装 Node.js 20.12+' -ForegroundColor Red
    exit 1
}

$syncRunning = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*obsidian-sync.mjs*' }
if (-not $syncRunning) {
    Start-Process -FilePath $nodeExe -ArgumentList '.\sync\obsidian-sync.mjs' -WorkingDirectory $project -WindowStyle Hidden
    Write-Host 'Obsidian 同步已启动（后台静默运行）'
} else {
    Write-Host 'Obsidian 同步已在运行，无需重复启动'
}
