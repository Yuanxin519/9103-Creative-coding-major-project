// User Input Mechanic
// When the mouse hovers over tiles:
//   1. Triggers flip (connects to the time-based teammate's flipProgress animation)
//   2. Tiles expand with a ripple effect, lerping back to their original size

// Adjustable parameters
const HOVER_RADIUS = 80;   // Mouse influence radius (px)
const BULGE_SCALE  = 2;  // Maximum expansion multiplier
const LERP_SPEED   = 0.2; // Easing speed

// Call once in setup(), after buildTiles().
// Adds two extra properties to every tile object:
//   displaySize — the current animated radius used for drawing
//   baseSize    — the original Perlin-noise size to lerp back to
function initUserInput() {
  for (let t of tiles) {
    t.displaySize = t.drawnSize;
    t.baseSize    = t.drawnSize;
  }
}
 
 
// updateUserInput 
// Call every frame inside draw(), after updateFlipProgress().
// Handles both the ripple size animation and the erase trigger.
function updateUserInput() {
  for (let t of tiles) {
    // Tile centre position on the canvas
    let cx = t.x + tileSize / 2;
    let cy = t.y + tileSize / 2;
 
    // Distance from mouse to tile centre — ref: tutorial sketch.js segment distance
    let d = dist(mouseX, mouseY, cx, cy);
 
    if (d < HOVER_RADIUS) {
      // Smoothstep falloff: tiles closest to the mouse bulge the most
      // The formula produces a smooth S-curve between 0 and 1
      // ref: Perlin noise smooth transition from sketch3.js
      let falloff = 1 - d / HOVER_RADIUS;
      let ease    = falloff * falloff * (3 - 2 * falloff);
 
      // Scale the tile up toward BULGE_SCALE based on proximity
      let target    = t.baseSize * (1 + (BULGE_SCALE - 1) * ease);
      t.displaySize = lerp(t.displaySize, target, LERP_SPEED);
 
      // Mark this tile as flipped — triggers the erase reveal
      // The time-based teammate's updateFlipProgress() animates flipProgress to 1
      t.flipped = true;
 
    } else {
      // Mouse has moved away — lerp back to the original Perlin-noise size
      // ref: squareSize lerp easing in sketch.js
      t.displaySize = lerp(t.displaySize, t.baseSize, LERP_SPEED);
    }
  }
}
 

// Replaces the teammate's rect-based drawTile with a circle version.
// The colour blending logic is identical — only the shape changes.
// Because JavaScript uses the last definition of a function, this override
// takes effect as long as user_input.js is loaded after the main sketch file.
function drawTile(tile) {
 
  // Blend between Adele and The Kiss based on flipProgress
  // flipProgress = 0 → Adele only; flipProgress = 1 → The Kiss only
  let r = lerp(tile.colourAdele[0], tile.colourKiss[0], tile.flipProgress);
  let g = lerp(tile.colourAdele[1], tile.colourKiss[1], tile.flipProgress);
  let b = lerp(tile.colourAdele[2], tile.colourKiss[2], tile.flipProgress);
 
  // Apply the per-tile colour shift (gold leaf variation from main sketch)
  r = constrain(r + tile.rShift, 0, 255);
  g = constrain(g + tile.gShift, 0, 255);
  b = constrain(b + tile.bShift, 0, 255);
 
  fill(r, g, b);
  noStroke();
 
  // Draw as a circle using displaySize (the animated size from updateUserInput)
  // Falls back to drawnSize if initUserInput() has not been called yet
  let s  = tile.displaySize || tile.drawnSize;
  let cx = tile.x + tileSize / 2;
  let cy = tile.y + tileSize / 2;
  circle(cx, cy, s);
}