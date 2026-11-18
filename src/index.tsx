import React from "react";
import { AbsoluteFill, Composition, interpolate, registerRoot, spring, useCurrentFrame } from "remotion";
import { person, car, store, bill, tag } from "./art";
import atlas from "./mascot.png";
import { Obj, Stage, Text3D, Coin3D, CoinPile, Box3D, Gear3D, Billboard, Floor, shake, Ring, Rays, Confetti, Stars, Flash, Vignette } from "./fx";

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
const BADGES = ["", "THE TRICK", "THE STUDY", "THE ESTIMATE", "THE TAKEAWAY", ""];


/* ---------- mascot atlas (one PNG with every pose and turnaround view) ---------- */
const AT = { w: 2400, h: 1590, pos: { talk: [0, 0, 942, 650], wow: [948, 0, 684, 608], present: [1638, 0, 658, 512], think: [0, 656, 492, 508], idea: [498, 656, 540, 518], front: [1044, 656, 360, 920], three: [1410, 656, 304, 932], side: [1720, 656, 224, 934], back: [1950, 656, 356, 924] } };
const spriteW = (name, h) => (AT.pos[name][2] * h) / AT.pos[name][3];
const Sprite = ({ name, h, style }) => {
  const [x, y, w, hh] = AT.pos[name];
  const k = h / hh;
  return <div style={{ width: w * k, height: h, backgroundImage: `url(${atlas})`, backgroundRepeat: "no-repeat", backgroundSize: `${AT.w * k}px ${AT.h * k}px`, backgroundPosition: `${-x * k}px ${-y * k}px`, ...style }} />;
};

/* which word is being spoken right now */
const lineState = (f) => {
  const t = f / FPS;
  let li = 0;
  LINES.forEach(([st], i) => { if (t >= st) li = i; });
  const [st, en, text] = LINES[li];
  const words = text.split(" ");
  const w = words.map((x) => x.length + 2);
  const total = w.reduce((a, b) => a + b, 0);
  const p = Math.min(0.999, Math.max(0, (t - st) / Math.max(0.1, en - st)));
  let acc = 0, cur = 0, curStart = 0;
  w.forEach((x, i) => { if (p >= acc / total) { cur = i; curStart = acc / total; } acc += x; });
  return { st, en, text, words, cur, wordFrame: (st + curStart * (en - st)) * FPS };
};
const speech = (f) => Math.exp(-(f - lineState(f).wordFrame) / 5);

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
  const { st, text, words, cur } = lineState(f);
  const size = text.length <= 40 ? 88 : text.length <= 75 ? 74 : 62;
  const lf = f - Math.round(st * FPS);
  const e = fade(lf, 0, 7);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 140, height: 380, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.16, opacity: e, transform: `translateY(${(1 - e) * 18}px)`, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
      <div>
        {words.map((x, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: size * 0.26, color: i === cur ? C.gold : C.text, opacity: i < cur ? 0.6 : i === cur ? 1 : 0.34, filter: i > cur ? "blur(3px)" : "none", transform: i === cur ? "scale(1.07)" : "scale(1)" }}>{x}</span>
        ))}
      </div>
    </div>
  );
};

