// Main sketch file — controls the overall flow of the project
// All shared variables are declared here so every other file can access them
 
let imgAdele;
let imgKiss;
 
let tiles = [];
 
// Base size of each tile in pixels
let tileSize = 12;
 
// Controls how smooth the Perlin noise is across the canvas
let noiseScale = 0.04;
 
// These store where and how big the image is drawn on the canvas
let imgDrawX, imgDrawY, imgDrawW, imgDrawH;
 
// These store how many columns and rows of tiles fit on the canvas
// Used by TimeBased for the wave transition
let numCols, numRows;
 
// Load both images before the sketch starts
function preload() {
  imgAdele = loadImage('assets/Adele_Bloch-Bauer_I.jpg');
  imgKiss  = loadImage('assets/The-Kiss.jpg');
}
 
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255);
  noStroke();
 
  // Resize both images to the same size so they line up correctly when blending
  imgAdele.resize(800, 0);
  imgKiss.resize(800, 0);
 
  // Work out where to draw the image on the canvas
  calculateImageDrawProps();
 
  // Create all the tile objects
  buildTiles();
 
  // Initialise each teammate's mechanic
  initUserInput();
  setupAudio();
}
 
function draw() {
  background(20);

  // 删掉这整段
  // let avgFlip = 0;
  // for (let t of tiles) { ... }
  // if (avgFlip < 0.5) { image(imgAdele...) } else { image(imgKiss...) }

  updateTimeBased();
  updateUserInput();
  drawAudio();

  for (let i = 0; i < tiles.length; i++) {
    drawTile(tiles[i]);
  }

  drawCountdown();
}
 
// Rebuild the tile grid whenever the browser window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateImageDrawProps();
  buildTiles();
  initUserInput();
}