// Truchet Tiles - p5.js
// 按 R 重新随机。按 S 保存。点击切换样式。
// 两种样式：'arc' 圆弧版，'diag' 对角线版

let tileSize = 60; // 单块尺寸
let cols, rows;
let styleName = "arc"; // 初始样式：'arc' 或 'diag'
let seed = 1234;

function setup() {
  createCanvas(960, 720);
  noLoop();
  cols = floor(width / tileSize);
  rows = floor(height / tileSize);
}

function draw() {
  randomSeed(seed);
  background(250);
  stroke(20);
  strokeWeight(2);
  noFill();

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * tileSize;
      const y = j * tileSize;

      // 决定旋转与反相
      const r = floor(random(4)); // 0..3 四种旋转
      const flip = random() < 0.5; // 是否取反
      push();
      translate(x + tileSize / 2, y + tileSize / 2);
      rotate((PI / 2) * r);

      if (styleName === "arc") {
        drawArcTile(tileSize, flip);
      } else {
        drawDiagTile(tileSize, flip);
      }
      pop();
    }
  }

  // 边框
  noFill();
  stroke(0, 30);
  rect(0.5, 0.5, cols * tileSize - 1, rows * tileSize - 1);
}

// 经典圆弧版 Truchet：在相对角各画 1/4 圆弧
function drawArcTile(s, flip) {
  const r = s; // 让圆弧半径等于 tileSize，弧线从角到角更顺滑
  const o = s / 2;

  if (!flip) {
    // 左上到右上角、左下到右下角的连通方式
    arc(-o, -o, r, r, 0, HALF_PI); // 左上，向右下
    arc(o, o, r, r, PI, PI + HALF_PI); // 右下，向左上
    arc(o, o, r / 1.4, r / 1.4, PI, PI + HALF_PI); // 右下，向左上
  } else {
    // 另一种对称
    arc(o, -o, r, r, HALF_PI, PI); // 右上，向左下
    arc(-o, o, r, r, -HALF_PI, 0); // 左下，向右上
  }
}

// 对角线版：两条从中点到中点的对角线，flip 决定朝向
function drawDiagTile(s, flip) {
  const o = s / 2;
  if (!flip) {
    line(-o, -o, o, o);
    line(-o, o, o, -o);
  } else {
    // 反相时改为边中点相连，形成另一种连接逻辑
    line(-o, 0, 0, -o);
    line(0, o, o, 0);
  }
}

// 交互
function keyPressed() {
  if (key === "R" || key === "r") {
    seed = floor(random(1e9));
    redraw();
  }
  if (key === "S" || key === "s") {
    saveCanvas("truchet_tiles", "png");
  }
}

function mousePressed() {
  styleName = styleName === "arc" ? "diag" : "arc";
  redraw();
}

// 可选：调整格子大小
function windowResized() {
  // 如果想自适应窗口，取消下面三行注释
  // resizeCanvas(windowWidth, windowHeight);
  // cols = floor(width / tileSize);
  // rows = floor(height / tileSize);
}
