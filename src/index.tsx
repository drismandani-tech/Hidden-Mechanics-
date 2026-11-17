import React from "react";
import { AbsoluteFill, Composition, Sequence, interpolate, registerRoot, spring, useCurrentFrame } from "remotion";
import { person, car, store, bill, coins, tag } from "./art";
import { mascot } from "./mascot";

const FPS = 30;
const C = { bg: "#0b1020", text: "#ffffff", gold: "#ffcc33", teal: "#35d0c0", red: "#ff5a6e", dim: "#7b86a8", ink: "#10162e" };
const FONT = "Arial, Helvetica, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const fade = (f, a, b) => interpolate(f, [a, b], [0, 1], clamp);
const pop = (f, start, damping = 12) => spring({ frame: Math.max(0, f - start), fps: FPS, config: { damping } });

const FR = [90, 300, 225, 195, 150, 90];
const STARTS = FR.map((_, i) => FR.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = FR.reduce((a, b) => a + b, 0);
const sceneOf = (f) => {
  let s = 0;
  STARTS.forEach((st, k) => { if (f >= st) s = k; });
  return s;
};

/* ---- narration lines: [start sec, end sec, text]. When real voice-over exists, only these times change. ---- */
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
const STEPS = ["HOOK", "BRAIN", "STUDY", "MONEY", "TAKEAWAY"];
const STEP_OF_SCENE = [0, 1, 2, 3, 4, 4];
const POSES = [["wow", "wow"], ["point", "smile"], ["think", "worry"], ["wow", "grin"], ["thumbs", "grin"], ["wave", "grin"]];

const Art = ({ svg, left, top, width, height, style }) => (
  <div style={{ position: "absolute", left, top, width, height, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />
);
const T = ({ children, left = 0, right = 0, top, size, color = C.text, weight = 900, align = "center", style }) => (
  <div style={{ position: "absolute", left, right, top, textAlign: align, fontFamily: FONT, fontWeight: weight, fontSize: size, color, ...style }}>{children}</div>
);

/* ---------- background ---------- */
const Background = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(900px 700px at 15% 6%, rgba(53,208,192,0.20), transparent 62%), radial-gradient(1000px 800px at 90% 96%, rgba(255,204,51,0.15), transparent 62%), ${C.bg}` }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)", backgroundSize: "52px 52px" }} />
      <div style={{ position: "absolute", left: 640 + Math.sin(f / 50) * 50, top: 260 + Math.cos(f / 60) * 40, width: 380, height: 380, borderRadius: "50%", background: "rgba(53,208,192,0.14)", filter: "blur(70px)" }} />
      <div style={{ position: "absolute", left: 40 + Math.cos(f / 55) * 40, top: 1150 + Math.sin(f / 45) * 50, width: 340, height: 340, borderRadius: "50%", background: "rgba(255,90,110,0.10)", filter: "blur(70px)" }} />
    </AbsoluteFill>
  );
};

/* ---------- kinetic subtitles (top) ---------- */
const Subtitles = () => {
  const f = useCurrentFrame();
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
  const size = text.length <= 40 ? 88 : text.length <= 75 ? 74 : 62;
  const lf = f - Math.round(st * FPS);
  const e = fade(lf, 0, 7);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 150, height: 380, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.16, opacity: e, transform: `translateY(${(1 - e) * 18}px)` }}>
      <div>
        {words.map((x, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: size * 0.26, color: i === cur ? C.gold : C.text, opacity: i < cur ? 0.55 : i === cur ? 1 : 0.2, filter: i > cur ? "blur(5px)" : "none", transform: i === cur ? "scale(1.06)" : "scale(1)" }}>{x}</span>
        ))}
      </div>
    </div>
  );
};

/* ---------- step bar ---------- */
const Stepper = ({ step }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 560, height: 84, fontFamily: FONT }}>
    <div style={{ position: "absolute", left: 24, right: 24, top: 18, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.18)" }} />
    <div style={{ position: "absolute", left: 24, top: 18, height: 6, borderRadius: 3, background: C.teal, width: `${(step / 4) * 100}%`, maxWidth: "calc(100% - 48px)" }} />
    <div style={{ position: "absolute", left: 24, right: 24, top: 0, display: "flex", justifyContent: "space-between" }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ width: 0, display: "flex", flexDirection: "column", alignItems: "center", overflow: "visible" }}>
          <div style={{ width: i === step ? 34 : 24, height: i === step ? 34 : 24, marginTop: i === step ? -5 : 0, borderRadius: "50%", background: i <= step ? C.teal : C.bg, border: `5px solid ${i <= step ? C.teal : "rgba(255,255,255,0.3)"}`, boxShadow: i === step ? `0 0 24px ${C.teal}` : "none", boxSizing: "border-box" }} />
          <div style={{ marginTop: 12, fontSize: 24, fontWeight: 800, letterSpacing: 2, color: i <= step ? C.text : C.dim, whiteSpace: "nowrap" }}>{s}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ---------- stage card ---------- */
const Card = ({ f, badge, children }) => {
  const e = fade(f, 0, 12);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 670, height: 690, borderRadius: 48, background: "linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))", border: "2px solid rgba(255,255,255,0.16)", overflow: "hidden", opacity: e, transform: `translateY(${(1 - e) * 70}px)`, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 34, top: 28, padding: "8px 24px", borderRadius: 999, background: C.teal, color: C.ink, fontSize: 32, fontWeight: 900, letterSpacing: 1.5 }}>{badge}</div>
      {children}
    </div>
  );
};

/* ---------- scene stages ---------- */
const Stage1 = () => {
  const f = useCurrentFrame();
  const tags = [
    ["$9.99", 90, 740, 520, -8, 0],
    ["$19.99", 520, 900, 480, 7, 10],
    ["$4.99", 130, 1080, 460, -3, 20],
  ];
  return (
    <>
      {tags.map(([txt, l, t, w, r, d], i) => (
        <Art key={i} svg={tag(txt, txt.length > 5 ? 40 : 46)} left={l} top={t + Math.sin((f + i * 20) / 14) * 10} width={w} height={w * 0.636}
          style={{ transform: `rotate(${r}deg) scale(${pop(f, d)})`, filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.45))" }} />
      ))}
      <T left={640} right={40} top={700} size={260} color={C.gold} style={{ transform: `scale(${pop(f, 30, 8)}) rotate(10deg)` }}>?</T>
    </>
  );
};

const Stage2 = () => {
  const f = useCurrentFrame();
  const lit = f < 20 ? 0 : f < 45 ? 1 : 2; // 0 none, 1 "$" read, 2 "4" read
  const line = fade(f, 150, 190);
  const pin = pop(f, 130, 9);
  return (
    <Card f={f} badge="THE TRICK">
      <T top={82} size={32} weight={800} color={C.dim} style={{ letterSpacing: 3, opacity: fade(f, 0, 12) }}>YOUR BRAIN READS &nbsp;&rarr;</T>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, display: "flex", justifyContent: "center", alignItems: "baseline", fontFamily: FONT, fontSize: 240, fontWeight: 900 }}>
        <span style={{ color: lit >= 1 ? C.text : "rgba(255,255,255,0.35)" }}>$</span>
        <span style={{ display: "inline-block", color: lit >= 2 ? C.gold : "rgba(255,255,255,0.35)", transform: `scale(${1 + 0.12 * pop(f, 40)})`, transformOrigin: "bottom center", textShadow: lit >= 2 ? `0 0 40px ${C.gold}` : "none" }}>4</span>
        <span style={{ color: lit >= 2 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.35)" }}>.99</span>
      </div>
      <svg style={{ position: "absolute", left: 0, top: 410, opacity: fade(f, 100, 120) }} width="960" height="250" viewBox="0 0 960 250" fontFamily={FONT}>
        <line x1="130" y1="90" x2="830" y2="90" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - fade(f, 100, 130))} />
        <line x1="130" y1="62" x2="130" y2="118" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <line x1="830" y1="62" x2="830" y2="118" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <text x="130" y="168" fill={C.gold} fontSize="46" fontWeight="900" textAnchor="middle">$4.00</text>
        <text x="830" y="168" fill="#fff" fontSize="46" fontWeight="900" textAnchor="middle">$5.00</text>
        <g transform={`translate(0 ${(1 - pin) * -50})`} opacity={pin}>
          <circle cx="823" cy="90" r="17" fill={C.gold} stroke={C.ink} strokeWidth="5" />
          <text x="823" y="44" fill={C.gold} fontSize="44" fontWeight="900" textAnchor="middle">$4.99</text>
        </g>
        <g opacity={line}>
          <path d="M805 112 C 700 190, 300 190, 160 118" fill="none" stroke={C.gold} strokeWidth="6" strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-f * 1.5} />
          <path d="M150 128 L138 98 L176 106 Z" fill={C.gold} />
          <text x="480" y="238" fill={C.gold} fontSize="44" fontWeight="900" textAnchor="middle">feels like $4</text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 625, display: "flex", justifyContent: "center", opacity: fade(f, 205, 225), transform: `scale(${0.9 + 0.1 * pop(f, 205)})` }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: C.ink, background: C.gold, borderRadius: 18, padding: "10px 30px", letterSpacing: 1 }}>LEFT-DIGIT EFFECT</div>
      </div>
    </Card>
  );
};

const Stage3 = () => {
  const f = useCurrentFrame();
  const carX = interpolate(f, [0, 225], [-320, 1000]);
  const L = [0, 1, 2, 3, 4, 5, 6, 7];
  const R = [0, 1, 2];
  return (
    <Card f={f} badge="THE STUDY · 21M RIDERS">
      <Art svg={tag("$9.99", 46)} left={110} top={90} width={260} height={165} style={{ transform: `scale(${pop(f, 20)})` }} />
      <Art svg={tag("$10.00", 40)} left={590} top={90} width={260} height={165} style={{ transform: `scale(${pop(f, 20)})` }} />
      <T left={400} right={400} top={150} size={60} weight={900} color={C.dim}>vs</T>
      {L.map((i) => (
        <Art key={"l" + i} svg={person({ shirt: C.teal })} left={10 + (i % 4) * 118} top={268 + Math.floor(i / 4) * 138} width={122} height={138} style={{ transform: `scale(${pop(f, 45 + i * 4, 14)})` }} />
      ))}
      {R.map((j) => (
        <Art key={"r" + j} svg={person({ shirt: C.red })} left={560 + j * 118} top={268} width={122} height={138} style={{ transform: `scale(${pop(f, 90 + j * 6, 14)})` }} />
      ))}
      <div style={{ position: "absolute", left: 540, width: 400, top: 425, display: "flex", justifyContent: "center", opacity: fade(f, 125, 145) }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 16, padding: "8px 22px" }}>demand drops &darr;</div>
      </div>
      <T left={520} right={20} top={505} size={30} weight={400} color={C.dim} style={{ opacity: fade(f, 120, 150) }}>Illustration, not actual data</T>
      <div style={{ position: "absolute", left: 0, right: 0, top: 664, height: 8, background: "rgba(255,255,255,0.18)" }} />
      <Art svg={car({ rot: f * 12 })} left={carX} top={548} width={270} height={112} />
    </Card>
  );
};

const Stage4 = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [0, 60], [0, 160], clamp));
  const stack = Math.min(9, Math.max(1, Math.ceil(n / 18)));
  const bills = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <Card f={f} badge="THE ESTIMATE">
      {bills.map((i) => (
        <Art key={i} svg={bill()} left={30 + ((i * 131) % 800)} top={((f * (4 + (i % 3) * 2) + i * 140) % 900) - 130} width={130} height={65}
          style={{ opacity: 0.8, transform: `rotate(${(i % 5 - 2) * 14 + Math.sin((f + i * 9) / 15) * 18}deg)` }} />
      ))}
      <T top={110} size={250} color={C.gold} style={{ textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>${n}M</T>
      <T top={370} size={52} weight={800} style={{ opacity: fade(f, 60, 80), textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>extra profit per year</T>
      <T top={440} size={36} weight={400} color="#c4cbe6" style={{ opacity: fade(f, 70, 90), textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>researchers’ estimate for Lyft</T>
      <Art svg={coins(stack)} left={409} top={430} width={141} height={270} />
    </Card>
  );
};

const cart = (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 160"><path d="M52 40 H178 L160 100 H62 Z" fill="${c}" opacity="0.9"/><path d="M10 20 H40 L60 100 H160" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="130" r="14" fill="#fff"/><circle cx="148" cy="130" r="14" fill="#fff"/></svg>`;

const Stage5 = () => {
  const f = useCurrentFrame();
  const swing = Math.sin(f / 9) * 7;
  const cartX = interpolate(f, [20, 80], [980, 640], clamp);
  return (
    <Card f={f} badge="THE TAKEAWAY">
      <Art svg={store()} left={40} top={110} width={500} height={417} style={{ opacity: fade(f, 8, 22) }} />
      <Art svg={tag("$9.99", 46)} left={560} top={110} width={330} height={210} style={{ transformOrigin: "30% 0%", transform: `rotate(${swing}deg) scale(${pop(f, 18)})`, filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.4))" }} />
      <Art svg={cart(C.teal)} left={cartX} top={420} width={250} height={200} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center", opacity: fade(f, 50, 70) }}>
        <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, background: C.teal, borderRadius: 18, padding: "8px 28px" }}>a nudge for your brain</div>
      </div>
    </Card>
  );
};

const Stage6 = () => {
  const f = useCurrentFrame();
  return (
    <>
      <T top={690} size={104} color={C.gold} style={{ opacity: fade(f, 0, 12), textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>Hidden Mechanics</T>
      <T top={840} size={52} weight={800} color="#c4cbe6" style={{ opacity: fade(f, 20, 36) }}>@hiddenmechanicsfacts</T>
      <Art svg={tag("$9.99", 46)} left={150} top={990} width={230} height={147} style={{ transform: `rotate(-8deg) scale(${pop(f, 30)})` }} />
      <Art svg={coins(5)} left={470} top={960} width={115} height={220} style={{ transform: `scale(${pop(f, 40)})` }} />
      <Art svg={car({ color: C.teal, rot: f * 14 })} left={650} top={1010} width={290} height={120} style={{ transform: `scale(${pop(f, 50)})` }} />
    </>
  );
};

const STAGES = [Stage1, Stage2, Stage3, Stage4, Stage5, Stage6];

/* ---------- mascot (bottom) ---------- */
const Mascot = () => {
  const f = useCurrentFrame();
  const s = sceneOf(f);
  const lf = f - STARTS[s];
  const [pose, mood] = POSES[s];
  const blink = f % 110 < 4;
  const k = 0.88 + 0.12 * pop(lf, 0, 10);
  return (
    <Art svg={mascot({ pose, mood, blink })} left={330} top={1330 + Math.sin(f / 12) * 6} width={435} height={580}
      style={{ transformOrigin: "50% 100%", transform: `scale(${k})`, filter: "drop-shadow(0 -6px 24px rgba(0,0,0,0.35))" }} />
  );
};

const Video = () => {
  const f = useCurrentFrame();
  const s = sceneOf(f);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />
      <Subtitles />
      <Stepper step={STEP_OF_SCENE[s]} />
      {STAGES.map((St, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={FR[i]}><St /></Sequence>
      ))}
      <Mascot />
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <Composition id="Prices99" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
));
