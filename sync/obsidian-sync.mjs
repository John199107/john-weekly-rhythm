import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(here, '.env')); } catch {}

const supabaseUrl = process.env.JOHN_SUPABASE_URL || 'https://oofqbmlpfrhiothxkjiy.supabase.co';
const serviceKey = process.env.JOHN_SUPABASE_SERVICE_KEY || '';
const vault = process.env.JOHN_OBSIDIAN_VAULT || 'D:\\Users\\76114\\Obsidian Vault';
const output = path.join(vault, '01_工作', '任务看板.md');
const intervalMs = Number(process.env.JOHN_SYNC_INTERVAL || 15000);

if (!serviceKey) {
  console.error('[obsidian-sync] 缺少 JOHN_SUPABASE_SERVICE_KEY');
  console.error('请在 Supabase 控制台 Settings → API 复制 service_role key，写入 sync/.env 后重试');
  process.exit(1);
}

const AREA_REV = { '工作': '工作', '生活与家庭': '生活家庭', '个人成长': '个人成长', 'AI与果果': 'AI亲子', 'AI与自媒体': 'AI自媒体', '甜甜产品': '甜甜产品', '休息娱乐': '休息娱乐' };
const ORDER = ['工作', '生活家庭', '个人成长', 'AI亲子', 'AI自媒体', '甜甜产品', '休息娱乐'];

function toDue(cycle) {
  if (!cycle || cycle === '持续' || cycle === '每周' || cycle === '每月' || cycle === '本周') return '持续';
  const m = String(cycle).match(/(\d{1,2})月(\d{1,2})日/);
  if (m) return `2026-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
  return cycle;
}
function toRepeat(cycle) {
  if (cycle === '每周') return 'w';
  if (cycle === '每月') return 'm';
  return '';
}
const esc = s => String(s || '').replace(/\|/g, '｜').replace(/%%/g, '%％').replace(/[\r\n]+/g, ' ');

function md(tasks) {
  const groups = new Map();
  for (const t of tasks) {
    const cat = AREA_REV[t.area] || '工作';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(t);
  }
  const lines = [
    '# 任务看板',
    '',
    '> 状态：Supabase 权威，本文件由同步脚本自动生成，请勿手动编辑。',
    `> 同步时间：${new Date().toLocaleString('zh-CN')}`,
    '',
    '---',
    '',
  ];
  for (const cat of ORDER) {
    const list = groups.get(cat);
    if (!list || list.length === 0) continue;
    lines.push(`## ${cat}`, '');
    for (const t of list) {
      const done = t.status === '已完成' ? 'x' : ' ';
      const due = toDue(t.cycle);
      const prio = t.priority === '最高' ? '高' : (t.priority || '中');
      const repeat = toRepeat(t.cycle);
      const note = esc(t.note);
      lines.push(`- [${done}] ${esc(t.title)} %%${t.id}|${cat}|${due}|${prio}|${repeat}|${note}|%%`);
    }
    lines.push('');
  }
  return lines.join('\n') + '\n';
}

async function fetchWorkspace() {
  const url = `${supabaseUrl}/rest/v1/workspaces?select=payload&order=updated_at.desc&limit=1`;
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

let last = '';
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
  console.log(new Date().toLocaleTimeString('zh-CN'), '已同步任务看板，任务数', tasks.length);
}

await sync();
if (process.env.JOHN_SYNC_ONCE === '1') process.exit(0);
setInterval(() => sync().catch(e => console.error(e.message)), intervalMs);
