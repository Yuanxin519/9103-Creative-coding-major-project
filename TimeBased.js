// ============================================================
// TimeBased.js
// Mosaic transition between two Klimt paintings driven by time.
// After a 10-second idle, a column-by-column (or row-by-row) wave
// sweeps all tiles to reveal the other image in ~3-5 seconds.
// The loop then repeats indefinitely.
// ============================================================

let imgAdele, imgKiss;
let tiles = [];
let tileSize  = 12;
let noiseScale = 0.04;
let numCols, numRows;
let imgDrawX, imgDrawY, imgDrawW, imgDrawH;

// Transition state
let transitionActive = false;
let transitionStart  = 0;
let showingKiss      = false;  // false = Adele on screen, true = The Kiss on screen
let idleStart        = 0;      // frameCount when the current idle period began
let useColumns       = true;   // true = L→R column wave, false = T→B row wave

const IDLE_FRAMES = 360;  // 6 seconds at 60 fps before each switch
const CYCLE_COUNT = 1;    // one full sweep per transition (~3 sec)

// Load both images before setup runs
function preload() {
  imgAdele = loadImage('assets/Adele_Bloch-Bauer_I.jpg');
  imgKiss  = loadImage('assets/The-Kiss.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255);
  noStroke();
  numCols = floor(width  / tileSize);
  numRows = floor(height / tileSize);
  calculateImageDrawProps();
  buildTiles();
}

function draw() {
  background(20);
  updateTimeBased();
  // for...of traversal draws every tile each frame
  for (let tile of tiles) {
    drawTile(tile);
  }
  drawCountdown();
}

// Fit the image onto the canvas while keeping its aspect ratio
function calculateImageDrawProps() {
  let aspect       = imgAdele.width / imgAdele.height;
  let canvasAspect = width / height;

  if (aspect > canvasAspect) {
    imgDrawW = width;
    imgDrawH = width / aspect;
    imgDrawX = 0;
    imgDrawY = (height - imgDrawH) / 2;
  } else {
    imgDrawH = height;
    imgDrawW = height * aspect;
    imgDrawX = (width - imgDrawW) / 2;
    imgDrawY = 0;
  }
}

// Create all tile objects with colour samples from both images
function buildTiles() {
  tiles = [];

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      let x = col * tileSize;
      let y = row * tileSize;

      // Perlin noise gives each tile a slightly varied drawn size
      let noiseVal  = noise(col * noiseScale, row * noiseScale);
      let drawnSize = map(noiseVal, 0, 1, tileSize * 0.7, tileSize * 1.1);

      // Sample the pixel colour at this grid position from both images
      let colourFromAdele = [20, 20, 20, 255];
      let colourFromKiss  = [20, 20, 20, 255];

      if (x >= imgDrawX && x < imgDrawX + imgDrawW &&
          y >= imgDrawY && y < imgDrawY + imgDrawH) {
        let imgX = floor(map(x, imgDrawX, imgDrawX + imgDrawW, 0, imgAdele.width));
        let imgY = floor(map(y, imgDrawY, imgDrawY + imgDrawH, 0, imgAdele.height));
        imgX = constrain(imgX, 0, imgAdele.width  - 1);
        imgY = constrain(imgY, 0, imgAdele.height - 1);
        colourFromAdele = imgAdele.get(imgX, imgY);
        colourFromKiss  = imgKiss.get(imgX, imgY);
      }

      // Stable per-tile colour shift using a fixed random seed
      randomSeed(col * 1000 + row);
      let rShift = random(-15, 15);
      let gShift = random(-10, 10);
      let bShift = random(-8,   8);

      tiles.push({
        x:           x,
        y:           y,
        col:         col,          // column index — used for L→R wave
        row:         row,          // row index    — used for T→B wave
        drawnSize:   drawnSize,
        colourAdele: colourFromAdele,
        colourKiss:  colourFromKiss,
        rShift:      rShift,
        gShift:      gShift,
        bShift:      bShift,
        flipProgress: 0            // 0 = showing Adele colour, 1 = showing Kiss colour
      });
    }
  }
}

// Blend between Adele and Kiss colours using each tile's flipProgress
function drawTile(tile) {
  let r = lerp(tile.colourAdele[0], tile.colourKiss[0], tile.flipProgress);
  let g = lerp(tile.colourAdele[1], tile.colourKiss[1], tile.flipProgress);
  let b = lerp(tile.colourAdele[2], tile.colourKiss[2], tile.flipProgress);

  r = constrain(r + tile.rShift, 0, 255);
  g = constrain(g + tile.gShift, 0, 255);
  b = constrain(b + tile.bShift, 0, 255);

  fill(r, g, b);
  let offset = (tileSize - tile.drawnSize) / 2;
  rect(tile.x + offset, tile.y + offset, tile.drawnSize, tile.drawnSize, 2);
}

// Core time loop: 10-sec idle → wave transition → 10-sec idle → ...
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
  let target   = showingKiss ? 0 : 1;  // transition toward the image not currently shown

  // interval = total strips in this wave direction
  let interval = useColumns ? numCols : numRows;

  // frameCount % interval == tileIndex pattern:
  // elapsed % interval selects exactly one column (or row) strip per frame,
  // creating a left-to-right (or top-to-bottom) rolling wave
  for (let tile of tiles) {
    let tileIndex = useColumns ? tile.col : tile.row;
    if (elapsed % interval === tileIndex) {
      tile.flipProgress = lerp(tile.flipProgress, target, 0.95);
    }
  }

  // After CYCLE_COUNT full sweeps every strip has been pushed enough times
  if (elapsed >= interval * CYCLE_COUNT) {
    // Snap all tiles to the exact target so nothing is left mid-blend
    for (let tile of tiles) {
      tile.flipProgress = target;
    }
    showingKiss      = !showingKiss;
    transitionActive = false;
    idleStart        = frameCount;  // restart the 10-second idle
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

// Rebuild the grid whenever the browser window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  numCols = floor(width  / tileSize);
  numRows = floor(height / tileSize);
  calculateImageDrawProps();
  buildTiles();
}
