import React from "react";
import {
  AbsoluteFill, Composition, Sequence, interpolate,
  registerRoot, spring, useCurrentFrame, useVideoConfig,
} from "remotion";
import { person, car, skyline, store, bill, coins, tag, bubble } from "./art";

const FPS = 30;
const sec = (n) => Math.round(n * FPS);
const C = { bg: "#0b1020", text: "#ffffff", gold: "#ffcc33", teal: "#35d0c0", red: "#ff5a6e", dim: "#7b86a8", road: "#1a2145" };
const FONT = "Arial, Helvetica, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const fade = (f, a, b) => interpolate(f, [a, b], [0, 1], clamp);
const PW = (h) => Math.round((h * 300) / 340);

const Art = ({ svg, left, top, width, height, style }) => (
  <div style={{ position: "absolute", left, top, width, height, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />
);

const Txt = ({ children, top, size, color = C.text, weight = 900, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT, fontWeight: weight, fontSize: size, color, ...style }}>
    {children}
  </div>
);

const Caption = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1360, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 56, lineHeight: 1.25, color: C.text, opacity: fade(f, 0, 8) }}>
      {text}
    </div>
  );
};

const Scene1 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 12 } });
  const x = interpolate(f, [0, 60], [-300, 330], clamp);
  const leg = Math.sin(f / 2.5) * 22 * (1 - fade(f, 50, 66));
  const tagPop = spring({ frame: Math.max(0, f - 55), fps, config: { damping: 12 } });
  return (
    <>
      <Txt top={420} size={90} weight={800} style={{ opacity: fade(f, 0, 8) }}>Why do prices end in</Txt>
      <Txt top={520} size={320} color={C.gold} style={{ transform: `scale(${pop})` }}>.99?</Txt>
      <Art svg={person({ leg, armL: 30, armR: 10 })} left={x} top={1130} width={PW(408)} height={408} />
      <Art svg={tag("$9.99", 46)} left={x + 230} top={1250} width={200} height={127} style={{ transform: `rotate(-10deg) scale(${tagPop})` }} />
    </>
  );
};

const Scene2 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: Math.max(0, f - 30), fps, config: { damping: 12 } });
  const dim = interpolate(f, [30, 60], [1, 0.25], clamp);
  const bub = spring({ frame: Math.max(0, f - 90), fps, config: { damping: 12 } });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", alignItems: "baseline", fontFamily: FONT, fontSize: 300, fontWeight: 900, color: C.text }}>
        <span style={{ opacity: dim }}>$</span>
        <span style={{ color: C.gold, display: "inline-block", transform: `scale(${1 + 0.25 * grow})`, transformOrigin: "bottom center" }}>4</span>
        <span style={{ opacity: dim }}>.99</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 710, display: "flex", justifyContent: "center", opacity: fade(f, 170, 190) }}>
        <div style={{ fontFamily: FONT, fontSize: 64, fontWeight: 800, color: C.gold, border: `4px solid ${C.gold}`, borderRadius: 24, padding: "12px 36px" }}>LEFT-DIGIT EFFECT</div>
      </div>
      <Art svg={person({ mood: "think", up: 5, armL: 6, armR: 6 })} left={110} top={960} width={PW(380)} height={380} style={{ opacity: fade(f, 0, 15) }} />
      <Art svg={bubble("$4")} left={330} top={850} width={330} height={259} style={{ transform: `scale(${bub})`, transformOrigin: "bottom left" }} />
      <Sequence from={0} durationInFrames={165}>
        <Caption text="Your brain reads prices left to right. So $4.99 feels like four dollars, not five." />
      </Sequence>
      <Sequence from={165}>
        <Caption text="Researchers call it the left-digit effect." />
      </Sequence>
    </>
  );
};

