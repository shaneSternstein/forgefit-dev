// Focus: the target split Shane wants, compared with what the routine plans.
// Stored as settings.focus = { preset, dials }. dials: group -> 0 Low, 1 Normal (default), 2 High.
import { MUSCLE_TIERS } from './muscleWeights.js';

export const FOCUS_GROUPS = MUSCLE_TIERS.map(t => t[0]);
// Balanced split, scaled to muscle size (larger groups get more of the training). Sums to 100.
export const FOCUS_BASE = { Chest: 13, Back: 18, Shoulders: 12, Biceps: 9, Triceps: 9, Core: 8, Quads: 11, Hamstrings: 8, Glutes: 8, Calves: 4 };
export const DIAL_MULT = [0.5, 1, 1.6];
export const DIAL_LABELS = ['Low', 'Normal', 'High'];

// Placeholder weightings (approved as-is). Each lists only the groups moved off Normal.
export const FOCUS_PRESETS = [
  ['Balanced', {}, 'Even coverage scaled to muscle size. Larger groups like Back and Quads get more of your training than Calves or Core.'],
  ['Upper focus', { Chest: 2, Back: 2, Shoulders: 2, Biceps: 2, Triceps: 2, Quads: 0, Hamstrings: 0, Glutes: 0, Calves: 0 }, 'Weights chest, back, shoulders and arms higher, with legs at a lower share.'],
  ['Lower focus', { Quads: 2, Hamstrings: 2, Glutes: 2, Calves: 2, Chest: 0, Shoulders: 0, Biceps: 0, Triceps: 0 }, 'Raises quads, hamstrings, glutes and calves, and lowers chest, shoulders and arms.'],
  ['Push/pull even', { Biceps: 2 }, 'Keeps pushing muscles (chest, shoulders, triceps) and pulling muscles (back, biceps) level, a common guide for shoulder balance.'],
  ['Glute focus', { Glutes: 2, Hamstrings: 2, Chest: 0, Biceps: 0, Triceps: 0 }, 'Prioritizes glutes and hamstrings and trims chest and arms.'],
  ['V-taper', { Shoulders: 2, Back: 2, Biceps: 0, Calves: 0 }, 'Emphasizes shoulders and back for a wide upper body, with less biceps and calves.'],
  ['Athletic', { Back: 2, Glutes: 2, Hamstrings: 2, Core: 2, Biceps: 0, Calves: 0 }, 'Favors back, glutes, hamstrings and core for general strength and stability.'],
  ['Powerlifting', { Chest: 2, Back: 2, Quads: 2, Glutes: 2, Biceps: 0, Calves: 0 }, 'Leans toward chest, back, quads and glutes, the muscles behind the squat, bench and deadlift.'],
  ['Posterior chain', { Back: 2, Glutes: 2, Hamstrings: 2, Chest: 0, Biceps: 0 }, 'Prioritizes the back of the body: back, glutes and hamstrings.'],
  ['Classic physique', { Shoulders: 2, Chest: 2, Back: 2, Calves: 2 }, 'Bodybuilding-style proportions: bigger shoulders, chest, back and calves.'],
  ['Shoulders and arms', { Shoulders: 2, Biceps: 2, Triceps: 2 }, 'Raises shoulders, biceps and triceps.'],
  ['Custom', null, 'Your own dial settings. Changing any dial switches to Custom.']
].map(([name, dials, desc]) => ({ name, dials, desc }));

// Default focus inside each group (estimates), in MUSCLE_TIERS row order.
export const WITHIN_FOCUS = {
  Chest: [30, 40, 30], Back: [35, 30, 15, 17, 3], Shoulders: [25, 40, 35], Biceps: [32, 32, 22, 14], Triceps: [38, 32, 30],
  Core: [65, 35], Quads: [30, 55, 15], Hamstrings: [100], Glutes: [70, 30], Calves: [55, 45]
};

export const defaultFocus = () => ({ preset: 'Balanced', dials: {} });
export const presetByName = n => FOCUS_PRESETS.find(p => p.name === n);
export const normalizeFocus = f => ({ preset: (f && presetByName(f.preset) ? f.preset : 'Balanced'), dials: { ...((f && f.dials) || {}) } });
export const dialOf = (focus, g) => { const v = focus && focus.dials ? focus.dials[g] : undefined; return v === 0 || v === 1 || v === 2 ? v : 1; };

export function applyPreset(name) {
  const p = presetByName(name); return { preset: name, dials: p && p.dials ? { ...p.dials } : {} };
}
export function setDial(focus, g, v) { return { preset: 'Custom', dials: { ...(focus ? focus.dials : {}), [g]: v } }; }

// Target shares per group, summing to 100.
export function focusShares(focus) {
  const raw = {}; let tot = 0;
  FOCUS_GROUPS.forEach(g => { raw[g] = FOCUS_BASE[g] * DIAL_MULT[dialOf(focus, g)]; tot += raw[g]; });
  const out = {}; FOCUS_GROUPS.forEach(g => { out[g] = raw[g] / tot * 100; }); return out;
}

// data: result of ffBalance (plan side). Returns per-group plan share, focus share and gap (plan - focus, in points).
export function compareFocus(data, focus) {
  const fs = focusShares(focus);
  return data.groups.map(g => ({ name: g.name, planShare: g.planShare, focusShare: fs[g.name], gap: g.planShare - fs[g.name], rows: g.rows, est: g.rows.some(r => r.est) }));
}
// Rows inside one group: plan share of the group vs default within-group focus.
export function compareWithin(group) {
  const f = WITHIN_FOCUS[group.name] || [];
  return group.rows.map((r, i) => ({ name: r.name, est: r.est, planShare: r.planShare, focusShare: f[i] != null ? f[i] : 0, gap: r.planShare - (f[i] != null ? f[i] : 0) }));
}
