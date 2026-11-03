import { addDays, dayAt, formatShortDate, getToday, getWeekAndDay, isRoutineMode, makeRoutinePhase, parseDateKey, phaseForWeek, phaseKey, resolveExercises, startOfWeek, toDateKey } from './utils.js';
import { CARDIO_ACTIVITIES, EXERCISE_LIBRARY } from './constants.js';

export function ffDayStatus(dt, e, n, ov, t, l, ph) {
  let dk = toDateKey(dt),
    sk = e.startDate,
    tk = toDateKey(getToday());
  if (dk > tk) return "future";
  if (dk < sk) return "before";
  let logged = !!t[dk] || !!l[dk];
  if (logged) return "active";
  let {
      weekNum: wn,
      dayIndex: di
    } = getWeekAndDay(parseDateKey(sk), dt),
    tmpl = dayAt(di, n),
    ovr = ov[dk],
    exCount;
  if (ovr && ovr.exercises) exCount = ovr.exercises.length;else if (tmpl) {
    let routine = isRoutineMode(wn, ph, e),
      rp = routine ? makeRoutinePhase(ph) : phaseForWeek(wn, ph);
    exCount = resolveExercises(tmpl, phaseKey(rp)).length;
  } else exCount = 0;
  return exCount > 0 ? "missed" : "rest";
}

export function ffMonthGrid(md) {
  let y = md.getFullYear(),
    mo = md.getMonth(),
    first = new Date(y, mo, 1),
    dim = new Date(y, mo + 1, 0).getDate(),
    lead = (first.getDay() + 6) % 7,
    cells = [];
  for (let i = 0; i < lead; i++) cells.push({
    date: new Date(y, mo, 1 - (lead - i)),
    inMonth: false
  });
  for (let d = 1; d <= dim; d++) cells.push({
    date: new Date(y, mo, d),
    inMonth: true
  });
  for (; cells.length % 7 !== 0;) cells.push({
    date: addDays(cells[cells.length - 1].date, 1),
    inMonth: false
  });
  return cells;
}

export function ffStreaks(e, n, ov, t, l, ph) {
  let today = getToday(),
    sk = e.startDate,
    dayStreak = 0;
  ffDayStatus(today, e, n, ov, t, l, ph) === "active" && dayStreak++;
  let cur = addDays(today, -1);
  for (; toDateKey(cur) >= sk;) {
    let st = ffDayStatus(cur, e, n, ov, t, l, ph);
    if (st === "missed") break;
    (st === "active" || st === "rest") && dayStreak++, cur = addDays(cur, -1);
  }
  let wkActive = ws => {
      for (let i = 0; i < 7; i++) if (ffDayStatus(addDays(ws, i), e, n, ov, t, l, ph) === "active") return true;
      return false;
    },
    weekStreak = 0,
    wk = startOfWeek(today),
    first = true,
    sw = startOfWeek(parseDateKey(sk));
  for (; toDateKey(wk) >= toDateKey(sw);) {
    let act = wkActive(wk);
    if (act) weekStreak++;else if (!first) break;
    first = false, wk = addDays(wk, -7);
  }
  return {
    dayStreak,
    weekStreak
  };
}

export function ffNormType(ty2) {
  return CARDIO_ACTIVITIES.some(a => a.k === ty2) ? ty2 : "bike";
}

export function ffRefDate(period, off, rt) {
  if (period === "1W") return addDays(rt, off * 7);
  if (period === "1M") return addDays(rt, off * 28);
  if (period === "3M") return new Date(rt.getFullYear(), rt.getMonth() + off * 3, rt.getDate());
  if (period === "1Y") return new Date(rt.getFullYear(), rt.getMonth() + off * 12, rt.getDate());
  return rt;
}

