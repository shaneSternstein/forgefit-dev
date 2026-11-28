import React from 'react';
import { addDays, parseDateKey, startOfWeek, getToday, formatShortDate } from '../utils.js';
import { ffBalance } from '../balance.js';
import { FOCUS_GROUPS, FOCUS_PRESETS, DIAL_LABELS, applyPreset, setDial, dialOf, presetByName, compareFocus, compareWithin, focusShares } from '../focus.js';
import { Card, Icon, Label } from './ui.jsx';
import { Radar } from './Radar.jsx';
import { theme } from '../theme.js';

const gapTxt = d => (d > 0 ? '+' : '') + Math.round(d) + ' pts';
const chip = on => ({ flexShrink: 0, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', background: on ? 'rgba(212,153,61,0.18)' : theme.steel, border: `1.5px solid ${on ? theme.phase : theme.border}`, color: on ? theme.phase : theme.sub, fontSize: 11, fontWeight: on ? 700 : 400, fontFamily: 'inherit' });

function Legend() {
  return <div style={{ display: 'flex', gap: 14, fontSize: 10, color: theme.muted, marginTop: 2 }}>
    <span><span style={{ color: theme.pull }}>{'\u25A0'}</span>{' Plan'}</span><span><span style={{ color: theme.phase }}>{'\u25A0'}</span>{' Focus'}</span></div>;
}

// Focus vs Plan. Plan comes from the editor's unsaved draft, so changes show before saving.
// scope: 'all' (whole program, or one typical week in routine mode) or a phase index.
export function FocusView({ settings, days, overrides, phases, routine, focus, onChange }) {
  const [scope, setScope] = React.useState('all'), [grp, setGrp] = React.useState(null), [dialsOpen, setDialsOpen] = React.useState(false);
  const sc = scope === 'all' || routine || scope >= phases.length ? 'all' : scope;
  const progStart = parseDateKey(settings.startDate);
  let start, end, scopeLabel;
  if (routine) { start = startOfWeek(getToday()); end = addDays(start, 6); scopeLabel = 'one routine week'; }
  else if (sc === 'all') { const wk = phases.reduce((a, p) => a + p.weeks, 0); start = progStart; end = addDays(progStart, wk * 7 - 1); scopeLabel = 'the whole program'; }
  else { let w0 = 0; for (let i = 0; i < sc; i++) w0 += phases[i].weeks; start = addDays(progStart, w0 * 7); end = addDays(start, phases[sc].weeks * 7 - 1); scopeLabel = phases[sc].name; }
  const data = React.useMemo(() => ffBalance('All', 0, settings, days, overrides, phases, {}, { start, end }), [settings, days, overrides, phases, scope, routine]);
  const cmp = compareFocus(data, focus), preset = presetByName(focus.preset), fs = focusShares(focus);
  const max = Math.max(24, ...cmp.map(x => Math.ceil(Math.max(x.planShare, x.focusShare) / 4) * 4));

  if (grp) {
    const g = data.groups.find(x => x.name === grp), rows = compareWithin(g), radar = rows.length >= 3, rmax = Math.max(40, ...rows.map(r => Math.ceil(Math.max(r.planShare, r.focusShare) / 10) * 10));
    return <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 40px' }}>
      <button onClick={() => setGrp(null)} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 13, cursor: 'pointer', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}><Icon name={'chevron-left'} size={16} color={theme.muted} />{' All muscle groups'}</button>
      <div style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>{grp}</div>
      <div style={{ fontSize: 11, color: theme.sub, marginBottom: 12 }}>{'Focus vs plan inside the group. Uses default within-group focus; fine-tune dials come later.'}</div>
      {g.planVal === 0 ? <Card><div style={{ fontSize: 12, color: theme.muted }}>{'Nothing planned for this group in ' + scopeLabel + '.'}</div></Card> : <>
        <Card style={{ padding: '12px 14px' }}>
          {radar ? <><Radar labels={rows.map(r => r.name)} max={rmax} series={[{ values: rows.map(r => r.focusShare), color: theme.phase, dashed: true }, { values: rows.map(r => r.planShare), color: theme.pull }]} /><Legend /></>
            : rows.map(r => <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: theme.text }}>{r.name}</span>
              <div style={{ position: 'relative', height: 8, background: theme.border, borderRadius: 4, flex: 1.2 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: r.planShare + '%', background: theme.pull, borderRadius: 4 }} />
                <div style={{ position: 'absolute', top: -3, bottom: -3, left: r.focusShare + '%', width: 2, background: theme.phase }} /></div>
              <span style={{ width: 34, textAlign: 'right', fontSize: 12, fontFamily: 'monospace', color: theme.text }}>{Math.round(r.planShare)}{'%'}</span></div>)}
          {rows.length === 1 && <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{'One part only, so there is nothing to balance inside this group.'}</div>}
        </Card>
        <Card style={{ padding: '4px 14px' }}>
          {rows.map((r, i) => { const flag = rows.length > 1 && Math.abs(r.gap) >= 5;
            return <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: i < rows.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: theme.text }}>{r.name}{r.est && <span style={{ marginLeft: 6, fontSize: 9, color: theme.muted, border: `1px dashed ${theme.muted}`, borderRadius: 4, padding: '0 4px' }}>{'estimated'}</span>}</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.muted }}>{'plan '}{Math.round(r.planShare)}{'% vs focus '}{Math.round(r.focusShare)}{'%'}</span>
              <span style={{ width: 50, textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: flag ? theme.push : theme.muted }}>{rows.length === 1 || Math.round(r.gap) === 0 ? '' : gapTxt(r.gap)}</span>
            </div>; })}
        </Card>
        <div style={{ fontSize: 10, color: theme.muted, lineHeight: 1.5 }}>{'Flags show at 5 points or more inside a group. Within-group focus uses estimated defaults.'}</div>
      </>}
    </div>;
  }

  return <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 40px' }}>
    <Label>{'Focus'}</Label>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{FOCUS_PRESETS.map(p => <button key={p.name} onClick={() => p.dials && onChange(applyPreset(p.name))} style={chip(focus.preset === p.name)}>{p.name}</button>)}</div>
    <div style={{ fontSize: 11, color: theme.sub, lineHeight: 1.5, marginBottom: 10 }}>{preset ? preset.desc : ''}</div>
    <Card style={{ padding: '10px 14px' }}>
      <div onClick={() => setDialsOpen(!dialsOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{'Dials by group'}</span><Icon name={dialsOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.muted} /></div>
      {dialsOpen && <div style={{ marginTop: 8 }}>{FOCUS_GROUPS.map(g => <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: theme.text }}>{g}</span>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: theme.muted, marginRight: 4 }}>{Math.round(fs[g])}{'%'}</span>
        {DIAL_LABELS.map((l, i) => <button key={l} onClick={() => onChange(setDial(focus, g, i))} style={{ ...chip(dialOf(focus, g) === i), padding: '3px 9px', fontSize: 10 }}>{l}</button>)}
      </div>)}</div>}
    </Card>
    {!routine && phases.length > 1 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0 10px' }}>
      {['all'].concat(phases.map((p, i) => i)).map(k => <button key={k} onClick={() => setScope(k)} style={{ ...chip(sc === k), color: sc === k ? theme.pull : theme.sub, border: `1.5px solid ${sc === k ? theme.pull : theme.border}`, background: sc === k ? 'rgba(191,195,255,0.12)' : theme.steel }}>{k === 'all' ? 'Whole program' : phases[k].name}</button>)}</div>}
    <Card style={{ padding: '12px 14px' }}>
      <Label style={{ marginBottom: 2 }}>{'Plan vs focus'}</Label>
      <div style={{ fontSize: 11, color: theme.muted, marginBottom: 4 }}>{(routine ? 'One routine week' : sc === 'all' ? 'Whole program' : phases[sc].name)}{' \u00B7 '}{formatShortDate(start)}{' \u2013 '}{formatShortDate(end)}</div>
      {data.planTot === 0 ? <div style={{ fontSize: 12, color: theme.muted, padding: '14px 0 8px' }}>{'No exercises planned in ' + scopeLabel + ' yet. Add some in the Template tab.'}</div> : <>
        <Radar labels={cmp.map(x => x.name)} max={max} series={[{ values: cmp.map(x => x.focusShare), color: theme.phase, dashed: true }, { values: cmp.map(x => x.planShare), color: theme.pull }]} />
        <Legend /></>}
    </Card>
    {data.planTot > 0 && <Card style={{ padding: '4px 14px' }}>
      <div style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', color: theme.muted, textTransform: 'uppercase', margin: '10px 0 2px' }}>{'Gaps in the plan \u00B7 tap a group'}</div>
      {cmp.map((x, i) => { const flag = Math.abs(x.gap) >= 2;
        return <div key={x.name} onClick={() => setGrp(x.name)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: i < cmp.length - 1 ? `1px solid ${theme.border}` : 'none', cursor: 'pointer' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: theme.text }}>{x.name}</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.muted }}>{'planned '}{Math.round(x.planShare)}{'% vs target '}{Math.round(x.focusShare)}{'%'}</span>
          <span style={{ width: 52, textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: flag ? theme.push : theme.muted }}>{Math.round(x.gap) === 0 ? 'on focus' : gapTxt(x.gap)}</span>
        </div>; })}
    </Card>}
    <div style={{ fontSize: 10, color: theme.muted, lineHeight: 1.5 }}>{'Plan counts weighted sets from the exercises in this editor, including changes you have not saved. Gaps are plan vs focus; 2 points or more are flagged. Your logged history is not affected.'}</div>
    {(data.unassigned.plan > 0 || data.approx.plan > 0) && <div style={{ fontSize: 10, color: theme.phase, marginTop: 4 }}>{data.unassigned.plan > 0 ? data.unassigned.plan + ' planned sets are not counted (no muscle mapping). ' : ''}{data.approx.plan > 0 ? data.approx.plan + ' use approximate weights (custom exercises).' : ''}</div>}
  </div>;
}
