import React from "react";
import { AbsoluteFill, Composition, Sequence, interpolate, registerRoot, spring, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { tag, bubble } from "./art";

const FPS = 30;
const INK = "#10162e";
const C = { bg: "#0b1020", text: "#ffffff", gold: "#ffcc33", teal: "#35d0c0", red: "#ff5a6e", dim: "#7b86a8" };
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

/* ---------- 3D building blocks ---------- */
const Part = ({ geo, color, outline = 1.07, ...p }) => (
  <group {...p}>
    <mesh>{geo}<meshToonMaterial color={color} /></mesh>
    <mesh scale={outline}>{geo}<meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
  </group>
);
const cap = (r, l) => <capsuleGeometry args={[r, l, 8, 16]} />;
const box = (x, y, z) => <boxGeometry args={[x, y, z]} />;

const Hero = ({ shirt = "#35d0c0", skin = "#f2c9a0", pants = "#2b3a67", hair = "#2a2018", walk = 0, armL = -0.2, armR = 0.2, bob = 0, mood = "smile", children }) => (
  <group position={[0, bob, 0]}>
    <group position={[-0.22, 1.0, 0]} rotation={[walk, 0, 0]}><Part position={[0, -0.45, 0]} geo={cap(0.15, 0.6)} color={pants} /></group>
    <group position={[0.22, 1.0, 0]} rotation={[-walk, 0, 0]}><Part position={[0, -0.45, 0]} geo={cap(0.15, 0.6)} color={pants} /></group>
    <Part position={[0, 1.4, 0]} geo={cap(0.42, 0.5)} color={shirt} />
    <group position={[-0.5, 1.8, 0]} rotation={[0, 0, armL]}><Part position={[0, -0.36, 0]} geo={cap(0.11, 0.5)} color={shirt} /></group>
    <group position={[0.5, 1.8, 0]} rotation={[0, 0, armR]}><Part position={[0, -0.36, 0]} geo={cap(0.11, 0.5)} color={shirt} /></group>
    <Part position={[0, 2.3, 0]} geo={<sphereGeometry args={[0.5, 32, 32]} />} color={skin} />
    <Part position={[0, 2.32, 0]} rotation={[-0.35, 0, 0]} outline={1.03} geo={<sphereGeometry args={[0.53, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />} color={hair} />
    <mesh position={[-0.17, 2.35, 0.45]}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color={INK} /></mesh>
    <mesh position={[0.17, 2.35, 0.45]}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color={INK} /></mesh>
    {mood === "think" ? (
      <mesh position={[0, 2.2, 0.48]}><boxGeometry args={[0.18, 0.03, 0.02]} /><meshBasicMaterial color="#5a2a2a" /></mesh>
    ) : (
      <mesh position={[0, 2.2, 0.47]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} /><meshBasicMaterial color="#5a2a2a" /></mesh>
    )}
    {children}
  </group>
);

const Bag = () => (
  <group position={[-0.64, 0.9, 0.1]}>
    <Part geo={box(0.34, 0.4, 0.22)} color={C.gold} />
  </group>
);

const Car = ({ color = C.gold, rot = 0 }) => (
  <group>
    <Part position={[0, 0.5, 0]} geo={box(2.6, 0.5, 1.1)} color={color} />
    <Part position={[-0.1, 0.95, 0]} geo={box(1.4, 0.45, 1.0)} color={color} />
    <mesh position={[-0.1, 0.97, 0]}><boxGeometry args={[1.2, 0.3, 1.02]} /><meshBasicMaterial color="#bfe6ff" /></mesh>
    <mesh position={[0.1, 0.98, 0.52]}><sphereGeometry args={[0.15, 16, 16]} /><meshToonMaterial color="#f2c9a0" /></mesh>
    <mesh position={[1.31, 0.5, 0.3]}><boxGeometry args={[0.04, 0.12, 0.2]} /><meshBasicMaterial color="#fff6b0" /></mesh>
    <mesh position={[1.31, 0.5, -0.3]}><boxGeometry args={[0.04, 0.12, 0.2]} /><meshBasicMaterial color="#fff6b0" /></mesh>
    {[[-0.85, 0.5], [0.85, 0.5], [-0.85, -0.5], [0.85, -0.5]].map(([x, z], i) => (
      <group key={i} position={[x, 0.28, z]} rotation={[0, 0, -rot]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.2, 24]} /><meshToonMaterial color={INK} /></mesh>
        <mesh position={[0, 0, z > 0 ? 0.11 : -0.11]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.02, 16]} /><meshToonMaterial color="#8791b3" /></mesh>
      </group>
    ))}
  </group>
);

const Store = () => (
  <group>
    <Part position={[0, 0.7, 0]} geo={box(1.5, 1.4, 0.9)} color="#2b3a67" />
    <Part position={[0, 1.45, 0.1]} geo={box(1.7, 0.14, 1.1)} color={C.red} />
    <Part position={[0, 1.85, 0.2]} geo={box(1.0, 0.28, 0.1)} color={C.gold} />
    <Part position={[0.4, 0.4, 0.47]} geo={box(0.4, 0.8, 0.05)} color={INK} />
    <Part position={[-0.35, 0.6, 0.47]} geo={box(0.6, 0.5, 0.05)} color="#bfe6ff" />
  </group>
);

const City = () => (
  <group position={[0, 0, -8]}>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const h = 1.4 + ((i * 7) % 5) * 0.55;
      return (
        <group key={i} position={[-4.2 + i * 1.2, 0, 0]}>
          <mesh position={[0, h / 2, 0]}><boxGeometry args={[1.05, h, 1]} /><meshBasicMaterial color="#121a36" /></mesh>
          {[0, 1, 2, 3, 4, 5].map((k) =>
            k * 0.45 + 0.5 < h ? (
              <mesh key={k} position={[((k % 2) - 0.5) * 0.45, 0.5 + k * 0.45, 0.51]}>
                <planeGeometry args={[0.2, 0.26]} />
                <meshBasicMaterial color={C.gold} transparent opacity={(i + k * 3) % 4 === 0 ? 0.45 : 0.1} />
              </mesh>
            ) : null
          )}
        </group>
      );
    })}
  </group>
);

