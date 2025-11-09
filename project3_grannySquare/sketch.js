let chainX = 12;
let chainY = 7;

function setup() {
  createCanvas(600, 600);
  background(255);
  translate(width / 2, height / 2);
  noFill();
  stroke(80, 130, 130);
  strokeWeight(2);

  // 中心圈
  drawCenterRing(0, 0, 25);

  // 第一圈长针群
  drawDoubleClusters(0, 0, 45, chainY);

  // 第一圈四角锁针
  drawCornerChains(40, 0, 12);

  // 第二圈：外圈长针群
  drawOuterClusters(70, 30, chainX);

  // 第二圈：外圈四角锁针
  drawCornerChains(65, 0, 12);

  // 第二圈：四边中央的两颗锁针
  drawSideChains(70, 7, chainX, chainY);
}

// 中心小圈
function drawCenterRing(x, y, r) {
  stroke(0);
  noFill();
  ellipse(x, y, r); // 中心圈

  // 圈中小锁针圈
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i;
    let px = (cos(angle) * r) / 2;
    let py = (sin(angle) * r) / 2;

    push();
    translate(px, py);
    rotate(angle + HALF_PI); // 椭圆朝向中心（垂直于半径方向）
    ellipse(0, 0, chainX, chainY);
    pop();
  }
}

// 长针群（四个方向）
function drawDoubleClusters(x, y, dist, len) {
  for (let a = 0; a < 4; a++) {
    let angle = HALF_PI * a;
    push();
    rotate(angle);

    // 从中心(20)到外缘(dist)绘制三根针
    // 让横向间距随着 y 值线性增大
    for (let i = -1; i <= 1; i++) {
      // 定义底端的水平偏移：随距离增大
      let baseY1 = 20;
      let baseY2 = dist;
      let spread1 = map(baseY1, 20, dist, 2, 12); // 中心处针距较小
      let spread2 = map(baseY2, 20, dist, 2, chainX); // 外缘针距较大

      // 计算上端和下端的横坐标
      let x1 = i * spread1;
      let y1 = baseY1;
      let x2 = i * spread2;
      let y2 = baseY2;

      // 画长针
      line(x1, y1, x2, y2);

      // 上下横杠（针脚符号）
      let capSize = 6;
      line(x2 - capSize / 2, y2, x2 + capSize / 2, y2); // 底部横杠
    }
    pop();
  }
}

function drawCornerChains(side, offset, step) {
  noFill();
  stroke(0);
  strokeWeight(2);

  // 四个角的基础坐标（相对中心）
  let corners = [
    createVector(-side, -side), // 左上
    createVector(side, -side), // 右上
    createVector(side, side), // 右下
    createVector(-side, side), // 左下
  ];

  for (let i = 0; i < corners.length; i++) {
    let c = corners[i];

    // 朝向中心旋转角度
    let angleToCenter = atan2(-c.y, -c.x) + HALF_PI; // 指向(0,0)

    // ① 角点锁针
    push();
    translate(c.x, c.y);
    rotate(angleToCenter);
    ellipse(0, 0, chainX, chainY); // 角上的锁针
    pop();

    // ② 根据角落不同，沿边偏移两个椭圆
    if (i == 0) {
      // 左上角 → 向下、向右
      drawOffsetChain(c.x, c.y, 0, step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, step, 0, chainX, chainY, 0);
    } else if (i == 1) {
      // 右上角 → 向下、向左
      drawOffsetChain(c.x, c.y, 0, step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, -step, 0, chainX, chainY, 0);
    } else if (i == 2) {
      // 右下角 → 向上、向左
      drawOffsetChain(c.x, c.y, 0, -step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, -step, 0, chainX, chainY, 0);
    } else if (i == 3) {
      // 左下角 → 向上、向右
      drawOffsetChain(c.x, c.y, 0, -step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, step, 0, chainX, 8, 0);
    }
  }
}

// 小函数：在角点基础上偏移并画锁针
function drawOffsetChain(baseX, baseY, dx, dy, w, h, rot) {
  push();
  translate(baseX + dx, baseY + dy);
  rotate(rot);
  ellipse(0, 0, w, h);
  pop();
}

// 外圈八组长针
function drawOuterClusters(dist, offset, spread) {
  for (let a = 0; a < 4; a++) {
    let angle = HALF_PI * a;
    push();
    rotate(angle);

    // 每边两组
    for (let j = -1; j <= 1; j += 2) {
      let sideOffset = offset * j;
      for (let i = -1; i <= 1; i++) {
        let baseY1 = 45;
        let baseY2 = dist;
        let spread1 = map(baseY1, 45, dist, 2, 10);
        let spread2 = map(baseY2, 45, dist, 2, spread);

        let x1 = i * spread1 + sideOffset;
        let y1 = baseY1;
        let x2 = i * spread2 + sideOffset;
        let y2 = baseY2;

        line(x1, y1, x2, y2);
        let capSize = 6;
        line(x2 - capSize / 2, y2, x2 + capSize / 2, y2);
      }
    }

    pop();
  }
}

// 四角锁针
function drawCornerChains(side, offset, step) {
  noFill();
  stroke(0);
  strokeWeight(2);

  let corners = [
    createVector(-side, -side),
    createVector(side, -side),
    createVector(side, side),
    createVector(-side, side),
  ];

  for (let i = 0; i < corners.length; i++) {
    let c = corners[i];
    let angleToCenter = atan2(-c.y, -c.x) + HALF_PI;

    push();
    translate(c.x, c.y);
    rotate(angleToCenter);
    ellipse(0, 0, chainX, chainY);
    pop();

    if (i == 0) {
      drawOffsetChain(c.x, c.y, 0, step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, step, 0, chainX, chainY, 0);
    } else if (i == 1) {
      drawOffsetChain(c.x, c.y, 0, step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, -step, 0, chainX, chainY, 0);
    } else if (i == 2) {
      drawOffsetChain(c.x, c.y, 0, -step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, -step, 0, chainX, chainY, 0);
    } else if (i == 3) {
      drawOffsetChain(c.x, c.y, 0, -step, chainX, chainY, 90);
      drawOffsetChain(c.x, c.y, step, 0, chainX, chainY, 0);
    }
  }
}

function drawOffsetChain(baseX, baseY, dx, dy, w, h, rot) {
  push();
  translate(baseX + dx, baseY + dy);
  rotate(radians(rot));
  ellipse(0, 0, w, h);
  pop();
}

// 四边中央的两颗锁针
function drawSideChains(sideY, offsetX, w, h) {
  noFill();
  stroke(0);
  strokeWeight(2);

  for (let a = 0; a < 4; a++) {
    push();
    rotate(a * HALF_PI); // 旋转到对应边方向

    // 上边：y 固定为 -sideY，在 x 正负 offsetX 位置绘制
    for (let i = -1; i <= 1; i += 2) {
      push();
      translate(i * offsetX, -sideY);
      ellipse(0, 0, w, h);
      pop();
    }

    pop();
  }
}
