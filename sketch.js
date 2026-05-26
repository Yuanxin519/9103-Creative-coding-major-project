// We need variables to hold our two source images
let imgAdele;
let imgKiss;

// We will store all the tile objects in an array
let tiles = [];

// This controls the base size of each tile in pixels
let tileSize = 12;

// This controls how zoomed in the Perlin noise is
let noiseScale = 0.04;

// We will store how many columns and rows of tiles fit on the canvas
let numCols;
let numRows;

// We will store the draw properties of the image so we can sample it correctly
let imgDrawX, imgDrawY, imgDrawW, imgDrawH;

// Let's load both images before setup runs
function preload() {
  imgAdele = loadImage('assets/Adele_Bloch-Bauer_I.jpg');
  imgKiss  = loadImage('assets/The-Kiss.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // We use RGB colour mode throughout to keep things simple and consistent
  colorMode(RGB, 255);
  noStroke();

  // Calculate how many columns and rows of tiles fit on the canvas
  numCols = floor(width  / tileSize);
  numRows = floor(height / tileSize);

  // Calculate the draw area for the image so it fits the canvas without distortion
  calculateImageDrawProps();

  // Build all the tiles and store them in the array
  buildTiles();
}

// This function works out how to fit the image onto the canvas while keeping its proportions
function calculateImageDrawProps() {
  let aspect = imgAdele.width / imgAdele.height;
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
  
  //modify
  if (imgDrawH > height) {
    imgDrawH = height;
    imgDrawW = height * aspect;
    imgDrawX = (width - imgDrawW) / 2;
    imgDrawY = 0;
  }
}

function draw() {
  background(20);

  // Loop through every tile and draw it
  for (let i = 0; i < tiles.length; i++) {
    drawTile(tiles[i]);
  }
}

// This function creates all the tile objects and fills the tiles array
function buildTiles() {
  tiles = [];

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {

      // Calculate the x and y position of this tile on the canvas
      let x = col * tileSize;
      let y = row * tileSize;

      // --- PERLIN NOISE ---
      let noiseValue = noise(col * noiseScale, row * noiseScale);

      // Map the noise value to a size range — some tiles bigger, some smaller
      let drawnSize = map(noiseValue, 0, 1, tileSize * 0.7, tileSize * 1.1);

      // --- SAMPLE COLOUR FROM SOURCE IMAGES ---
      let colourFromAdele = [20, 20, 20, 255];
      let colourFromKiss  = [20, 20, 20, 255];

      // Check if this tile's position falls inside the image draw area
      if (x >= imgDrawX && x < imgDrawX + imgDrawW &&
          y >= imgDrawY && y < imgDrawY + imgDrawH) {

        // Map the canvas position to the image pixel coordinates
        let imgX = floor(map(x, imgDrawX, imgDrawX + imgDrawW, 0, imgAdele.width));
        let imgY = floor(map(y, imgDrawY, imgDrawY + imgDrawH, 0, imgAdele.height));

        // Clamp to make sure we never go outside the image bounds
        imgX = constrain(imgX, 0, imgAdele.width  - 1);
        imgY = constrain(imgY, 0, imgAdele.height - 1);

        colourFromAdele = imgAdele.get(imgX, imgY);
        colourFromKiss  = imgKiss.get(imgX, imgY);
      }

      // --- RANDOM SEED ---
      randomSeed(col * 1000 + row);

      // Generate a small random shift for each colour channel
      let rShift = random(-15, 15);
      let gShift = random(-10, 10);
      let bShift = random(-8,  8);

      // Store all the properties of this tile as an object
      tiles.push({
        x:            x,
        y:            y,
        drawnSize:    drawnSize,
        colourAdele:  colourFromAdele,
        colourKiss:   colourFromKiss,
        rShift:       rShift,
        gShift:       gShift,
        bShift:       bShift,
        // flipProgress goes from 0 (showing Adele) to 1 (showing The Kiss)
        // Other team members will change this value to animate the reveal
        flipProgress: 0,
        flipped:      false
      });
    }
  }
}

// This function draws a single tile to the canvas
function drawTile(tile) {

  // Blend between the Adele colour and the Kiss colour based on flipProgress
  // When flipProgress = 0 we only see Adele; when 1 we only see The Kiss
  let r = lerp(tile.colourAdele[0], tile.colourKiss[0], tile.flipProgress);
  let g = lerp(tile.colourAdele[1], tile.colourKiss[1], tile.flipProgress);
  let b = lerp(tile.colourAdele[2], tile.colourKiss[2], tile.flipProgress);

  // Apply the per-tile colour shift to simulate gold leaf variation
  r = constrain(r + tile.rShift, 0, 255);
  g = constrain(g + tile.gShift, 0, 255);
  b = constrain(b + tile.bShift, 0, 255);

  fill(r, g, b);

  // Draw the tile centred within its grid cell
  let offset = (tileSize - tile.drawnSize) / 2;
  rect(tile.x + offset, tile.y + offset, tile.drawnSize, tile.drawnSize, 2);
}

// This function is called by the User Input teammate when the mouse is clicked
function flipTileAt(x, y) {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].x <= x && x < tiles[i].x + tileSize &&
        tiles[i].y <= y && y < tiles[i].y + tileSize) {
      tiles[i].flipped = true;
    }
  }
}

// This function is called by the Time-based teammate every frame in draw()
function updateFlipProgress() {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].flipped && tiles[i].flipProgress < 1) {
      tiles[i].flipProgress = lerp(tiles[i].flipProgress, 1, 0.05);
      if (tiles[i].flipProgress > 0.99) {
        tiles[i].flipProgress = 1;
      }
    }
  }
}

// Rebuild the tile grid if the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  numCols = floor(width  / tileSize);
  numRows = floor(height / tileSize);
  calculateImageDrawProps();
  buildTiles();
}