const Coins = ({ n }) => (
  <group>
    {Array.from({ length: n }).map((_, i) => (
      <Part key={i} position={[0, 0.07 + i * 0.14, 0]} geo={<cylinderGeometry args={[0.5, 0.5, 0.12, 40]} />} color={C.gold} outline={1.05} />
    ))}
  </group>
);

const Bill = ({ x, y, z, rx, rz }) => (
  <mesh position={[x, y, z]} rotation={[rx, 0, rz]}><boxGeometry args={[0.55, 0.03, 0.28]} /><meshToonMaterial color="#3fbf7f" /></mesh>
);

/* ---------- 3D world: picks content by scene ---------- */
const World = () => {
  const f = useCurrentFrame();
  const s = sceneOf(f);
  const lf = f - STARTS[s];
  const bob = Math.sin(f / 15) * 0.03;
  let content = null;

  if (s === 0) {
    const x = interpolate(lf, [0, 60], [-4, -0.6], clamp);
    const walk = Math.sin(lf / 2.5) * 0.6 * (1 - fade(lf, 50, 66));
    content = (
      <group position={[x, 0, 0.6]} scale={0.65}>
        <Hero walk={walk} armL={-0.3} armR={0.3} bob={bob}><Bag /></Hero>
      </group>
    );
  } else if (s === 1) {
    content = (
      <group position={[-0.9, 0, 0.6]} scale={0.65}>
        <Hero mood="think" armL={-0.1} armR={0.1} bob={bob} />
      </group>
    );
  } else if (s === 2) {
    const people = [];
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 4; k++) {
        const i = r * 4 + k;
        people.push(
          <group key={"l" + i} position={[-2.0 + k * 0.55 + r * 0.27, 0, 0.7 - r * 1.1]} scale={0.42 * pop(lf, 60 + i * 4, 14)}>
            <Hero shirt={C.teal} />
          </group>
        );
      }
    for (let j = 0; j < 3; j++)
      people.push(
        <group key={"r" + j} position={[0.7 + j * 0.55, 0, 0.7]} scale={0.42 * pop(lf, 100 + j * 6, 14)}>
          <Hero shirt={C.red} />
        </group>
      );
    const carX = interpolate(lf, [0, 225], [-5, 5]);
    content = (
      <>
        {people}
        <group position={[carX, 0, -2.5]} scale={0.8}><Car rot={lf * 0.25} /></group>
      </>
    );
  } else if (s === 3) {
    const n = Math.round(interpolate(lf, [0, 60], [0, 160], clamp));
    const stack = Math.min(9, Math.max(1, Math.ceil(n / 18)));
    const bills = [];
    for (let i = 0; i < 10; i++)
      bills.push(
        <Bill key={i} x={-2 + (((i * 197) % 880) / 880) * 4} y={6 - ((lf * (0.045 + (i % 3) * 0.015) + i * 0.9) % 9)} z={-1 + (i % 3) * 0.8}
          rx={lf * 0.03 + i} rz={lf * 0.02 * (i % 2 ? 1 : -1) + i * 0.5} />
      );
    content = (
      <>
        {bills}
        <group position={[0, 0, 0.5]} scale={1.1}><Coins n={stack} /></group>
      </>
    );
  } else if (s === 4) {
    content = (
      <>
        <group position={[-0.9, 0, 0.6]} scale={0.65}>
          <Hero shirt={C.gold} skin="#d9a273" armL={-0.2} armR={2.2 + Math.sin(lf / 4) * 0.3} bob={bob} />
        </group>
        <group position={[1.05, 0, -0.3]} scale={0.9}><Store /></group>
      </>
    );
  } else {
    const carX = interpolate(lf, [0, 90], [-5, 4]);
    content = (
      <>
        <group position={[-1.1, 0, 0.6]} scale={0.65}>
          <Hero shirt={C.red} skin="#a8724a" armL={-0.2} armR={2.2 + Math.sin(lf / 3) * 0.35} bob={bob} />
        </group>
        <group position={[carX, 0, -1.5]} scale={0.8}><Car color={C.teal} rot={lf * 0.3} /></group>
      </>
    );
  }

  return (
    <>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 6, 6]} intensity={2.6} />
      <mesh position={[0, -0.1, -3]}><boxGeometry args={[16, 0.2, 14]} /><meshToonMaterial color="#111835" /></mesh>
      <City />
      {content}
    </>
  );
};

