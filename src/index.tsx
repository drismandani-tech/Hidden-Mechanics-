import React from "react";
import { AbsoluteFill, Composition, interpolate, registerRoot, spring, useCurrentFrame } from "remotion";
import { person, car, store, bill, tag } from "./art";
import { mascot } from "./mascot";
import { Obj, Stage, Text3D, Coin3D, CoinPile, Box3D, Gear3D, Billboard, Floor } from "./fx";

const FPS = 30;
const C = { bg: "#0b1020", text: "#ffffff", gold: "#ffcc33", teal: "#35d0c0", red: "#ff5a6e", dim: "#7b86a8", ink: "#10162e" };
const FONT = "Arial, Helvetica, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const fade = (f, a, b) => interpolate(f, [a, b], [0, 1], clamp);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const L = (f, a, b, from, to) => from + (to - from) * ease(fade(f, a, b));
const pop = (f, start, damping = 12) => spring({ frame: Math.max(0, f - start), fps: FPS, config: { damping } });

const FR = [90, 300, 225, 195, 150, 90];
const STARTS = FR.map((_, i) => FR.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = FR.reduce((a, b) => a + b, 0);
const sceneOf = (f) => {
  let s = 0;
  STARTS.forEach((st, k) => { if (f >= st) s = k; });
  return s;
};

/* narration lines: [start sec, end sec, text] — with real voice-over only these times change */
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
const BADGES = ["", "THE TRICK", "THE STUDY", "THE ESTIMATE", "THE TAKEAWAY", ""];
const POSES = [["wow", "wow"], ["point", "smile"], ["think", "worry"], ["wow", "grin"], ["thumbs", "grin"], ["wave", "grin"]];

const Spr = ({ svg, w, h, style }) => <div style={{ width: w, height: h, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />;
const Art = ({ svg, left, top, width, height, style }) => (
  <div style={{ position: "absolute", left, top, width, height, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />
);

const Tag3D = ({ text, size = 46, w = 380, ry = 0, rz = 0 }) => (
  <div style={{ position: "relative", width: w, height: w * 0.636, transformStyle: "preserve-3d", transformOrigin: "30% 0%", transform: `rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }} dangerouslySetInnerHTML={{ __html: tag(text, size) }} />
    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} dangerouslySetInnerHTML={{ __html: tag("", size) }} />
  </div>
);

const Chip = ({ children, bg = C.gold, color = C.ink, size = 44 }) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color, background: bg, borderRadius: 18, padding: "8px 28px", whiteSpace: "nowrap" }}>{children}</div>
);

const DIM = ["#c4cbe8", "#8a94bd", "#5f6a96"];

/* ---------- 2D background ---------- */
const Background = () => {
  const f = useCurrentFrame();
  const dots = [];
  for (let i = 0; i < 16; i++) {
    const x = (i * 197) % 1080;
    const y = 1900 - ((f * (0.7 + (i % 4) * 0.35) + i * 260) % 2000);
    dots.push(<div key={i} style={{ position: "absolute", left: x, top: y, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3, borderRadius: "50%", background: i % 2 ? "rgba(255,204,51,0.55)" : "rgba(53,208,192,0.5)", boxShadow: "0 0 14px currentColor" }} />);
  }
  return (
    <AbsoluteFill style={{ background: `radial-gradient(900px 700px at 15% 6%, rgba(53,208,192,0.22), transparent 62%), radial-gradient(1000px 800px at 90% 96%, rgba(255,204,51,0.16), transparent 62%), ${C.bg}` }}>
      <div style={{ position: "absolute", left: 640 + Math.sin(f / 50) * 50, top: 260 + Math.cos(f / 60) * 40, width: 380, height: 380, borderRadius: "50%", background: "rgba(53,208,192,0.14)", filter: "blur(70px)" }} />
      <div style={{ position: "absolute", left: 40 + Math.cos(f / 55) * 40, top: 1150 + Math.sin(f / 45) * 50, width: 340, height: 340, borderRadius: "50%", background: "rgba(255,90,110,0.12)", filter: "blur(70px)" }} />
      {dots}
    </AbsoluteFill>
  );
};

/* ---------- kinetic subtitles ---------- */
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
    <div style={{ position: "absolute", left: 70, right: 70, top: 150, height: 380, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.16, opacity: e, transform: `translateY(${(1 - e) * 18}px)`, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
      <div>
        {words.map((x, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: size * 0.26, color: i === cur ? C.gold : C.text, opacity: i < cur ? 0.6 : i === cur ? 1 : 0.34, filter: i > cur ? "blur(3px)" : "none", transform: i === cur ? "scale(1.07)" : "scale(1)" }}>{x}</span>
        ))}
      </div>
    </div>
  );
};

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

const Badge = ({ text, lf }) =>
  text ? (
    <div style={{ position: "absolute", left: 60, top: 656, padding: "8px 24px", borderRadius: 999, background: C.teal, color: C.ink, fontFamily: FONT, fontSize: 32, fontWeight: 900, letterSpacing: 1.5, opacity: fade(lf, 4, 14), transform: `translateX(${(1 - ease(fade(lf, 4, 16))) * -80}px)` }}>{text}</div>
  ) : null;

/* ---------- shared 3D backdrop: gears far behind ---------- */
const Backdrop = ({ f }) => (
  <>
    <Obj x={-430} y={-260} z={-900}><Gear3D size={560} spin={f * 0.35} color="#18244d" front="#22336a" depth={60} /></Obj>
    <Obj x={440} y={90} z={-1100}><Gear3D size={700} spin={-f * 0.28 + 10} color="#16224a" front="#1f2f63" depth={60} /></Obj>
    <Obj x={20} y={-520} z={-1400}><Gear3D size={760} spin={f * 0.2} color="#141f43" front="#1c2a58" depth={60} /></Obj>
  </>
);

/* ---------- scenes (3D) ---------- */
const FLOOR = 250;
const NW = { whiteSpace: "nowrap" };

const S1 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 90, -260, 0), rx: -9, ry: L(lf, 0, 90, -14, 0) };
  const tags = [["$9.99", -300, -250, 110, -10, 0], ["$19.99", 300, -250, 70, 8, 8], ["$4.99", -280, 200, 210, -4, 16]];
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 4} />
      <Backdrop f={f} />
      <Obj x={0} y={0} z={0} ry={Math.sin(lf / 14) * 12} s={pop(lf, 6, 9)}>
        <Text3D text=".99?" size={380} depth={90} />
      </Obj>
      {tags.map(([txt, x, y, z, rz, d], i) => {
        const k = ease(fade(lf, d, d + 24));
        return (
          <Obj key={i} x={x} y={y + Math.sin((f + i * 20) / 14) * 12} z={z - (1 - k) * 1800} ry={(1 - k) * 200 + Math.sin((f + i * 30) / 20) * 10} rz={rz}>
            <Tag3D text={txt} size={txt.length > 5 ? 40 : 46} w={380} />
          </Obj>
        );
      })}
      <Obj x={330} y={150} z={230} s={pop(lf, 26)}><Coin3D size={150} spin={f * 5} tilt={12} /></Obj>
      <Obj x={-60} y={270} z={260} s={pop(lf, 34)}><Coin3D size={110} spin={-f * 4 + 40} tilt={-14} /></Obj>
    </Stage>
  );
};

const S2 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 300, -40, 60), rx: -9, ry: L(lf, 0, 300, -12, 12) };
  const rail = ease(fade(lf, 100, 130));
  const pin = pop(lf, 130, 9);
  const flip = ease(fade(lf, 205, 228));
  const four = ease(fade(lf, 30, 52));
  const beamX = L(lf, 6, 44, -420, -70);
  const beamO = fade(lf, 4, 10) * (1 - fade(lf, 44, 60));
  const R = Math.max(rail, 0.001);
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 3} />
      <Backdrop f={f} />
      <Obj x={0} y={-140} z={0}>
        <div style={{ display: "flex", alignItems: "baseline", transformStyle: "preserve-3d" }}>
          <div style={{ transformStyle: "preserve-3d", transform: `translateZ(${-30 * four}px)` }}><Text3D text="$" size={240} face={lf >= 20 ? ["#f4f6ff", "#c4cbe8", "#8a94bd"] : DIM} side="#2e3558" depth={60} /></div>
          <div style={{ transformStyle: "preserve-3d", transform: `translateZ(${110 * four}px) scale(${1 + 0.1 * four})` }}><Text3D text="4" size={240} depth={80} layers={20} /></div>
          <div style={{ transformStyle: "preserve-3d", transform: `translateZ(${-60 * four}px)` }}><Text3D text=".99" size={240} face={DIM} side="#2a3052" depth={60} /></div>
        </div>
      </Obj>
      <Obj x={beamX} y={-140} z={150}>
        <div style={{ width: 120, height: 300, background: "linear-gradient(90deg, transparent, rgba(255,204,51,0.4), transparent)", borderRadius: 40, opacity: beamO }} />
      </Obj>
      <Obj x={0} y={40} z={0} s={R}><Box3D w={760} h={16} d={18} color="#dfe6ff" shade="#8a94c0" topColor="#ffffff" /></Obj>
      <Obj x={-380} y={42} z={0} s={R}><Box3D w={12} h={80} d={12} color="#ffffff" shade="#8a94c0" /></Obj>
      <Obj x={380} y={42} z={0} s={R}><Box3D w={12} h={80} d={12} color="#ffffff" shade="#8a94c0" /></Obj>
      <Obj x={-380} y={125} z={20} s={R}><Text3D text="$4.00" size={58} depth={20} layers={8} /></Obj>
      <Obj x={380} y={125} z={20} s={R}><Text3D text="$5.00" size={58} face={["#ffffff", "#dfe6ff", "#aab3d6"]} side="#586089" depth={20} layers={8} /></Obj>
      <Obj x={372} y={40 - (1 - Math.min(pin, 1)) * 140} z={30} s={Math.max(pin, 0.001)}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff7c4, #ffcc33 55%, #d99a00)", boxShadow: "0 0 26px rgba(255,204,51,0.9)" }} />
      </Obj>
      <Obj x={372} y={-25} z={40} s={Math.max(pin, 0.001)}><Text3D text="$4.99" size={58} depth={20} layers={8} /></Obj>
      <Billboard x={0} y={105} z={50} cam={cam} style={{ opacity: fade(lf, 150, 185) }}>
        <svg width="760" height="140" viewBox="0 0 760 140">
          <path d="M752 10 C 640 130, 250 130, 22 20" fill="none" stroke={C.gold} strokeWidth="6" strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-f * 1.5} />
          <path d="M10 32 L8 0 L44 12 Z" fill={C.gold} />
        </svg>
      </Billboard>
      <Obj x={0} y={215} z={60} s={Math.max(ease(fade(lf, 160, 190)), 0.001)}><Text3D text="feels like $4" size={64} depth={22} layers={8} /></Obj>
      <Obj x={70} y={-318} z={90} rx={(1 - flip) * -90} s={Math.max(flip, 0.001)}>
        <Box3D w={600} h={66} d={24} color={C.gold} shade="#a86f00" topColor="#fff0a0">
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.ink, letterSpacing: 2, whiteSpace: "nowrap" }}>LEFT-DIGIT EFFECT</span>
        </Box3D>
      </Obj>
    </Stage>
  );
};

const S3 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 225, 0, 60), rx: -12, ry: L(lf, 0, 225, -24, 12) };
  const hL = ease(fade(lf, 20, 64)) * 280;
  const hR = ease(fade(lf, 32, 74)) * 120;
  const carX = L(lf, 0, 225, -760, 760);
  const lp = [];
  for (let i = 0; i < 8; i++) lp.push([(i % 4 - 1.5) * 46, Math.floor(i / 4) * 70 - 35, 60 + i * 4]);
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 5} />
      <Backdrop f={f} />
      <Obj x={-250} y={FLOOR - hL / 2} z={0}><Box3D w={210} h={Math.max(hL, 2)} d={210} color={C.teal} shade="#1f8b80" topColor="#7ff0e2" /></Obj>
      <Obj x={250} y={FLOOR - hR / 2} z={0}><Box3D w={210} h={Math.max(hR, 2)} d={210} color={C.red} shade="#b03a4c" topColor="#ff9aa8" /></Obj>
      {lp.map(([dx, dz, d], i) => (
        <Billboard key={"l" + i} x={-250 + dx} y={FLOOR - hL - 38} z={dz} cam={cam} s={pop(lf, d, 14)}>
          <Spr svg={person({ shirt: C.teal })} w={74} h={84} />
        </Billboard>
      ))}
      {[0, 1, 2].map((j) => (
        <Billboard key={"r" + j} x={250 + (j - 1) * 56} y={FLOOR - hR - 38} z={0} cam={cam} s={pop(lf, 100 + j * 6, 14)}>
          <Spr svg={person({ shirt: C.red })} w={74} h={84} />
        </Billboard>
      ))}
      <Obj x={-250} y={FLOOR - hL - 130} z={0} ry={Math.sin(f / 30) * 8} s={pop(lf, 30, 10)}><Text3D text="$9.99" size={84} depth={26} layers={10} /></Obj>
      <Obj x={250} y={FLOOR - hR - 130} z={0} ry={Math.sin(f / 30 + 1) * 8} s={pop(lf, 40, 10)}><Text3D text="$10.00" size={78} face={["#ffd0d6", "#ff8d9c", "#e0475c"]} side="#8f2438" depth={26} layers={10} /></Obj>
      <Obj x={0} y={-320} z={40} s={pop(lf, 4, 10)} ry={Math.sin(f / 26) * 8}><Text3D text="21M" size={140} depth={50} layers={14} /></Obj>
      <Billboard x={0} y={-232} z={40} cam={cam}><div style={{ ...NW, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.text }}>riders in the study</div></Billboard>
      <Billboard x={0} y={100} z={230} cam={cam} style={{ opacity: fade(lf, 130, 150) }}>
        <Chip bg={C.red} color="#fff" size={32}>demand drops &darr;</Chip>
      </Billboard>
      <Billboard x={carX} y={FLOOR - 62} z={-320} cam={cam}><Spr svg={car({ rot: f * 12 })} w={300} h={124} /></Billboard>
    </Stage>
  );
};

const S4 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 195, -80, 120), rx: -8, ry: Math.sin(lf / 40) * 9 };
  const n = Math.round(interpolate(lf, [0, 60], [0, 160], clamp));
  const stack = Math.min(9, Math.max(1, Math.ceil(n / 18)));
  const ring = fade(lf, 58, 90);
  const coins = [];
  for (let i = 0; i < 12; i++) {
    const y = ((lf * (7 + (i % 3) * 2) + i * 170) % 1300) - 650;
    coins.push(<Obj key={i} x={-440 + ((i * 83) % 880)} y={y} z={-200 + (i % 4) * 120} s={0.6 + (i % 3) * 0.18}><Coin3D size={110} spin={lf * (6 + (i % 4) * 2) + i * 30} tilt={20 * Math.sin(lf / 20 + i)} /></Obj>);
  }
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 6} />
      <Backdrop f={f} />
      <Obj x={0} y={-185} z={-40} s={ring * 1.5 + 0.2}><div style={{ width: 520, height: 520, borderRadius: "50%", border: `10px solid rgba(255,204,51,${0.7 * (1 - ring)})`, boxSizing: "border-box" }} /></Obj>
      <Obj x={0} y={-185} z={0} ry={Math.sin(lf / 30) * 11}><Text3D text={`$${n}M`} size={240} depth={90} layers={20} /></Obj>
      <Billboard x={0} y={-15} z={60} cam={cam} style={{ opacity: fade(lf, 60, 80) }}><div style={{ ...NW, fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.text, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>extra profit per year</div></Billboard>
      <Billboard x={0} y={50} z={60} cam={cam} style={{ opacity: fade(lf, 70, 90) }}><div style={{ ...NW, fontFamily: FONT, fontSize: 38, color: "#c4cbe6", textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>researchers’ estimate for Lyft</div></Billboard>
      {coins}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Obj key={"b" + i} x={-380 + i * 150} y={((lf * (3 + (i % 3)) + i * 230) % 1100) - 550} z={-60 + (i % 3) * 90} rx={lf * 3 + i * 40} ry={Math.sin(lf / 12 + i) * 50} rz={(i % 3 - 1) * 20}>
          <Spr svg={bill()} w={150} h={75} />
        </Obj>
      ))}
      <Obj x={-300} y={FLOOR - 40} z={130} s={1.05}><CoinPile n={stack} size={170} /></Obj>
    </Stage>
  );
};

const cart = (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 160"><path d="M52 40 H178 L160 100 H62 Z" fill="${c}" opacity="0.95"/><path d="M10 20 H40 L60 100 H160" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="130" r="14" fill="#fff"/><circle cx="148" cy="130" r="14" fill="#fff"/></svg>`;

const S5 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 150, 0, 60), rx: -10, ry: L(lf, 0, 150, 10, -10) };
  const cartX = L(lf, 20, 85, 760, 110);
  const flip = ease(fade(lf, 50, 74));
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 4} />
      <Backdrop f={f} />
      <Obj x={0} y={-255} z={0} s={pop(lf, 0, 9)} ry={Math.sin(lf / 16) * 11}><Text3D text="$9.99" size={210} depth={70} layers={16} /></Obj>
      <Obj x={0} y={FLOOR - 22} z={0}><Box3D w={780} h={44} d={420} color="#2c3f82" shade="#18224d" topColor="#3d56a8" /></Obj>
      <Billboard x={-220} y={FLOOR - 44 - 145} z={0} cam={cam} style={{ opacity: fade(lf, 6, 22) }}><Spr svg={store()} w={350} h={290} /></Billboard>
      <Obj x={310} y={-5} z={90} ry={Math.sin(f / 10) * 28} rz={Math.sin(f / 9) * 6}><Tag3D text="$9.99" w={240} /></Obj>
      <Billboard x={cartX} y={FLOOR - 44 - 80} z={110} cam={cam}><Spr svg={cart(C.teal)} w={200} h={160} /></Billboard>
      <Obj x={0} y={-110} z={130} rx={(1 - flip) * 90} s={Math.max(flip, 0.001)}>
        <Box3D w={600} h={74} d={24} color={C.teal} shade="#1f8b80" topColor="#9ff5ec">
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: C.ink, whiteSpace: "nowrap" }}>a nudge for your brain</span>
        </Box3D>
      </Obj>
    </Stage>
  );
};

const S6 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 90, 80, -160), rx: -6, ry: Math.sin(lf / 18) * 9 };
  const coins = [];
  for (let i = 0; i < 9; i++) {
    const y = ((lf * (5 + (i % 3) * 2) + i * 190) % 1200) - 600;
    coins.push(<Obj key={i} x={-420 + ((i * 113) % 840)} y={y} z={-100 + (i % 3) * 140} s={0.7}><Coin3D size={100} spin={lf * (7 + (i % 3) * 2) + i * 40} tilt={16 * Math.sin(lf / 18 + i)} /></Obj>);
  }
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 4} />
      <Backdrop f={f} />
      <Obj x={0} y={-280} z={0} s={pop(lf, 0, 10)}><Gear3D size={330} spin={f * 1.6} color="#b8860a" front="#ffcc33" depth={70} /></Obj>
      <Obj x={0} y={-20} z={0} s={pop(lf, 8, 11)} ry={Math.sin(lf / 14) * 10}><Text3D text="Hidden Mechanics" size={112} depth={46} layers={14} /></Obj>
      <Billboard x={0} y={92} z={30} cam={cam} style={{ opacity: fade(lf, 22, 38) }}><div style={{ ...NW, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#c4cbe6" }}>@hiddenmechanicsfacts</div></Billboard>
      {coins}
      <Obj x={-300} y={200} z={140} ry={f * 4} s={pop(lf, 30)}><Tag3D text="$9.99" w={300} /></Obj>
      <Obj x={310} y={220} z={150} s={pop(lf, 40)}><Coin3D size={130} spin={f * 5} tilt={14} /></Obj>
    </Stage>
  );
};

