// Muscle balance: turns planned and logged sets into weighted muscle shares.
// Weights come from src/muscleWeights.js (generated from the approved weight table).
import { MUSCLE_TIERS, MUSCLE_WEIGHTS } from './muscleWeights.js';
import { EXERCISE_LIBRARY } from './constants.js';
import { addDays, dayAt, getToday, getWeekAndDay, isRoutineMode, makeRoutinePhase, parseDateKey, phaseForWeek, phaseKey, resolveExercises, startOfWeek, toDateKey } from './utils.js';
import { ffRefDate } from './stats.js';

export const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const EST_ROWS = new Set(['Biceps long', 'Biceps short', 'Brachialis', 'Triceps long', 'Triceps lateral', 'Triceps medial', 'Rectus femoris', 'Vasti', 'Gastrocnemius', 'Soleus']);

const byId = {}, byName = {};
MUSCLE_WEIGHTS.forEach(r => { byId[r.l] = r; if (r.p) byId[r.p] = r; byName[norm(r.n)] = r; });

// Generic splits used when an exercise is not in the weight table (custom exercises). Marked approximate.
const GEN = {
  Chest: { 'Upper chest': .2, 'Mid chest': .6, 'Lower chest': .2 }, Back: { Lats: .4, 'Mid-back': .45, Traps: .15 },
  Shoulders: { 'Front delt': .55, 'Side delt': .35, 'Rear delt': .1 }, Biceps: { 'Biceps long': .35, 'Biceps short': .35, Brachialis: .2, Forearms: .1 },
  Triceps: { 'Triceps long': .4, 'Triceps lateral': .3, 'Triceps medial': .3 }, Core: { Abs: .85, Obliques: .15 },
  Quads: { 'Rectus femoris': .3, Vasti: .6, Adductors: .1 }, Hamstrings: { Hamstrings: 1 }, Glutes: { 'Glute max': .85, 'Glute med': .15 },
  Calves: { Gastrocnemius: .6, Soleus: .4 }
};
const GEN_RULES = [[/calf|calves/i, 'Calves'], [/leg curl|hamstring|deadlift|rdl|good morning/i, 'Hamstrings'], [/leg extension|leg press|squat|lunge|step.?up/i, 'Quads'],
  [/curl/i, 'Biceps'], [/tricep|pushdown|pressdown|skull|dip|kickback|extension/i, 'Triceps'], [/glute|hip thrust|bridge/i, 'Glutes'],
  [/crunch|plank|sit.?up|twist|ab wheel|rollout|leg raise|knee raise/i, 'Core'], [/bench|chest|fly|flye|push.?up|pec/i, 'Chest'],
  [/row|pulldown|pull.?up|chin.?up|lat |shrug|pullover/i, 'Back'], [/shoulder|lateral|raise|overhead press|upright|face pull|arnold|military/i, 'Shoulders']];
const LEGACY_FALLBACK = { Chest: 'Chest', Back: 'Back', Shoulders: 'Shoulders', Core: 'Core' };

export function fallbackProfile(name) {
  let g = (GEN_RULES.find(([re]) => re.test(name || '')) || [])[1];
  if (!g) { const lib = EXERCISE_LIBRARY.find(x => norm(x.name) === norm(name)); g = lib && LEGACY_FALLBACK[lib.muscle]; }
  return g ? { g, w: { ...GEN[g] }, approx: true } : null;
}

// Every exercise object we can find, keyed by id (days + overrides + library), so ids in logged sessions resolve to names.
export function exerciseIndex(days, overrides) {
  const map = {};
  EXERCISE_LIBRARY.forEach(x => { map[x.id] = x; });
  (days || []).forEach(d => {
    const ex = d.exercises;
    Array.isArray(ex) ? ex.forEach(x => { map[x.id] = x; }) : ex && typeof ex === 'object' && Object.values(ex).forEach(a => (a || []).forEach(x => { map[x.id] = x; }));
  });
  Object.values(overrides || {}).forEach(o => (o && o.exercises || []).forEach(x => { map[x.id] = x; }));
  return map;
}

export function profileFor(exId, index, nameHint) {
  const direct = byId[exId]; if (direct) return { g: direct.g, w: direct.w, approx: false, name: direct.n };
  const name = nameHint || (index[exId] && index[exId].name) || '';
  const hit = byName[norm(name)]; if (hit) return { g: hit.g, w: hit.w, approx: false, name: hit.n };
  const fb = fallbackProfile(name); return fb ? { ...fb, name } : null;
}

// Same period rules as the Strength and Cardio cards: 1W calendar week, 1M four whole weeks, 3M, 1Y, All.
export function ffPeriodRange(period, off, e) {
  const rt = getToday(); let today = ffRefDate(period, off || 0, rt), start;
  if (period === '1W') start = startOfWeek(today), today = addDays(start, 6);
  else if (period === '1M') start = addDays(startOfWeek(today), -21), today = addDays(start, 27);
  else if (period === '3M') start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  else if (period === '1Y') start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  else start = parseDateKey(e.startDate), today = rt;
  return { start, end: today };
}

function addTo(acc, w, sets) { for (const c in w) acc[c] = (acc[c] || 0) + w[c] * sets; }

