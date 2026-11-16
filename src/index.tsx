import React from "react";
import {
  AbsoluteFill, Composition, Sequence, interpolate,
  registerRoot, spring, useCurrentFrame, useVideoConfig,
} from "remotion";

const FPS = 30;
const sec = (n) => Math.round(n * FPS);
const C = { bg: "#0b1020", text: "#ffffff", gold: "#ffcc33", teal: "#35d0c0", red: "#ff5a6e", dim: "#7b86a8" };
const FONT = "Arial, Helvetica, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const fade = (f, a, b) => interpolate(f, [a, b], [0, 1], clamp);

const Center = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: C.text, textAlign: "center", paddingBottom: 200 }}>
    {children}
  </AbsoluteFill>
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
  return (
    <Center>
      <div style={{ fontSize: 90, fontWeight: 800, opacity: fade(f, 0, 8) }}>Why do prices end in</div>
      <div style={{ fontSize: 320, fontWeight: 900, color: C.gold, transform: `scale(${pop})` }}>.99?</div>
    </Center>
  );
};

const Scene2 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: Math.max(0, f - 30), fps, config: { damping: 12 } });
  const dim = interpolate(f, [30, 60], [1, 0.25], clamp);
  return (
    <>
      <Center>
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 300, fontWeight: 900 }}>
          <span style={{ opacity: dim }}>$</span>
          <span style={{ color: C.gold, display: "inline-block", transform: `scale(${1 + 0.25 * grow})`, transformOrigin: "bottom center" }}>4</span>
          <span style={{ opacity: dim }}>.99</span>
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, color: C.teal, opacity: fade(f, 90, 110) }}>feels like $4</div>
        <div style={{ marginTop: 40, fontSize: 64, fontWeight: 800, color: C.gold, border: `4px solid ${C.gold}`, borderRadius: 24, padding: "12px 36px", opacity: fade(f, 170, 190) }}>
          LEFT-DIGIT EFFECT
        </div>
      </Center>
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
  const n = Math.round(interpolate(f, [0, 50], [0, 21], clamp));
  const h1 = interpolate(f, [60, 90], [0, 340], clamp);
  const h2 = interpolate(f, [100, 130], [0, 170], clamp);
  const bar = (h, color, label) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
      <div style={{ width: 220, height: h, background: color, borderRadius: 16 }} />
      <div style={{ marginTop: 16, fontSize: 56, fontWeight: 800 }}>{label}</div>
    </div>
  );
  return (
    <>
      <Center>
        <div style={{ fontSize: 200, fontWeight: 900, color: C.gold }}>{n} million</div>
        <div style={{ fontSize: 60, fontWeight: 700 }}>Lyft riders in the study</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 140, height: 440, marginTop: 40 }}>
          {bar(h1, C.teal, "$9.99")}
          {bar(h2, C.red, "$10.00")}
        </div>
        <div style={{ marginTop: 12, fontSize: 36, color: C.dim, opacity: fade(f, 100, 130) }}>Illustration, not actual data</div>
      </Center>
      <Caption text="In a study of 21 million Lyft riders, demand dropped sharply when a fare crossed a whole-dollar mark." />
    </>
  );
};

const Scene4 = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [0, 60], [0, 160], clamp));
  return (
    <>
      <Center>
        <div style={{ fontSize: 300, fontWeight: 900, color: C.gold }}>${n}M</div>
        <div style={{ fontSize: 64, fontWeight: 700, opacity: fade(f, 60, 80) }}>estimated extra profit per year</div>
        <div style={{ marginTop: 20, fontSize: 44, color: C.dim, opacity: fade(f, 70, 90) }}>researchers’ estimate for Lyft</div>
      </Center>
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
      <Center>
        <div style={{ fontSize: 340, fontWeight: 900, color: C.gold, transform: `scale(${pop})` }}>$9.99</div>
        <div style={{ fontSize: 84, fontWeight: 800, color: C.teal, opacity: fade(f, 40, 60) }}>a nudge for your brain</div>
      </Center>
      <Caption text="So next time you see $9.99, remember: it’s a nudge for your brain." />
    </>
  );
};

const Scene6 = () => {
  const f = useCurrentFrame();
  return (
    <Center>
      <div style={{ fontSize: 108, fontWeight: 900, color: C.gold, opacity: fade(f, 0, 12) }}>Hidden Mechanics</div>
      <div style={{ fontSize: 64, fontWeight: 700, marginTop: 20, opacity: fade(f, 20, 36) }}>Follow for more</div>
    </Center>
  );
};

const SCENES = [[Scene1, 3], [Scene2, 10], [Scene3, 7.5], [Scene4, 6.5], [Scene5, 5], [Scene6, 3]];
const TOTAL = SCENES.reduce((a, [, d]) => a + sec(d), 0);

const Video = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
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
