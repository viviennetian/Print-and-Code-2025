// ======================================================
// CONFIG
// ======================================================
let W = 7.5 * 120; // 900 px
let H = 10 * 120; // 1200 px

// Each "granny square" is based on this cell size.
// There are 4 columns × 3 rows, so 12 clusters.
let cell = 260;
let cols = 4;
let rows = 3;

// These are the only colors that appear in the final artwork.
// The four inner-ring colors + the fixed outer black.
let paletteColors = ["#ff6b6b", "#4d96ff", "#ffb703", "#8ecae6", "#b5179e"];
let colorList = [
  "#ff6b6b",
  "#4d96ff",
  "#ffb703",
  "#8ecae6",
  "#b5179e",
  "#000000",
];

// This object will hold 5 separate SVG graphics buffers,
// one for each color layer (invisible, for exporting).
let layers = {};

// This array will store the randomized assignments for all 12 granny units.
// Each element will contain its x/y position and the three ring colors.
let grannyData = [];

// These are used for the oval shapes (the "chain stitches").
let chainX = 11;
let chainY = 7;

// ======================================================
// ===== Setup: create the main canvas and initialize ====
function setup() {
  createCanvas(W, H);
  angleMode(RADIANS);
  noLoop();

  generateGrannyData(); // stable random colors
  createLayers(); // create 5 SVG layer buffers
  renderLayers(); // draw each layer into its buffer
}

// ======================================================
// ===== Randomizing the 12 granny units once =====
function generateGrannyData() {
  grannyData = [];

  // Loop over the 3×4 grid
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Randomly pick two distinct colors from the palette.
      // These are the inner and middle ring colors.
      let inner1 = random(paletteColors);
      let inner2 = random(paletteColors);
      while (inner2 === inner1) inner2 = random(paletteColors);

      grannyData.push({
        x,
        y,
        inner1,
        inner2,
        outer: "#000000", //// Always black on the outside
      });
    }
  }
}

// ======================================================
// ===== Creating the SVG layers for exporting =====
function createLayers() {
  // For each of the 5 final colors,
  // create a new p5.Graphics object in SVG mode.
  for (let c of colorList) {
    layers[c] = createGraphics(W, H, SVG);
    // Make sure line styling matches the main sketch.
    layers[c].strokeWeight(1.5);
    layers[c].noFill();
  }
}

// ======================================================
// ===== Draw all granny units into their color layers ===
function renderLayers() {
  // Loop over all 12 units
  for (let g of grannyData) {
    // Compute the center positions for each unit,
    // so everything is symmetrically centered on the canvas.
    let px = centerX(g.x);
    let py = centerY(g.y);

    // Draw the inner ring into the appropriate layer
    drawGrannyFull(layers[g.inner1], px, py, g, "inner1");
    // Draw the middle ring into its color layer
    drawGrannyFull(layers[g.inner2], px, py, g, "inner2");
    // Draw the outer ring (black) into the black layer
    drawGrannyFull(layers[g.outer], px, py, g, "outer");
  }
}

// ======================================================
// ===== Preview on the main canvas ======
function draw() {
  background(255);

  // Loop through all granny units
  for (let g of grannyData) {
    push();
    translate(centerX(g.x), centerY(g.y));

    // Draw the full-color version
    // so you see exactly what SVG output will look like.
    drawGrannyPreview(g);
    pop();
  }
}

// ======================================================
// ===== compute centered grid placement =====
function centerX(col) {
  // Compute total grid width based on spacing
  let gridW = cell + (cols - 1) * cell * 0.75;
  return (W - gridW) / 2 + col * cell * 0.75 + cell / 2;
}

function centerY(row) {
  let gridH = cell + (rows - 1) * cell * 0.75;
  return (H - gridH) / 2 + row * cell * 0.75 + cell / 2;
}

