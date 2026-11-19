/* Flat-vector mascot (red-hoodie boy), full body. viewBox -40 0 480 700 */
const INK = "#1b1424";
const SKIN = "#f9c49a", SKIN_D = "#e2a177";
const HAIR = "#2a1b17", HAIR_L = "#4b2f26";
const RED = "#e0292d", RED_D = "#a81a1f", RED_L = "#f0484a";
const PANTS = "#262833", PANTS_D = "#16171f", PANTS_L = "#363948";
const WHITE = "#ffffff";

const POSES = {
  rest:    { L: [115, 335, 62, 430, 72, 520, "fist"], R: [285, 335, 338, 430, 328, 520, "fist"] },
  wow:     { L: [115, 335, 28, 300, 108, 240, "fist"], R: [285, 335, 372, 300, 292, 240, "fist"] },
  present: { L: [115, 335, 62, 430, 72, 520, "fist"], R: [285, 335, 365, 380, 392, 318, "open"] },
  idea:    { L: [115, 335, 62, 430, 72, 520, "fist"], R: [285, 335, 372, 290, 336, 168, "point"] },
  think:   { L: [115, 335, 62, 430, 72, 520, "fist"], R: [285, 335, 318, 296, 238, 282, "fist"] },
  cheer:   { L: [115, 335, 34, 260, 52, 128, "fist"], R: [285, 335, 366, 260, 348, 128, "fist"] },
  thumbs:  { L: [115, 335, 62, 430, 72, 520, "fist"], R: [285, 335, 376, 360, 350, 262, "thumb"] },
  wave:    { L: [115, 335, 62, 430, 72, 520, "fist"], R: [285, 335, 378, 290, 352, 176, "open"] },
};

const hand = (x, y, kind) => {
  const s = `stroke="${SKIN_D}" stroke-width="4" stroke-linejoin="round"`;
  let g = `<circle cx="${x}" cy="${y}" r="27" fill="${SKIN}" ${s}/>`;
  if (kind === "point") g = `<rect x="${x - 10}" y="${y - 62}" width="20" height="58" rx="10" fill="${SKIN}" ${s}/>` + g;
  if (kind === "thumb") g = `<rect x="${x - 10}" y="${y - 58}" width="20" height="52" rx="10" fill="${SKIN}" ${s}/>` + g;
  if (kind === "open")
    g = [-26, -9, 9, 26].map((dx, i) => `<rect x="${x + dx - 8}" y="${y - 58 + (i === 0 || i === 3 ? 10 : 0)}" width="16" height="50" rx="8" fill="${SKIN}" ${s}/>`).join("") + g;
  return g;
};

const arm = ([sx, sy, cx, cy, hx, hy, kind]) => {
  const d = `M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`;
  return `<path d="${d}" fill="none" stroke="${RED_D}" stroke-width="58" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${RED}" stroke-width="46" stroke-linecap="round"/>` +
    `<circle cx="${hx}" cy="${hy}" r="31" fill="${RED_D}"/>` + hand(hx, hy, kind);
};

