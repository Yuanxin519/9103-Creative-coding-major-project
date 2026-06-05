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
 
  // Calculate how many tile columns and rows fit in the image area
  // Used by TimeBased for the wave transition
  numCols = floor(imgDrawW / tileSize);
  numRows = floor(imgDrawH / tileSize);
}
 
// This function creates all the tile objects and fills the tiles array
function buildTiles() {
  tiles = [];
 
  for (let x = imgDrawX; x < imgDrawX + imgDrawW; x += tileSize) {
    for (let y = imgDrawY; y < imgDrawY + imgDrawH; y += tileSize) {
 
      // Convert canvas position to image pixel position
      let imgX = floor(map(x, imgDrawX, imgDrawX + imgDrawW, 0, imgAdele.width));
      let imgY = floor(map(y, imgDrawY, imgDrawY + imgDrawH, 0, imgAdele.height));
      imgX = constrain(imgX, 0, imgAdele.width - 1);
      imgY = constrain(imgY, 0, imgAdele.height - 1);
 
      // Get the colour from each image at this position
      let colourFromAdele = imgAdele.get(imgX, imgY);
      let colourFromKiss  = imgKiss.get(imgX, imgY);
 
      // Calculate brightness by averaging the R, G, B values
      // Dark pixels get larger circles, bright pixels get smaller ones
      // This is inspired by halftone printing technique
      let brightness = (colourFromAdele[0] + colourFromAdele[1] + colourFromAdele[2]) / 3;
      let cellSize = map(brightness, 0, 255, tileSize, tileSize * 0.85);
 
      // Add a small Perlin noise offset to make the sizes feel more organic
      // Without this the sizes would look too uniform and mechanical
      let noiseValue = noise(x * noiseScale, y * noiseScale);
      cellSize = cellSize + map(noiseValue, 0, 1, -1, 1);
      cellSize = constrain(cellSize, 1, tileSize);
 
      // Use a fixed random seed based on position so the colour shift
      // stays the same every frame and does not flicker
      randomSeed(floor(x) * 1000 + floor(y));
 
      // Small random shifts to each colour channel
      // This makes tiles in the same gold area look slightly different
      // like real gold leaf catching light at different angles
      let rShift = random(-15, 15);
      let gShift = random(-10, 10);
      let bShift = random(-8, 8);
 
      // Derive col/row index from pixel position for the wave transition
      let col = floor((x - imgDrawX) / tileSize);
      let row = floor((y - imgDrawY) / tileSize);
 
      // Store everything about this tile as one object
      tiles.push({
        x, y,
        col, row,
        drawnSize:    cellSize,
        colourAdele:  colourFromAdele,
        colourKiss:   colourFromKiss,
        rShift, gShift, bShift,
        // flipProgress is shared with teammates — 0 shows Adele, 1 shows The Kiss
        flipProgress: 0,
        flipped:      false
      });
    }
  }
}
 
// Draws one tile as a circle on the canvas
function drawTile(tile) {
 
  // Mix between Adele colour and Kiss colour depending on how far the flip has gone
  let r = lerp(tile.colourAdele[0], tile.colourKiss[0], tile.flipProgress);
  let g = lerp(tile.colourAdele[1], tile.colourKiss[1], tile.flipProgress);
  let b = lerp(tile.colourAdele[2], tile.colourKiss[2], tile.flipProgress);
 
  // Apply the small colour shift to simulate gold leaf texture
  r = constrain(r + tile.rShift, 0, 255);
  g = constrain(g + tile.gShift, 0, 255);
  b = constrain(b + tile.bShift, 0, 255);
 
  // 250 out of 255 opacity — nearly opaque so colours stay rich
  fill(r, g, b);
 
  // Draw the circle in the centre of its grid cell
  let s = tile.displaySize || tile.drawnSize;
  circle(tile.x + tileSize / 2, tile.y + tileSize / 2, s);
}
 
// Called by the User Input teammate when the mouse interacts with the canvas
// Marks the tile at that position to start flipping
function flipTileAt(x, y) {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].x <= x && x < tiles[i].x + tileSize &&
        tiles[i].y <= y && y < tiles[i].y + tileSize) {
      tiles[i].flipped = true;
    }
  }
}
 
// Called every frame inside draw()
// Smoothly moves flipProgress towards 1 for any tile that has been flipped
function updateFlipProgress() {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].flipped && tiles[i].flipProgress < 1) {
      // lerp makes the animation ease in smoothly rather than jumping
      tiles[i].flipProgress = lerp(tiles[i].flipProgress, 1, 0.05);
      // Snap to exactly 1 when close enough so the flip fully completes
      if (tiles[i].flipProgress > 0.99) {
        tiles[i].flipProgress = 1;
      }
    }
  }
}
 

