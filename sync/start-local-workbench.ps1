# 启动 Obsidian 同步：读 Supabase 云端工作台数据，写入 Obsidian md
# 使用方式：右键「使用 PowerShell 运行」，或在本目录执行 .\start-local-workbench.ps1

$project = 'D:\Resourse\WorkBuddy\2026-08-04-09-20-50\workbench-codex\john-weekly-rhythm'

# 优先用系统 node（需要 >= 20.12，支持 process.loadEnvFile）
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host '未找到 node，请先安装 Node.js 20.12+ 或 22+' -ForegroundColor Red
    exit 1
}

$syncRunning = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*obsidian-sync.mjs*' }
if (-not $syncRunning) {
    Start-Process -FilePath 'node' -ArgumentList '.\sync\obsidian-sync.mjs' -WorkingDirectory $project
    Write-Host 'Obsidian 同步已启动（窗口保持打开即持续同步，关闭窗口即停止）'
} else {
    Write-Host 'Obsidian 同步已在运行，无需重复启动'
}