const Badge = ({ text, lf }) =>
  text ? (
    <div style={{ position: "absolute", left: 60, top: 592, padding: "8px 24px", borderRadius: 999, background: C.teal, color: C.ink, fontFamily: FONT, fontSize: 32, fontWeight: 900, letterSpacing: 1.5, opacity: fade(lf, 4, 14), transform: `translateX(${(1 - ease(fade(lf, 4, 16))) * -80}px)` }}>{text}</div>
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
  const cam = { z: L(lf, 0, 90, -260, 0), rx: -9 + shake(lf, 8, 1.2), ry: L(lf, 0, 90, -14, 0) + shake(lf, 8, 1.6) };
  const tags = [["$9.99", -300, -250, 110, -10, 0], ["$19.99", 300, -250, 70, 8, 8], ["$4.99", -280, 200, 210, -4, 16]];
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 4} />
      <Backdrop f={f} />
      {lf >= 6 && lf < 42 ? <Obj x={0} y={0} z={-60}><Ring t={fade(lf, 6, 40)} size={640} /></Obj> : null}
      {lf >= 6 && lf < 50 ? <Obj x={0} y={0} z={-80}><Rays t={fade(lf, 6, 48)} size={900} /></Obj> : null}
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
  const cam = { z: L(lf, 0, 300, -40, 60), rx: -9 + shake(lf, 40, 1) + shake(lf, 132, 1.2), ry: L(lf, 0, 300, -12, 12) + shake(lf, 40, 1.4) };
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
      {lf >= 38 && lf < 80 ? <Obj x={-30} y={-140} z={120}><Ring t={fade(lf, 38, 78)} size={420} color="255,204,51" width={8} /></Obj> : null}
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
      {lf >= 134 && lf < 170 ? <Obj x={372} y={40} z={30}><Ring t={fade(lf, 134, 168)} size={260} color="255,204,51" width={6} /></Obj> : null}
      <Obj x={372} y={-25} z={40} s={Math.max(pin, 0.001)}><Text3D text="$4.99" size={58} depth={20} layers={8} /></Obj>
      <Billboard x={0} y={95} z={50} cam={cam} style={{ opacity: fade(lf, 150, 185) }}>
        <svg width="760" height="140" viewBox="0 0 760 140">
          <path d="M752 10 C 640 130, 250 130, 22 20" fill="none" stroke={C.gold} strokeWidth="6" strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-f * 1.5} />
          <path d="M10 32 L8 0 L44 12 Z" fill={C.gold} />
        </svg>
      </Billboard>
      <Obj x={0} y={190} z={60} s={Math.max(ease(fade(lf, 160, 190)), 0.001)}><Text3D text="feels like $4" size={64} depth={22} layers={8} /></Obj>
      <Obj x={70} y={-318} z={90} rx={(1 - flip) * -90} s={Math.max(flip, 0.001)}>
        <Box3D w={600} h={66} d={24} color={C.gold} shade="#a86f00" topColor="#fff0a0">
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.ink, letterSpacing: 2, whiteSpace: "nowrap" }}>LEFT-DIGIT EFFECT</span>
        </Box3D>
      </Obj>
    </Stage>
  );
};

const S3 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 225, 0, 60), rx: -12 + shake(lf, 36, 1), ry: L(lf, 0, 225, -24, 12) + shake(lf, 36, 1.2) };
  const hL = ease(fade(lf, 0, 34)) * 280;
  const hR = ease(fade(lf, 6, 40)) * 120;
  const carX = L(lf, 0, 225, -760, 760);
  const lp = [];
  for (let i = 0; i < 8; i++) lp.push([(i % 4 - 1.5) * 46, Math.floor(i / 4) * 70 - 35, 30 + i * 3]);
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
        <Billboard key={"r" + j} x={250 + (j - 1) * 56} y={FLOOR - hR - 38} z={0} cam={cam} s={pop(lf, 50 + j * 5, 14)}>
          <Spr svg={person({ shirt: C.red })} w={74} h={84} />
        </Billboard>
      ))}
      <Obj x={-250} y={FLOOR - hL - 130} z={0} ry={Math.sin(f / 30) * 8} s={pop(lf, 14, 10)}><Text3D text="$9.99" size={84} depth={26} layers={10} /></Obj>
      <Obj x={250} y={FLOOR - hR - 130} z={0} ry={Math.sin(f / 30 + 1) * 8} s={pop(lf, 24, 10)}><Text3D text="$10.00" size={78} face={["#ffd0d6", "#ff8d9c", "#e0475c"]} side="#8f2438" depth={26} layers={10} /></Obj>
      <Obj x={0} y={-320} z={40} s={pop(lf, 0, 10)} ry={Math.sin(f / 26) * 8}><Text3D text="21M" size={140} depth={50} layers={14} /></Obj>
      <Billboard x={0} y={-232} z={40} cam={cam}><div style={{ ...NW, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.text }}>riders in the study</div></Billboard>
      <Billboard x={0} y={100} z={230} cam={cam} style={{ opacity: fade(lf, 120, 140) }}>
        <Chip bg={C.red} color="#fff" size={32}>demand drops &darr;</Chip>
      </Billboard>
      <Billboard x={carX} y={FLOOR - 62} z={-320} cam={cam}><Spr svg={car({ rot: f * 12 })} w={300} h={124} /></Billboard>
    </Stage>
  );
};

