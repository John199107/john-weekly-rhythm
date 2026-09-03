'use client';
import { useEffect, useRef, useState } from 'react';
import { Tree, useSimpleTree } from 'react-arborist';
import type { NodeApi } from 'react-arborist';

type Priority = '最高' | '高' | '中' | '低';
type Status = '未开始' | '进行中' | '等待他人' | '已完成' | '暂停';
type DemoNode = {
  id: string;
  name: string;
  area: string;
  priority: Priority;
  status: Status;
  children?: DemoNode[];
};

const PRIO_BG: Record<Priority, string> = {
  '最高': '#b91c2c',
  '高': '#d4571a',
  '中': '#b88608',
  '低': '#525c72',
};
const STATUS_BG: Record<Status, string> = {
  '进行中': '#16a34a',
  '等待他人': '#2563eb',
  '未开始': '#8a93a8',
  '已完成': '#5b6478',
  '暂停': '#9333ea',
};
const AREA_BG: Record<string, { bg: string; fg: string }> = {
  '工作': { bg: '#e3eef8', fg: '#2563a8' },
  '生活与家庭': { bg: '#fce6d4', fg: '#c25a18' },
  '个人成长': { bg: '#dceaf8', fg: '#2563a8' },
  'AI与果果': { bg: '#e5dcf6', fg: '#5b3fb0' },
  'AI与自媒体': { bg: '#fbdce6', fg: '#b32b56' },
  '甜甜产品': { bg: '#fbdcec', fg: '#b03076' },
  '休息娱乐': { bg: '#d6f0eb', fg: '#1c706a' },
};

const initial: DemoNode[] = [
  { id: 'vm', name: '价值魔方', area: '工作', priority: '高', status: '进行中', children: [
    { id: 'vm1', name: '抽样验证10-20条', area: '工作', priority: '高', status: '进行中' },
    { id: 'vm2', name: '赛道系数微调', area: '工作', priority: '中', status: '未开始' },
    { id: 'vm3', name: 'v4迁移Coze', area: '工作', priority: '中', status: '等待他人' },
    { id: 'vm4', name: '智能体三设计', area: '工作', priority: '中', status: '未开始' },
    { id: 'vm5', name: '智能体一测试', area: '工作', priority: '高', status: '进行中' },
    { id: 'vm6', name: '比赛材料准备', area: '工作', priority: '低', status: '已完成' },
    { id: 'vm7', name: '下沉一线调研', area: '工作', priority: '低', status: '未开始' },
  ]},
  { id: 'ai', name: 'AI大赛', area: '工作', priority: '最高', status: '进行中', children: [
    { id: 'ai1', name: '补5张图', area: '工作', priority: '最高', status: '进行中' },
    { id: 'ai2', name: '复核量化数字', area: '工作', priority: '高', status: '未开始' },
    { id: 'ai3', name: 'PPT配色', area: '工作', priority: '中', status: '等待他人' },
    { id: 'ai4', name: '三人审阅定稿', area: '工作', priority: '高', status: '未开始' },
  ]},
  { id: 'xc', name: '信创', area: '工作', priority: '高', status: '进行中', children: [
    { id: 'xc1', name: '信创设备协调', area: '工作', priority: '高', status: '等待他人' },
    { id: 'xc2', name: '前置系统+2人', area: '工作', priority: '中', status: '未开始' },
    { id: 'xc3', name: '总账系统迁移', area: '工作', priority: '高', status: '进行中' },
    { id: 'xc4', name: '金融IC卡重排', area: '工作', priority: '中', status: '未开始' },
  ]},
  { id: 't1', name: '需求回检方案', area: '工作', priority: '高', status: '已完成' },
  { id: 't2', name: '需求价值评估', area: '工作', priority: '高', status: '进行中' },
  { id: 't3', name: '终端设备管理', area: '工作', priority: '低', status: '未开始' },
  { id: 'g1', name: '果果AI真实互动', area: 'AI与果果', priority: '中', status: '进行中' },
  { id: 'g2', name: '每周发片', area: 'AI与自媒体', priority: '高', status: '未开始' },
  { id: 'g3', name: '老婆生日 11/12', area: '生活与家庭', priority: '高', status: '未开始' },
];

