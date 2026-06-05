// Mosaic transition between two artworks driven by time.

// Transition logic
let transitionActive = false;
let transitionStart  = 0;
let showingKiss      = false;  // false = Adele on screen, true = The Kiss on screen
let idleStart        = 0;      // frameCount when the current idle period began
let useColumns       = true;   // true = L to R column wave, false = T to B row wave

const IDLE_FRAMES = 360;  // 6 seconds at 60 fps before each switch
const CYCLE_COUNT = 1;    // one full sweep per transition (3 sec)

// Load both images before setup runs
function preload() {
  imgAdele = loadImage('assets/Adele_Bloch-Bauer_I.jpg');
  imgKiss  = loadImage('assets/The-Kiss.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255);
  noStroke();
  // Normalize both images first so sampling and aspect ratio use the same dimensions
  imgAdele.resize(800, 0);
  imgKiss.resize(800, 0);
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
  // Number of tile strips that fit inside the image draw area
  numCols = floor(imgDrawW / tileSize);
  numRows = floor(imgDrawH / tileSize);
}

// Create all tile objects with colour samples from both images
function buildTiles() {
  tiles = [];

  for (let x = imgDrawX; x < imgDrawX + imgDrawW; x += tileSize) {
    for (let y = imgDrawY; y < imgDrawY + imgDrawH; y += tileSize) {
      let imgX = floor(map(x, imgDrawX, imgDrawX + imgDrawW, 0, imgAdele.width));
      let imgY = floor(map(y, imgDrawY, imgDrawY + imgDrawH, 0, imgAdele.height));
      imgX = constrain(imgX, 0, imgAdele.width  - 1);
      imgY = constrain(imgY, 0, imgAdele.height - 1);

      let colourFromAdele = imgAdele.get(imgX, imgY);
      let colourFromKiss  = imgKiss.get(imgX, imgY);

      // Circle size driven by Adele pixel brightness + Perlin noise
      let brightness = (colourFromAdele[0] + colourFromAdele[1] + colourFromAdele[2]) / 3;
      let noiseVal   = noise(x * noiseScale, y * noiseScale);
      let cellSize   = map(brightness, 0, 255, tileSize, tileSize * 0.85);
      cellSize = cellSize + map(noiseVal, 0, 1, -1, 1);
      cellSize = constrain(cellSize, 1, tileSize);

      randomSeed(floor(x) * 1000 + floor(y));
      let rShift = random(-15, 15);
      let gShift = random(-10, 10);
      let bShift = random(-8, 8);

      // Derive col/row index from pixel position for the wave transition
      let col = floor((x - imgDrawX) / tileSize);
      let row = floor((y - imgDrawY) / tileSize);

      tiles.push({
        x, y,
        col, row,                  // col = L→R wave index, row = T→B wave index
        drawnSize:    cellSize,
        colourAdele:  colourFromAdele,
        colourKiss:   colourFromKiss,
        rShift, gShift, bShift,
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

  fill(r, g, b, 250);
  circle(tile.x + tileSize / 2, tile.y + tileSize / 2, tile.drawnSize);
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
  calculateImageDrawProps();
  buildTiles();
}