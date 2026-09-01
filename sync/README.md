# Obsidian 同步程序

工作台数据以 Supabase 云端为主数据源。本机同步程序每 15 秒检查一次变化，把云端任务写成：

`D:\Users\76114\Obsidian Vault\00_个人待办工作台_数据.md`

它不会覆盖 `00_个人待办工作台.md`（那是手动维护的主控文件）。

## 首次配置

1. 打开 Supabase 控制台 → Project Settings → API，复制 `service_role` key。
2. 复制 `sync/.env.example` 为 `sync/.env`，填入 key：
   ```
   JOHN_SUPABASE_SERVICE_KEY=sb_secret_xxx
   ```
   `.env` 已被 gitignore 排除，不会提交。

## 运行

```powershell
node .\sync\obsidian-sync.mjs
```

脚本会自动从 `sync/.env` 读取密钥，每 15 秒拉取 Supabase 最新数据，有变化才写文件。

可选环境变量（默认值已内置）：`JOHN_SUPABASE_URL`、`JOHN_OBSIDIAN_VAULT`、`JOHN_SYNC_INTERVAL`。

## 说明

- 数据流：工作台网页（GitHub Pages）→ Supabase `workspaces` 表 → 本脚本 → Obsidian md。
- 之前的旧版读的是 Cloudflare D1（`/api/workspace`），与网页实际写入的 Supabase 不是同一库，导致同步为空。现已改为直连 Supabase。
- 若本机访问 `supabase.co` 不稳定，可先设置系统/终端代理（如 `HTTPS_PROXY`）再运行。
