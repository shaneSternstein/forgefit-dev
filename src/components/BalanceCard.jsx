import React from 'react';
import { formatShortDate } from '../utils.js';
import { Card, Icon, Label } from './ui.jsx';
import { Radar } from './Radar.jsx';
import { theme } from '../theme.js';

const pct = v => Math.round(v);
export const gapPts = d => (d > 0 ? '+' : '') + Math.round(d) + ' pts';

export function Legend() {
  return <div style={{ display: 'flex', gap: 14, fontSize: 10, color: theme.muted, marginTop: 2 }}>
    <span><span style={{ color: theme.pelo }}>{'\u25A0'}</span>{' Actual'}</span><span><span style={{ color: theme.pull }}>{'\u25A0'}</span>{' Plan'}</span></div>;
}

export function BalanceCard({ data, period, setPeriod, off, setOff, onOpen }) {
  const canNav = period !== 'All', atCurrent = off >= 0, g = data.groups;
  const max = Math.max(24, ...g.map(x => Math.max(x.planShare, x.actShare)) .map(v => Math.ceil(v / 4) * 4));
  const range = `${formatShortDate(data.start)} \u2013 ${formatShortDate(data.end)}, ${data.end.getFullYear()}`;
  const approx = data.approx.plan + data.approx.actual, un = data.unassigned.plan + data.unassigned.actual;
  return <Card style={{ marginBottom: 14, padding: '14px 14px 16px' }}>
    <Label style={{ marginBottom: 2 }}>{'Muscle Balance'}</Label>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: canNav ? 'center' : 'flex-start', gap: 8, marginBottom: 6 }}>
      {canNav && <button onClick={() => setOff(off - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}><Icon name={'chevron-left'} size={14} color={theme.muted} /></button>}
      <div style={{ fontSize: 11, color: theme.muted }}>{range}</div>
      {canNav && <button onClick={() => !atCurrent && setOff(off + 1)} disabled={atCurrent} style={{ background: 'none', border: 'none', cursor: atCurrent ? 'default' : 'pointer', padding: 2, display: 'flex', opacity: atCurrent ? 0.25 : 1 }}><Icon name={'chevron-right'} size={14} color={theme.muted} /></button>}
    </div>
    {data.empty ? <div style={{ fontSize: 12, color: theme.muted, padding: '16px 0 10px' }}>{'Nothing planned or logged in this period yet.'}</div> : <>
      <Radar labels={g.map(x => x.name)} max={max} series={[{ values: g.map(x => x.planShare), color: theme.pull, dashed: true }, { values: g.map(x => x.actShare), color: theme.pelo }]} />
      <Legend />
      {data.completion !== null && <div style={{ fontSize: 11, color: theme.sub, margin: '8px 0 4px' }}>{'Plan completion so far: '}<span style={{ color: theme.text, fontFamily: 'monospace', fontWeight: 700 }}>{pct(data.completion)}{'%'}</span></div>}
      <div style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', color: theme.muted, textTransform: 'uppercase', margin: '10px 0 2px' }}>{'Tap a group to see its parts'}</div>
      {g.map(x => { const d = x.actShare - x.planShare, flag = Math.abs(d) >= 2;
        return <div key={x.name} onClick={() => onOpen(x.name)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 2px', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: theme.text }}>{x.name}</span>
          <div style={{ position: 'relative', height: 8, background: theme.border, borderRadius: 4, flex: 1.2 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.min(x.actShare * 4, 100) + '%', background: theme.pelo, borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: -3, bottom: -3, left: Math.min(x.planShare * 4, 100) + '%', width: 2, background: theme.pull }} />
          </div>
          <span style={{ width: 34, textAlign: 'right', fontSize: 12, fontFamily: 'monospace', color: theme.text }}>{pct(x.actShare)}{'%'}</span>
          <span style={{ width: 52, textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: flag ? theme.push : theme.muted }}>{Math.round(d) === 0 ? 'on plan' : gapPts(d)}</span>
        </div>; })}
      <div style={{ fontSize: 10, color: theme.muted, marginTop: 8, lineHeight: 1.5 }}>{'Share of weighted sets: 1.0 for the main muscle, 0.5 for helpers. Gaps are actual vs plan; 2 points or more are flagged.'}</div>
      {approx > 0 && <div style={{ fontSize: 10, color: theme.phase, marginTop: 4 }}>{approx + ' set' + (approx === 1 ? '' : 's') + ' use approximate muscle weights (custom exercises).'}</div>}
      {un > 0 && <div style={{ fontSize: 10, color: theme.phase, marginTop: 4 }}>{un + ' set' + (un === 1 ? '' : 's') + ' are not counted (exercise has no muscle mapping).'}</div>}
    </>}
    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>{['1W', '1M', '3M', '1Y', 'All'].map(p => <button key={p} onClick={() => setPeriod(p)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, padding: '6px 11px', borderRadius: 999, background: p === period ? theme.text : 'transparent', color: p === period ? theme.black : theme.muted }}>{p}</button>)}</div>
  </Card>;
}
