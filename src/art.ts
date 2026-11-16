const FONT = "Arial, Helvetica, sans-serif";
const NS = 'xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"';

export const person = ({ shirt = "#35d0c0", pants = "#2b3a67", skin = "#f2c9a0", hair = "#2a2018", armL = 8, armR = 8, leg = 0, mood = "smile", up = 0 } = {}) => {
  const arm = (x, a, flip) =>
    `<g transform="rotate(${flip ? -a : a} ${x} 126)"><line x1="${x}" y1="126" x2="${x}" y2="196" stroke="${shirt}" stroke-width="20" stroke-linecap="round"/><circle cx="${x}" cy="204" r="11" fill="${skin}"/></g>`;
  const legs = (x, a) =>
    `<g transform="rotate(${a} ${x} 214)"><rect x="${x - 11}" y="206" width="22" height="104" rx="10" fill="${pants}"/><ellipse cx="${x + 4}" cy="316" rx="18" ry="9" fill="#10162e"/></g>`;
  const mouth =
    mood === "wow"
      ? `<ellipse cx="100" cy="82" rx="7" ry="9" fill="#5a2a2a"/>`
      : mood === "think"
      ? `<line x1="90" y1="82" x2="110" y2="82" stroke="#5a2a2a" stroke-width="4" stroke-linecap="round"/>`
      : `<path d="M86 76 Q100 92 114 76" fill="none" stroke="#5a2a2a" stroke-width="4" stroke-linecap="round"/>`;
  const ey = 62 - up;
  return `<svg ${NS} viewBox="-50 0 300 340">${legs(86, leg)}${legs(114, -leg)}<rect x="62" y="106" width="76" height="116" rx="24" fill="${shirt}"/>${arm(66, armL, false)}${arm(134, armR, true)}<rect x="90" y="92" width="20" height="22" fill="${skin}"/><circle cx="100" cy="60" r="42" fill="${skin}"/><path d="M58 56 A42 42 0 0 1 142 56 Q100 34 58 56 Z" fill="${hair}"/><circle cx="86" cy="${ey}" r="5" fill="#1b1b2b"/><circle cx="114" cy="${ey}" r="5" fill="#1b1b2b"/>${mouth}</svg>`;
};

export const car = ({ color = "#ffcc33", rot = 0, rider = true } = {}) => {
  const wheel = (cx) =>
    `<g transform="translate(${cx} 96)"><circle r="23" fill="#10162e"/><g transform="rotate(${rot})"><circle r="11" fill="#8791b3"/><rect x="-2" y="-11" width="4" height="22" fill="#10162e"/><rect x="-11" y="-2" width="22" height="4" fill="#10162e"/></g></g>`;
  return `<svg ${NS} viewBox="0 0 300 124"><rect x="14" y="58" width="272" height="36" rx="14" fill="${color}"/><path d="M76 60 L100 28 Q104 22 112 22 L186 22 Q194 22 200 29 L228 60 Z" fill="${color}"/><path d="M94 56 L111 30 L142 30 L142 56 Z" fill="#bfe6ff"/><path d="M150 56 L150 30 L184 30 L208 56 Z" fill="#bfe6ff"/>${rider ? `<circle cx="166" cy="42" r="9" fill="#f2c9a0"/><path d="M152 56 Q166 44 180 56 Z" fill="#35d0c0"/>` : ""}<rect x="276" y="66" width="14" height="9" rx="3" fill="#fff6b0"/><rect x="12" y="66" width="10" height="9" rx="3" fill="#ff5a6e"/>${wheel(72)}${wheel(232)}</svg>`;
};

export const skyline = () => {
  const B = [[0, 110, 200], [100, 90, 280], [180, 120, 170], [290, 100, 330], [380, 130, 230], [500, 90, 300], [580, 120, 190], [690, 100, 350], [780, 110, 240], [880, 90, 290], [960, 120, 200]];
  let s = "";
  B.forEach(([x, w, h], i) => {
    s += `<rect x="${x}" y="${420 - h}" width="${w}" height="${h}" fill="#121a36"/>`;
    for (let c = 0; c < Math.floor((w - 12) / 28); c++)
      for (let r = 0; r < Math.floor((h - 16) / 34); r++) {
        const lit = (i * 5 + c * 3 + r * 7) % 5 === 0;
        s += `<rect x="${x + 12 + c * 28}" y="${420 - h + 14 + r * 34}" width="14" height="18" fill="${lit ? "#ffcc33" : "#1e2850"}" opacity="${lit ? 0.4 : 1}"/>`;
      }
  });
  return `<svg ${NS} viewBox="0 0 1080 420">${s}</svg>`;
};

export const store = () => {
  let st = "";
  for (let i = 0; i < 8; i++) {
    const col = i % 2 ? "#ffffff" : "#ff5a6e";
    st += `<rect x="${20 + i * 40}" y="92" width="40" height="38" fill="${col}"/><circle cx="${40 + i * 40}" cy="130" r="20" fill="${col}"/>`;
  }
  return `<svg ${NS} viewBox="0 0 360 300"><rect x="30" y="86" width="300" height="214" rx="8" fill="#2b3a67"/><rect x="46" y="160" width="150" height="100" rx="6" fill="#bfe6ff"/><text x="121" y="222" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="38" fill="#0b1020">$9.99</text><rect x="216" y="160" width="96" height="140" rx="6" fill="#10162e"/><circle cx="298" cy="236" r="5" fill="#ffcc33"/>${st}<rect x="110" y="40" width="140" height="42" rx="8" fill="#ffcc33"/><text x="180" y="71" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="30" fill="#0b1020">STORE</text></svg>`;
};

export const bill = () =>
  `<svg ${NS} viewBox="0 0 200 100"><rect x="4" y="4" width="192" height="92" rx="12" fill="#3fbf7f"/><rect x="14" y="14" width="172" height="72" rx="8" fill="none" stroke="#1f7a4d" stroke-width="3"/><circle cx="100" cy="50" r="24" fill="#2fa56a"/><text x="100" y="61" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="32" fill="#0f5c38">$</text></svg>`;

export const coins = (n = 5) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const y = 200 - i * 17;
    s += `<rect x="12" y="${y}" width="96" height="14" fill="#d9a516"/><ellipse cx="60" cy="${y + 14}" rx="48" ry="12" fill="#d9a516"/>`;
  }
  const ty = 200 - (n - 1) * 17;
  s += `<ellipse cx="60" cy="${ty}" rx="48" ry="12" fill="#ffcc33"/><ellipse cx="60" cy="${ty}" rx="32" ry="7" fill="none" stroke="#d9a516" stroke-width="3"/>`;
  return `<svg ${NS} viewBox="0 0 120 230">${s}</svg>`;
};

export const tag = (text, size = 46) =>
  `<svg ${NS} viewBox="0 0 220 140"><path d="M14 70 L58 22 H200 Q210 22 210 32 V108 Q210 118 200 118 H58 Z" fill="#ffffff"/><circle cx="58" cy="70" r="9" fill="#0b1020"/><text x="138" y="${70 + size * 0.35}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${size}" fill="#0b1020">${text}</text></svg>`;

export const bubble = (text, color = "#0b1020") =>
  `<svg ${NS} viewBox="0 0 280 220"><circle cx="40" cy="190" r="10" fill="#fff"/><circle cx="66" cy="160" r="16" fill="#fff"/><ellipse cx="160" cy="84" rx="116" ry="72" fill="#fff"/><text x="160" y="112" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="84" fill="${color}">${text}</text></svg>`;
