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
      let scale = map(d, 0, HOVER_RADIUS, BULGE_SCALE, 1);
      targetSize = t.baseSize * scale;

      // Also trigger the image-reveal flip for the time-based teammate
      t.flipped = true;

    } else {
      // Mouse is out of range — return to original size
      targetSize = t.baseSize;
    }

    // lerp() eases toward the target smoothly each frame
    // (the tutorial applies scale instantly; lerp makes it feel animated)
    t.displaySize = lerp(t.displaySize, targetSize, LERP_SPEED);
  }
}
