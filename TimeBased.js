// Mosaic transition between two artworks driven by time.
 
// Transition logic
let transitionActive = false;
let transitionStart  = 0;
let showingKiss      = false;  // false = Adele on screen, true = The Kiss on screen
let idleStart        = 0;      // frameCount when the current idle period began
let useColumns       = true;   // true = L to R column wave, false = T to B row wave
 
const IDLE_FRAMES = 360;  // 6 seconds at 60 fps before each switch
const CYCLE_COUNT = 1;    // one full sweep per transition (3 sec)
 
// Core time loop: 6 sec idle, flip transition over 3 sec, repeat
function updateTimeBased() {
  // Trigger a new transition once IDLE_FRAMES have passed
  if (!transitionActive && frameCount - idleStart >= IDLE_FRAMES) {
    transitionActive = true;
    transitionStart  = frameCount;
    useColumns = !useColumns;  // alternate between column wave and row wave each time
  }
 
  if (!transitionActive) return;
 
  // elapsed = frames since this transition started
  let elapsed  = frameCount - transitionStart;
  // transition toward the image not currently shown
  let target;
  if (showingKiss) { target = 0; } else { target = 1; }
 
  // interval = total strips in this wave direction
  let interval;
  if (useColumns) { interval = numCols; } else { interval = numRows; }
 
  // frameCount % interval == tileIndex pattern:
  // elapsed % interval selects exactly one column (or row) strip per frame,
  // creating a left-to-right (or top-to-bottom) rolling wave
  for (let tile of tiles) {
    let tileIndex;
    if (useColumns) { tileIndex = tile.col; } else { tileIndex = tile.row; }
    if (elapsed % interval === tileIndex) {
      tile.flipProgress = lerp(tile.flipProgress, target, 0.95);
    }
  }
 
  // After CYCLE_COUNT full sweeps every strip has been pushed enough times
  if (elapsed >= interval * CYCLE_COUNT) {
    for (let tile of tiles) {
      tile.flipProgress = lerp(tile.flipProgress, target, 0.1);
    }

    let allDone = true;
    
    for (let i = 0; i < tiles.length; i++) {
      if (abs(tiles[i].flipProgress - target) >= 0.01) {
        allDone = false;
  }
}
    
    if (allDone) {
      for (let tile of tiles) {
        tile.flipProgress = target;
      }
      showingKiss = !showingKiss;
      transitionActive = false;
      idleStart = frameCount;
    }
  }
}
 
// Simple countdown number in the bottom-right corner during idle
function drawCountdown() {
  if (transitionActive) return;
  let secsLeft = ceil((IDLE_FRAMES - (frameCount - idleStart)) / 60);
  push();
  noStroke();
  fill(255, 255, 255, 180);
  textAlign(RIGHT, BOTTOM);
  textSize(18);
  text(secsLeft, width - 20, height - 20);
  pop();
}
