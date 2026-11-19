import React from "react";
import { AbsoluteFill, Composition, interpolate, registerRoot, spring, useCurrentFrame } from "remotion";
import { person, car, store, bill, coins, tag } from "./art";
import { mascot } from "./mascot";

const FPS = 30;
const P = { navy: "#14224f", blue: "#2b59ff", blue2: "#1f3fbf", purple: "#6d4cff", teal: "#0fb5a3", coral: "#ff6a4d", gold: "#ffc93c", white: "#ffffff", red: "#ff5a5f" };
const FONT = "Arial, Helvetica, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const fade = (f, a, b) => interpolate(f, [a, b], [0, 1], clamp);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const L = (f, a, b, from, to) => from + (to - from) * ease(fade(f, a, b));
const pop = (f, start, damping = 11) => spring({ frame: Math.max(0, f - start), fps: FPS, config: { damping } });
const rnd = (i, seed, m) => (((i * 9301 + seed * 49297 + i * i * 31) % m) / m + 1) % 1;

const FR = [90, 300, 225, 195, 150, 90];
const STARTS = FR.map((_, i) => FR.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = FR.reduce((a, b) => a + b, 0);
const sceneOf = (f) => {
  let s = 0;
  STARTS.forEach((st, k) => { if (f >= st) s = k; });
  return s;
};
const BG = [P.blue, P.purple, P.teal, P.coral, P.blue2, P.navy];
const SHADOW = ["#1a2f9e", "#4a30c4", "#087a6e", "#b8402a", "#142a80", "#0a1230"];
const BADGES = ["", "THE TRICK", "THE STUDY", "THE ESTIMATE", "THE TAKEAWAY", ""];

/* narration lines: [start sec, end sec, text]. With real voice-over, only these times change. */
const LINES = [
  [0.0, 2.9, "Why do prices end in .99?"],
  [3.0, 6.6, "Your brain reads prices left to right."],
  [6.6, 10.4, "So $4.99 feels like four dollars, not five."],
  [10.4, 13.0, "Researchers call it the left-digit effect."],
  [13.0, 20.4, "In a study of 21 million Lyft riders, demand dropped sharply when a fare crossed a whole-dollar mark."],
  [20.5, 27.0, "Researchers estimated that 99-cent pricing could add about 160 million dollars a year in profit."],
  [27.0, 32.0, "So next time you see $9.99, remember: it’s a nudge for your brain."],
  [32.0, 35.0, "Follow for more hidden mechanics."],
];
const lineState = (f) => {
  const t = f / FPS;
  let li = 0;
  LINES.forEach(([st], i) => { if (t >= st) li = i; });
  const [st, en, text] = LINES[li];
  const words = text.split(" ");
  const w = words.map((x) => x.length + 2);
  const total = w.reduce((a, b) => a + b, 0);
  const p = Math.min(0.999, Math.max(0, (t - st) / Math.max(0.1, en - st)));
  let acc = 0, cur = 0;
  w.forEach((x, i) => { if (p >= acc / total) cur = i; acc += x; });
  return { st, en, text, words, cur, speaking: t >= st && t <= en };
};

/* ---------- small helpers ---------- */
const Art = ({ svg, left, top, width, height, style }) => (
  <div style={{ position: "absolute", left, top, width, height, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />
);
const T = ({ children, top, size, color = P.white, left = 0, right = 0, weight = 900, shadow, sd = 10, style }) => (
  <div style={{ position: "absolute", left, right, top, textAlign: "center", fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1.05, color, whiteSpace: "nowrap", textShadow: shadow ? `${sd}px ${sd}px 0 ${shadow}` : "none", ...style }}>{children}</div>
);
const Chip = ({ children, bg = P.white, color = P.navy, size = 44, style }) => (
  <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, color, background: bg, borderRadius: 22, padding: "8px 28px", whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(20,34,79,0.22)", ...style }}>{children}</div>
);
const Coin2D = ({ size = 120, f = 0, seed = 0 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: P.gold, border: `${size * 0.07}px solid #e09b00`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: size * 0.55, color: "#b87800", transform: `scaleX(${Math.cos((f + seed * 9) / 6)})` }}>$</div>
);
const STAR = "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)";

const gearPath = (R = 96, r = 74, n = 10, hole = 28) => {
  let d = "";
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    [[r, a - step * 0.3], [R, a - step * 0.16], [R, a + step * 0.16], [r, a + step * 0.3]].forEach(([rad, ang], j) => {
      d += `${i === 0 && j === 0 ? "M" : "L"}${(100 + rad * Math.cos(ang)).toFixed(1)} ${(100 + rad * Math.sin(ang)).toFixed(1)} `;
    });
  }
  return `${d}Z M100 ${100 + hole} A${hole} ${hole} 0 1 0 100 ${100 - hole} A${hole} ${hole} 0 1 0 100 ${100 + hole} Z`;
};
const GEAR = gearPath();
const Gear = ({ size, color, rot = 0, style }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} style={{ transform: `rotate(${rot}deg)`, ...style }}><path d={GEAR} fill={color} fillRule="evenodd" /></svg>
);

