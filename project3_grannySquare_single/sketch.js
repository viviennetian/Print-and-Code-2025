let chainX = 11;
let chainY = 7;

function setup() {
  createCanvas(700, 700);
  background(255);
  translate(width / 2, height / 2);
  noFill();
  strokeWeight(1.5);

  // ========== 第一圈 ==========
  stroke(255, 0, 0);
  drawCenterRing(0, 0, 25);
  drawDoubleClusters(0, 0, 45, chainY);
  drawCornerChains(40, 0, 12);

  // ========== 第二圈 ==========
  stroke(60, 120, 200);
  drawOuterClustersFlexible(70, 2, chainX, 45);
  drawCornerChains(70, 0, 12);
  // 第二圈（每边2组长针）
  drawSideChainsBetweenGroups(70, 2, 10, chainX, chainY);

  // ========== 第三圈 ==========
  stroke(0);
  drawOuterClustersFlexible(100, 3, chainX, 75);
  drawCornerChains(100, 0, 12);
  // 第三圈（每边3组长针）
  drawSideChainsBetweenGroups(100, 3, 10, chainX, chainY);
}

// ================= 基础圈 =================

// 中心小圈
function drawCenterRing(x, y, r) {
  noFill();
  ellipse(x, y, r);
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i;
    let px = (cos(angle) * r) / 2;
    let py = (sin(angle) * r) / 2;
    push();
    translate(px, py);
    rotate(angle + HALF_PI);
    ellipse(0, 0, chainX, chainY);
    pop();
  }
}

// 第一圈长针群
function drawDoubleClusters(x, y, dist, len) {
  for (let a = 0; a < 4; a++) {
    let angle = HALF_PI * a;
    push();
    rotate(angle);
    for (let i = -1; i <= 1; i++) {
      let baseY1 = 20;
      let baseY2 = dist;
      let spread1 = map(baseY1, 20, dist, 2, 10);
      let spread2 = map(baseY2, 20, dist, 2, chainX);
      let x1 = i * spread1;
      let y1 = baseY1;
      let x2 = i * spread2;
      let y2 = baseY2;
      line(x1, y1, x2, y2);
      let capSize = 6;
      line(x2 - capSize / 2, y2, x2 + capSize / 2, y2);

      // 平行短线
      let upperOffset = -5; // 往上偏移
      let upperScale = 0.7; // 缩短比例（小于1）
      line(
        x2 - (capSize * upperScale) / 2,
        y2 + upperOffset,
        x2 + (capSize * upperScale) / 2,
        y2 + upperOffset
      );
    }
    pop();
  }
}

// ================= 可调外圈长针 =================

// 通用外圈长针群
function drawOuterClustersFlexible(dist, groupCountPerSide, spreadMax, baseY) {
  for (let a = 0; a < 4; a++) {
    let angle = HALF_PI * a;
    push();
    rotate(angle);
    let step = (dist * 2) / (groupCountPerSide + 1);
    for (let g = 1; g <= groupCountPerSide; g++) {
      let sideOffset = -dist + step * g;
      for (let i = -1; i <= 1; i++) {
        let y1 = baseY;
        let y2 = dist;
        let spread1 = map(y1, baseY, dist, 2, 10);
        let spread2 = map(y2, baseY, dist, 2, spreadMax);
        let x1 = i * spread1 + sideOffset;
        let yStart = y1;
        let x2 = i * spread2 + sideOffset;
        let yEnd = y2;
        line(x1, yStart, x2, yEnd);
        let capSize = 6;
        line(x2 - capSize / 2, y2, x2 + capSize / 2, y2);
        // 平行短线
        let upperOffset = -5; // 往上偏移
        let upperScale = 0.7; // 缩短比例（小于1）
        line(
          x2 - (capSize * upperScale) / 2,
          y2 + upperOffset,
          x2 + (capSize * upperScale) / 2,
          y2 + upperOffset
        );
      }
    }
    pop();
  }
}

// ================= 四角锁针 =================

function drawCornerChains(side, offset, step) {
  noFill();
  strokeWeight(1.5);
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

// ================= 四边锁针 =================

// 在每条边上：针对每两组相邻长针的“中点”，放置一对锁针（两个椭圆）
// dist: 此圈外侧方形的半径（与 drawOuterClustersFlexible 的 dist 一致）
// groupCountPerSide: 每边长针组数量（第二圈=2，第三圈=3）
// pairSpacing: 同一对锁针在边方向上的间距（两个椭圆彼此之间的距离）
// w,h: 椭圆尺寸
function drawSideChainsBetweenGroups(
  dist,
  groupCountPerSide,
  pairSpacing,
  w,
  h
) {
  noFill();
  strokeWeight(1.5);

  for (let a = 0; a < 4; a++) {
    push();
    rotate(a * HALF_PI); // 统一在“上边”坐标系画，旋转到四边

    // 计算这一边上各长针组的侧向位置（与 drawOuterClustersFlexible 完全一致）
    let step = (dist * 2) / (groupCountPerSide + 1);
    let groupOffsets = [];
    for (let g = 1; g <= groupCountPerSide; g++) {
      groupOffsets.push(-dist + step * g); // 沿边方向的偏移（x 方向）
    }

    // 对于每对相邻长针组，求中点，并在中点左右各画一个锁针
    for (let g = 0; g < groupOffsets.length - 1; g++) {
      let mid = (groupOffsets[g] + groupOffsets[g + 1]) / 2;

      // 两个锁针，沿“边方向”（x 轴）左右各偏 pairSpacing/2
      // 边的法向在本地坐标是 y=-dist（上边），方向平行于边
      push();
      translate(mid - pairSpacing / 2, -dist);
      ellipse(0, 0, w, h);
      pop();

      push();
      translate(mid + pairSpacing / 2, -dist);
      ellipse(0, 0, w, h);
      pop();
    }

    pop();
  }
}
