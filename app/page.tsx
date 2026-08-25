'use client';
import { useEffect, useState } from 'react';
type Status = '未开始'|'进行中'|'已完成'|'等待他人'|'暂停';
type Task = {id:string;area:string;result:string;next:string;priority:string;status:Status};
const week=[
{day:'周一',morning:'选题与核心观点',evening:'家庭 / 休息',kind:'rest'},
{day:'周二',morning:'口播初稿',evening:'果果 AI 日',note:'真实互动 · 积累素材',kind:'ai'},
{day:'周三',morning:'修改与试录',evening:'剪辑日',note:'整理已有故事',kind:'edit'},
{day:'周四',morning:'正式录口播 / OBS',evening:'果果 AI 日',note:'真实互动 · 积累素材',kind:'ai'},
{day:'周五',morning:'补录 · 标题 · 封面',evening:'剪辑日或家庭',kind:'edit'},
{day:'周末',morning:'仅在需要时补缺',evening:'完成剪辑 / 发布',note:'也可以户外或纯家庭时间',kind:'weekend'}];
const defaults:Task[]=[
{id:'agent',area:'工作',result:'智能体大赛申报材料定稿并提交',next:'约项目组讨论时间，提前发送初稿',priority:'最高',status:'进行中'},
{id:'demand',area:'工作',result:'需求分级分类形成可讨论版本',next:'明确分级维度、分类规则、流程和示例',priority:'高',status:'未开始'},
{id:'weekly',area:'固定运转',result:'周报、通报、测试、审核和时效跟踪',next:'统一收集数据，固定窗口批量处理',priority:'高',status:'未开始'},
{id:'family',area:'家庭 / AI',result:'至少一次果果 AI 真实互动',next:'不设计台词，只记录真实过程',priority:'中',status:'未开始'},
{id:'media',area:'自媒体',result:'争取完成一条视频',next:'早晨口播，隔晚剪辑；没有好内容不硬发',priority:'中',status:'未开始'}];
const parking=[['小红书起号','四周后再看','暂不启动'],['学习 IMA','有真实需求时','停车'],['DeepSeek / Harness','甜甜进入相关阶段时','停车'],['价值魔方体系','智能体大赛关键节点后','稍后推进']];
export default function Home(){
const [tasks,setTasks]=useState<Task[]>(defaults);const [tab,setTab]=useState<'rhythm'|'focus'|'parking'>('rhythm');
useEffect(()=>{const saved=localStorage.getItem('john-weekly-tasks');if(saved)setTasks(JSON.parse(saved));},[]);
const update=(id:string,status:Status)=>{const next=tasks.map(t=>t.id===id?{...t,status}:t);setTasks(next);localStorage.setItem('john-weekly-tasks',JSON.stringify(next));};
const done=tasks.filter(t=>t.status==='已完成').length;
return <main><header className="hero"><div className="eyebrow">JOHN · 每周节奏</div><h1>把想法放回各自的位置</h1><p>工作先履责，家庭要在场，AI走长期，自媒体记录结果。</p><div className="progress"><span style={{width:`${done/tasks.length*100}%`}}/></div><small>本周完成 {done} / {tasks.length} 项 · 不追求全部做满</small></header>
<nav className="tabs"><button className={tab==='rhythm'?'active':''} onClick={()=>setTab('rhythm')}>每周节奏</button><button className={tab==='focus'?'active':''} onClick={()=>setTab('focus')}>本周重点</button><button className={tab==='parking'?'active':''} onClick={()=>setTab('parking')}>想法停车场</button></nav>
{tab==='rhythm'&&<section className="section"><div className="sectionHead"><div><span>01</span><h2>晚上交替，早晨创造</h2></div><p>通勤输入与试读 · 午间轻松刷视频和休息</p></div><div className="dayGrid">{week.map(d=><article className={`dayCard ${d.kind}`} key={d.day}><div className="dayName">{d.day}</div><div className="slot"><small>07:00—07:40</small><strong>{d.morning}</strong></div><div className="divider"/><div className="slot"><small>20:00—21:00</small><strong>{d.evening}</strong>{d.note&&<p>{d.note}</p>}</div></article>)}</div><div className="minimum"><b>最低可行周</b><span>一次早晨口播</span><i>＋</i><span>一次果果AI互动</span><i>＋</i><span>一次剪辑</span></div></section>}
{tab==='focus'&&<section className="section"><div className="sectionHead"><div><span>02</span><h2>本周只盯结果</h2></div><p>点击状态即可更新，记录保存在当前设备</p></div><div className="taskList">{tasks.map(t=><article className="task" key={t.id}><div className="taskTop"><span className="area">{t.area}</span><span className={`priority p-${t.priority}`}>{t.priority}</span></div><h3>{t.result}</h3><p>{t.next}</p><select value={t.status} onChange={e=>update(t.id,e.target.value as Status)}>{['未开始','进行中','已完成','等待他人','暂停'].map(s=><option key={s}>{s}</option>)}</select></article>)}</div></section>}
{tab==='parking'&&<section className="section"><div className="sectionHead"><div><span>03</span><h2>不是放弃，只是排队</h2></div><p>每周统一看一次，平时不立即切换任务</p></div><div className="parkingList">{parking.map(([idea,when,state])=><article key={idea}><div><small>{state}</small><h3>{idea}</h3></div><p>{when}</p></article>)}</div></section>}
<footer>果果和爸爸的 AI 之旅 · 慢一点，也是在前进</footer></main>}
