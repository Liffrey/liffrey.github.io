// Film posters: a background color, a foreground color and a motif drawn as an SVG path on an 80x120 sheet.
// The same path is drawn as SVG in the Cinema panel and onto a canvas texture on the wall.
export const MOTIFS = ['sun', 'moon', 'diamond', 'stripes', 'tower', 'bike'];

// A circle as a path; ccw draws it the other way round, which cuts a hole in a shape drawn clockwise.
const circle = (x, y, r, ccw = false) => {
  const s = ccw ? 0 : 1;
  return `M${x - r} ${y}a${r} ${r} 0 1 ${s} ${2 * r} 0a${r} ${r} 0 1 ${s} ${-2 * r} 0Z`;
};

const PATHS = {
  sun: circle(40, 48, 20) + 'M8 84h64v5H8z',
  moon: 'M46 26A20 20 0 0 0 46 66A26 26 0 0 1 46 26Z' + 'M60 22h4v4h-4zM16 78h3v3h-3zM62 72h3v3h-3z',
  diamond: 'M40 22L62 50L40 78L18 50Z',
  stripes: 'M0 20h80v8H0zM0 40h80v8H0zM0 60h80v8H0zM0 80h80v8H0z',
  tower: 'M38 12h4v12h-4zM32 24h16v16H32zM24 40h32v48H24zM12 88h56v5H12z',
  // a low motorbike riding right, with speed lines behind it
  bike: circle(22, 74, 11) + circle(22, 74, 5, true) + circle(60, 74, 11) + circle(60, 74, 5, true) +
    'M14 70C18 58 30 52 44 54L62 58C70 60 72 68 66 70L52 66L30 70Z' + 'M30 54C34 46 44 44 48 50L44 54Z' +
    'M0 48h16v3H0zM4 58h10v3H4zM0 68h8v3H0z',
};

export const motifPath = motif => PATHS[motif];

export function posterSVG({ colors: [bg, fg], motif }) {
  return `<svg class="poster" viewBox="0 0 80 120" aria-hidden="true"><rect width="80" height="120" fill="${bg}"/>` +
    `<path d="${motifPath(motif)}" fill="${fg}"/></svg>`;
}
