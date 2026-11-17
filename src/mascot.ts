const INK = "#10162e";
const SKIN = "#ffe3bd";
const HAT = "#ffcc33";
const VEST = "#35d0c0";

const gear = (cx, cy, r, color) => {
  let teeth = "";
  for (let i = 0; i < 8; i++)
    teeth += `<rect x="${cx - 4}" y="${cy - r - 5}" width="8" height="11" rx="2" fill="${color}" transform="rotate(${i * 45} ${cx} ${cy})"/>`;
  return `${teeth}<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="${HAT}"/>`;
};

const POSES = {
  point:   { L: [120, 420, 60, 470, 80, 548, 0], R: [300, 420, 395, 395, 352, 285, 1] },
  think:   { L: [120, 420, 60, 470, 80, 548, 0], R: [300, 420, 345, 360, 250, 352, 0] },
  wow:     { L: [120, 420, 30, 380, 98, 285, 0], R: [300, 420, 390, 380, 322, 285, 0] },
  thumbs:  { L: [120, 420, 60, 470, 80, 548, 0], R: [300, 420, 392, 430, 352, 340, 2] },
  wave:    { L: [120, 420, 60, 470, 80, 548, 0], R: [300, 420, 395, 340, 365, 235, 0] },
  present: { L: [120, 420, 60, 470, 80, 548, 0], R: [300, 420, 380, 470, 405, 400, 0] },
};

export const mascot = ({ pose = "point", mood = "smile", blink = false } = {}) => {
  const P = POSES[pose] || POSES.point;
  const arm = ([sx, sy, cx, cy, hx, hy, extra]) => {
    const d = `M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`;
    let hand = `<circle cx="${hx}" cy="${hy}" r="24" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>`;
    if (extra === 1) hand = `<rect x="${hx - 11}" y="${hy - 58}" width="22" height="64" rx="11" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>` + hand;
    if (extra === 2) hand = `<rect x="${hx - 10}" y="${hy - 54}" width="20" height="50" rx="10" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>` + hand;
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="46" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${VEST}" stroke-width="34" stroke-linecap="round"/>${hand}`;
  };
  const eyes = blink
    ? `<path d="M148 235 Q165 245 182 235" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M238 235 Q255 245 272 235" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="165" cy="235" rx="15" ry="${mood === "wow" ? 21 : 18}" fill="#fff" stroke="${INK}" stroke-width="5"/><ellipse cx="255" cy="235" rx="15" ry="${mood === "wow" ? 21 : 18}" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="168" cy="238" r="8" fill="${INK}"/><circle cx="252" cy="238" r="8" fill="${INK}"/>`;
  const brows = mood === "worry"
    ? `<path d="M140 205 L184 218" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M280 205 L236 218" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`
    : mood === "wow"
    ? `<path d="M142 195 Q165 178 188 195" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M232 195 Q255 178 278 195" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`
    : `<path d="M142 208 Q165 196 188 208" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M232 208 Q255 196 278 208" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const mouth = mood === "wow"
    ? `<ellipse cx="210" cy="305" rx="19" ry="25" fill="#7a2f3a" stroke="${INK}" stroke-width="6"/>`
    : mood === "grin"
    ? `<path d="M165 285 Q210 345 255 285 Z" fill="#7a2f3a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M182 300 Q210 322 238 300 Q210 312 182 300Z" fill="#fff"/>`
    : mood === "worry"
    ? `<path d="M185 308 Q210 288 235 308" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`
    : `<path d="M175 290 Q210 328 245 290" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 420 560">
  <path d="M105 560 L105 440 Q105 385 160 378 L260 378 Q315 385 315 440 L315 560 Z" fill="${VEST}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M170 378 L210 430 L250 378 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <rect x="190" y="470" width="40" height="46" rx="8" fill="${HAT}" stroke="${INK}" stroke-width="5"/>
  ${arm(P.L)}
  <rect x="180" y="340" width="60" height="50" rx="16" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>
  <circle cx="210" cy="235" r="132" fill="${SKIN}" stroke="${INK}" stroke-width="7"/>
  <g transform="translate(0 22)"><ellipse cx="128" cy="262" rx="20" ry="13" fill="#ffb8a8" opacity="0.7"/><ellipse cx="292" cy="262" rx="20" ry="13" fill="#ffb8a8" opacity="0.7"/>
  ${eyes}${brows}${mouth}</g>
  <path d="M78 205 Q78 70 210 70 Q342 70 342 205 Z" fill="${HAT}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <rect x="58" y="190" width="304" height="34" rx="17" fill="#f0b81e" stroke="${INK}" stroke-width="7"/>
  <rect x="192" y="40" width="36" height="40" rx="10" fill="#f0b81e" stroke="${INK}" stroke-width="6"/>
  ${gear(210, 138, 30, INK)}
  ${arm(P.R)}
  </svg>`;
};