export const mascot = ({ pose = "rest", mood = "smile", talk = 0, blink = false, look = 0, wave = 0 } = {}) => {
  const P = POSES[pose] || POSES.rest;
  const open = Math.min(1, talk);
  const eyeY = 205;
  const eyeR = mood === "wow" ? 22 : 19;
  const up = mood === "think" ? 5 : 0;
  const eye = (cx) => blink || mood === "happy"
    ? `<path d="M${cx - 17} ${eyeY + 4} Q${cx} ${mood === "happy" ? eyeY - 14 : eyeY + 14} ${cx + 17} ${eyeY + 4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`
    : `<ellipse cx="${cx}" cy="${eyeY}" rx="17" ry="${eyeR}" fill="#fff" stroke="${INK}" stroke-width="4"/>` +
      `<circle cx="${cx + look * 5}" cy="${eyeY + 2 - up}" r="12.5" fill="#8a4f2a"/><circle cx="${cx + look * 5}" cy="${eyeY + 2 - up}" r="6.5" fill="${INK}"/><circle cx="${cx + look * 5 + 4}" cy="${eyeY - 4 - up}" r="3.6" fill="#fff"/>`;
  const brows =
    mood === "wow" ? `<path d="M138 168 Q170 146 198 168" stroke="${HAIR}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M262 168 Q230 146 202 168" stroke="${HAIR}" stroke-width="9" fill="none" stroke-linecap="round"/>`
    : mood === "think" ? `<path d="M140 176 Q170 160 198 172" stroke="${HAIR}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M264 160 Q236 148 204 164" stroke="${HAIR}" stroke-width="9" fill="none" stroke-linecap="round"/>`
    : mood === "worry" ? `<path d="M140 172 L196 164" stroke="${HAIR}" stroke-width="9" stroke-linecap="round"/><path d="M260 172 L204 164" stroke="${HAIR}" stroke-width="9" stroke-linecap="round"/>`
    : `<path d="M140 172 Q170 158 198 172" stroke="${HAIR}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M260 172 Q230 158 202 172" stroke="${HAIR}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  const mouth =
    mood === "wow" ? `<ellipse cx="200" cy="262" rx="${12 + open * 4}" ry="${16 + open * 6}" fill="#8c2f3a" stroke="${INK}" stroke-width="4"/>`
    : mood === "think" ? `<path d="M182 262 Q200 256 222 266" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`
    : mood === "worry" ? `<path d="M182 268 Q200 252 218 268" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`
    : (mood === "grin" || open > 0.25)
      ? `<path d="M170 250 Q200 ${268 + open * 26} 230 250 Z" fill="#8c2f3a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M178 251 Q200 258 222 251 L220 258 Q200 264 180 258 Z" fill="#fff"/><ellipse cx="200" cy="${262 + open * 8}" rx="13" ry="${5 + open * 4}" fill="#ee6a7a"/>`
      : `<path d="M174 250 Q200 276 226 250" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const spike = (d) => `<path d="${d}" fill="${HAIR}" stroke="#120b09" stroke-width="3" stroke-linejoin="round"/>`;
  const head =
    `<ellipse cx="124" cy="214" rx="17" ry="21" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="4"/><ellipse cx="276" cy="214" rx="17" ry="21" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="4"/>` +
    `<ellipse cx="200" cy="202" rx="80" ry="86" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="4"/>` +
    `<ellipse cx="146" cy="240" rx="16" ry="10" fill="#ff9f8f" opacity="0.55"/><ellipse cx="254" cy="240" rx="16" ry="10" fill="#ff9f8f" opacity="0.55"/>` +
    eye(168) + eye(232) + brows + mouth +
    spike("M150 104 L146 64 L180 92 Z") + spike("M178 92 L190 46 L216 90 Z") + spike("M212 90 L244 52 L250 100 Z") + spike("M246 98 L290 78 L284 126 Z") +
    `<path d="M114 206 C100 140 140 86 204 86 C268 86 304 142 286 206 C282 178 268 156 244 148 C236 164 226 160 214 138 C204 160 190 160 180 140 C170 160 150 160 140 150 C124 160 116 182 114 206 Z" fill="${HAIR}" stroke="#120b09" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M150 112 C170 96 200 92 226 98" fill="none" stroke="${HAIR_L}" stroke-width="9" stroke-linecap="round"/>`;
  const legs =
    `<path d="M128 455 L272 455 L268 600 L208 600 L200 520 L192 600 L132 600 Z" fill="${PANTS}" stroke="${PANTS_D}" stroke-width="4" stroke-linejoin="round"/>` +
    `<rect x="104" y="500" width="34" height="62" rx="8" fill="${PANTS_L}" stroke="${PANTS_D}" stroke-width="4"/><rect x="262" y="500" width="34" height="62" rx="8" fill="${PANTS_L}" stroke="${PANTS_D}" stroke-width="4"/>` +
    `<rect x="128" y="584" width="68" height="26" rx="10" fill="${PANTS_D}"/><rect x="204" y="584" width="68" height="26" rx="10" fill="${PANTS_D}"/>`;
  const shoe = (x) =>
    `<g transform="translate(${x} 0)"><path d="M0 606 L66 606 L66 650 Q66 674 40 676 L-12 676 Q-22 676 -22 664 L-22 646 Q-22 630 0 626 Z" fill="${WHITE}" stroke="#c9ccd6" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M0 606 L66 606 L66 628 L0 628 Z" fill="${RED}"/><path d="M-22 652 L66 652 L66 668 Q66 676 56 676 L-12 676 Q-22 676 -22 664 Z" fill="#e9ebf2"/><circle cx="33" cy="618" r="6" fill="${WHITE}"/></g>`;
  const torso =
    `<path d="M126 296 C176 276 224 276 274 296 L296 330 L300 458 Q200 482 100 458 L104 330 Z" fill="${RED}" stroke="${RED_D}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M104 440 Q200 466 296 440 L298 462 Q200 490 102 462 Z" fill="${RED_D}"/>` +
    `<path d="M150 392 L250 392 L262 446 Q200 462 138 446 Z" fill="${RED_L}" opacity="0.35" stroke="${RED_D}" stroke-width="3"/>` +
    `<path d="M136 292 Q200 330 264 292 L252 284 Q200 312 148 284 Z" fill="${RED_D}"/><path d="M162 300 Q200 334 238 300 L232 290 Q200 316 168 290 Z" fill="#14141c"/>` +
    `<path d="M176 322 L174 394" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M224 322 L226 394" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="174" cy="398" r="6" fill="${INK}"/><circle cx="226" cy="398" r="6" fill="${INK}"/>`;
  const neck = `<rect x="178" y="272" width="44" height="40" rx="14" fill="${SKIN_D}"/>`;
  const rightArm = `<g transform="rotate(${wave} 285 335)">${arm(P.R)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-40 0 480 700">` +
    `<ellipse cx="200" cy="682" rx="130" ry="14" fill="rgba(0,0,0,0.18)"/>` +
    legs + shoe(150) + shoe(228) + neck + torso + arm(P.L) + head + rightArm + `</svg>`;
};