// range (optional {start,end}) overrides the period, used by the Program editor to plan over the whole program.
export function ffBalance(period, off, settings, days, overrides, phases, sessions, range) {
  const { start, end } = range || ffPeriodRange(period, off, settings), sk = toDateKey(start), ek = toDateKey(end), pk0 = settings.startDate, tk = toDateKey(getToday());
  const index = exerciseIndex(days, overrides), progStart = parseDateKey(settings.startDate);
  const plan = {}, planToDate = {}, act = {}, exPlan = {}, exAct = {};
  let unPlan = 0, unAct = 0, approxPlan = 0, approxAct = 0;
  const note = (store, id, prof, sets, name) => { const x = store[id] || (store[id] = { id, name: (prof && prof.name) || name || id, g: prof && prof.g, sets: 0, w: prof && prof.w, approx: !!(prof && prof.approx) }); x.sets += sets; };

  // Plan: what the program says for each day in range (override first, else template for that phase).
  for (let d = new Date(Math.max(start, progStart)); d <= end; d = addDays(d, 1)) {
    const dk = toDateKey(d); if (dk < pk0) continue;
    const { weekNum, dayIndex } = getWeekAndDay(progStart, d), tmpl = dayAt(dayIndex, days), ovr = overrides && overrides[dk];
    let list = [];
    if (ovr && ovr.exercises) list = ovr.exercises;
    else if (tmpl) { const ph = isRoutineMode(weekNum, phases, settings) ? makeRoutinePhase(phases) : phaseForWeek(weekNum, phases); list = resolveExercises(tmpl, phaseKey(ph)); }
    list.forEach(x => {
      const sets = Number(x.sets) || 0; if (!sets) return;
      const prof = profileFor(x.id, index, x.name);
      if (!prof) { unPlan += sets; return; }
      prof.approx && (approxPlan += sets);
      addTo(plan, prof.w, sets); dk <= tk && addTo(planToDate, prof.w, sets); note(exPlan, x.id, prof, sets, x.name);
    });
  }
  // Actual: done sets in logged sessions.
  Object.entries(sessions || {}).forEach(([dk, sess]) => {
    if (dk < sk || dk > ek) return;
    Object.entries((sess && sess.exercises) || {}).forEach(([id, arr]) => {
      const sets = (arr || []).filter(s => s.done).length; if (!sets) return;
      const prof = profileFor(id, index);
      if (!prof) { unAct += sets; return; }
      prof.approx && (approxAct += sets);
      addTo(act, prof.w, sets); note(exAct, id, prof, sets);
    });
  });

  const sumCols = (store, cols) => cols.reduce((a, c) => a + (store[c] || 0), 0);
  const groups = MUSCLE_TIERS.map(([name, cols]) => ({ name, cols, planVal: sumCols(plan, cols), actVal: sumCols(act, cols) }));
  const planTot = groups.reduce((a, g) => a + g.planVal, 0), actTot = groups.reduce((a, g) => a + g.actVal, 0);
  const planToDateTot = Object.values(planToDate).reduce((a, v) => a + v, 0);
  groups.forEach(g => {
    g.planShare = planTot ? g.planVal / planTot * 100 : 0; g.actShare = actTot ? g.actVal / actTot * 100 : 0;
    g.rows = g.cols.map(c => ({ name: c, est: EST_ROWS.has(c), planVal: plan[c] || 0, actVal: act[c] || 0,
      planShare: g.planVal ? (plan[c] || 0) / g.planVal * 100 : 0, actShare: g.actVal ? (act[c] || 0) / g.actVal * 100 : 0 }));
    const feed = (store, which) => Object.values(store).filter(x => x.w && x.g).map(x => ({ id: x.id, name: x.name, sets: x.sets, approx: x.approx, weighted: g.cols.reduce((a, c) => a + (x.w[c] || 0), 0) * x.sets })).filter(x => x.weighted > 0).sort((a, b) => b.weighted - a.weighted);
    g.actExercises = feed(exAct); g.planExercises = feed(exPlan);
  });
  return { start, end, groups, planTot, actTot, completion: planToDateTot ? Math.min(actTot / planToDateTot * 100, 999) : null,
    unassigned: { plan: unPlan, actual: unAct }, approx: { plan: approxPlan, actual: approxAct }, empty: !planTot && !actTot };
}

// Muscle split of one day's session: planned vs done weighted sets per group.
// exercises: [{id,name,sets}], setsDone: {exId: number of done sets}. Unmapped exercises are counted in `unmapped`.
export function ffDayMuscles(exercises, setsDone, days, overrides) {
  const index = exerciseIndex(days, overrides), plan = {}, done = {}; let unmapped = 0, approx = 0;
  (exercises || []).forEach(x => {
    const sets = Number(x.sets) || 0, d = (setsDone && setsDone[x.id]) || 0, prof = profileFor(x.id, index, x.name);
    if (!prof) { if (sets || d) unmapped++; return; }
    prof.approx && (sets || d) && approx++;
    addTo(plan, prof.w, sets); addTo(done, prof.w, d);
  });
  const groups = MUSCLE_TIERS.map(([name, cols]) => ({ name, planned: cols.reduce((a, c) => a + (plan[c] || 0), 0), done: cols.reduce((a, c) => a + (done[c] || 0), 0) })).filter(g => g.planned > 0 || g.done > 0);
  const tot = groups.reduce((a, g) => a + g.planned, 0);
  groups.forEach(g => { g.share = tot ? g.planned / tot * 100 : 0; });
  groups.sort((a, b) => b.planned - a.planned);
  return { groups, unmapped, approx };
}
