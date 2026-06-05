// Audio mechanic
// Plays a classical music track and uses FFT frequency analysis
// to make tiles pulse in size with the music energy
// Mouse Y controls volume, mouse X controls stereo pan
 
let song;
let fft;
let volume = 1.0;
let pan    = 0.0;
let audioButton;
 
// Call once in setup() to load the audio and create the play button
function setupAudio() {
  song = loadSound("assets/9103-Satie-Gymnopédie n°1.wav", function() {
    // Only connect FFT and create button after the sound has fully loaded
    fft = new p5.FFT(0.8, 128);
    song.connect(fft);
 
    audioButton = createButton("Play / Pause Music");
    audioButton.position(20, height - 40);
    audioButton.mousePressed(playPause);
  });
}
 
// Call every frame inside draw()
// Uses FFT frequency data to scale tile display sizes with the music energy
function drawAudio() {
  // Skip if FFT is not ready yet
  if (!fft) return;
 
  let spectrum = fft.analyze();
 
  for (let i = 0; i < tiles.length; i++) {
    // Map each tile to a frequency bin in the spectrum
    let binIndex  = floor(map(i, 0, tiles.length, 0, 128));
    let energy    = spectrum[binIndex] / 255;
    let audioScale = 1 + energy * 1.5;
 
    // Use baseSize if available (added by UserInput), otherwise fall back to drawnSize
    let audioTarget = (tiles[i].baseSize || tiles[i].drawnSize) * audioScale;
 
    // Only grow tiles, never shrink them — UserInput handles shrinking
    if (audioTarget > tiles[i].displaySize) {
      tiles[i].displaySize = lerp(tiles[i].displaySize, audioTarget, 0.2);
    }
  }
 
  // Show current volume and pan values on screen
  fill(255);
  noStroke();
  textSize(14);
  text("Volume: " + volume.toFixed(2), 20, 30);
  text("Pan: "    + pan.toFixed(2),    20, 50);
}
 
// Toggle play and pause when the button is pressed
function playPause() {
  if (!song) return;
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();
  }
}
 
// Mouse Y controls volume, mouse X controls stereo pan
function mouseMoved() {
  if (!song) return;
  volume = map(mouseY, 0, height, 1, 0, true);
  song.setVolume(volume);
  pan = map(mouseX, 0, width, -1, 1, true);
  song.pan(pan);
}