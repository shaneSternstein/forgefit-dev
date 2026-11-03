import React from 'react';
import { addDays, formatShortDate, getToday, saveToStorage, startOfWeek, staticPhaseForWeek, toDateKey } from '../utils.js';
import { CATEGORY_COLORS, theme } from '../theme.js';
import { Badge, Card, Icon, Label, PrimaryButton } from './ui.jsx';
import { DEFAULT_PROGRAM_DAYS } from '../constants.js';

const shell = {
  minHeight: "100vh",
  background: theme.black,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  fontFamily: "system-ui,sans-serif"
};

const inputStyle = {
  width: "100%",
  background: theme.steel,
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 15,
  color: theme.text,
  boxSizing: "border-box"
};

function Header({ title, subtitle }) {
  return <div style={{ textAlign: "center", marginBottom: 28 }}>
    <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.2em", color: theme.push, textTransform: "uppercase", marginBottom: 12 }}>ForgeFit</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, lineHeight: 1.1, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 14, color: theme.sub, lineHeight: 1.5 }}>{subtitle}</div>
  </div>;
}

function BackButton({ onClick }) {
  return <button onClick={onClick} style={{
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "0 0 14px",
    color: theme.muted,
    fontSize: 13,
    fontFamily: "inherit"
  }}><Icon name="chevron-left" size={16} color={theme.muted} />Back</button>;
}

