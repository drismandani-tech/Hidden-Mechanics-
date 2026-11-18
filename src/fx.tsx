import React from "react";

const FONT = "Arial, Helvetica, sans-serif";
const P3 = { transformStyle: "preserve-3d" };

/* position any object in 3D space (relative to stage centre) */
export const Obj = ({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, children, style }) => (
  <div style={{ position: "absolute", left: "50%", top: "50%", transformOrigin: "0 0", ...P3, transform: `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s}) translate(-50%,-50%)`, ...style }}>{children}</div>
);

/* perspective stage with a moving camera */
export const Stage = ({ cam, top = 570, height = 860, children }) => (
  <div style={{ position: "absolute", left: 0, top, width: 1080, height, perspective: 1250, perspectiveOrigin: "50% 50%" }}>
    <div style={{ position: "absolute", inset: 0, ...P3, transform: `translateZ(${cam.z}px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)` }}>{children}</div>
  </div>
);

/* thick extruded text (solid face + highlight, no background-clip) */
export const Text3D = ({ text, size, face = ["#fff4b8", "#ffcc33", "#f0a800"], side = "#a86f00", depth = 60, layers = 12, style }) => {
  const base = { whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05 };
  return (
    <div style={{ position: "relative", ...P3, ...style }}>
      {Array.from({ length: layers }).map((_, i) => (
        <div key={i} style={{ ...base, position: "absolute", left: 0, top: 0, color: side, transform: `translateZ(${-((i + 1) * depth) / layers}px)` }}>{text}</div>
      ))}
      <div style={{ ...base, position: "relative", color: face[1] }}>{text}</div>
      <div style={{ ...base, position: "absolute", left: 0, top: 0, color: face[0], clipPath: "inset(0 0 55% 0)", transform: "translateZ(1px)" }}>{text}</div>
      <div style={{ ...base, position: "absolute", left: 0, top: 0, color: face[2], clipPath: "inset(70% 0 0 0)", transform: "translateZ(1px)" }}>{text}</div>
    </div>
  );
};

/* coin with thickness */
export const Coin3D = ({ size = 140, spin = 0, tilt = 0, thick = 26, layers = 7 }) => (
  <div style={{ position: "relative", width: size, height: size, ...P3, transform: `rotateX(${tilt}deg) rotateY(${spin}deg)` }}>
    {Array.from({ length: layers }).map((_, i) => {
      const z = (i / (layers - 1) - 0.5) * thick;
      const edge = i === 0 || i === layers - 1;
      return (
        <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", transform: `translateZ(${z}px)`, boxSizing: "border-box",
          background: edge ? "radial-gradient(circle at 32% 28%, #fff7c4, #ffcc33 52%, #e0a200)" : "#c99700",
          border: edge ? `${size * 0.05}px solid #f0b81e` : "none", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FONT, fontWeight: 900, fontSize: size * 0.55, color: "#b88400" }}>{edge ? "$" : ""}</div>
      );
    })}
  </div>
);

/* flat stacked coins (a pile) */
export const CoinPile = ({ n = 5, size = 170 }) => (
  <div style={{ position: "relative", width: size, height: size, ...P3 }}>
    {Array.from({ length: n }).map((_, i) => (
      <Obj key={i} y={-i * 20} z={0} rx={90} style={{ left: "50%", top: "50%" }}>
        <Coin3D size={size} thick={18} layers={5} />
      </Obj>
    ))}
  </div>
);

