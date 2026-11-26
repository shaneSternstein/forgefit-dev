import React from 'react';
import { formatShortDate } from '../utils.js';
import { Badge, Card, Icon, Label } from './ui.jsx';
import { Radar } from './Radar.jsx';
import { Legend, gapPts } from './BalanceCard.jsx';
import { theme } from '../theme.js';

export function BalanceDrill({ data, group, onBack }) {
  const g = data.groups.find(x => x.name === group); if (!g) return null;
  const rows = g.rows, radar = rows.length >= 3, max = Math.max(40, ...rows.map(r => Math.ceil(Math.max(r.planShare, r.actShare) / 10) * 10));
  const range = `${formatShortDate(data.start)} \u2013 ${formatShortDate(data.end)}, ${data.end.getFullYear()}`;
  return <div style={{ padding: '16px 16px 0', fontFamily: 'system-ui,sans-serif' }}>
    <button onClick={onBack} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 13, cursor: 'pointer', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}><Icon name={'chevron-left'} size={16} color={theme.muted} />{' Muscle Balance'}</button>
    <Label style={{ marginBottom: 2 }}>{range}</Label>
    <div style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>{g.name}</div>
    <div style={{ fontSize: 11, color: theme.sub, marginBottom: 12 }}>{Math.round(g.actShare)}{'% of logged training, '}{Math.round(g.planShare)}{'% of plan'}</div>
    {g.planVal === 0 && g.actVal === 0 ? <Card><div style={{ fontSize: 12, color: theme.muted }}>{'No planned or logged work for this group in this period.'}</div></Card> : <>
      <Card style={{ padding: '12px 14px' }}>
        {radar ? <><Radar labels={rows.map(r => r.name)} max={max} series={[{ values: rows.map(r => r.planShare), color: theme.pull, dashed: true }, { values: rows.map(r => r.actShare), color: theme.pelo }]} /><Legend /></>
          : rows.map(r => <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: theme.text }}>{r.name}</span>
            <div style={{ position: 'relative', height: 8, background: theme.border, borderRadius: 4, flex: 1.2 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: r.actShare + '%', background: theme.pelo, borderRadius: 4 }} />
              <div style={{ position: 'absolute', top: -3, bottom: -3, left: r.planShare + '%', width: 2, background: theme.pull }} /></div>
            <span style={{ width: 34, textAlign: 'right', fontSize: 12, fontFamily: 'monospace', color: theme.text }}>{Math.round(r.actShare)}{'%'}</span></div>)}
        {!radar && rows.length === 1 && <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{'One part only, so there is nothing to balance inside this group.'}</div>}
      </Card>
      <Card style={{ padding: '4px 14px' }}>
        {rows.map((r, i) => { const d = r.actShare - r.planShare, flag = rows.length > 1 && Math.abs(d) >= 5;
          return <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: i < rows.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: theme.text }}>{r.name}{r.est && <span style={{ marginLeft: 6, fontSize: 9, color: theme.muted, border: `1px dashed ${theme.muted}`, borderRadius: 4, padding: '0 4px' }}>{'estimated'}</span>}</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.muted }}>{'plan '}{Math.round(r.planShare)}{'% \u00B7 actual '}{Math.round(r.actShare)}{'%'}</span>
            <span style={{ width: 50, textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: flag ? theme.push : theme.muted }}>{rows.length === 1 || Math.round(d) === 0 ? '' : gapPts(d)}</span>
          </div>; })}
      </Card>
      <Label style={{ margin: '14px 0 6px' }}>{'Exercises that fed ' + g.name}</Label>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {g.actExercises.length ? g.actExercises.map((x, i) => <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < g.actExercises.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{x.name}</div>{x.approx && <div style={{ fontSize: 9, color: theme.phase }}>{'approximate weights'}</div>}</div>
          <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 11, color: theme.sub }}>{x.sets}{' sets'}<div style={{ fontSize: 10, color: theme.muted }}>{x.weighted.toFixed(1)}{' weighted'}</div></div>
        </div>) : <div style={{ padding: '12px 14px', fontSize: 12, color: theme.muted }}>{'No logged sets for this group in this period.'}</div>}
      </Card>
      <div style={{ fontSize: 10, color: theme.muted, margin: '10px 0 0', lineHeight: 1.5 }}>{'Shares here are each part\u2019s portion of the group. Gaps flag at 5 points or more.'}</div>
    </>}
  </div>;
}