/* ---------- 2D text overlays ---------- */
const Art = ({ svg, left, top, width, height, style }) => (
  <div style={{ position: "absolute", left, top, width, height, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />
);
const Txt = ({ children, top, size, color = C.text, weight = 900, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT, fontWeight: weight, fontSize: size, color, ...style }}>{children}</div>
);
const Caption = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1360, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 56, lineHeight: 1.25, color: C.text, opacity: fade(f, 0, 8) }}>{text}</div>
  );
};

const Ov1 = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Txt top={420} size={90} weight={800} style={{ opacity: fade(f, 0, 8) }}>Why do prices end in</Txt>
      <Txt top={520} size={320} color={C.gold} style={{ transform: `scale(${pop(f, 0)})` }}>.99?</Txt>
    </>
  );
};

const Ov2 = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [30, 60], [1, 0.25], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", alignItems: "baseline", fontFamily: FONT, fontSize: 300, fontWeight: 900, color: C.text }}>
        <span style={{ opacity: dim }}>$</span>
        <span style={{ color: C.gold, display: "inline-block", transform: `scale(${1 + 0.25 * pop(f, 30)})`, transformOrigin: "bottom center" }}>4</span>
        <span style={{ opacity: dim }}>.99</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 710, display: "flex", justifyContent: "center", opacity: fade(f, 170, 190) }}>
        <div style={{ fontFamily: FONT, fontSize: 64, fontWeight: 800, color: C.gold, border: `4px solid ${C.gold}`, borderRadius: 24, padding: "12px 36px" }}>LEFT-DIGIT EFFECT</div>
      </div>
      <Art svg={bubble("$4")} left={380} top={640} width={330} height={259} style={{ transform: `scale(${pop(f, 90)})`, transformOrigin: "bottom left" }} />
      <Sequence from={0} durationInFrames={165}><Caption text="Your brain reads prices left to right. So $4.99 feels like four dollars, not five." /></Sequence>
      <Sequence from={165}><Caption text="Researchers call it the left-digit effect." /></Sequence>
    </>
  );
};

const Ov3 = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [0, 50], [0, 21], clamp));
  return (
    <>
      <Txt top={290} size={170} color={C.gold}>{n} million</Txt>
      <Txt top={500} size={56} weight={700}>Lyft riders in the study</Txt>
      <Txt top={600} size={36} weight={400} color={C.dim} style={{ opacity: fade(f, 120, 150) }}>Illustration, not actual data</Txt>
      <Art svg={tag("$9.99", 46)} left={150} top={870} width={220} height={140} style={{ transform: `scale(${pop(f, 40)})` }} />
      <Art svg={tag("$10.00", 40)} left={722} top={870} width={220} height={140} style={{ transform: `scale(${pop(f, 40)})` }} />
      <Caption text="In a study of 21 million Lyft riders, demand dropped sharply when a fare crossed a whole-dollar mark." />
    </>
  );
};

const Ov4 = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [0, 60], [0, 160], clamp));
  return (
    <>
      <Txt top={330} size={300} color={C.gold}>${n}M</Txt>
      <Txt top={700} size={64} weight={700} style={{ opacity: fade(f, 60, 80) }}>estimated extra profit per year</Txt>
      <Txt top={790} size={44} weight={400} color={C.dim} style={{ opacity: fade(f, 70, 90) }}>researchers’ estimate for Lyft</Txt>
      <Caption text="Researchers estimated that 99-cent pricing could add about 160 million dollars a year in profit." />
    </>
  );
};

const Ov5 = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Txt top={280} size={340} color={C.gold} style={{ transform: `scale(${pop(f, 0, 10)})` }}>$9.99</Txt>
      <Txt top={700} size={84} weight={800} color={C.teal} style={{ opacity: fade(f, 40, 60) }}>a nudge for your brain</Txt>
      <Caption text="So next time you see $9.99, remember: it’s a nudge for your brain." />
    </>
  );
};

const Ov6 = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Txt top={520} size={108} color={C.gold} style={{ opacity: fade(f, 0, 12) }}>Hidden Mechanics</Txt>
      <Txt top={680} size={64} weight={700} style={{ opacity: fade(f, 20, 36) }}>Follow for more</Txt>
    </>
  );
};

const OVERLAYS = [Ov1, Ov2, Ov3, Ov4, Ov5, Ov6];

const Video = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <ThreeCanvas width={1080} height={1920} flat camera={{ position: [0, 1.62, 13], fov: 35, rotation: [0, 0, 0] }}>
      <World />
    </ThreeCanvas>
    {OVERLAYS.map((Ov, i) => (
      <Sequence key={i} from={STARTS[i]} durationInFrames={FR[i]}><Ov /></Sequence>
    ))}
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition id="Prices3D" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
));
