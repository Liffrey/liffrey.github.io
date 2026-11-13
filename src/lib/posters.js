// Abstract film posters: a background color, a foreground color and a motif on an 8x12 pixel grid.
// The same rectangles are drawn as SVG in the Cinema panel and onto a texture on the wall.
export const MOTIFS = ['sun', 'moon', 'diamond', 'stripes', 'tower'];

const SHAPES = {
  sun: [[3, 2, 2, 1], [2, 3, 4, 3], [1, 4, 6, 1], [3, 6, 2, 1], [0, 9, 8, 1]],
  moon: [[3, 2, 3, 1], [2, 3, 2, 3], [3, 6, 3, 1], [6, 1, 1, 1], [1, 9, 1, 1], [6, 8, 1, 1]],
  diamond: [[3, 2, 2, 1], [2, 3, 4, 1], [1, 4, 6, 2], [2, 6, 4, 1], [3, 7, 2, 1]],
  stripes: [[0, 2, 8, 1], [0, 4, 8, 1], [0, 6, 8, 1], [0, 8, 8, 1]],
  tower: [[4, 1, 1, 2], [3, 3, 3, 2], [2, 5, 5, 5], [1, 10, 7, 1]],
};

export const motifPixels = motif => SHAPES[motif];

export function posterSVG({ colors: [bg, fg], motif }) {
  const rects = motifPixels(motif).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fg}"/>`).join('');
  return `<svg class="poster" viewBox="0 0 8 12" shape-rendering="crispEdges" aria-hidden="true"><rect width="8" height="12" fill="${bg}"/>${rects}</svg>`;
}