// ======================================================
// ===== Mouse click = export the five SVG layers =====
function mousePressed() {
  // Save each color layer independently.
  // This gives you 5 separate SVG files.
  for (let c of colorList) {
    layers[c].save("layer_" + c.replace("#", "") + ".svg");
  }
}

// ======================================================
// ===== Drawing logic for layers and preview ======

// This function draws ONE of the three rings (inner1, inner2, or outer)
// into a given graphics buffer (gfx).
function drawGrannyFull(gfx, x, y, g, mode) {
  gfx.push();
  gfx.translate(x, y);
  gfx.strokeWeight(1.5);
  gfx.noFill();

  // Depending on the mode, we select the right ring
  if (mode === "inner1") {
    gfx.stroke(g.inner1);
    drawCenterRing(gfx, 0, 0, 25);
    drawDoubleClusters(gfx, 0, 0, 45);
    drawCornerChains(gfx, 40, 12);
  }

  if (mode === "inner2") {
    gfx.stroke(g.inner2);
    drawOuterClustersFlexible(gfx, 70, 2, chainX, 45);
    drawCornerChains(gfx, 70, 12);
    drawSideChainsBetweenGroups(gfx, 70, 2, 10, chainX, chainY);
  }

  if (mode === "outer") {
    gfx.stroke(g.outer);
    drawOuterClustersFlexible(gfx, 100, 3, chainX, 75);
    drawCornerChains(gfx, 100, 12);
    drawSideChainsBetweenGroups(gfx, 100, 3, 10, chainX, chainY);
  }
  gfx.pop();
}

// The preview version draws all three rings at once.
// This is the full-color version seen on the main canvas.
function drawGrannyPreview(g) {
  push();

  // center ring
  stroke(g.inner1);
  drawCenterRing(this, 0, 0, 25);
  drawDoubleClusters(this, 0, 0, 45);
  drawCornerChains(this, 40, 12);

  // second ring
  stroke(g.inner2);
  drawOuterClustersFlexible(this, 70, 2, chainX, 45);
  drawCornerChains(this, 70, 12);
  drawSideChainsBetweenGroups(this, 70, 2, 10, chainX, chainY);

  // outer ring
  stroke(0);
  drawOuterClustersFlexible(this, 100, 3, chainX, 75);
  drawCornerChains(this, 100, 12);
  drawSideChainsBetweenGroups(this, 100, 3, 10, chainX, chainY);

  pop();
}

// ======================================================
// ===== Primitive drawing helpers (the core shapes) =====

// Draw the center small ring + 6 petals
function drawCenterRing(p, x, y, r) {
  p.ellipse(x, y, r);
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i;
    let px = (cos(angle) * r) / 2;
    let py = (sin(angle) * r) / 2;
    p.push();
    p.translate(px, py);
    p.rotate(angle + HALF_PI);
    p.ellipse(0, 0, chainX, chainY);
    p.pop();
  }
}

// Four-direction symmetrical long stitches
function drawDoubleClusters(p, x, y, dist) {
  for (let a = 0; a < 4; a++) {
    p.push();
    p.rotate(HALF_PI * a);
    for (let i = -1; i <= 1; i++) {
      let baseY1 = 20;
      let baseY2 = dist;
      let spread1 = map(baseY1, 20, dist, 2, 10);
      let spread2 = map(baseY2, 20, dist, 2, chainX);
      let x1 = i * spread1;
      let y1 = baseY1;
      let x2 = i * spread2;
      let y2 = baseY2;
      p.line(x1, y1, x2, y2);
      let capSize = 6;
      p.line(x2 - capSize / 2, y2, x2 + capSize / 2, y2);
      let upperOffset = -5;
      let upperScale = 0.7;
      p.line(
        x2 - (capSize * upperScale) / 2,
        y2 + upperOffset,
        x2 + (capSize * upperScale) / 2,
        y2 + upperOffset
      );
    }
    p.pop();
  }
}

