let img, TILES_X = 70, TILES_Y = 70, BOLDD, CHARS = "FLVR", string = "imgs/seed1.jpg", laranja, cinza;
let dropzone;
let slid;
let vid;
let cnv;
let resizeButton;
let gradient = false;
let fxSwitch = 1;
let c1, c2;
let pg;
let b;
let checkbox;


let capturer; // CCapture instance for video recording
let recording = false;
let startTime;

function preload() {
  img = loadImage(string);
  BOLDD = loadFont("CarbonaTest-MonoBold.ttf");
  checkbox.addClass('autoCheck')
  checkbox.id('autoCheck');
}

function setup() {
  cnv = createCanvas(600, 600, WEBGL);
  cnv.parent('output');
  checkbox = createCheckbox(' auto');
  // checkbox.addClass('autoCheck')
  checkbox.position(925, 650);


  pixelDensity(2);
  pg = createGraphics(width, height);
  c1 = color(11, 11, 11);
  c2 = color(200);
  img.resize(TILES_X, TILES_Y);
  TILE_W = width / TILES_X;
  TILE_H = height / TILES_Y;
  textFont(BOLDD);
  textAlign(CENTER, CENTER);
  laranja = color('#F84C01');
  cinza = color('#A3A3A3');

  dropzone = select('#dropzone');
  dropzone.drop(gotFile);

  resizeButton = select('#resizeButton');
  resizeButton.mousePressed(resizeC);

  slid = createSlider(0, 102, 0);
  slid.id('pixelP');

  capturer = new CCapture({
    format: 'webm',
    framerate: 7,
    quality: 100
  });

  // Start/Stop recording when 'R' key is pressed
  document.addEventListener('keydown', function(event) {
    if (event.key === 'r') {
      if (!recording) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  });
}

function startRecording() {
  capturer.start();
  recording = true;
  startTime = millis();
}

function stopRecording() {
  capturer.stop();
  capturer.save();
  recording = false;
}

function draw() {
  if (gradient == false) {
    background("#000000");
  } else if (gradient == true) {
    for (let y = 0; y < height; y++) {
      let n = map(y, 0, height, 0, 1);
      let newc = lerpColor(c1, c2, n);
      stroke(newc);
      line(0, y, width, y);
    }
  }

  loadPixels();
  pg.clear();

  let sinFrameCount = sin(radians(frameCount));
  let mappedFrameCount = map(sinFrameCount, -1, 1, 0, CHARS.length - 1);

  for (let x = 0; x < TILES_X; x++) {
    for (let y = 0; y < TILES_Y; y++) {
      let c = img.get(x, y);
      b = brightness(c);
      let selector = int(map(b, 0, 100, 0, CHARS.length) - 1);

      let mappedBrightness = map(b, 0, 100, 0, 255);
      let sinMappedBrightness = map(sin(radians(frameCount / 4 * b)), -1, 1, 0, 255);

      if (fxSwitch == 1) {
        if (checkbox.checked()) {
          if (b < map(sin(radians(frameCount)),-1,1,0,102)) {
            pg.fill(laranja, mappedBrightness);
          } else {
            pg.fill(cinza, sinMappedBrightness);
          }
        } else {
          if (b < slid.value()) {
            pg.fill(laranja, mappedBrightness);
          } else {
            pg.fill(cinza, sinMappedBrightness);
          }
        }
      }
      

      pg.push();
      pg.textFont(BOLDD);
      pg.textSize(b / map(sinMappedBrightness, 0, 255, 7, 12));
      pg.translate(x * TILE_W, y * TILE_H);
      pg.text(CHARS.charAt(map(sin(radians(frameCount + x * y)), -1, 1, 0, CHARS.length - 1)), 0, 0);
      pg.pop();
    }
  }
  updatePixels();
  image(pg, -width/2, -height/2, width, height);

  // Record while 'R' is held down
  if (recording) {
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    laranja = color('#A3A3A3');
    cinza = color('#F84C01');
  } else if (keyCode === RIGHT_ARROW) {
    laranja = color('#F84C01');
    cinza = color('#A3A3A3');
  } else if (keyCode === 83) {
    save(pg, "flvr-alpha.png");
  } else if (keyCode === 65) {
    save(cnv, "flvr.png");
  } else if (keyCode === 68) {
    filter(THRESHOLD, 0.1);
    save(cnv, "flvr-mask.png");
  }
}

function gotFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      resizeCanvas(img.width, img.height)
      img.resize(TILES_X, TILES_Y);
    });
  } else if (file.type === 'video') {
    vid = createVideo(file.data, () => {
      resizeCanvas(vid.width/4,vid.height/4);
      vid.size(TILES_X, TILES_Y);
      vid.loop();
      vid.hide();
      img = vid;
      img.volume(0); // Mute the video if audio is not needed
    });
  }
}

function resizeC() {
  resizeCanvas(1920, 1080);
}