export function Onboarding({
  onComplete
}) {
  let [step, setStep] = React.useState("basics"),
    [name, setName] = React.useState(""),
    [unit, setUnit] = React.useState("lbs"),
    [bodyWeight, setBodyWeight] = React.useState(""),
    [mode, setMode] = React.useState(null),
    [week, setWeek] = React.useState(1),
    thisWeek = startOfWeek(getToday()),
    phase = staticPhaseForWeek(week),
    base = () => ({
      name: name.trim(),
      unit,
      restTime: 90,
      ...(bodyWeight && parseFloat(bodyWeight) > 0 ? { bodyWeight: parseFloat(bodyWeight) } : {})
    }),
    startProgram = async () => {
      let s = {
        ...base(),
        week,
        startDate: toDateKey(addDays(thisWeek, -(week - 1) * 7)),
        mode: "program"
      };
      await saveToStorage("settings:user", s), onComplete(s);
    },
    startRoutine = async () => {
      let s = {
        ...base(),
        startDate: toDateKey(thisWeek),
        mode: "routine"
      };
      await saveToStorage("settings:user", s), onComplete(s);
    },
    choiceCard = (id, title, desc) => <button key={id} onClick={() => setMode(id)} style={{
      width: "100%",
      textAlign: "left",
      background: mode === id ? "rgba(233,69,96,0.1)" : theme.steel,
      border: `1.5px solid ${mode === id ? theme.push : theme.border}`,
      borderRadius: 12,
      padding: "16px",
      cursor: "pointer",
      marginBottom: 12,
      fontFamily: "inherit"
    }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: theme.sub, lineHeight: 1.4 }}>{desc}</div>
    </button>;

  if (step === "basics") return <div style={shell}><div style={{ maxWidth: 380, width: "100%" }}>
    <Header title={name.trim() ? `Welcome, ${name.trim()}.` : "Welcome."} subtitle="Let's set up a few basics." />
    <Label>Your name</Label>
    <input value={name} onChange={ev => setName(ev.target.value)} placeholder="e.g. Shane" autoComplete="given-name" style={{ ...inputStyle, marginBottom: 18 }} />
    <Label>Weight unit</Label>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
      {["lbs", "kg"].map(u => <button key={u} onClick={() => setUnit(u)} style={{
        background: unit === u ? "rgba(233,69,96,0.15)" : theme.steel,
        border: `1.5px solid ${unit === u ? theme.push : theme.border}`,
        borderRadius: 8,
        padding: "10px",
        color: unit === u ? theme.push : theme.sub,
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        fontFamily: "inherit"
      }}>{u}</button>)}
    </div>
    <Label>Body weight ({unit}) · optional</Label>
    <input type="number" inputMode="decimal" value={bodyWeight} onChange={ev => setBodyWeight(ev.target.value)} placeholder="Used for bodyweight exercises" style={{ ...inputStyle, fontFamily: "monospace", marginBottom: 8 }} />
    <div style={{ fontSize: 11, color: theme.muted, lineHeight: 1.5, marginBottom: 24 }}>Rest timers, beep volume and the rest of the settings can be changed any time from the gear icon.</div>
    <PrimaryButton onClick={() => setStep("mode")}>Continue</PrimaryButton>
  </div></div>;

  if (step === "mode") return <div style={shell}><div style={{ maxWidth: 380, width: "100%" }}>
    <BackButton onClick={() => setStep("basics")} />
    <Header title={name.trim() ? `Hi, ${name.trim()}.` : "Hi."} subtitle="Would you like to follow a structured program, or just log freely?" />
    {choiceCard("program", "Start a Program", "A phased, week-by-week plan with progressive overload.")}
    {choiceCard("routine", "Just a Routine", "Log workouts and cardio on an ongoing basis \u2014 no set end date.")}
    <div style={{ height: 8 }} />
    <PrimaryButton disabled={!mode} onClick={() => mode === "program" ? setStep("week") : startRoutine()}>{mode === "routine" ? "Start Routine" : "Continue"}</PrimaryButton>
  </div></div>;

  return <div style={shell}><div style={{ maxWidth: 380, width: "100%" }}>
    <BackButton onClick={() => setStep("mode")} />
    <Header title="Pick your week" subtitle="Which week of the program are you starting on?" />
    <Label>Select your current week</Label>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 20 }}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
        let c = n <= 4 ? theme.phase : n <= 8 ? theme.pull : theme.legs;
        return <button key={n} onClick={() => setWeek(n)} style={{
          background: week === n ? c + "22" : theme.steel,
          border: `1.5px solid ${week === n ? c : theme.border}`,
          borderRadius: 8,
          padding: "10px 4px",
          cursor: "pointer",
          color: week === n ? c : theme.sub,
          fontWeight: 700,
          fontSize: 13,
          fontFamily: "inherit"
        }}>{n}</button>;
      })}
    </div>
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Badge color={theme.phase}>{phase.label}</Badge>
        <span style={{ fontSize: 11, color: theme.sub }}>Weeks {phase.weeks[0]}{"\u2013"}{phase.weeks[3]}</span>
      </div>
      <div style={{ fontSize: 12, color: theme.sub, marginBottom: 4 }}>{phase.desc}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: theme.pelo }}><Icon name="bike" size={13} color={theme.pelo} /> {phase.rides} cardio/week</div>
    </Card>
    <Label>This week starts</Label>
    <div style={{ background: theme.steel, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: 20 }}>
      {DEFAULT_PROGRAM_DAYS.map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: i < 5 ? `1px solid ${theme.border}` : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: CATEGORY_COLORS[d.type] }} />
          <span style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>{d.label}</span>
        </div>
        <span style={{ fontSize: 11, color: theme.sub }}>{formatShortDate(addDays(thisWeek, i))}</span>
      </div>)}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: theme.muted }} />
          <span style={{ fontSize: 12, color: theme.muted }}>Rest</span>
        </div>
        <span style={{ fontSize: 11, color: theme.sub }}>{formatShortDate(addDays(thisWeek, 6))}</span>
      </div>
    </div>
    {week > 1 && <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
      <Icon name="info" size={14} color={theme.phase} />
      <span style={{ fontSize: 12, color: theme.phase }}>Past sessions show as "Not logged." Fill them in anytime from the Sessions tab.</span>
    </div>}
    <PrimaryButton onClick={startProgram}>Start Week {week}</PrimaryButton>
  </div></div>;
}
