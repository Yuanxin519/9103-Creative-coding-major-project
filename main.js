// We need variables to hold our two source images
let imgAdele;
let imgKiss;
 
// We will store all the tile objects in an array
let tiles = [];
 
// This controls the base size of each tile in pixels
// Try changing this value to make the mosaic coarser or finer
let tileSize = 12;
 
// This controls how zoomed in the Perlin noise is
// Smaller values = smoother variation, larger values = more chaotic
let noiseScale = 0.04;
 
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
 
  // Give a same size to two picture
  imgAdele.resize(800, 0);
  imgKiss.resize(800, 0);

  // Calculate the draw area for the image so it fits the canvas without distortion
  calculateImageDrawProps();
 
  // Build all the tiles and store them in the array
  buildTiles();
  initUserInput();
  setupAudio();
 
  
}
 