export function ffCardioStats(period, cat, l, e, off) {
  let rt = getToday(),
    today = ffRefDate(period, off || 0, rt),
    start;
  if (period === "1W") start = startOfWeek(today), today = addDays(start, 6);else if (period === "1M") start = addDays(startOfWeek(today), -21), today = addDays(start, 27);else if (period === "3M") start = new Date(today.getFullYear(), today.getMonth() - 2, 1);else if (period === "1Y") start = new Date(today.getFullYear(), today.getMonth() - 11, 1);else {
    start = parseDateKey(e.startDate), today = rt;
  }
  let sk = toDateKey(start),
    tk = toDateKey(today),
    entries = Object.entries(l).filter(([dk, r]) => ffNormType(r.type) === cat && dk >= sk && dk <= tk && parseFloat(r.distance) > 0),
    total = entries.reduce((a, [, r]) => a + (parseFloat(r.distance) || 0), 0),
    rangeDays = Math.round((today - start) / 864e5) + 1,
    weeks = Math.max(rangeDays / 7, 1);
  return {
    total: Math.round(total * 100) / 100,
    weeklyAvg: Math.round(total / weeks * 100) / 100,
    activityAvg: entries.length ? Math.round(total / entries.length * 100) / 100 : 0,
    count: entries.length,
    start,
    end: today
  };
}

export function ffCardioBuckets(period, cat, l, e, off) {
  let rt = getToday(),
    today = ffRefDate(period, off || 0, rt);
  if (period === "1W") {
    let start = startOfWeek(today);
    return Array.from({
      length: 7
    }, (_, i) => {
      let d = addDays(start, i),
        dk = toDateKey(d),
        r = l[dk],
        v = r && ffNormType(r.type) === cat ? parseFloat(r.distance) || 0 : 0;
      return {
        label: "MTWTFSS"[(d.getDay() + 6) % 7],
        total: v
      };
    });
  }
  if (period === "1M") {
    let start = addDays(startOfWeek(today), -21);
    return Array.from({
      length: 4
    }, (_, w) => {
      let wStart = addDays(start, w * 7),
        total = 0;
      for (let i = 0; i < 7; i++) {
        let dk = toDateKey(addDays(wStart, i)),
          r = l[dk];
        r && ffNormType(r.type) === cat && (total += parseFloat(r.distance) || 0);
      }
      return {
        label: formatShortDate(wStart),
        total
      };
    });
  }
  let monthsBack;
  if (period === "1Y") monthsBack = 11;else if (period === "All") {
    today = rt;
    let start = parseDateKey(e.startDate);
    monthsBack = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  } else monthsBack = 2;
  return Array.from({
    length: monthsBack + 1
  }, (_, idx) => {
    let m = monthsBack - idx,
      md = new Date(today.getFullYear(), today.getMonth() - m, 1),
      total = 0;
    return Object.entries(l).forEach(([dk, r]) => {
      if (ffNormType(r.type) !== cat) return;
      let rd = parseDateKey(dk);
      rd.getFullYear() === md.getFullYear() && rd.getMonth() === md.getMonth() && (total += parseFloat(r.distance) || 0);
    }), {
      label: md.toLocaleDateString("en-US", {
        month: "short"
      }),
      total
    };
  });
}

// ---------------------------------------------------------------------------
// Strength output model (relative, INOL-style).
//
// Every logged set is reduced to a load and an "effective reps" count:
//   loaded lift   load = weight                      reps = reps
//   bodyweight    load = bodyWeight * fraction + added weight   reps = reps
//   timed hold    load = 1 (constant)                reps = seconds / 3
//   carry         load = weight                      reps = feet / 10
// (3 s per rep is a typical rep tempo, ~10 ft is about 3 s of walking.)
//
// Intensity is the set's load divided by the best estimated 1RM
// (Epley: load * (1 + reps/30)) you had logged for that exercise up to and
// including that day. A set scores reps / (100 - intensity%), x10 for readable
// numbers. Heavier-relative-to-your-best sets score higher per rep, and the
// score never uses the unit (lbs/kg) so mixed exercise types are comparable.
// ---------------------------------------------------------------------------
const BW_FRACTION = {
  pushup: 0.64, pullup: 1, dip: 0.95, nordic: 0.65, knee_raise: 0.4, leg_raise: 0.5,
  glute_bridge: 0.5, ab_wheel: 0.6, dead_bug: 0.15, mountain: 0.6, burpee: 0.8
};
const BW_DEFAULT_FRACTION = 0.5;