const S4 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 195, -80, 120), rx: -8 + shake(lf, 60, 1.4), ry: Math.sin(lf / 40) * 9 + shake(lf, 60, 1.8) };
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
      {lf >= 58 && lf < 110 ? <Obj x={0} y={-185} z={-80}><Rays t={fade(lf, 58, 108)} size={1000} /></Obj> : null}
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
  const cam = { z: L(lf, 0, 150, 0, 60), rx: -10 + shake(lf, 86, 1), ry: L(lf, 0, 150, 10, -10) + shake(lf, 86, 1.4) };
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
      {lf >= 74 && lf < 110 ? <Obj x={0} y={-110} z={100}><Ring t={fade(lf, 74, 108)} size={520} color="53,208,192" width={8} /></Obj> : null}
      <Obj x={0} y={-110} z={130} rx={(1 - flip) * 90} s={Math.max(flip, 0.001)}>
        <Box3D w={600} h={74} d={24} color={C.teal} shade="#1f8b80" topColor="#9ff5ec">
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: C.ink, whiteSpace: "nowrap" }}>a nudge for your brain</span>
        </Box3D>
      </Obj>
    </Stage>
  );
};

/* full-body turntable built from the front / 3/4 / side / back views */
const TURN = [["front", 0, 1], ["three", 45, 1], ["side", 90, 1], ["back", 180, 1], ["side", 270, -1], ["three", 315, -1]];
const Turn = ({ theta, h }) => {
  let best = TURN[0], bd = 999;
  TURN.forEach((v) => {
    const d = ((theta - v[1] + 540) % 360) - 180;
    if (Math.abs(d) < Math.abs(bd)) { bd = d; best = v; }
  });
  return (
    <div style={{ width: 340, height: h, display: "flex", justifyContent: "center", alignItems: "flex-end", transformStyle: "preserve-3d" }}>
      <div style={{ transform: `rotateY(${bd * 0.85}deg) scaleX(${best[2]})`, filter: "drop-shadow(0 0 14px rgba(53,208,192,0.55))" }}><Sprite name={best[0]} h={h} /></div>
    </div>
  );
};

const S6 = ({ lf, f }) => {
  const cam = { z: L(lf, 0, 90, 60, -90), rx: -7 + shake(lf, 70, 1.2), ry: Math.sin(lf / 22) * 5 };
  const theta = L(lf, 6, 70, 0, 360);
  const coins = [];
  for (let i = 0; i < 6; i++) {
    const y = ((lf * (5 + (i % 3) * 2) + i * 190) % 1200) - 600;
    coins.push(<Obj key={i} x={-420 + ((i * 163) % 840)} y={y} z={-100 + (i % 3) * 140} s={0.7}><Coin3D size={100} spin={lf * (7 + (i % 3) * 2) + i * 40} tilt={16 * Math.sin(lf / 18 + i)} /></Obj>);
  }
  return (
    <Stage cam={cam}>
      <Floor y={FLOOR} scroll={f * 4} />
      <Backdrop f={f} />
      <Obj x={0} y={-40} z={-380}><Gear3D size={560} spin={f * 0.8} color="#6d4f08" front="#a67a0c" depth={70} /></Obj>
      <Obj x={0} y={-335} z={0} s={pop(lf, 0, 10)} ry={Math.sin(lf / 14) * 8}><Text3D text="Hidden Mechanics" size={104} depth={44} layers={14} /></Obj>
      <Billboard x={0} y={-250} z={30} cam={cam} style={{ opacity: fade(lf, 22, 38) }}><div style={{ ...NW, fontFamily: FONT, fontWeight: 800, fontSize: 48, color: "#c4cbe6" }}>@hiddenmechanicsfacts</div></Billboard>
      <Obj x={0} y={FLOOR} z={0} rx={90}>
        <div style={{ width: 430, height: 430, borderRadius: "50%", border: "6px solid rgba(53,208,192,0.9)", boxShadow: "0 0 40px rgba(53,208,192,0.7), inset 0 0 50px rgba(53,208,192,0.4)", background: "radial-gradient(circle, rgba(53,208,192,0.30), rgba(10,20,50,0.2) 70%)", boxSizing: "border-box" }} />
      </Obj>
      {coins}
      <Billboard x={0} y={FLOOR - 255} z={20} cam={cam} s={pop(lf, 2, 10)}><Turn theta={theta} h={510} /></Billboard>
    </Stage>
  );
};

