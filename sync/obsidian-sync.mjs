import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(here, '.env')); } catch {}

const supabaseUrl = process.env.JOHN_SUPABASE_URL || 'https://oofqbmlpfrhiothxkjiy.supabase.co';
const serviceKey = process.env.JOHN_SUPABASE_SERVICE_KEY || '';
const vault = process.env.JOHN_OBSIDIAN_VAULT || 'D:\\Users\\76114\\Obsidian Vault';
const output = path.join(vault, '00_个人待办工作台_数据.md');
const intervalMs = Number(process.env.JOHN_SYNC_INTERVAL || 15000);

if (!serviceKey) {
  console.error('[obsidian-sync] 缺少 JOHN_SUPABASE_SERVICE_KEY');
  console.error('请在 Supabase 控制台 Settings → API 中复制 service_role key，写入 sync/.env 后重试');
  process.exit(1);
}

let last = '';

function md(tasks) {
  const groups = new Map();
  for (const t of tasks) { if (!groups.has(t.area)) groups.set(t.area, []); groups.get(t.area).push(t); }
  const lines = ['---', 'generated: true', 'source: John个人待办工作台', '---', '', '# 个人待办工作台数据', '', `> 最近同步：${new Date().toLocaleString('zh-CN')}`, ''];
  for (const [area, list] of groups) {
    lines.push(`## ${area}`, '');
    for (const t of list) {
      lines.push(`### ${t.title}`, '', `- 状态：${t.status}`, `- 优先级：${t.priority}`, `- 周期：${t.cycle}`, `- 下一步：${t.next}`, `- 备注：${t.note || '—'}`);
      if (t.logs?.length) { lines.push('- 跟踪记录：'); for (const l of t.logs) lines.push(`  - ${l.date}：${l.text}`); }
      lines.push('');
    }
  }
  return lines.join('\n') + '\n';
}

async function fetchWorkspace() {
  const url = `${supabaseUrl}/rest/v1/workspaces?select=payload,updated_at&order=updated_at.desc&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Supabase 读取失败：HTTP ${res.status}`);
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const payload = rows[0].payload;
  if (payload == null) return null;
  return Array.isArray(payload) ? payload : (typeof payload === 'string' ? JSON.parse(payload) : null);
}

async function sync() {
  const tasks = await fetchWorkspace();
  if (!tasks) return;
  const signature = JSON.stringify(tasks);
  if (signature === last) return;
  const content = md(tasks);
  const temp = output + '.tmp';
  await fs.writeFile(temp, content, 'utf8');
  await fs.rename(temp, output);
  last = signature;
  console.log(new Date().toLocaleTimeString('zh-CN'), '已同步到 Obsidian，任务数', tasks.length);
}

await sync();
setInterval(() => sync().catch(e => console.error(e.message)), intervalMs);
