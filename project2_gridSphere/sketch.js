let apiKey = "AIzaSyBMzjJz8TDbWlZ_DRlyCN9580utzgLBly8";
let datasetUrl =
  "https://data.cityofnewyork.us/resource/8znf-7b2c.json?$where=section='MN041'&$limit=20";

let dpi = 300;
let pageW = 8.5;
let pageH = 11;
let canvasW = pageW * dpi;
let canvasH = pageH * dpi;

let baseLat, baseLng;
let grid;
let imgSize = (canvasH * 0.8) / 5;

let dataAll = []; //store all data of litter bins
let currentIndex = 0; //which bin we are showing now
let images = []; // store 17 images for current bin

let orange, green;

// directions with corresponding headings
let directions = [
  { label: "N", heading: 0 },
  { label: "NE", heading: 45 },
  { label: "E", heading: 90 },
  { label: "SE", heading: 135 },
  { label: "S", heading: 180 },
  { label: "SW", heading: 225 },
  { label: "W", heading: 270 },
  { label: "NW", heading: 315 },
];

function setup() {
  createCanvas(canvasW, canvasH);

  // Unable to use Riso because extractCMYKChannel() cannot be applied to images loaded from the Google Maps API

  // orange = new Riso("orange");
  // green = new Riso("green");

  noLoop(); // draw() will be called only when redraw() is invoked

  //using EasyGrid to layout images
  grid = new EasyGrid({
    x: canvasW / 2 - (imgSize * 5) / 2 + imgSize / 2,
    y: canvasH / 2 - (imgSize * 5) / 2,
    columns: 5,
    rows: 5,
    width: imgSize * 5,
    height: imgSize * 5,
    gutter: 0,
  });

  //load dataset
  loadJSON(datasetUrl, (data) => {
    dataAll = data.filter((o) => o.point && o.point.coordinates);
    console.log("Loaded", dataAll.length, "bins");
    loadNextBin();
  });
}

// ===== change to the next bin =====
// by clicking on the screen, to switch to the next bin position on the dataset
function loadNextBin() {
  if (currentIndex >= dataAll.length) currentIndex = 0; //loop back to first bin

  images = [];
  background(240); //clear previous images

  let obj = dataAll[currentIndex]; //get current bin object coordinates
  baseLng = obj.point.coordinates[0];
  baseLat = obj.point.coordinates[1];

  console.log("Now showing bin", currentIndex + 1, "at", baseLat, baseLng);
  generateImagesFor(baseLat, baseLng); //pass out lat,lng to generate images
}

function mousePressed() {
  currentIndex++;
  background(220);

  loadNextBin();
}

