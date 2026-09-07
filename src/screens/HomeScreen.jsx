import React from 'react';
import { addDays, dayAt, getToday, getWeekAndDay, isRoutineMode, makeRoutinePhase, parseDateKey, phaseForWeek, phaseKey, resolveCardio, startOfWeek, toDateKey } from '../utils.js';
import { CATEGORY_COLORS, theme, metal, gradientText, topLitGoldBorder, gradientBorder } from '../theme.js';
import { Card, Icon, Label, PrimaryButton } from '../components/ui.jsx';

export function HomeScreen({
  settings: e,
  sessions: t,
  rides: l,
  days: n,
  navigate: i,
  phases: ph
}) {
  let a = parseDateKey(e.startDate),
    o = getToday(),
    {
      weekNum: c,
      dayIndex: f
    } = getWeekAndDay(a, o),
    m = isRoutineMode(c, ph, e),
    y = m ? makeRoutinePhase(ph) : phaseForWeek(c, ph),
    b = dayAt(f, n),
    p = toDateKey(o),
    h = 0;
  for (let d = 1; d <= 30; d++) {
    let r = toDateKey(addDays(o, -d)),
      v = dayAt(getWeekAndDay(a, parseDateKey(r)).dayIndex, n);
    if (v && t[r]) h++;else if (v) break;
  }
  let E = Object.values(t).reduce((d, r) => d + (r.prs || []).length, 0),
    T = startOfWeek(o),
    M = Array.from({
      length: 7
    }, (d, r) => toDateKey(addDays(T, r))).filter(d => l[d]).length;
  return <div style={{
      padding: "16px 16px 0",
      fontFamily: "'Inter',system-ui,sans-serif"
    }}>{<div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16
    }}>{<div>{<div style={{
      fontSize: 22,
      fontFamily: "'Roboto Condensed',sans-serif",
      fontWeight: 300,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      marginBottom: 6,
      ...gradientText(metal.eyebrowTan)
    }}>{"Asteria"}</div>}{<div style={{
      fontSize: 54,
      fontWeight: 700,
      fontFamily: "'Bebas Neue',system-ui,sans-serif",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      lineHeight: 1.05,
      WebkitTextStroke: "1.5px #EEF2F3",
      textShadow: "0 3px 6px rgba(0,0,0,0.4)",
      ...gradientText(metal.greetingSilver)
    }}>{(() => {
    let d = (/* @__PURE__ */new Date()).getHours();
    return d < 12 ? "Good morning" : d < 17 ? "Good afternoon" : "Good evening";
  })()}{", Shane."}</div>}</div>}</div>}{m ? <div style={{
      backgroundImage: metal.carbonGradient,
      border: `1px solid ${theme.border}`,
      borderRadius: 18,
      padding: "16px 18px",
      marginBottom: 12
    }}>{<div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4
    }}>{<span style={{
      fontSize: 10,
      fontFamily: "monospace",
      color: theme.legs,
      textTransform: "uppercase",
      letterSpacing: "0.12em"
    }}>{"Routine Mode · Week "}{c}</span>}{<span style={{
      fontSize: 10,
      fontFamily: "monospace",
      color: theme.legs,
      fontWeight: 700
    }}>{"Program Complete ✓"}</span>}</div>}{<div style={{
      fontSize: 11,
      color: theme.sub,
      lineHeight: 1.5
    }}>{"Running your Week 12 routine on repeat. Edit it anytime from the Program tab."}</div>}</div> : <div style={{
      ...topLitGoldBorder(metal.carbonGradient),
      borderRadius: 18,
      padding: "16px 18px",
      marginBottom: 12
    }}>{<div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 10
    }}>{<span style={{
      fontSize: 17,
      fontWeight: 700,
      fontFamily: "'Bebas Neue',system-ui,sans-serif",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      textShadow: metal.bevelGold,
      ...gradientText(metal.eyebrowGold)
    }}>{"WK "}{c}</span>}{<span style={{
      fontSize: 14,
      fontWeight: 700,
      fontFamily: "monospace",
      textShadow: metal.bevelGold,
      ...gradientText(metal.goldText)
    }}>{c}{" / 12"}</span>}</div>}{<div style={{
      ...gradientBorder(`linear-gradient(${theme.black}, ${theme.black})`, metal.borderBarVertical),
      height: 6,
      borderRadius: 4,
      overflow: "hidden"
    }}>{<div style={{
      position: "relative",
      height: "100%",
      background: metal.goldBar,
      borderRadius: 4,
      width: `${(c - 1) / 12 * 100}%`,
      transition: "width 0.4s",
      overflow: "hidden"
    }}>{<div style={{
      position: "absolute",
      top: "-60%",
      left: "55%",
      width: "34%",
      height: "220%",
      background: metal.barHotspot
    }} />}</div>}</div>}{<div style={{
      fontSize: 11,
      color: theme.sub,
      marginTop: 9,
      lineHeight: 1.5
    }}>{y.weekFocus?.[(c - 1) % 4] || y.desc || ""}</div>}</div>}{<div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 8,
      marginBottom: 12
    }}>{[{
    val: h,
    label: "Streak",
    color: theme.gold,
    icon: "fire",
    grad: ["#FFDD82", "#8F6519"]
  }, {
    val: `${M}/${n.filter(Rd => resolveCardio(Rd, phaseKey(y))).length}`,
    label: "Cardio",
    color: theme.ice,
    icon: "heart-pulse",
    grad: ["#FFFFFF", "#7FB8DE"]
  }, {
    val: E,
    label: "PRs",
    color: theme.text,
    icon: "kettlebell",
    grad: ["#FFFFFF", "#9AA3B5"]
  }].map(d => <div key={d.label} style={{
      ...gradientBorder(metal.steelGradient, metal.borderMetalNeutral),
      borderRadius: 14,
      padding: "28px 10px 24px",
      minHeight: 148,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center"
    }}>{<Icon name={d.icon} size={32} color={d.color} strokeWidth={1.5} gradient={d.grad} />}{<div style={{
      fontSize: 23,
      fontWeight: 700,
      fontFamily: "'Bebas Neue',system-ui,sans-serif",
      lineHeight: 1,
      marginTop: 12,
      textShadow: d.color === theme.gold ? "0 1px 2px rgba(0,0,0,0.4), 0 0 10px rgba(212,153,61,0.35)" : "0 1px 2px rgba(0,0,0,0.4)",
      ...gradientText(d.color === theme.gold ? metal.goldText : d.color === theme.ice ? `linear-gradient(180deg, #FFFFFF, #BFE0F5)` : metal.silverText)
    }}>{d.val}</div>}{<div style={{
      fontSize: 9,
      color: theme.muted,
      marginTop: 6,
      textTransform: "uppercase",
      letterSpacing: "0.1em"
    }}>{d.label}</div>}</div>)}</div>}{b ? <Card style={{
      ...topLitGoldBorder(metal.carbonGradient)
    }}>{<div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12
    }}>{<div>{<Label style={{
      marginBottom: 4,
      fontFamily: "monospace",
      ...gradientText(metal.eyebrowGold)
    }}>{"Today"}</Label>}{<div style={{
      fontSize: 24,
      fontWeight: 700,
      fontFamily: "'Bebas Neue',system-ui,sans-serif",
      letterSpacing: "0.01em",
      textTransform: "uppercase",
      textShadow: metal.bevelSilver,
      ...gradientText(metal.silverText)
    }}>{b.label}</div>}{<div style={{
      fontSize: 11,
      color: theme.sub,
      marginTop: 3,
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }}>{b.exercises.length}{" exercises"}</div>}</div>}{<span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "monospace",
      letterSpacing: "0.06em",
      color: theme.gold,
      backgroundColor: "transparent",
      backgroundImage: `linear-gradient(${theme.carbon}, ${theme.carbon}), ${metal.borderDiagonalGold}`,
      backgroundOrigin: "padding-box, border-box",
      backgroundClip: "padding-box, border-box",
      border: "1px solid transparent",
      borderRadius: 8,
      padding: "4px 12px"
    }}>{b.type.toUpperCase()}</span>}</div>}{<PrimaryButton onClick={() => i("sessions")} color={theme.gold} outline={!!t[p]}>{t[p] ? "View Today's Session" : "Begin " + b.label}</PrimaryButton>}</Card> : <Card>{<div style={{
      fontSize: 16,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 4
    }}>{"Rest Day"}</div>}{<div style={{
      fontSize: 12,
      color: theme.sub
    }}>{"Recovery is part of the program."}</div>}</Card>}</div>;
}

