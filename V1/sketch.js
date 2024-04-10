let img, TILES_X = 100, TILES_Y = 100, BOLDD, CHARS = "FLVRR", string = "imgs/seed1.jpg", laranja, cinza;
let dropzone;
let slid;
let vid;
let cnv;
let resizeButton;
let fxSwitch = 1;
let c1, c2;
let pg;
let b;
let checkbox;
let fontMin;
let animSpeed;

let startTime;


const ancho_inicial = 1080;
const alto_inicial = 1080;

let botón_de_grabación;
let encoder;
let recording = false;


function preload() {
  img = loadImage(string);
    img.willReadFrequently = true; // Setting willReadFrequently to true

  BOLDD = loadFont("FLAVOR.otf");
  pg = createGraphics(width, height);

  HME.createH264MP4Encoder().then(enc => {
    encoder = enc;
    encoder.outputFilename = (random() + "").replace("0.", "flvr");
    encoder.width = ancho_inicial;
    encoder.height = alto_inicial;
    encoder.frameRate = 7;
    encoder.kbps = 50000;
    encoder.groupOfPictures = 10;
    encoder.initialize();
})
  
}

function setup() {


  cnv = createCanvas(ancho_inicial,alto_inicial, WEBGL);
  frameRate(24);

  cnv.parent('output');

  botón_de_grabación = createButton('Gravar')
  botón_de_grabación.mousePressed(() => {
       recording = botón_de_grabación.html() == "Gravar"
       if (recording) {
            botón_de_grabación.html("Parar")
       } else {
            botón_de_grabación.html("Gravar")
            finalizarGrabación()
       }

  })

  checkbox = createCheckbox(' auto');
  checkbox.position(925, 650);

  dropzone = select('#dropzone');
  dropzone.drop(gotFile);

  resizeButton = select('#resizeButton');
  resizeButton.mousePressed(resizeC);

  slid = createSlider(0, 102, 0);
  slid.id('pixelP');

  fontMin = createInput(12, int);
  fontMin.position(1000,650);

  animSpeed = createInput(4, int);
  animSpeed.position(1150,650);

  pixelDensity(2);
  pg = createGraphics(width, height);
  laranja = color('#F84C01'); // Initialize laranja as orange
  cinza = color('#A3A3A3');   // Initialize cinza as gray
  c1 = color(laranja);
  c2 = color(cinza);

  img.resize(TILES_X, TILES_Y);
  TILE_W = width / TILES_X;
  TILE_H = height / TILES_Y;

  textFont(BOLDD);
  textAlign(CENTER, CENTER);
  

  // Load video here in setup
  vid = createVideo('your_video_file.mp4', vidLoaded);
  vid.hide(); // Hide the video element

  

}

function vidLoaded() {
  // Callback function when video is loaded
  vid.loop(); // Start playing the video
}


function draw() {
  
 
  background(0);

  let minSize = fontMin.value();
  let speed = animSpeed.value();


  // loadPixels();
  pg.clear();

  let sinFrameCount = sin(radians(frameCount));

  for (let x = 0; x < TILES_X; x++) {
    for (let y = 0; y < TILES_Y; y++) {
      let c = img.get(x, y);
      b = brightness(c);

      let mappedBrightness = map(b, 0, 100, 0, 255);
      let sinMappedBrightness = map(sin(radians(frameCount / 4 * b)), -1, 1, 0, 255);

      if (fxSwitch == 1) {
        if (checkbox.checked()) {
          if (b < map(sin(radians(frameCount*speed)),-1,1,0,102)) {
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
      pg.textSize(b / map(sinMappedBrightness, 0, 255, 6, minSize));
      pg.translate(x * TILE_W, y * TILE_H);
      // pg.text(CHARS.charAt(map(sin(radians(frameCount + x * y)), -1, 1, 0, CHARS.length - 1)), 0, 0);
      pg.text(CHARS.charAt(random(CHARS.length)),0,0)
      pg.pop();

    }
  }
  // updatePixels();
  // scale(2);

image(pg, -width/2, -height/2, encoder.width, encoder.height);

  grabarFotograma();

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
      // resizeCanvas(vid.width,vid.height);
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


function grabarFotograma() {
  
  if (recording) {
    let imageData = get(0, 0, encoder.width, encoder.height).canvas.toDataURL("image/jpeg", 1.0);
    let img = new Image();
    img.src = imageData;
    img.onload = function() {
      let canvas = document.createElement('canvas');
      canvas.width = encoder.width;
      canvas.height = encoder.height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, encoder.width, encoder.height); // Draw with the correct size
      let imageData = ctx.getImageData(0, 0, encoder.width, encoder.height);
      let rgba = new Uint8Array(imageData.data.buffer);
      encoder.addFrameRgba(rgba);
    };
  }
}



function finalizarGrabación() {
  recording = false
  console.log('recording stopped')

  encoder.finalize()
  const uint8Array = encoder.FS.readFile(encoder.outputFilename);
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }))
  anchor.download = encoder.outputFilename
  anchor.click()
  encoder.delete()


  preload()
  window.location.reload();

}

