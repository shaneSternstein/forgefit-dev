import React from 'react';
import { ffDayMuscles } from '../balance.js';
import { Card, Icon } from './ui.jsx';
import { theme } from '../theme.js';

// Collapsed by default. Bars fill as sets are logged; the blue tick is the planned amount.
export function MusclesToday({ exercises, exSets, days, overrides, label }) {
  const [open, setOpen] = React.useState(false);
  const done = {}; (exercises || []).forEach(x => { done[x.id] = ((exSets && exSets[x.id]) || []).filter(s => s.done).length; });
  const m = ffDayMuscles(exercises, done, days, overrides);
  if (!m.groups.length) return null;
  const mx = Math.max(...m.groups.map(g => Math.max(g.planned, g.done)), 1), top = m.groups.slice(0, 3).map(g => g.name + ' ' + Math.round(g.share) + '%').join(' \u00B7 ');
  return <Card style={{ padding: '10px 14px', marginBottom: 8 }}>
    <div onClick={() => setOpen(!open)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
      <div><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{'Muscles today'}</div>{!open && <div style={{ fontSize: 10, color: theme.muted, marginTop: 2 }}>{top}</div>}</div>
      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={theme.muted} />
    </div>
    {open && <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, color: theme.muted, marginBottom: 6, lineHeight: 1.5 }}>{(label ? label + ': ' : '') + 'planned muscle split for this session. Bars fill as you log sets; the blue tick is the planned amount.'}</div>
      {m.groups.map(g => <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
        <span style={{ width: 82, fontSize: 12, fontWeight: 600, color: theme.text }}>{g.name}{' '}<span style={{ color: theme.muted, fontWeight: 400 }}>{Math.round(g.share)}{'%'}</span></span>
        <div style={{ position: 'relative', height: 8, background: theme.border, borderRadius: 4, flex: 1 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.min(g.done / mx * 100, 100) + '%', background: theme.pelo, borderRadius: 4 }} />
          <div style={{ position: 'absolute', top: -3, bottom: -3, left: Math.min(g.planned / mx * 100, 100) + '%', width: 2, background: theme.pull }} />
        </div>
        <span style={{ width: 62, textAlign: 'right', fontSize: 10, fontFamily: 'monospace', color: theme.sub }}>{g.done.toFixed(1)}{' / '}{g.planned.toFixed(1)}</span>
      </div>)}
      <div style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>{'Numbers are weighted sets done / planned.'}</div>
      {m.unmapped > 0 && <div style={{ fontSize: 10, color: theme.phase, marginTop: 4 }}>{m.unmapped + ' exercise' + (m.unmapped === 1 ? '' : 's') + ' not counted (no muscle mapping).'}</div>}
    </div>}
  </Card>;
}