function ffExerciseKind(exId) {
  let bare = exId.replace(/^lb_/, ""),
    lib = EXERCISE_LIBRARY.find(x => x.id === exId || x.id === "lb_" + exId);
  if (/plank$/.test(bare)) return { kind: "timed" };
  if (/farmer_carry$/.test(bare)) return { kind: "carry" };
  if (lib?.equip === "Bodyweight") return { kind: "bodyweight", frac: BW_FRACTION[bare] ?? BW_DEFAULT_FRACTION };
  return { kind: "loaded" };
}

function ffSetLoadReps(kind, set, bodyWeight) {
  let w = parseFloat(set.weight) || 0,
    r = parseFloat(set.reps) || 0;
  if (kind.kind === "timed") return { load: 1, reps: w / 3 };
  if (kind.kind === "carry") return { load: w, reps: r / 10 };
  if (kind.kind === "bodyweight") return bodyWeight ? { load: bodyWeight * kind.frac + w, reps: r } : null;
  return { load: w, reps: r };
}

export function ffStrengthScores(t, e) {
  let bodyWeight = parseFloat(e?.bodyWeight) || 0,
    best = {},
    byDate = {},
    needsBodyWeight = false;
  Object.keys(t).sort().forEach(dk => {
    let sess = t[dk],
      sets = [];
    Object.entries(sess?.exercises || {}).forEach(([exId, arr]) => {
      let kind = ffExerciseKind(exId);
      (arr || []).filter(s => s.done).forEach(s => {
        let lr = ffSetLoadReps(kind, s, bodyWeight);
        if (!lr) {
          kind.kind === "bodyweight" && (needsBodyWeight = true);
          return;
        }
        if (lr.load > 0 && lr.reps > 0) sets.push({ exId, ...lr });
      });
    });
    // update personal bests with today's sets first, so a new best scores against itself
    sets.forEach(x => {
      let e1 = x.load * (1 + x.reps / 30);
      if (e1 > (best[x.exId] || 0)) best[x.exId] = e1;
    });
    byDate[dk] = sets.reduce((sum, x) => {
      let i = Math.min(x.load / best[x.exId], 0.95);
      return sum + x.reps / (10 * (1 - i));
    }, 0);
  });
  return { byDate, needsBodyWeight };
}

export function ffStrengthStats(period, t, e, off) {
  let rt = getToday(),
    today = ffRefDate(period, off || 0, rt),
    start;
  if (period === "1W") start = startOfWeek(today), today = addDays(start, 6);else if (period === "1M") start = addDays(startOfWeek(today), -21), today = addDays(start, 27);else if (period === "3M") start = new Date(today.getFullYear(), today.getMonth() - 2, 1);else if (period === "1Y") start = new Date(today.getFullYear(), today.getMonth() - 11, 1);else {
    start = parseDateKey(e.startDate), today = rt;
  }
  let scores = ffStrengthScores(t, e).byDate,
    sk = toDateKey(start),
    tk = toDateKey(today),
    entries = Object.entries(t).filter(([dk]) => dk >= sk && dk <= tk).map(([dk]) => [dk, scores[dk] || 0]).filter(([, v]) => v > 0),
    total = entries.reduce((a, [, v]) => a + v, 0),
    rangeDays = Math.round((today - start) / 864e5) + 1,
    weeks = Math.max(rangeDays / 7, 1);
  return {
    total: Math.round(total),
    weeklyAvg: Math.round(total / weeks),
    sessionAvg: entries.length ? Math.round(total / entries.length) : 0,
    count: entries.length,
    start,
    end: today
  };
}

