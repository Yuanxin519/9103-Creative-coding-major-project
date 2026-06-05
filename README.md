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
Your text...

### User Input Mechanic
Your text...

### Audio Mechanic
Your text...

## Mechanic Ownership

## AI Acknowledgement

## External References


## Interaction Instructions

1. Click **Play / Pause Music**.
2. Move the mouse over the artwork to change the size of the circle mosaic.
3. Move the mouse vertically to control volume.
4. Move the mouse horizontally to control stereo pan.