// Draw flexible outer clusters
function drawOuterClustersFlexible(
  p,
  dist,
  groupCountPerSide,
  spreadMax,
  baseY
) {
  for (let a = 0; a < 4; a++) {
    p.push();
    p.rotate(HALF_PI * a);
    let step = (dist * 2) / (groupCountPerSide + 1);
    for (let g = 1; g <= groupCountPerSide; g++) {
      let sideOffset = -dist + step * g;
      for (let i = -1; i <= 1; i++) {
        let y1 = baseY;
        let y2 = dist;
        let spread1 = map(y1, baseY, dist, 2, 10);
        let spread2 = map(y2, baseY, dist, 2, spreadMax);
        let x1 = i * spread1 + sideOffset;
        let x2 = i * spread2 + sideOffset;
        p.line(x1, y1, x2, y2);
        let capSize = 6;
        p.line(x2 - capSize / 2, y2, x2 + capSize / 2, y2);
        let upperOffset = -5;
        let upperScale = 0.7;
        p.line(
          x2 - (capSize * upperScale) / 2,
          y2 + upperOffset,
          x2 + (capSize * upperScale) / 2,
          y2 + upperOffset
        );
      }
    }
    p.pop();
  }
}

// Four-corner chain stitches
function drawCornerChains(p, side, step) {
  let corners = [
    createVector(-side, -side),
    createVector(side, -side),
    createVector(side, side),
    createVector(-side, side),
  ];
  for (let i = 0; i < corners.length; i++) {
    let c = corners[i];
    let angleToCenter = atan2(-c.y, -c.x) + HALF_PI;
    p.push();
    p.translate(c.x, c.y);
    p.rotate(angleToCenter);
    p.ellipse(0, 0, chainX, chainY);
    p.pop();

    // After drawing the corner oval, draw some offset ovals chains nearby
    if (i === 0) {
      drawOffsetChain(p, c.x, c.y, 0, step, chainX, chainY, 90);
      drawOffsetChain(p, c.x, c.y, step, 0, chainX, chainY, 0);
    } else if (i === 1) {
      drawOffsetChain(p, c.x, c.y, 0, step, chainX, chainY, 90);
      drawOffsetChain(p, c.x, c.y, -step, 0, chainX, chainY, 0);
    } else if (i === 2) {
      drawOffsetChain(p, c.x, c.y, 0, -step, chainX, chainY, 90);
      drawOffsetChain(p, c.x, c.y, -step, 0, chainX, chainY, 0);
    } else if (i === 3) {
      drawOffsetChain(p, c.x, c.y, 0, -step, chainX, chainY, 90);
      drawOffsetChain(p, c.x, c.y, step, 0, chainX, chainY, 0);
    }
  }
}

// Offset chain ellipse
function drawOffsetChain(p, baseX, baseY, dx, dy, w, h, rot) {
  p.push();
  p.translate(baseX + dx, baseY + dy);
  p.rotate(radians(rot));
  p.ellipse(0, 0, w, h);
  p.pop();
}

// Side chains between groups
function drawSideChainsBetweenGroups(
  p,
  dist,
  groupCountPerSide,
  pairSpacing,
  w,
  h
) {
  for (let a = 0; a < 4; a++) {
    p.push();
    p.rotate(a * HALF_PI);
    let step = (dist * 2) / (groupCountPerSide + 1);
    let groupOffsets = [];
    for (let g = 1; g <= groupCountPerSide; g++) {
      groupOffsets.push(-dist + step * g);
    }
    for (let g = 0; g < groupOffsets.length - 1; g++) {
      let mid = (groupOffsets[g] + groupOffsets[g + 1]) / 2;
      p.push();
      p.translate(mid - pairSpacing / 2, -dist);
      p.ellipse(0, 0, w, h);
      p.pop();
      p.push();
      p.translate(mid + pairSpacing / 2, -dist);
      p.ellipse(0, 0, w, h);
      p.pop();
    }
    p.pop();
  }
}