function Node({ node, style, dragHandle, isMobile }: { node: NodeApi<DemoNode>; style: React.CSSProperties; dragHandle?: (el: HTMLDivElement | null) => void; isMobile: boolean }) {
  const d = node.data;
  const isFolder = !!d.children?.length;
  const prio = PRIO_BG[d.priority] || PRIO_BG['低'];
  const st = STATUS_BG[d.status] || STATUS_BG['未开始'];
  const area = AREA_BG[d.area] || { bg: '#eee', fg: '#666' };
  const isDone = d.status === '已完成';
  const fs = isFolder ? (isMobile ? 19 : 17.5) : (isMobile ? 16 : 15);
  const tagFs = isMobile ? 13 : 12;
  return (
    <div ref={dragHandle} onClick={() => { if (isFolder) node.toggle(); }}
      style={{
        ...style,
        cursor: 'grab',
        display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10,
        height: Number(style.height) - (isMobile ? 12 : 10), marginTop: isMobile ? 8 : 6,
        padding: '0 14px 0 0',
        background: isDone ? '#f3f5f8' : (isFolder ? '#f1f7fc' : '#ffffff'),
        border: '1px solid #dde6ef',
        borderTop: '1px solid #ffffff',
        borderLeft: `6px solid ${prio}`,
        borderRadius: 16,
        boxShadow: '0 4px 14px rgba(40,80,140,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        boxSizing: 'border-box',
        transition: 'transform .18s ease, box-shadow .18s ease',
        animation: 'card-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
        animationDelay: `${Math.min(node.level || 0, 4) * 0.06}s`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 24px rgba(40,120,200,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(40,80,140,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'; }}
    >
      <span style={{ width: 22, height: 26, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: isFolder ? '#1d4a9e' : '#aab3c5', fontSize: 16, fontWeight: 800, lineHeight: 1, userSelect: 'none', cursor: isFolder ? 'pointer' : 'default' }}>
        {isFolder ? (node.isOpen ? '▾' : '▸') : '·'}
      </span>
      <span style={{ flex: 1, fontSize: fs, fontWeight: isFolder ? 700 : 500, color: isDone ? '#8a93a8' : '#1a2a3a', textDecoration: isDone ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {d.name}
      </span>
      <span style={{ fontSize: tagFs, padding: isMobile ? '5px 12px' : '4px 11px', borderRadius: 999, background: st, color: '#fff', flexShrink: 0, fontWeight: 700 }}>
        {d.status}
      </span>
      {!isMobile && <span style={{ fontSize: tagFs, padding: '4px 10px', borderRadius: 7, background: area.bg, color: area.fg, flexShrink: 0, fontWeight: 700 }}>
        {d.area}
      </span>}
      {!isMobile && <span style={{ fontSize: tagFs, padding: '4px 11px', borderRadius: 999, background: prio, color: '#fff', flexShrink: 0, fontWeight: 700 }}>
        {d.priority}
      </span>}
      {isFolder && <span style={{ fontSize: tagFs, color: '#2563a8', background: '#dbeafe', borderRadius: 999, padding: isMobile ? '5px 12px' : '4px 10px', flexShrink: 0, fontWeight: 700 }}>{d.children!.length} 项</span>}
    </div>
  );
}

export default function TreeDemo() {
  const [data, controller] = useSimpleTree<DemoNode>(initial);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [treeW, setTreeW] = useState(740);
  const [treeH, setTreeH] = useState(620);
  const treeWrapRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const m = window.innerWidth < 640;
      setIsMobile(m);
      if (m) {
        setTreeW(Math.max(window.innerWidth - 32, 280));
        setTreeH(Math.max(window.innerHeight - 280, 400));
      } else {
        setTreeW(Math.min(window.innerWidth - 80, 760));
        setTreeH(Math.max(window.innerHeight - 320, 480));
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    let m = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!m) {
      m = document.createElement('meta');
      m.name = 'viewport';
      m.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      document.head.appendChild(m);
    } else { m.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'; }
  }, []);

  // 惯性滚动 + 边界回弹 + 背景视差
  useEffect(() => {
    const wrap = treeWrapRef.current;
    if (!wrap) return;
    // 等 react-arborist 渲染出滚动容器
    const timer = setTimeout(() => {
      const scroller = (wrap.querySelector('[role="tree"]') as HTMLElement) || wrap;
      let velocity = 0;
      let raf = 0;
      let running = false;

      const settle = () => {
        const max = scroller.scrollHeight - scroller.clientHeight;
        let target = scroller.scrollTop;
        if (target < 0) target = 0;
        else if (target > max && max > 0) target = max;
        const easeBack = () => {
          const diff = target - scroller.scrollTop;
          if (Math.abs(diff) > 0.4) {
            scroller.scrollTop += diff * 0.18;
            raf = requestAnimationFrame(easeBack);
          } else {
            scroller.scrollTop = target;
            running = false;
          }
        };
        if (Math.abs(target - scroller.scrollTop) > 0.4) { easeBack(); } else { running = false; }
      };

      const step = () => {
        velocity *= 0.94; // 摩擦减速
        scroller.scrollTop += velocity;

        const max = scroller.scrollHeight - scroller.clientHeight;
        if (scroller.scrollTop < 0) {
          // 顶部橡皮筋回弹
          const over = -scroller.scrollTop;
          scroller.scrollTop = -over * 0.32;
          velocity *= 0.88;
        } else if (max > 0 && scroller.scrollTop > max) {
          const over = scroller.scrollTop - max;
          scroller.scrollTop = max + over * 0.32;
          velocity *= 0.88;
        }

        // 背景视差：背景慢速移动，前景快速，形成景深
        if (cloudsRef.current) {
          cloudsRef.current.style.transform = `translateY(${scroller.scrollTop * 0.32}px)`;
        }

        if (Math.abs(velocity) > 0.35) {
          raf = requestAnimationFrame(step);
        } else {
          settle();
        }
      };

      const onWheel = (e: WheelEvent) => {
        if (scroller.scrollHeight <= scroller.clientHeight) return;
        e.preventDefault();
        velocity += e.deltaY;
        if (!running) { running = true; raf = requestAnimationFrame(step); }
      };

      scroller.addEventListener('wheel', onWheel, { passive: false });
      (scroller as any)._cleanup = () => {
        scroller.removeEventListener('wheel', onWheel);
        cancelAnimationFrame(raf);
      };
    }, 50);

    return () => {
      clearTimeout(timer);
      const scroller = wrap.querySelector('[role="tree"]') as HTMLElement | null;
      if (scroller && (scroller as any)._cleanup) (scroller as any)._cleanup();
    };
  }, []);

  if (!mounted) return <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#1a2a3a' }}>加载中…</main>;
  return (
    <>
      <style>{`
        body { margin: 0; }
        @keyframes ring-out { 0%{transform:scale(.9);opacity:.9} 100%{transform:scale(2.6);opacity:0} }
        @keyframes card-in { from{opacity:0;transform:translateY(24px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        .sky-bg {
          min-height: 100vh; position: relative; overflow-x: hidden;
          background: linear-gradient(180deg, #c8e4ff 0%, #b3daff 40%, #d4ebff 100%);
        }
        .clouds { position: fixed; inset: 0; pointer-events: none; will-change: transform; }
        .cloud { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.7); filter: blur(40px); }
        .c1 { width: 480px; height: 220px; left: -80px; top: 8%; }
        .c2 { width: 380px; height: 170px; right: -60px; top: 22%; opacity: .8; }
        .c3 { width: 560px; height: 240px; left: 20%; bottom: -40px; opacity: .85; }
        .c4 { width: 320px; height: 150px; left: 6%; bottom: 30%; opacity: .6; }
        .ai-fab { position: fixed; right: 22px; bottom: 22px; z-index: 10; }
        .ai-fab .ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid rgba(74,158,255,0.55); animation: ring-out 2.6s ease-out infinite; }
        .ai-fab .ring.r2 { animation-delay: .87s; }
        .ai-fab .ring.r3 { animation-delay: 1.73s; }
        .ai-fab .core { position: absolute; inset: 12px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #8fc7ff 0%, #3d7bff 60%, #1d4a9e 100%); box-shadow: 0 6px 22px rgba(60,130,220,0.55), inset 0 1px 0 rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; font-weight: 700; }
      `}</style>
      <main className="sky-bg" style={{ padding: isMobile ? 12 : 24, fontFamily: 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <div className="clouds" ref={cloudsRef} aria-hidden="true">
          <span className="cloud c1" /><span className="cloud c2" /><span className="cloud c3" /><span className="cloud c4" />
        </div>
        <div style={{ maxWidth: isMobile ? '100%' : 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: isMobile ? 20 : 24, margin: isMobile ? '0 0 8px' : '0 0 8px', color: '#0e2a4a', fontWeight: 800 }}>树形任务 · 天空蓝</h1>
          <p style={{ color: '#3a5a78', fontSize: isMobile ? 13 : 14, margin: '0 0 16px', lineHeight: 1.5 }}>
            拖到另一个任务上→变子项；拖到空白→变顶层；点三角展开；双击改名；Delete 删除。滚动有惯性回弹，背景有视差景深。
          </p>
          <div style={{ display: 'flex', gap: isMobile ? 8 : 10, flexWrap: 'wrap', marginBottom: 14, fontSize: isMobile ? 12 : 12, color: '#3a5a78', alignItems: 'center' }}>
            <span>优先级：</span>
            {(['最高', '高', '中', '低'] as Priority[]).map(p => (
              <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <i style={{ width: 12, height: 12, background: PRIO_BG[p], borderRadius: 3, display: 'inline-block' }} />
                {p}
              </span>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11.5 }}>惯性滚动 · 入场动画 · 视差景深</span>
          </div>
          <div ref={treeWrapRef} style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: isMobile ? 10 : 14, boxShadow: '0 8px 28px rgba(40,100,180,0.10)', overflow: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <Tree<DemoNode>
              data={data}
              {...controller}
              height={treeH}
              width={treeW}
              indent={isMobile ? 24 : 28}
              rowHeight={isMobile ? 76 : 64}
            >
              {props => <Node {...props} isMobile={isMobile} />}
            </Tree>
          </div>
          <p style={{ color: '#5a7390', fontSize: isMobile ? 12 : 12, marginTop: 14 }}>独立 demo 页（/tree-demo），手机端已自动简化布局。</p>
        </div>
        <div className="ai-fab" style={{ width: isMobile ? 64 : 60, height: isMobile ? 64 : 60 }} aria-hidden="true">
          <span className="ring" /><span className="ring r2" /><span className="ring r3" />
          <span className="core">✦</span>
        </div>
      </main>
    </>
  );
}