const Scene3 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(interpolate(f, [0, 50], [0, 21], clamp));
  const carX = interpolate(f, [0, 225], [-400, 1100]);
  const popAt = (start) => spring({ frame: Math.max(0, f - start), fps, config: { damping: 14 } });
  const L = [0, 1, 2, 3, 4, 5, 6, 7];
  const R = [0, 1, 2];
  return (
    <>
      <Txt top={290} size={170} color={C.gold}>{n} million</Txt>
      <Txt top={500} size={56} weight={700}>Lyft riders in the study</Txt>
      <Art svg={tag("$9.99", 46)} left={191} top={610} width={220} height={140} style={{ transform: `scale(${popAt(40)})` }} />
      <Art svg={tag("$10.00", 40)} left={726} top={610} width={220} height={140} style={{ transform: `scale(${popAt(40)})` }} />
      {L.map((i) => (
        <Art key={"l" + i} svg={person({ shirt: C.teal })} left={40 + (i % 4) * 130} top={770 + Math.floor(i / 4) * 165} width={PW(150)} height={150} style={{ transform: `scale(${popAt(60 + i * 4)})` }} />
      ))}
      {R.map((j) => (
        <Art key={"r" + j} svg={person({ shirt: C.red })} left={640 + j * 130} top={770} width={PW(150)} height={150} style={{ transform: `scale(${popAt(100 + j * 6)})` }} />
      ))}
      <Txt top={1105} size={36} weight={400} color={C.dim} style={{ opacity: fade(f, 120, 150) }}>Illustration, not actual data</Txt>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1338, height: 8, background: C.road }} />
      <Art svg={car({ rot: f * 12 })} left={carX} top={1215} width={330} height={136} />
      <Caption text="In a study of 21 million Lyft riders, demand dropped sharply when a fare crossed a whole-dollar mark." />
    </>
  );
};

const Scene4 = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [0, 60], [0, 160], clamp));
  const stack = Math.min(9, Math.max(1, Math.ceil(n / 18)));
  const bills = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <>
      {bills.map((i) => (
        <Art key={i} svg={bill()} left={40 + ((i * 197) % 880)} top={((f * (5 + (i % 3) * 2) + i * 230) % 1350) - 100} width={150} height={75}
          style={{ opacity: 0.5, transform: `rotate(${(i % 5 - 2) * 14 + Math.sin((f + i * 9) / 15) * 20}deg)` }} />
      ))}
      <Txt top={330} size={300} color={C.gold}>${n}M</Txt>
      <Txt top={700} size={64} weight={700} style={{ opacity: fade(f, 60, 80) }}>estimated extra profit per year</Txt>
      <Txt top={790} size={44} weight={400} color={C.dim} style={{ opacity: fade(f, 70, 90) }}>researchers’ estimate for Lyft</Txt>
      <Art svg={coins(stack)} left={450} top={1010} width={180} height={345} />
      <Caption text="Researchers estimated that 99-cent pricing could add about 160 million dollars a year in profit." />
    </>
  );
};

const Scene5 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 10 } });
  return (
    <>
      <Txt top={280} size={340} color={C.gold} style={{ transform: `scale(${pop})` }}>$9.99</Txt>
      <Txt top={700} size={84} weight={800} color={C.teal} style={{ opacity: fade(f, 40, 60) }}>a nudge for your brain</Txt>
      <Art svg={person({ shirt: C.gold, skin: "#d9a273", armR: 120 + Math.sin(f / 4) * 15 })} left={110} top={960} width={PW(380)} height={380} style={{ opacity: fade(f, 0, 15) }} />
      <Art svg={store()} left={560} top={990} width={420} height={350} style={{ opacity: fade(f, 10, 30) }} />
      <Caption text="So next time you see $9.99, remember: it’s a nudge for your brain." />
    </>
  );
};

const Scene6 = () => {
  const f = useCurrentFrame();
  const carX = interpolate(f, [0, 90], [-350, 650]);
  return (
    <>
      <Txt top={520} size={108} color={C.gold} style={{ opacity: fade(f, 0, 12) }}>Hidden Mechanics</Txt>
      <Txt top={680} size={64} weight={700} style={{ opacity: fade(f, 20, 36) }}>Follow for more</Txt>
      <Art svg={person({ shirt: C.red, skin: "#a8724a", armR: 125 + Math.sin(f / 3) * 18 })} left={110} top={930} width={PW(380)} height={380} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1318, height: 8, background: C.road }} />
      <Art svg={car({ color: C.teal, rot: f * 14 })} left={carX} top={1195} width={330} height={136} />
    </>
  );
};

const SCENES = [[Scene1, 3], [Scene2, 10], [Scene3, 7.5], [Scene4, 6.5], [Scene5, 5], [Scene6, 3]];
const TOTAL = SCENES.reduce((a, [, d]) => a + sec(d), 0);

const Video = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Art svg={skyline()} left={0} top={1500} width={1080} height={420} />
      {SCENES.map(([Scene, d], i) => {
        const start = from;
        from += sec(d);
        return (
          <Sequence key={i} from={start} durationInFrames={sec(d)}>
            <Scene />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <Composition id="Prices99" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
));
