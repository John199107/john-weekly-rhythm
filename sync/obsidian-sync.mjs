import fs from 'node:fs/promises';
import path from 'node:path';

const siteUrl=process.env.JOHN_WORKBENCH_URL;
const token=process.env.JOHN_SITES_TOKEN;
const vault=process.env.JOHN_OBSIDIAN_VAULT||'D:\\Users\\76114\\Obsidian Vault';
const output=path.join(vault,'00_个人待办工作台_数据.md');
if(!siteUrl||!token)throw new Error('请设置 JOHN_WORKBENCH_URL 和 JOHN_SITES_TOKEN');
let last='';
function md(tasks){
 const groups=new Map();for(const t of tasks){if(!groups.has(t.area))groups.set(t.area,[]);groups.get(t.area).push(t)}
 const lines=['---','generated: true','source: John个人待办工作台','---','','# 个人待办工作台数据','',`> 最近同步：${new Date().toLocaleString('zh-CN')}`,''];
 for(const [area,list] of groups){lines.push(`## ${area}`,'');for(const t of list){lines.push(`### ${t.title}`,'',`- 状态：${t.status}`,`- 优先级：${t.priority}`,`- 周期：${t.cycle}`,`- 下一步：${t.next}`,`- 备注：${t.note||'—'}`);if(t.logs?.length){lines.push('- 跟踪记录：');for(const l of t.logs)lines.push(`  - ${l.date}：${l.text}`)}lines.push('')}}return lines.join('\n')+'\n';
}
async function sync(){
 const response=await fetch(new URL('/api/workspace',siteUrl),{headers:{'OAI-Sites-Authorization':token}});if(!response.ok)throw new Error(`同步读取失败：${response.status}`);
 const body=await response.json();if(!body.data)return;const content=md(body.data);const signature=JSON.stringify(body.data);if(signature===last)return;
 const temp=output+'.tmp';await fs.writeFile(temp,content,'utf8');await fs.rename(temp,output);last=signature;console.log(new Date().toLocaleTimeString('zh-CN'),'已同步到 Obsidian');
}
await sync();setInterval(()=>sync().catch(e=>console.error(e.message)),15000);