/* ---------- effects (all flat shapes) ---------- */
const CONF = [P.gold, P.white, P.red, P.teal, P.purple];
const Confetti = ({ f, start, n = 40, cx = 540, cy = 900, life = 70, seed = 1, power = 1 }) => {
  const t = f - start;
  if (t < 0 || t > life) return null;
  const out = [];
  for (let i = 0; i < n; i++) {
    const ang = rnd(i, seed, 997) * Math.PI * 2;
    const sp = (5 + rnd(i, seed + 3, 613) * 15) * power;
    const k = 1 - Math.max(0, (t - life * 0.6) / (life * 0.4));
    out.push(<div key={i} style={{ position: "absolute", left: cx + Math.cos(ang) * sp * t * 0.85, top: cy + Math.sin(ang) * sp * t * 0.85 + 0.2 * t * t, width: 16, height: 24, borderRadius: 4, background: CONF[i % 5], transform: `rotate(${rnd(i, seed + 7, 331) * 360 + t * (8 + rnd(i, seed, 211) * 20)}deg) scale(${k})`, opacity: k }} />);
  }
  return <>{out}</>;
};
const Stars = ({ f, start, n = 12, cx = 540, cy = 900, spread = 360, life = 50, seed = 2, color = P.white }) => {
  const t = f - start;
  if (t < 0 || t > life) return null;
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = cx + (rnd(i, seed, 997) - 0.5) * 2 * spread;
    const y = cy + (rnd(i, seed + 5, 613) - 0.5) * 2 * spread * 0.7;
    const d = rnd(i, seed + 9, 41) * 14;
    const k = Math.max(0, Math.sin(((t - d) / life) * Math.PI));
    const sz = 26 + rnd(i, seed + 1, 77) * 36;
    out.push(<div key={i} style={{ position: "absolute", left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, background: color, clipPath: STAR, transform: `scale(${k}) rotate(${t * 4}deg)` }} />);
  }
  return <>{out}</>;
};
const Flash = ({ f, start, strength = 0.5 }) => {
  const t = f - start;
  if (t < 0 || t > 12) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: strength * Math.exp(-t / 3.5) }} />;
};
const Burst = ({ cx, cy, size = 1500, rot = 0, color = "rgba(255,255,255,0.13)", k = 1 }) => (
  <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: "50%", background: `repeating-conic-gradient(${color} 0deg 9deg, transparent 9deg 24deg)`, transform: `rotate(${rot}deg) scale(${k})` }} />
);
const RingPulse = ({ cx, cy, t, size = 360, color = P.gold, width = 12 }) => (
  <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: "50%", border: `${width}px solid ${color}`, boxSizing: "border-box", opacity: 1 - t, transform: `scale(${0.3 + t * 1.3})` }} />
);