/* box with 5 faces (bars, slabs, ribbons) */
export const Box3D = ({ w, h, d, color, shade, topColor, children }) => (
  <div style={{ position: "relative", width: w, height: h, ...P3 }}>
    <div style={{ position: "absolute", width: w, height: h, background: color, transform: `translateZ(${d / 2}px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    <div style={{ position: "absolute", width: w, height: h, background: shade, transform: `translateZ(${-d / 2}px)` }} />
    <div style={{ position: "absolute", width: d, height: h, left: (w - d) / 2, background: shade, transform: `rotateY(90deg) translateZ(${w / 2}px)` }} />
    <div style={{ position: "absolute", width: d, height: h, left: (w - d) / 2, background: shade, transform: `rotateY(-90deg) translateZ(${w / 2}px)` }} />
    <div style={{ position: "absolute", width: w, height: d, top: (h - d) / 2, background: topColor || color, transform: `rotateX(90deg) translateZ(${h / 2}px)` }} />
  </div>
);

/* extruded gear made of stacked svg layers */
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
const GEAR_D = gearPath();
export const Gear3D = ({ size = 300, spin = 0, color = "#1c2a55", front = "#26376e", depth = 50, layers = 6, tilt = [0, 0] }) => (
  <div style={{ position: "relative", width: size, height: size, ...P3, transform: `rotateX(${tilt[0]}deg) rotateY(${tilt[1]}deg) rotateZ(${spin}deg)` }}>
    {Array.from({ length: layers }).map((_, i) => (
      <svg key={i} viewBox="0 0 200 200" width={size} height={size} style={{ position: "absolute", left: 0, top: 0, transform: `translateZ(${-(i * depth) / layers}px)` }}>
        <path d={GEAR_D} fill={i === 0 ? front : color} fillRule="evenodd" />
      </svg>
    ))}
  </div>
);

/* flat sprite that always faces the camera (cancels the camera rotation) */
export const Billboard = ({ x = 0, y = 0, z = 0, cam, s = 1, children, style }) => (
  <div style={{ position: "absolute", left: "50%", top: "50%", transformOrigin: "0 0", ...P3, transform: `translate3d(${x}px,${y}px,${z}px) rotateY(${-cam.ry}deg) rotateX(${-cam.rx}deg) scale(${s}) translate(-50%,-50%)`, ...style }}>{children}</div>
);

export const Floor = ({ y = 300, scroll = 0, color = "53,208,192" }) => (
  <div style={{ position: "absolute", left: "50%", top: "50%", width: 3200, height: 3200, marginLeft: -1600, transformOrigin: "50% 0%", transform: `translate3d(0px, ${y}px, -1600px) rotateX(90deg)`,
    backgroundImage: `linear-gradient(rgba(${color},0.34) 3px, transparent 3px), linear-gradient(90deg, rgba(${color},0.34) 3px, transparent 3px)`, backgroundSize: "160px 160px", backgroundPosition: `0 ${scroll}px`,
    WebkitMaskImage: "radial-gradient(closest-side, #000 35%, transparent 100%)", maskImage: "radial-gradient(closest-side, #000 35%, transparent 100%)" }} />
);

/* ---------- effects ---------- */
export const shake = (lf, at, amp = 1.6) => (lf < at ? 0 : amp * Math.exp(-(lf - at) / 7) * Math.sin((lf - at) * 2.6));

/* expanding shock ring, t = 0..1 */
export const Ring = ({ t, size = 500, color = "255,204,51", width = 10 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", border: `${width}px solid rgba(${color},${0.85 * (1 - t)})`, transform: `scale(${0.2 + t * 1.4})`, boxSizing: "border-box" }} />
);

/* radial light rays, t = 0..1 */
export const Rays = ({ t, size = 700, color = "255,226,140" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `repeating-conic-gradient(rgba(${color},${0.6 * (1 - t)}) 0deg 6deg, transparent 6deg 15deg)`,
    WebkitMaskImage: "radial-gradient(closest-side, #000 18%, transparent 100%)", maskImage: "radial-gradient(closest-side, #000 18%, transparent 100%)", transform: `scale(${0.4 + t * 0.9}) rotate(${t * 50}deg)` }} />
);

const CONF = ["#ffcc33", "#35d0c0", "#ff5a6e", "#ffffff", "#8a7bff"];
const rnd = (i, seed, m) => (((i * 9301 + seed * 49297 + i * i * 31) % m) / m + 1) % 1;

/* confetti burst in screen pixels */
export const Confetti = ({ f, start, n = 40, cx = 540, cy = 900, life = 70, seed = 1, power = 1 }) => {
  const t = f - start;
  if (t < 0 || t > life) return null;
  const out = [];
  for (let i = 0; i < n; i++) {
    const ang = rnd(i, seed, 997) * Math.PI * 2;
    const sp = (5 + rnd(i, seed + 3, 613) * 15) * power;
    const k = 1 - Math.max(0, (t - life * 0.6) / (life * 0.4));
    out.push(
      <div key={i} style={{ position: "absolute", left: cx + Math.cos(ang) * sp * t * 0.85, top: cy + Math.sin(ang) * sp * t * 0.85 + 0.2 * t * t, width: 14, height: 22, borderRadius: 3, background: CONF[i % 5],
        transform: `rotate(${rnd(i, seed + 7, 331) * 360 + t * (8 + rnd(i, seed, 211) * 20)}deg) scale(${k})`, opacity: k }} />
    );
  }
  return <>{out}</>;
};

/* four-point twinkling stars */
const STAR = "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)";
export const Stars = ({ f, start = 0, n = 14, cx = 540, cy = 900, spread = 420, life = 60, seed = 2, color = "#fff6b0" }) => {
  const t = f - start;
  if (t < 0 || t > life) return null;
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = cx + (rnd(i, seed, 997) - 0.5) * 2 * spread;
    const y = cy + (rnd(i, seed + 5, 613) - 0.5) * 2 * spread * 0.7;
    const d = rnd(i, seed + 9, 41) * 18;
    const k = Math.max(0, Math.sin(((t - d) / life) * Math.PI));
    const sz = 22 + rnd(i, seed + 1, 77) * 34;
    out.push(<div key={i} style={{ position: "absolute", left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, background: color, clipPath: STAR, transform: `scale(${k}) rotate(${t * 4}deg)`, opacity: k, filter: "drop-shadow(0 0 8px #ffe27a)" }} />);
  }
  return <>{out}</>;
};

export const Flash = ({ f, start, strength = 0.5 }) => {
  const t = f - start;
  if (t < 0 || t > 14) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: strength * Math.exp(-t / 4) }} />;
};

export const Vignette = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 46%, transparent 52%, rgba(2,4,14,0.62) 100%)" }} />
);