const SCENES = [S1, S2, S3, S4, S5, S6];

/* ---------- mascot "host window" with pop-out character ---------- */
const HOST = { left: 190, top: 1335, w: 700, h: 430 };
const POSE = { present: { h: 500, dx: -12 }, think: { h: 500, dx: 0 }, idea: { h: 520, dx: 4 }, talk: { h: 540, dx: -36 }, wow: { h: 520, dx: 0 } };
const EVENTS = [[0, "wow"], [STARTS[1], "present"], [STARTS[1] + 190, "idea"], [STARTS[2], "think"], [STARTS[2] + 135, "wow"], [STARTS[3], "talk"], [STARTS[4], "idea"], [STARTS[4] + 85, "present"]];
const CLIP = `polygon(-2000px -2000px, 3000px -2000px, 3000px ${HOST.h}px, -2000px ${HOST.h}px)`;

const PoseImg = ({ pose, style }) => {
  const c = POSE[pose];
  const sw = spriteW(pose, c.h);
  return <div style={{ position: "absolute", left: (HOST.w - sw) / 2 + c.dx, top: HOST.h - c.h, width: sw, height: c.h, ...style }}><Sprite name={pose} h={c.h} /></div>;
};

const Corner = ({ x, y, rx, ry }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 44, height: 44, borderTop: ry ? "none" : "5px solid #35d0c0", borderBottom: ry ? "5px solid #35d0c0" : "none", borderLeft: rx ? "none" : "5px solid #35d0c0", borderRight: rx ? "5px solid #35d0c0" : "none", borderRadius: 6, filter: "drop-shadow(0 0 8px #35d0c0)" }} />
);

const Emotion = ({ pose, age, f }) => {
  const k = pop(age, 4, 9);
  if (pose === "think")
    return <div style={{ position: "absolute", left: 548, top: -120 + Math.sin(f / 9) * 10, fontFamily: FONT, fontWeight: 900, fontSize: 170, color: "#35d0c0", textShadow: "0 0 34px #35d0c0, 0 0 8px #fff", transform: `scale(${k}) rotate(${Math.sin(f / 12) * 8}deg)` }}>?</div>;
  if (pose === "wow")
    return (
      <>
        <div style={{ position: "absolute", left: 560, top: -110 + Math.sin(f / 7) * 8, fontFamily: FONT, fontWeight: 900, fontSize: 170, color: "#ffcc33", textShadow: "0 0 34px #ff9a00, 0 0 8px #fff", transform: `scale(${k}) rotate(${10 + Math.sin(f / 8) * 6}deg)` }}>!</div>
        {age < 40 ? <div style={{ position: "absolute", left: 350, top: 130, transform: "translate(-50%,-50%)" }}><Ring t={fade(age, 0, 38)} size={420} color="255,204,51" width={8} /></div> : null}
      </>
    );
  if (pose === "idea")
    return <div style={{ position: "absolute", left: 556, top: -28, transform: "translate(-50%,-50%)" }}><Rays t={(age % 60) / 60} size={330} color="255,226,120" /></div>;
  return null;
};

