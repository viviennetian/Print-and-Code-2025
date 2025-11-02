// Vera Molnar (1974) - Carrés perturbés
//original drawing:
//https://collections.vam.ac.uk/item/O1193777/structures-of-squares-drawing-molnar-vera/
// full reproduction in p5.js

let cols = 5; // 6x6 grid
let rows = 5;
let margin = 30;
let layers = 8; // nested squares per cell
let seed = 1000; // reproducibility

function setup() {
  createCanvas(11 * 72, 8.5 * 72, SVG);
  noFill();
  stroke(0);
  strokeWeight(1);
  rectMode(CENTER);
  randomSeed(seed);
  background(255);

  let cellW = (width * 0.6) / cols;
  let cellH = (width * 0.6) / rows;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      push();
      translate(margin + cellW * (i + 0.5), margin + cellH * (j + 0.5));
      drawSquareSet(min(cellW, cellH) * 0.9);
      pop();
    }
  }
  save("nested_squares.svg");
}

function drawSquareSet(size) {
  let base = size;
  for (let n = 0; n < layers; n++) {
    let s = base * map(n, 0, layers - 1, 1, 0.1);
    let offset = s * 0.3; // offset amount
    let dx = random(-offset, offset);
    let dy = random(-offset, offset);
    rect(dx, dy, s, s);
  }
}
