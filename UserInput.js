// User Input Mechanic
// When the mouse hovers over tiles:
//   1. Triggers flip (connects to the time-based teammate's flipProgress animation)
//   2. Tiles expand with a ripple effect, lerping back to their original size

// Adjustable parameters
const HOVER_RADIUS = 80;   // Mouse influence radius (px)
const BULGE_SCALE  = 1.8;  // Maximum expansion multiplier
const LERP_SPEED   = 0.12; // Easing speed

// Initialisation: call once in setup() after buildTiles(）
function initUserInput() {
  for (let t of tiles) {
    t.displaySize = t.drawnSize; // Current animated size
    t.baseSize    = t.drawnSize; // Original size to lerp back to
  }
}

// Per-frame update: call in draw() after updateFlipProgress()
function updateUserInput() {
  for (let t of tiles) {
    // Calculate the centre coordinates of this tile
    let cx = t.x + tileSize / 2;
    let cy = t.y + tileSize / 2;

    // Use dist() to measure how far the mouse is from the tile centre
    // Reference: tutorial sketch.js — dist(segment, mouseX, mouseY)
    let d = dist(mouseX, mouseY, cx, cy);

    if (d < HOVER_RADIUS) {
      // Smoothstep falloff: tiles closer to the mouse expand more
      // Reference: Perlin noise smooth transition idea from sketch3.js
      let falloff = 1 - d / HOVER_RADIUS;
      let ease    = falloff * falloff * (3 - 2 * falloff);

      // Calculate the target size based on distance from mouse
      let target = t.baseSize * (1 + (BULGE_SCALE - 1) * ease);

      // Lerp toward the target size for a smooth expansion
      // Reference: squareSize lerp easing in sketch.js
      t.displaySize = lerp(t.displaySize, target, LERP_SPEED);

      // Trigger the flip — connects to the time-based teammate's updateFlipProgress()
      t.flipped = true;

    } else {
      // Mouse has left — lerp back to the original tile size
      t.displaySize = lerp(t.displaySize, t.baseSize, LERP_SPEED);
    }
  }
}