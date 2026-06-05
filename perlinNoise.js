// This function works out how to fit the image onto the canvas while keeping its proportions
// This is the same approach used in the tutorial code for image display
function calculateImageDrawProps() {
  let aspect = imgAdele.width / imgAdele.height;
  let canvasAspect = width / height;
 
  if (aspect > canvasAspect) {
    // Image is wider than canvas — fit to width
    imgDrawW = width;
    imgDrawH = width / aspect;
    imgDrawX = 0;
    imgDrawY = (height - imgDrawH) / 2;
  } else {
    // Image is taller than canvas — fit to height
    imgDrawH = height;
    imgDrawW = height * aspect;
    imgDrawX = (width - imgDrawW) / 2;
    imgDrawY = 0;
  }
 
  // Make sure the image never overflows the canvas
  if (imgDrawH > height) {
    imgDrawH = height;
    imgDrawW = height * aspect;
    imgDrawX = (width - imgDrawW) / 2;
    imgDrawY = 0;
  }
}
 
function draw() {
  background(20);
  
  if (tiles.length > 0 && tiles[0].flipProgress < 0.5) {
    image(imgAdele, imgDrawX, imgDrawY, imgDrawW, imgDrawH);
  } else {
    image(imgKiss, imgDrawX, imgDrawY, imgDrawW, imgDrawH);
  }
  
  updateFlipProgress();
  updateUserInput();
  
  for (let i = 0; i < tiles.length; i++) {
    drawTile(tiles[i]);
  }
}
 
// This function creates all the tile objects and fills the tiles array
function buildTiles() {
  tiles = [];

  for (let x = imgDrawX; x < imgDrawX + imgDrawW; x += tileSize) {
    for (let y = imgDrawY; y < imgDrawY + imgDrawH; y += tileSize) {

      let imgX = floor(map(x, imgDrawX, imgDrawX + imgDrawW, 0, imgAdele.width));
      let imgY = floor(map(y, imgDrawY, imgDrawY + imgDrawH, 0, imgAdele.height));
      imgX = constrain(imgX, 0, imgAdele.width - 1);
      imgY = constrain(imgY, 0, imgAdele.height - 1);

      let colourFromAdele = imgAdele.get(imgX, imgY);
      let colourFromKiss  = imgKiss.get(imgX, imgY);

      // 亮度决定圆的大小
      let brightness = (colourFromAdele[0] + colourFromAdele[1] + colourFromAdele[2]) / 3;
      // Perlin noise 加有机感
      let noiseValue = noise(x * noiseScale, y * noiseScale);
      let cellSize = map(brightness, 0, 255, tileSize, tileSize * 0.85);
      cellSize = cellSize + map(noiseValue, 0, 1, -1, 1);
      cellSize = constrain(cellSize, 1, tileSize);

      randomSeed(floor(x) * 1000 + floor(y));
      let rShift = random(-15, 15);
      let gShift = random(-10, 10);
      let bShift = random(-8, 8);

      tiles.push({
        x, y,
        drawnSize:    cellSize,
        colourAdele:  colourFromAdele,
        colourKiss:   colourFromKiss,
        rShift, gShift, bShift,
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
 
  fill(r, g, b, 250);
 
  // Draw the circle centred within its grid cell
  circle(tile.x + tileSize / 2, tile.y + tileSize / 2, tile.drawnSize);
}
 
// This function is called by the User Input teammate when the mouse is clicked
// It finds the tile at the given canvas position and marks it to flip
function flipTileAt(x, y) {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].x <= x && x < tiles[i].x + tileSize &&
        tiles[i].y <= y && y < tiles[i].y + tileSize) {
      tiles[i].flipped = true;
    }
  }
}
 
// This function is called by the Time-based teammate every frame in draw()
// It smoothly animates any flipped tiles towards showing The Kiss
function updateFlipProgress() {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].flipped && tiles[i].flipProgress < 1) {
      // lerp creates a smooth easing animation towards 1
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
  calculateImageDrawProps();
  buildTiles();
}
 