/* ---------- background with circle-reveal scene change ---------- */
const Background = ({ f }) => {
  const s = sceneOf(f);
  const lf = f - STARTS[s];
  const r = s === 0 ? 3000 : ease(fade(lf, 0, 16)) * 3000;
  const prev = BG[Math.max(0, s - 1)];
  const decor = [];
  for (let i = 0; i < 9; i++) {
    const x = rnd(i, 3, 997) * 1200 - 60;
    const y = 120 + rnd(i, 5, 613) * 1500 + Math.sin((f + i * 40) / 50) * 24;
    const sz = 60 + rnd(i, 7, 211) * 110;
    const kind = i % 3;
    decor.push(kind === 0
      ? <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", border: "10px solid rgba(255,255,255,0.12)", boxSizing: "border-box" }} />
      : kind === 1
      ? <div key={i} style={{ position: "absolute", left: x, top: y, width: sz * 0.5, height: sz * 0.5, background: "rgba(255,255,255,0.12)", transform: `rotate(${f * 0.6 + i * 40}deg)`, clipPath: "polygon(35% 0, 65% 0, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0 65%, 0 35%, 35% 35%)" }} />
      : <div key={i} style={{ position: "absolute", left: x, top: y, width: sz * 0.45, height: sz * 0.45, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />);
  }
  return (
    <AbsoluteFill style={{ background: prev }}>
      <div style={{ position: "absolute", inset: 0, background: BG[s], clipPath: `circle(${r}px at 200px 1480px)` }} />
      <Gear size={520} color="rgba(255,255,255,0.08)" rot={f * 0.5} style={{ position: "absolute", left: -140, top: 520 }} />
      <Gear size={420} color="rgba(255,255,255,0.08)" rot={-f * 0.6 + 12} style={{ position: "absolute", left: 800, top: 1250 }} />
      {decor}
    </AbsoluteFill>
  );
};

/* ---------- kinetic subtitles (flat, highlight pill on the spoken word) ---------- */
const Subtitles = ({ f }) => {
  const { st, text, words, cur } = lineState(f);
  const size = text.length <= 40 ? 92 : text.length <= 75 ? 78 : 64;
  const lf = f - Math.round(st * FPS);
  const e = fade(lf, 0, 6);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 96, height: 390, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.3, opacity: e, transform: `translateY(${(1 - e) * 20}px)` }}>
      <div>
        {words.map((x, i) => (
          <span key={i} style={{ display: "inline-block", margin: "0 3px", padding: "0 11px", borderRadius: 18, color: i === cur ? P.navy : P.white, background: i === cur ? P.gold : "transparent", opacity: i <= cur ? 1 : 0.5, transform: i === cur ? "rotate(-2deg) scale(1.05)" : "none" }}>{x}</span>
        ))}
      </div>
    </div>
  );
};

const Badge = ({ text, lf }) =>
  text ? <div style={{ position: "absolute", left: 60, top: 500, padding: "8px 26px", borderRadius: 999, background: P.white, color: P.navy, fontFamily: FONT, fontSize: 32, fontWeight: 900, letterSpacing: 2, boxShadow: "0 6px 0 rgba(20,34,79,0.22)", opacity: fade(lf, 6, 16), transform: `translateX(${(1 - ease(fade(lf, 6, 18))) * -120}px)` }}>{text}</div> : null;

/* ---------- scenes ---------- */
const S1 = ({ lf, f }) => {
  const tags = [["$9.99", 40, 500, 340, -10, 0], ["$19.99", 700, 520, 330, 8, 8], ["$4.99", 650, 1060, 340, -5, 16]];
  const k = pop(lf, 4, 8);
  return (
    <>
      <Burst cx={540} cy={840} rot={f * 0.8} k={fade(lf, 2, 20)} />
      <T top={640} size={430} color={P.gold} shadow={P.navy} sd={16} style={{ transform: `scale(${k}) rotate(${-3 + (1 - k) * 8}deg)` }}>.99?</T>
      {tags.map(([txt, x, y, w, r, d], i) => (
        <Art key={i} svg={tag(txt, txt.length > 5 ? 40 : 46)} left={x} top={y + (1 - pop(lf, d, 9)) * -700 + Math.sin((f + i * 20) / 12) * 8} width={w} height={w * 0.636}
          style={{ transform: `rotate(${r + Math.sin((f + i * 30) / 16) * 3}deg)`, filter: "drop-shadow(0 12px 0 rgba(20,34,79,0.25))" }} />
      ))}
      <div style={{ position: "absolute", left: 440, top: 1070 + Math.sin(f / 10) * 10, opacity: fade(lf, 26, 34) }}><Coin2D size={120} f={f} /></div>
      <div style={{ position: "absolute", left: 900, top: 1330 + Math.sin(f / 9) * 10, opacity: fade(lf, 34, 42) }}><Coin2D size={100} f={f} seed={2} /></div>
    </>
  );
};