//===== Generate image URLs and load images =======
function generateImagesFor(baseLat, baseLng) {
  let fov = 40;
  let urls = [];

  // center look down pitch -90
  urls.push({ col: 3, row: 3, heading: 0, pitch: -90 });

  // middle pitch -45
  urls.push({ col: 3, row: 2, heading: 0, pitch: -45 }); // N
  urls.push({ col: 4, row: 2, heading: 45, pitch: -45 }); // NE
  urls.push({ col: 4, row: 3, heading: 90, pitch: -45 }); // E
  urls.push({ col: 4, row: 4, heading: 135, pitch: -45 }); // SE
  urls.push({ col: 3, row: 4, heading: 180, pitch: -45 }); // S
  urls.push({ col: 2, row: 4, heading: 225, pitch: -45 }); // SW
  urls.push({ col: 2, row: 3, heading: 270, pitch: -45 }); // W
  urls.push({ col: 2, row: 2, heading: 315, pitch: -45 }); // NW

  // outside pitch 0
  urls.push({ col: 3, row: 1, heading: 0, pitch: 0 }); // N
  urls.push({ col: 5, row: 1, heading: 45, pitch: 0 }); // NE
  urls.push({ col: 5, row: 3, heading: 90, pitch: 0 }); // E
  urls.push({ col: 5, row: 5, heading: 135, pitch: 0 }); // SE
  urls.push({ col: 3, row: 5, heading: 180, pitch: 0 }); // S
  urls.push({ col: 1, row: 5, heading: 225, pitch: 0 }); // SW
  urls.push({ col: 1, row: 3, heading: 270, pitch: 0 }); // W
  urls.push({ col: 1, row: 1, heading: 315, pitch: 0 }); // NW

  // Load images from generated URLs
  for (let i = 0; i < urls.length; i++) {
    // Get current image data
    let u = urls[i];

    // Get the grid cell for this position (returns x, y center)
    let module = grid.getModule(u.col, u.row);

    // Define the image size for Google Street View request
    let size = imgSize + "x" + imgSize;

    // Build the Street View API URL
    let url =
      "https://maps.googleapis.com/maps/api/streetview?size=" +
      size +
      "&location=" +
      baseLat +
      "," +
      baseLng +
      "&heading=" +
      u.heading +
      "&pitch=" +
      u.pitch +
      "&fov=" +
      fov +
      "&source=outdoor&key=" +
      apiKey;

    // Load the image from the Street View API
    loadImage(
      url,
      function (img) {
        // Add small random rotation for a natural look
        let randomAngle = random(-5, 5);

        // Save this image’s info into the images array
        images.push({
          img: img,
          // c: c, // store cyan channel
          // m: m, // store magenta channel
          x: module.x,
          y: module.y,
          heading: u.heading,
          randomAngle: randomAngle,
        });

        // Redraw the canvas after each image loads
        redraw();
      },
      function () {
        // If the image fails to load, log a warning
        console.warn("Failed to load", url);
      }
    );
  }
}

function draw() {
  background(255);
  imageMode(CENTER);

  for (let i = 0; i < images.length; i++) {
    let { img, x, y, heading, randomAngle } = images[i]; //destructuring assignment //局部变量
    push();
    translate(x, y);
    rotate(radians(heading + randomAngle));
    // just get the image
    image(img, 0, 0, imgSize, imgSize);

    // if (img) {
    //   console.log("img is available");
    //   let cs = extractCMYKChannel(img, "cyan");
    //   let ms = extractCMYKChannel(img, "magenta");

    //   // ===== Map channels to layers =====
    //   green.image(cs, 0, 0, imgSize, imgSize); // Cyan → Green ink
    //   orange.image(ms, 0, 0, imgSize, imgSize); // Magenta → Orange ink
    // } else {
    //   // Draw placeholder
    //   fill(220);
    //   rect(0, 0, imgSize, imgSize);
    // }

    pop();
  }
  // Combine both layers for preview
  // drawRiso();

  if (!dataAll || !dataAll[currentIndex]) {
    return; // 跳过这一帧，直到数据加载好
  }
  let obj = dataAll[currentIndex];

  // avoid undefined, some field is void
  let section = obj.section || "";
  let basketid = obj.basketid || "";
  let street1 = obj.streetname1 || "";
  let street2 = obj.streetname2 || "";

  fill(0);
  textFont("Times New Roman");
  textStyle(ITALIC);
  textSize(dpi / 10);
  textAlign(CENTER);

  text("have you...", width / 2, (canvasH / 8) * 6.9);
  text(
    "try to find the trash can on the street...?",
    width / 2,
    (canvasH / 8) * 7
  );

  // 只有非空才打印
  if (basketid) {
    text(
      `section: ${section} | bin ID: ${basketid}`,
      width / 2,
      (canvasH / 10) * 9.2
    );
  }

  if (street1 || street2) {
    text(
      `street: ${street1}${street1 && street2 ? " & " : ""}${street2}`,
      width / 2,
      (canvasH / 10) * 9.3
    );
  }

  if (baseLat && baseLng) {
    text(`lat: ${baseLat.toFixed(6)}`, width / 2, (canvasH / 10) * 9.4);
    text(`lng: ${baseLng.toFixed(6)}`, width / 2, (canvasH / 10) * 9.5);
  }
}
