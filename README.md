# 9103-Creative-coding-major-project

## Inspiration
Our project was inspired by Gustav Klimt's artworks, particularly Portrait of Adele Bloch-Bauer I and The Kiss. We were interested in how Klimt's use of gold, mosaic-like surfaces, and decorative patterns could be translated into an interactive digital experience.

We also drew inspiration from generative art practices that reconstruct images through repeated geometric elements. These influences led us to create a mosaic system where individual circles act as visual building blocks that gradually transform one artwork into another through interaction, sound, and time.

## Techniques

### Image Mosaic (PerlinNoise)
- A double for loop divides the canvas into a grid, creating one tile object per cell via tiles.push({...}).

- img.get(x, y) samples pixel colour from both paintings, storing colourAdele and colourKiss in each tile.

- Circle size is driven by pixel brightness; noise() adds organic variation so the grid feels hand-crafted rather than mechanical.

- flipProgress (0–1) is the shared property all four mechanics use to blend between the two paintings via lerp().

- calculateImageDrawProps() keeps the image correctly fitted at any window size; windowResized() rebuilds the grid automatically.

### Time-Based Mechanic
- frameCount drives a repeating cycle: 6 seconds idle → wave transition → 6 seconds idle.

- The pattern elapsed % interval === tileIndex activates one column (or row) strip per frame, creating a rolling left-to-right or top-to-bottom wipe.

- Direction alternates each cycle between column wave and row wave using !useColumns.

- lerp(flipProgress, target, 0.95) gives each strip a fast, smooth colour snap.
drawCountdown() shows a live second counter with push() / pop() to isolate text styling.

### User Input Mechanic
- dist(`mouseX`, `mouseY`, `cx`, `cy`) finds tiles within HOVER_RADIUS (80px) of the cursor each frame.

- Tiles inside the radius expand toward `baseSize * BULGE_SCALE` via `lerp()`, creating a ripple bulge effect.

- `map(d, 0, HOVER_RADIUS, 1, 0)` produces a smooth proximity falloff so tiles closest to the cursor bulge most.

- Setting `tile.flipped = true` triggers `updateFlipProgress()`, revealing The Kiss under the cursor.

### Audio Mechanic
- fft.analyze() returns 128 frequency-band energy values each frame; each tile maps to one frequency bin.

- Energy values scale displaySize upward via lerp(), making circles pulse with the music.

- mouseMoved() maps mouse Y to volume and mouse X to stereo pan via song.setVolume() and song.pan().

- A createButton() Play / Pause button lets the viewer start or stop the music at any time.

## Mechanic Ownership

### Team Member Name - PerlinNoise
Your text...

### Xiaorong Dang – TimeBased
Xiaorong Dang: There is a time-driven mosaic transition between two artworks. Pausing every 6 seconds, waves sweep across the canvas column by column (or row by row), flipping all the tiles to reveal the other artwork within 3 seconds. Each cycle alternates between left-to-right and top-to-bottom directions. This cycle repeats infinitely.

### Liqi Lu – UserInput
Responsible for the interactive mouse-based behaviour of the mosaic. This mechanic uses distance calculations and interpolation to create a ripple effect when the cursor moves across the artwork.

Hovering over a tile also activates its flip state, allowing interaction to initiate the artwork transition process.

### Team Member Name – Audio
Your text...


## AI Acknowledgement
Your text...


## External References
Your text...


## Interaction Instructions

1. Click **Play / Pause Music**.
2. Move the mouse over the artwork to change the size of the circle mosaic.
3. Move the mouse vertically to control volume.
4. Move the mouse horizontally to control stereo pan.