const Host = ({ f }) => {
  const s = sceneOf(f);
  let idx = 0;
  EVENTS.forEach(([fr], i) => { if (f >= fr) idx = i; });
  const [fr, pose] = EVENTS[idx];
  const prev = EVENTS[Math.max(0, idx - 1)][1];
  const age = f - fr;
  const exit = s === 5 ? ease(fade(f - STARTS[5], 0, 14)) : 0;
  const sp = speech(f);
  const inK = pop(age, 0, 10);
  return (
    <div style={{ position: "absolute", left: HOST.left, top: HOST.top + exit * 820, width: HOST.w, height: HOST.h, perspective: 1300 }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateY(${Math.sin(f / 18) * 4}px) rotateY(${Math.sin(f / 42) * 7}deg) rotateX(${Math.sin(f / 57) * 2.5}deg)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, border: "3px solid rgba(53,208,192,0.9)", background: "linear-gradient(165deg, rgba(26,56,118,0.94), rgba(7,14,38,0.96))", boxShadow: "0 0 44px rgba(53,208,192,0.5), inset 0 0 70px rgba(53,208,192,0.2)", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "50%", top: "62%", width: 1000, height: 1000, marginLeft: -500, marginTop: -500, background: "repeating-conic-gradient(rgba(255,255,255,0.07) 0deg 7deg, transparent 7deg 18deg)", transform: `rotate(${f * 0.35}deg)` }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 2px, transparent 2px)", backgroundSize: "34px 34px" }} />
          <div style={{ position: "absolute", left: 26, bottom: 22, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 900, fontSize: 24, letterSpacing: 3, color: "#7fe9de" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5a6e", boxShadow: "0 0 12px #ff5a6e", opacity: 0.6 + 0.4 * Math.sin(f / 6) }} />HOST
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, transform: "translateZ(30px)", clipPath: CLIP }}>
          <PoseImg pose={pose} style={{ transform: `translate(14px, 12px)`, filter: "brightness(0) blur(7px)", opacity: 0.42 * fade(age, 0, 5) }} />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: "translateZ(70px)", clipPath: CLIP }}>
          {age < 7 ? <PoseImg pose={prev} style={{ opacity: 1 - fade(age, 0, 6) }} /> : null}
          <PoseImg pose={pose} style={{ opacity: fade(age, 0, 4), transformOrigin: "50% 100%", transform: `scale(${(0.82 + 0.18 * inK) * (1 + 0.03 * sp)}) translateY(${-9 * sp}px) rotate(${(1 - inK) * -4}deg)`, filter: "drop-shadow(0 0 10px rgba(53,208,192,0.45))" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: "translateZ(110px)" }}>
          <Emotion pose={pose} age={age} f={f} />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: "translateZ(40px)" }}>
          <Corner x={14} y={14} rx={0} ry={0} /><Corner x={642} y={14} rx={1} ry={0} /><Corner x={14} y={372} rx={0} ry={1} /><Corner x={642} y={372} rx={1} ry={1} />
        </div>
      </div>
    </div>
  );
};

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
      <Vignette />
      <Badge text={BADGES[s]} lf={lf} />
      {s === 2 ? <div style={{ position: "absolute", left: 600, right: 40, top: 1295, textAlign: "right", fontFamily: FONT, fontSize: 28, color: C.dim, opacity: fade(lf, 120, 150) }}>Illustration, not actual data</div> : null}
      <Subtitles />
      <Host f={f} />
      <Confetti f={f} start={STARTS[0] + 8} n={34} cx={540} cy={990} life={70} seed={1} />
      <Stars f={f} start={STARTS[1] + 40} n={12} cx={500} cy={850} spread={260} life={50} seed={2} />
      <Stars f={f} start={STARTS[2] + 36} n={14} cx={540} cy={1050} spread={420} life={60} seed={3} />
      <Confetti f={f} start={STARTS[3] + 60} n={70} cx={540} cy={800} life={90} seed={4} />
      <Flash f={f} start={STARTS[3] + 60} strength={0.45} />
      <Stars f={f} start={STARTS[4] + 74} n={14} cx={540} cy={980} spread={380} life={60} seed={5} />
      <Confetti f={f} start={STARTS[5] + 70} n={80} cx={540} cy={980} life={100} seed={6} power={1.15} />
      <Flash f={f} start={STARTS[5] + 70} strength={0.4} />
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <Composition id="Prices99" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
));
