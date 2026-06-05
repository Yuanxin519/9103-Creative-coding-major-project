// User Input Mechanic
// When the mouse hovers over tiles:
//   1. Triggers flip (connects to the time-based teammate's flipProgress animation)
//   2. Tiles expand with a ripple effect, lerping back to their original size

// Adjustable parameters
const HOVER_RADIUS = 80;   // Mouse influence radius (px)
const BULGE_SCALE  = 1.8;  // Maximum expansion multiplier
const LERP_SPEED   = 0.12; // Easing speed

// This replaces the drawTile() in sketch.js
function drawTile(tile) {

// Lazy initialisation — runs once per tile on its first draw call
  if (tile.displaySize === undefined) {
    tile.displaySize = tile.drawnSize;
    tile.baseSize    = tile.drawnSize;
  }

  // HOVER SIZE (dist + map pattern from tutorial, inverted)
  let cx = tile.x + tileSize / 2;
  let cy = tile.y + tileSize / 2;

  // dist() measures mouse proximity, same as the tutorial
  let d = dist(mouseX, mouseY, cx, cy);

  let targetSize;
  if (d < HOVER_RADIUS) {
    // Tutorial: scale = dist/100  →  far = big
    // Here:     map(d, 0, HOVER_RADIUS, BULGE_SCALE, 1)  →  close = big
    let scale = map(d, 0, HOVER_RADIUS, BULGE_SCALE, 1);
    targetSize = tile.baseSize * scale;
    tile.flipped = true;
  } else {
    targetSize = tile.baseSize;
  }

  // lerp() eases toward target each frame for smooth animation
  tile.displaySize = lerp(tile.displaySize, targetSize, LERP_SPEED);

  // --- COLOUR (same blending logic as sketch.js) ---
  let r = lerp(tile.colourAdele[0], tile.colourKiss[0], tile.flipProgress);
  let g = lerp(tile.colourAdele[1], tile.colourKiss[1], tile.flipProgress);
  let b = lerp(tile.colourAdele[2], tile.colourKiss[2], tile.flipProgress);

  r = constrain(r + tile.rShift, 0, 255);
  g = constrain(g + tile.gShift, 0, 255);
  b = constrain(b + tile.bShift, 0, 255);

  fill(r, g, b);
  noStroke();

  // Draw as a circle centred in the grid cell, sized by hover effect
  ellipse(cx, cy, tile.displaySize, tile.displaySize);
}