const S2 = ({ lf, f }) => {
  const e = ease(fade(lf, 0, 14));
  const lit = lf < 20 ? 0 : lf < 45 ? 1 : 2;
  const four = pop(lf, 40, 8);
  const line = ease(fade(lf, 100, 130));
  const pin = pop(lf, 130, 8);
  const note = ease(fade(lf, 150, 185));
  const rib = ease(fade(lf, 205, 228));
  const dim = "rgba(20,34,79,0.30)";
  return (
    <>
      <div style={{ position: "absolute", left: 70, right: 70, top: 560 + (1 - e) * 120, height: 640, borderRadius: 56, background: P.white, boxShadow: "0 16px 0 rgba(20,34,79,0.25)", opacity: e, fontFamily: FONT }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center", fontSize: 30, fontWeight: 900, letterSpacing: 4, color: "#8a93b8", opacity: 1 - rib }}>YOUR BRAIN READS &nbsp;&rarr;</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", alignItems: "baseline", fontSize: 280, fontWeight: 900, lineHeight: 1.1 }}>
          <span style={{ color: lit >= 1 ? P.navy : dim }}>$</span>
          <span style={{ display: "inline-block", color: lit >= 2 ? P.gold : dim, transform: `scale(${lit >= 2 ? 0.9 + 0.3 * Math.min(four, 1.15) : 1})`, transformOrigin: "50% 90%", textShadow: lit >= 2 ? `8px 8px 0 ${P.navy}` : "none" }}>4</span>
          <span style={{ color: dim }}>.99</span>
        </div>
        {lf >= 40 && lf < 80 ? <RingPulse cx={372} cy={230} t={fade(lf, 40, 78)} size={300} /> : null}
        <div style={{ position: "absolute", left: 130, top: 405, width: 680 * line, height: 14, borderRadius: 7, background: P.navy }} />
        <div style={{ position: "absolute", left: 124, top: 380, width: 14, height: 64, borderRadius: 7, background: P.navy, opacity: line }} />
        <div style={{ position: "absolute", left: 804, top: 380, width: 14, height: 64, borderRadius: 7, background: P.navy, opacity: line }} />
        <div style={{ position: "absolute", left: 40, width: 180, top: 460, textAlign: "center", fontSize: 44, fontWeight: 900, color: P.purple, opacity: line }}>$4.00</div>
        <div style={{ position: "absolute", left: 720, width: 180, top: 460, textAlign: "center", fontSize: 44, fontWeight: 900, color: P.navy, opacity: line }}>$5.00</div>
        <div style={{ position: "absolute", left: 788, top: 394 - (1 - Math.min(pin, 1)) * 90, width: 44, height: 44, borderRadius: "50%", background: P.gold, border: `6px solid ${P.navy}`, boxSizing: "border-box", transform: `scale(${Math.max(pin, 0.001)})` }} />
        <div style={{ position: "absolute", left: 700, width: 220, top: 326, textAlign: "center", fontSize: 48, fontWeight: 900, color: P.navy, opacity: Math.min(pin, 1) }}>$4.99</div>
        <svg style={{ position: "absolute", left: 0, top: 500, opacity: note, overflow: "visible" }} width="940" height="110" viewBox="0 0 940 110">
          <path d="M800 8 C 690 100, 280 100, 170 14" fill="none" stroke={P.purple} strokeWidth="7" strokeLinecap="round" strokeDasharray="18 12" strokeDashoffset={-f * 1.4} />
          <path d="M152 26 L140 -6 L186 8 Z" fill={P.purple} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 566, textAlign: "center", opacity: note }}><Chip bg={P.purple} color="#fff" size={44} style={{ boxShadow: "none" }}>feels like $4</Chip></div>
      </div>
      <div style={{ position: "absolute", left: 180 + (1 - rib) * -1100, top: 566, width: 720, height: 76, borderRadius: 14, background: P.gold, boxShadow: "0 8px 0 rgba(20,34,79,0.3)", transform: "rotate(-3deg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, letterSpacing: 3, color: P.navy }}>LEFT-DIGIT EFFECT</div>
    </>
  );
};

const S3 = ({ lf, f }) => {
  const BASE = 1100;
  const hL = ease(fade(lf, 4, 40)) * 210;
  const hR = ease(fade(lf, 10, 46)) * 100;
  const carX = L(lf, 0, 225, -300, 1100);
  const L8 = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <>
      <T top={545} size={160} shadow={SHADOW[2]} sd={9} style={{ transform: `scale(${pop(lf, 0, 9)})` }}>21M</T>
      <T top={700} size={42} weight={800}>riders in the study</T>
      <div style={{ position: "absolute", left: 100, top: BASE, width: 880, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.55)" }} />
      <div style={{ position: "absolute", left: 190, top: BASE - hL, width: 240, height: hL, background: P.navy, borderRadius: "18px 18px 0 0", boxShadow: "10px 0 0 rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 54, color: P.white, overflow: "hidden" }}>{hL > 120 ? "$9.99" : ""}</div>
      <div style={{ position: "absolute", left: 640, top: BASE - hR, width: 240, height: hR, background: P.coral, borderRadius: "18px 18px 0 0", boxShadow: "10px 0 0 rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 50, color: P.white, overflow: "hidden" }}>{hR > 60 ? "$10.00" : ""}</div>
      {L8.map((i) => (
        <Art key={"l" + i} svg={person({ shirt: P.gold })} left={204 + (i % 4) * 54} top={BASE - hL - 74 - Math.floor(i / 4) * 62 + (1 - pop(lf, 36 + i * 3, 12)) * -200} width={58} height={66} style={{ opacity: fade(lf, 36 + i * 3, 42 + i * 3) }} />
      ))}
      {[0, 1, 2].map((j) => (
        <Art key={"r" + j} svg={person({ shirt: P.white })} left={668 + j * 62} top={BASE - hR - 74 + (1 - pop(lf, 56 + j * 5, 12)) * -200} width={58} height={66} style={{ opacity: fade(lf, 56 + j * 5, 62 + j * 5) }} />
      ))}
      <div style={{ position: "absolute", left: 600, width: 340, top: 800, textAlign: "center", opacity: fade(lf, 120, 140), transform: `scale(${0.8 + 0.2 * pop(lf, 120, 9)})` }}><Chip bg={P.red} color="#fff" size={38}>demand drops &darr;</Chip></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: BASE + 12, height: 110, background: "#087a6e" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: BASE + 62, height: 8, backgroundImage: "repeating-linear-gradient(90deg, #fff 0 40px, transparent 40px 80px)", backgroundPosition: `${-f * 6}px 0` }} />
      <Art svg={car({ rot: f * 12 })} left={carX} top={BASE + 14} width={200} height={83} />
      <T top={BASE + 134} size={28} weight={400} color="rgba(255,255,255,0.8)" left={520} right={30} style={{ textAlign: "right", opacity: fade(lf, 120, 150) }}>Illustration, not actual data</T>
    </>
  );
};

const S4 = ({ lf, f }) => {
  const n = Math.round(interpolate(lf, [0, 60], [0, 160], clamp));
  const stack = Math.min(9, Math.max(1, Math.ceil(n / 18)));
  const hit = lf >= 60 ? Math.exp(-(lf - 60) / 6) * Math.sin((lf - 60) * 2.4) : 0;
  const bills = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <>
      <Burst cx={540} cy={780} rot={-f * 0.7} k={1 + 0.15 * Math.sin(f / 15)} color="rgba(255,255,255,0.14)" />
      {bills.map((i) => (
        <Art key={i} svg={bill()} left={40 + ((i * 131) % 860)} top={470 + ((lf * (5 + (i % 3) * 2) + i * 190) % 1400)} width={150} height={75}
          style={{ transform: `rotate(${(i % 5 - 2) * 16 + Math.sin((f + i * 9) / 14) * 20}deg)`, filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.15))" }} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={"c" + i} style={{ position: "absolute", left: 80 + ((i * 211) % 820), top: 470 + ((lf * (6 + (i % 3) * 2) + i * 300) % 1400) }}><Coin2D size={90 + (i % 2) * 24} f={f} seed={i} /></div>
      ))}
      <T top={640 + hit * 14} size={270} shadow={SHADOW[3]} sd={12} style={{ transform: `scale(${pop(lf, 0, 12)}) rotate(${hit * 2}deg)` }}>{`$${n}M`}</T>
      <T top={940} size={60} weight={900} style={{ opacity: fade(lf, 60, 80) }}>extra profit per year</T>
      <T top={1018} size={38} weight={700} color="rgba(255,255,255,0.85)" style={{ opacity: fade(lf, 70, 90) }}>researchers’ estimate for Lyft</T>
      <Art svg={coins(stack)} left={880} top={1010} width={110} height={211} />
    </>
  );
};

const cart = (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 160"><path d="M52 40 H178 L160 100 H62 Z" fill="${c}"/><path d="M10 20 H40 L60 100 H160" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="130" r="14" fill="#fff"/><circle cx="148" cy="130" r="14" fill="#fff"/></svg>`;

const S5 = ({ lf, f }) => {
  const cartX = L(lf, 20, 85, 1100, 430);
  const rib = pop(lf, 50, 9);
  const swing = Math.sin(f / 9) * 9;
  return (
    <>
      <T top={560} size={270} color={P.gold} shadow={SHADOW[4]} sd={14} style={{ transform: `scale(${pop(lf, 0, 9)})` }}>$9.99</T>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", opacity: Math.min(rib, 1), transform: `scale(${Math.max(rib, 0.001)})` }}><Chip size={54}>a nudge for your brain</Chip></div>
      <div style={{ position: "absolute", left: 430, right: 0, top: 1196, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.35)" }} />
      <Art svg={store()} left={620} top={900} width={370} height={308} style={{ opacity: fade(lf, 6, 20), transform: `translateY(${(1 - ease(fade(lf, 6, 22))) * 80}px)` }} />
      <Art svg={tag("$9.99", 46)} left={110} top={930} width={300} height={191} style={{ transformOrigin: "30% 0%", transform: `rotate(${swing}deg) scale(${pop(lf, 18, 8)})`, filter: "drop-shadow(0 12px 0 rgba(0,0,0,0.2))" }} />
      <Art svg={cart(P.teal)} left={cartX} top={1050} width={190} height={152} />
    </>
  );
};

const S6 = ({ lf, f }) => {
  const k = pop(lf, 0, 9);
  return (
    <>
      <Burst cx={540} cy={760} rot={f * 0.6} color="rgba(255,255,255,0.08)" />
      <div style={{ position: "absolute", left: 540 - 150, top: 560, transform: `scale(${k})` }}><Gear size={300} color={P.gold} rot={f * 1.6} /></div>
      <div style={{ position: "absolute", left: 200, top: 600 + Math.sin(f / 10) * 10, transform: `scale(${pop(lf, 14, 9)})` }}><Coin2D size={110} f={f} /></div>
      <div style={{ position: "absolute", left: 790, top: 700 + Math.sin(f / 9) * 10, transform: `scale(${pop(lf, 20, 9)})` }}><Coin2D size={90} f={f} seed={3} /></div>
      <T top={880} size={100} style={{ transform: `scale(${pop(lf, 8, 10)})`, textShadow: "8px 8px 0 rgba(0,0,0,0.35)" }}>Hidden <span style={{ color: P.gold }}>Mechanics</span></T>
      <T top={1010} size={52} weight={800} color="#aeb9e6" style={{ opacity: fade(lf, 22, 38) }}>@hiddenmechanicsfacts</T>
    </>
  );
};
const SCENES = [S1, S2, S3, S4, S5, S6];

/* ---------- mascot (bottom-left, fully in frame) ---------- */
const MS = { left: 4, top: 1160, h: 600 };
const MW = (MS.h * 480) / 700;
const EVENTS = [
  [0, "wow", "wow", "Wait…?"],
  [STARTS[1], "present", "grin", "Look closely!"],
  [STARTS[1] + 190, "idea", "happy", "Aha!"],
  [STARTS[2], "think", "think", "Hmm…"],
  [STARTS[2] + 135, "wow", "wow", "Whoa!"],
  [STARTS[3], "cheer", "grin", "Cha-ching!"],
  [STARTS[4], "thumbs", "grin", "Gotcha!"],
  [STARTS[5], "wave", "smile", "See you!"],
];

const Bulb = ({ f }) => (
  <svg width="120" height="140" viewBox="0 0 120 140" style={{ overflow: "visible" }}>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1="60" y1="52" x2={60 + Math.cos(-Math.PI + (i * Math.PI) / 6) * 92} y2={52 + Math.sin(-Math.PI + (i * Math.PI) / 6) * 92} stroke={P.gold} strokeWidth="8" strokeLinecap="round" strokeDasharray="14 80" strokeDashoffset={-((f * 3) % 40) + 8} />)}
    <path d="M60 8 C28 8 14 34 22 58 C28 72 40 80 40 96 L80 96 C80 80 92 72 98 58 C106 34 92 8 60 8 Z" fill={P.gold} stroke="#e09b00" strokeWidth="5" />
    <rect x="42" y="100" width="36" height="12" rx="5" fill="#c9ccd6" /><rect x="48" y="114" width="24" height="10" rx="5" fill="#9aa0b4" />
  </svg>
);

const Mascot = ({ f }) => {
  let idx = 0;
  EVENTS.forEach(([fr], i) => { if (f >= fr) idx = i; });
  const [fr, pose, mood, say] = EVENTS[idx];
  const age = f - fr;
  const { speaking, cur } = lineState(f);
  const talk = speaking ? 0.5 + 0.5 * Math.abs(Math.sin(f * 0.75 + cur)) : 0;
  const k = pop(age, 0, 8);
  const sx = 0.86 + 0.14 * k, sy = 1.18 - 0.18 * k;
  const bob = Math.sin(f / 14) * 5;
  const wave = pose === "wave" ? Math.sin(f / 4) * 10 - 4 : 0;
  return (
    <>
      <Art svg={mascot({ pose, mood, talk, blink: f % 100 < 4, wave, look: Math.sin(f / 40) })} left={MS.left} top={MS.top + bob} width={MW} height={MS.h}
        style={{ transformOrigin: "50% 100%", transform: `scale(${sx}, ${sy}) rotate(${Math.sin(f / 30) * 1.2}deg)` }} />
      {pose === "idea" ? <div style={{ position: "absolute", left: 262, top: 1150 + bob, transform: `scale(${pop(age, 6, 8)})` }}><Bulb f={f} /></div> : null}
      <div style={{ position: "absolute", left: 380, top: 1206, transformOrigin: "0% 100%", transform: `scale(${Math.max(pop(age, 4, 9), 0.001)})`, opacity: fade(age, 2, 8) }}>
        <div style={{ position: "relative", background: P.white, borderRadius: 34, padding: "14px 34px", fontFamily: FONT, fontWeight: 900, fontSize: 54, color: P.navy, whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(20,34,79,0.25)" }}>
          {say}
          <div style={{ position: "absolute", left: 26, bottom: -22, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: `28px solid ${P.white}`, transform: "skewX(20deg)" }} />
        </div>
      </div>
    </>
  );
};

const Video = () => {
  const f = useCurrentFrame();
  const s = sceneOf(f);
  const lf = f - STARTS[s];
  const Scene = SCENES[s];
  const sh = (a, amp) => (f >= a ? amp * Math.exp(-(f - a) / 6) * Math.sin((f - a) * 2.4) : 0);
  const shakeX = sh(STARTS[3] + 60, 9) + sh(STARTS[1] + 132, 4);
  return (
    <AbsoluteFill style={{ backgroundColor: P.navy }}>
      <Background f={f} />
      <AbsoluteFill style={{ transform: `translateX(${shakeX}px)` }}>
        <Scene lf={Math.max(0, lf - 4)} f={f} />
      </AbsoluteFill>
      <Badge text={BADGES[s]} lf={lf} />
      <Subtitles f={f} />
      <Mascot f={f} />
      <Confetti f={f} start={STARTS[0] + 8} n={34} cx={540} cy={860} seed={1} />
      <Stars f={f} start={STARTS[1] + 40} n={10} cx={420} cy={760} spread={240} seed={2} />
      <Stars f={f} start={STARTS[2] + 40} n={12} cx={540} cy={900} spread={400} seed={3} />
      <Confetti f={f} start={STARTS[3] + 60} n={70} cx={540} cy={800} life={90} seed={4} />
      <Flash f={f} start={STARTS[3] + 60} strength={0.5} />
      <Stars f={f} start={STARTS[4] + 52} n={12} cx={540} cy={900} spread={380} seed={5} color={P.gold} />
      <Confetti f={f} start={STARTS[5] + 40} n={60} cx={540} cy={700} life={50} seed={6} />
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <Composition id="Prices99" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
));
