import React from 'react';
import { theme } from '../theme.js';

// Reusable radar. labels: string[]; series: [{ values:number[], color, dashed, fill }]; max: axis maximum (same units as values).
export function Radar({ labels, series, max, height = 250 }) {
  const n = labels.length, cx = 150, cy = 125, r = 82;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n, k = Math.min(v / max, 1); return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]; };
  const ring = k => labels.map((_, i) => pt(i, max * k).join(',')).join(' ');
  return <svg viewBox={'0 0 300 250'} style={{ width: '100%', height, display: 'block' }}>
    {[0.33, 0.66, 1].map(k => <polygon key={k} points={ring(k)} fill={'none'} stroke={theme.border} strokeWidth={'1'} />)}
    {labels.map((l, i) => { const p = pt(i, max), q = pt(i, max * 1.22), x = q[0], anchor = x < cx - 8 ? 'end' : x > cx + 8 ? 'start' : 'middle';
      return <g key={l}><line x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke={theme.border} strokeWidth={'1'} /><text x={q[0]} y={q[1]} fontSize={'9'} fill={theme.sub} textAnchor={anchor} dominantBaseline={'middle'} fontFamily={'monospace'}>{l}</text></g>; })}
    {series.map((s, si) => <polygon key={si} points={s.values.map((v, i) => pt(i, v).join(',')).join(' ')} fill={s.dashed ? 'none' : s.color + '33'} stroke={s.color} strokeWidth={'2'} strokeLinejoin={'round'} strokeDasharray={s.dashed ? '5 3' : undefined} />)}
  </svg>;
}
