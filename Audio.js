// Audio mechanic (Carol's module)
// Plays a classical music track and uses FFT frequency analysis
// to make tiles pulse in size with the music energy
// Mouse Y controls volume, mouse X controls stereo pan
 
let song; // The audio file we will play = Satie-Gymnopédie n°1.
let fft;
let volume = 1.0;
let pan    = 0.0;
let audioButton;
 
// ------------------------------------------------------------
// setupAudio()
// Called once in setup().
// Loads the audio file and creates the Play/Pause button.
// ------------------------------------------------------------
function setupAudio() {
  // loadSound() loads the audio file asynchronously.
  // The second argument is a callback function that runs
  // ONLY after the sound has fully loaded.  
  song = loadSound("assets/9103-Satie-Gymnopédie n°1.wav", function() {
    // Create an FFT analyser AFTER the sound is loaded.
    // smoothing = 0.8 makes the spectrum less jumpy.
    // 128 bins = medium resolution frequency analysis.
    fft = new p5.FFT(0.8, 128);
    // Connect the FFT to the song so it can analyse it.
    song.connect(fft);
    
    // Create the Play/Pause button.
    // It appears near the bottom-left of the canvas.
    audioButton = createButton("Play / Pause Music");
    audioButton.position(20, height - 40);

    // When the button is clicked, call playPause().
    audioButton.mousePressed(playPause);
  });
}
 
// ------------------------------------------------------------
// drawAudio()
// Called every frame inside draw().
// Uses FFT data to make tiles pulse with the music.
// Also displays current volume and pan values.
// ------------------------------------------------------------
function drawAudio() {
  // Skip if FFT is not ready yet
  if (!fft) return;
 
  // spectrum[] contains 128 values (0–255),
  // each representing the energy of a frequency band.
  let spectrum = fft.analyze();
 
  // Loop through all tiles and scale them based on audio energy.
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
 
// ------------------------------------------------------------
// playPause()
// Toggles between playing and stopping the music.
// Called when the button is pressed.
// ------------------------------------------------------------
function playPause() {
  if (!song) return;
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();
  }
}
 
// ------------------------------------------------------------
// mouseMoved()
// Mouse Y controls volume (top = loud, bottom = quiet).
// Mouse X controls stereo pan (left = left speaker, right = right speaker).
// Called automatically by p5.js whenever the mouse moves.
// ------------------------------------------------------------
function mouseMoved() {
  if (!song) return;
  volume = map(mouseY, 0, height, 1, 0, true);
  song.setVolume(volume);
  pan = map(mouseX, 0, width, -1, 1, true);
  song.pan(pan);
}