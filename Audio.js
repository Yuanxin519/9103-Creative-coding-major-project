let song;
let fft;
let volume = 1.0;
let pan = 0.0;
let audioButton;

function setupAudio() {
  // 在 setupAudio 里加载音频，不用 preload
  song = loadSound("assets/9103-Satie-Gymnopédie n°1.wav", function() {
    // 加载完成后才连接 FFT 和创建按钮
    fft = new p5.FFT(0.8, 128);
    song.connect(fft);

    audioButton = createButton("Play/Pause Music");
    audioButton.position(20, height - 40);
    audioButton.mousePressed(playPause);
  });
}


function drawAudio() {
  // fft 还没准备好就跳过，避免报错
  if (!fft) return;

  let spectrum = fft.analyze();

  for (let i = 0; i < tiles.length; i++) {
    let binIndex = floor(map(i, 0, tiles.length, 0, 128));
    let energy = spectrum[binIndex] / 255;
    let audioScale = 1 + energy * 1.5;
    let audioTarget = tiles[i].baseSize * audioScale;
    if (audioTarget > tiles[i].displaySize) {
      tiles[i].displaySize = lerp(tiles[i].displaySize, audioTarget, 0.2);
    }
  }

  fill(255);
  noStroke();
  textSize(14);
  text("Volume: " + volume.toFixed(2), 20, 30);
  text("Pan: " + pan.toFixed(2), 20, 50);
}

function playPause() {
  if (!song) return;
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();
  }
}

function mouseMoved() {
  if (!song) return;
  volume = map(mouseY, 0, height, 1, 0, true);
  song.setVolume(volume);
  pan = map(mouseX, 0, width, -1, 1, true);
  song.pan(pan);
}