export function ffStrengthBuckets(period, t, e, off, n, ov, ph) {
  let scores = ffStrengthScores(t, e).byDate,
    rt = getToday(),
    today = ffRefDate(period, off || 0, rt);
  if (period === "1W") {
    let start = startOfWeek(today);
    return Array.from({
      length: 7
    }, (_, i) => {
      let d = addDays(start, i),
        dk = toDateKey(d),
        total = scores[dk] || 0,
        status = ffDayStatus(d, e, n, ov, t, {}, ph);
      return {
        label: "MTWTFSS"[(d.getDay() + 6) % 7],
        title: d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric"
        }),
        total,
        status
      };
    });
  }
  if (period === "1M") {
    let start = addDays(startOfWeek(today), -21);
    return Array.from({
      length: 4
    }, (_, w) => {
      let wStart = addDays(start, w * 7),
        total = 0;
      for (let i = 0; i < 7; i++) total += scores[toDateKey(addDays(wStart, i))] || 0;
      return {
        label: formatShortDate(wStart),
        title: formatShortDate(wStart) + " \u2013 " + formatShortDate(addDays(wStart, 6)),
        total
      };
    });
  }
  let monthsBack;
  if (period === "1Y") monthsBack = 11;else if (period === "All") {
    today = rt;
    let start = parseDateKey(e.startDate);
    monthsBack = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  } else monthsBack = 2;
  return Array.from({
    length: monthsBack + 1
  }, (_, idx) => {
    let m = monthsBack - idx,
      md = new Date(today.getFullYear(), today.getMonth() - m, 1),
      total = 0;
    return Object.entries(t).forEach(([dk, sess]) => {
      let rd = parseDateKey(dk);
      rd.getFullYear() === md.getFullYear() && rd.getMonth() === md.getMonth() && (total += scores[dk] || 0);
    }), {
      label: md.toLocaleDateString("en-US", {
        month: "short"
      }),
      title: md.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      }),
      total
    };
  });
}

export function ffStatsForPeriod(period, t, l, e) {
  let today = getToday(),
    start;
  if (period === "7D") start = addDays(today, -6);else if (period === "30D") start = addDays(today, -29);else if (period === "90D") start = addDays(today, -89);else start = parseDateKey(e.startDate);
  let sk = toDateKey(start),
    tk = toDateKey(today),
    sessions = Object.entries(t).filter(([D]) => D >= sk && D <= tk),
    rides = Object.entries(l).filter(([D]) => D >= sk && D <= tk),
    totalMin = rides.reduce((a, [, r]) => a + (parseFloat(r.duration) || 0), 0),
    totalCal = rides.reduce((a, [, r]) => a + (parseFloat(r.output) || 0), 0);
  return {
    workouts: sessions.length + rides.length,
    strength: sessions.length,
    cardio: rides.length,
    hrs: Math.floor(totalMin / 60),
    mins: Math.round(totalMin % 60),
    cal: Math.round(totalCal),
    start,
    end: today
  };
}

export function ffExMeta(n) {
  let map = {};
  return n.forEach(D => {
    let ex = D.exercises;
    Array.isArray(ex) ? ex.forEach(x => {
      map[x.id] = x;
    }) : ex && typeof ex == "object" && Object.values(ex).forEach(arr => {
      (arr || []).forEach(x => {
        map[x.id] = x;
      });
    });
  }), map;
}

export function ffMuscleOf(name) {
  let hit = EXERCISE_LIBRARY.find(x => x.name === name);
  return hit ? hit.muscle : "Other";
}

export function ffTrainedExercises(n, t) {
  let exMeta = ffExMeta(n),
    loggedIds = [...new Set(Object.values(t).flatMap(sess => Object.entries(sess.exercises || {}).filter(([, sets]) => sets.some(S => S.done)).map(([id]) => id)))];
  return loggedIds.map(id => {
    let meta = exMeta[id] || {
      id,
      name: id,
      equip: ""
    };
    return {
      id,
      name: meta.name,
      equip: meta.equip,
      muscle: ffMuscleOf(meta.name),
      log: ffExLog(id, t)
    };
  });
}

export function ffExLog(exId, t) {
  return Object.entries(t).filter(([, D]) => D.exercises?.[exId]?.some(S => S.done)).map(([D, q]) => {
    let sets = q.exercises[exId].filter(S => S.done),
      topW = Math.max(...sets.map(S => parseFloat(S.weight) || 0));
    return {
      key: D,
      date: D,
      sets,
      topW
    };
  }).sort((D, q) => D.date.localeCompare(q.date));
}