const SCENES = [S1, S2, S3, S4, S5, S6];

/* ---------- scene-change wipe ---------- */
const Wipe = ({ f }) => {
  const bands = [];
  STARTS.slice(1).forEach((st, i) => {
    const lf = f - (st - 6);
    if (lf < 0 || lf > 22) return;
    const k = ease(fade(lf, 0, 22));
    const x = -1500 + k * 3200;
    bands.push(
      <React.Fragment key={i}>
        <div style={{ position: "absolute", top: -100, left: x, width: 760, height: 2200, background: C.teal, transform: "skewX(-18deg)" }} />
        <div style={{ position: "absolute", top: -100, left: x - 360, width: 420, height: 2200, background: C.gold, transform: "skewX(-18deg)" }} />
      </React.Fragment>
    );
  });
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>{bands}</div>;
};

const Mascot = ({ f }) => {
  const s = sceneOf(f);
  const lf = f - STARTS[s];
  const [pose, mood] = POSES[s];
  const k = 0.88 + 0.12 * pop(lf, 0, 10);
  return (
    <Art svg={mascot({ pose, mood, blink: f % 110 < 4 })} left={330} top={1330 + Math.sin(f / 12) * 6} width={435} height={580}
      style={{ transformOrigin: "50% 100%", transform: `scale(${k})`, filter: "drop-shadow(0 -6px 24px rgba(0,0,0,0.35))" }} />
  );
};

const Video = () => {
  const f = useCurrentFrame();
  const s = sceneOf(f);
  const lf = f - STARTS[s];
  const Scene = SCENES[s];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />
      <Scene lf={lf} f={f} />
      <Wipe f={f} />
      <Badge text={BADGES[s]} lf={lf} />
      {s === 2 ? <div style={{ position: "absolute", left: 600, right: 40, top: 1292, textAlign: "right", fontFamily: FONT, fontSize: 28, color: C.dim, opacity: fade(lf, 120, 150) }}>Illustration, not actual data</div> : null}
      <Subtitles />
      <Stepper step={STEP_OF_SCENE[s]} />
      <Mascot f={f} />
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <Composition id="Prices99" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
));
