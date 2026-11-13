// ======================================
// NEON HIGHWAY
// TOP 10 RANKING + NAME ENTRY EDITION
// ======================================

let gameState = "title";

let playerX = 0;
let speed = 2;
let score = 0;
let distance = 0;

let enemies = [];
let particles = [];
let stars = [];

let roadOffset = 0;
let spawnTimer = 0;
let spawnInterval = 85;
let previousLane = -1;

let ranking = [];
let gameOverSaved = false;
let lastRank = 0;

let nameEntryContainer = null;
let nameInputElement = null;
let gameCanvas = null;

const LANES = [-0.65, 0, 0.65];

const CAR_COLORS = [
  [255, 40, 80],
  [30, 180, 255],
  [255, 190, 30],
  [160, 80, 255],
  [50, 255, 150]
];

// ======================================
// 背景設定
// ======================================

const BACKGROUNDS = [
  {
    name: "MORNING",
    top: [35, 115, 180],
    bottom: [255, 210, 130],
    building: [35, 55, 80],
    window: [255, 220, 140],
    road: [255, 220, 150]
  },
  {
    name: "DAY",
    top: [55, 165, 225],
    bottom: [210, 240, 255],
    building: [55, 75, 95],
    window: [240, 245, 255],
    road: [255, 255, 255]
  },
  {
    name: "SUNSET",
    top: [90, 35, 110],
    bottom: [255, 115, 55],
    building: [65, 25, 50],
    window: [255, 170, 70],
    road: [255, 120, 70]
  },
  {
    name: "NEON CITY",
    top: [2, 5, 35],
    bottom: [35, 5, 70],
    building: [8, 12, 40],
    window: [0, 255, 220],
    road: [0, 255, 180]
  },
  {
    name: "SPACE",
    top: [1, 2, 18],
    bottom: [10, 5, 40],
    building: [5, 5, 25],
    window: [100, 100, 255],
    road: [120, 70, 255]
  },
  {
    name: "ALIEN WORLD",
    top: [2, 5, 25],
    bottom: [25, 5, 65],
    building: [5, 5, 25],
    window: [0, 255, 150],
    road: [0, 255, 180]
  }
];

// ======================================
// 初期設定
// ======================================

function setup() {
  gameCanvas = createCanvas(1000, 650);
  textFont("Arial");

  loadRanking();

  for (let i = 0; i < 130; i++) {
    stars.push({
      x: random(width),
      y: random(0, 320),
      size: random(1, 3)
    });
  }
}

// ======================================
// ランキング保存・読み込み
// ======================================

function loadRanking() {
  try {
    let saved = localStorage.getItem("neonHighwayRanking");

    if (saved) {
      let data = JSON.parse(saved);

      if (Array.isArray(data)) {
        ranking = data
          .filter(item =>
            item &&
            typeof item.score === "number" &&
            Number.isFinite(item.score)
          )
          .map(item => ({
            name: String(item.name || "PLAYER").trim().slice(0, 14) || "PLAYER",
            score: item.score
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      }
    }
  } catch (error) {
    console.log("ランキング読み込みエラー:", error);
    ranking = [];
  }
}

function saveRanking() {
  try {
    localStorage.setItem(
      "neonHighwayRanking",
      JSON.stringify(ranking)
    );
  } catch (error) {
    console.log("ランキング保存エラー:", error);
  }
}

function recordScore(playerName) {
  if (gameOverSaved) return;

  gameOverSaved = true;

  let cleanName = String(playerName || "PLAYER").trim().slice(0, 14);

  if (cleanName.length === 0) {
    cleanName = "PLAYER";
  }

  let newRecord = {
    name: cleanName,
    score: score
  };

  ranking.push(newRecord);
  ranking.sort((a, b) => b.score - a.score);

  let rankIndex = ranking.indexOf(newRecord);

  lastRank = rankIndex >= 0 && rankIndex < 10
    ? rankIndex + 1
    : 0;

  ranking = ranking.slice(0, 10);

  saveRanking();
}

function getPlayerRank() {
  return lastRank;
}

// ======================================
// 名前入力画面
// ======================================

function createNameEntryUI() {
  removeNameEntryUI();

  let bounds = gameCanvas.elt.getBoundingClientRect();

  nameEntryContainer = document.createElement("div");

  nameEntryContainer.style.position = "fixed";
  nameEntryContainer.style.left =
    (bounds.left + bounds.width / 2) + "px";

  nameEntryContainer.style.top =
    (bounds.top + bounds.height * 0.62) + "px";

  nameEntryContainer.style.transform = "translate(-50%, -50%)";
  nameEntryContainer.style.zIndex = "9999";
  nameEntryContainer.style.width = "300px";
  nameEntryContainer.style.boxSizing = "border-box";
  nameEntryContainer.style.padding = "22px";
  nameEntryContainer.style.textAlign = "center";
  nameEntryContainer.style.background = "rgba(3, 10, 28, 0.97)";
  nameEntryContainer.style.border = "2px solid #00dcff";
  nameEntryContainer.style.borderRadius = "12px";
  nameEntryContainer.style.boxShadow =
    "0 0 25px rgba(0, 220, 255, 0.45)";
  nameEntryContainer.style.fontFamily = "Arial, sans-serif";

  let heading = document.createElement("div");

  heading.textContent = "ENTER YOUR NAME";
  heading.style.color = "#00dcff";
  heading.style.fontSize = "22px";
  heading.style.fontWeight = "bold";
  heading.style.marginBottom = "12px";

  nameEntryContainer.appendChild(heading);

  let description = document.createElement("div");

  description.textContent = "ランキングに表示する名前を入力";
  description.style.color = "white";
  description.style.fontSize = "13px";
  description.style.marginBottom = "12px";

  nameEntryContainer.appendChild(description);

  nameInputElement = document.createElement("input");

  nameInputElement.type = "text";
  nameInputElement.maxLength = 14;
  nameInputElement.placeholder = "YOUR NAME";
  nameInputElement.autocomplete = "off";

  nameInputElement.style.width = "100%";
  nameInputElement.style.boxSizing = "border-box";
  nameInputElement.style.padding = "11px";
  nameInputElement.style.border = "1px solid #00dcff";
  nameInputElement.style.borderRadius = "6px";
  nameInputElement.style.outline = "none";
  nameInputElement.style.background = "#101b32";
  nameInputElement.style.color = "white";
  nameInputElement.style.fontSize = "18px";
  nameInputElement.style.textAlign = "center";
  nameInputElement.style.marginBottom = "12px";

  nameEntryContainer.appendChild(nameInputElement);

  let submitButton = document.createElement("button");

  submitButton.type = "button";
  submitButton.textContent = "SAVE SCORE";
  submitButton.style.width = "100%";
  submitButton.style.padding = "11px";
  submitButton.style.border = "0";
  submitButton.style.borderRadius = "6px";
  submitButton.style.background = "#00cfee";
  submitButton.style.color = "#03101c";
  submitButton.style.fontWeight = "bold";
  submitButton.style.fontSize = "15px";
  submitButton.style.cursor = "pointer";

  nameEntryContainer.appendChild(submitButton);

  let hint = document.createElement("div");

  hint.textContent = "最大14文字 · Enterで登録";
  hint.style.color = "#9bb8c8";
  hint.style.fontSize = "11px";
  hint.style.marginTop = "10px";

  nameEntryContainer.appendChild(hint);

  document.body.appendChild(nameEntryContainer);

  submitButton.addEventListener("click", submitNameAndSaveScore);

  nameInputElement.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitNameAndSaveScore();
    }
  });

  nameInputElement.focus();
}

function removeNameEntryUI() {
  if (nameEntryContainer && nameEntryContainer.parentNode) {
    nameEntryContainer.parentNode.removeChild(nameEntryContainer);
  }

  nameEntryContainer = null;
  nameInputElement = null;
}

function submitNameAndSaveScore() {
  if (gameState !== "nameEntry") return;

  let playerName = nameInputElement
    ? nameInputElement.value
    : "";

  recordScore(playerName);

  removeNameEntryUI();

  gameState = "gameover";
}

// ======================================
// ステージ取得
// ======================================

function getBackgroundStage() {
  return min(floor(score / 500), 5);
}

function getCurrentBackground() {
  return BACKGROUNDS[getBackgroundStage()];
}

// ======================================
// 宇宙人の数
// 2500点から登場
// 1000点ごとに1体増加
// 最大8体
// ======================================

function getAlienCount() {
  if (score < 2500) {
    return 0;
  }

  return min(
    8,
    1 + floor((score - 2500) / 1000)
  );
}

// ======================================
// メインループ
// ======================================

function draw() {
  drawSky();
  drawCity();
  drawRoad();

  if (gameState === "playing") {
    updateGame();
  }

  drawEnemies();
  drawPlayerCar();
  drawParticles();
  drawHUD();

  if (gameState === "title") {
    drawTitle();
    drawRanking(500, 250);
  }

  if (gameState === "nameEntry") {
    drawNameEntry();
  }

  if (gameState === "gameover") {
    drawGameOver();
    drawRanking(500, 250);
  }
}

// ======================================
// 空
// ======================================

function drawSky() {
  let stage = getBackgroundStage();
  let bg = getCurrentBackground();

  let topColor = color(
    bg.top[0],
    bg.top[1],
    bg.top[2]
  );

  let bottomColor = color(
    bg.bottom[0],
    bg.bottom[1],
    bg.bottom[2]
  );

  noStroke();

  for (let y = 0; y < height; y++) {
    let c = lerpColor(
      topColor,
      bottomColor,
      y / height
    );

    stroke(c);
    line(0, y, width, y);
  }

  noStroke();

  if (stage <= 2) {
    let sunColor;

    if (stage === 0) {
      sunColor = color(255, 220, 140);
    } else if (stage === 1) {
      sunColor = color(255, 250, 190);
    } else {
      sunColor = color(255, 130, 60);
    }

    fill(sunColor);
    circle(800, 150, 100);

    drawCloud(200, 130, 1);
    drawCloud(530, 90, 0.8);
    drawCloud(900, 210, 0.7);
  }

  if (stage >= 3) {
    fill(255);

    for (let s of stars) {
      circle(s.x, s.y, s.size);
    }
  }

  if (stage === 3) {
    fill(150, 100, 255, 180);
    circle(800, 110, 70);
  }

  if (stage >= 4) {
    drawPlanet();
  }

  if (stage === 5) {
    drawAlienUFOs();
  }
}

// ======================================
// 雲
// ======================================

function drawCloud(x, y, s) {
  push();

  translate(x, y);
  scale(s);

  noStroke();
  fill(255, 255, 255, 160);

  ellipse(0, 0, 65, 25);
  ellipse(-20, -8, 35, 30);
  ellipse(10, -13, 40, 35);
  ellipse(30, -5, 30, 25);

  pop();
}

// ======================================
// 惑星
// ======================================

function drawPlanet() {
  push();

  noStroke();

  fill(90, 60, 180);
  circle(800, 150, 150);

  fill(130, 90, 220);
  ellipse(780, 130, 45, 20);
  ellipse(830, 180, 55, 18);

  noFill();
  stroke(180, 150, 255, 180);
  strokeWeight(7);

  arc(800, 150, 210, 65, PI, TWO_PI);

  pop();

  noStroke();
  fill(80, 180, 230);
  circle(180, 170, 45);
}

// ======================================
// UFOと宇宙人
// ======================================

function drawAlienUFOs() {
  let alienCount = getAlienCount();

  for (let i = 0; i < alienCount; i++) {
    let x =
      (frameCount * (1.2 + i * 0.12)
      + i * 170) % 1250 - 100;

    let y =
      120 + i * 35
      + sin(frameCount * 0.035 + i * 2) * 18;

    drawAlienUFO(
      x,
      y,
      0.8 + (i % 3) * 0.12
    );
  }
}

function drawAlienUFO(x, y, s) {
  push();

  translate(x, y);
  scale(s);

  noStroke();

  fill(0, 255, 150, 25);
  ellipse(0, 20, 140, 65);

  fill(0, 255, 120, 35);

  beginShape();
  vertex(-25, 20);
  vertex(25, 20);
  vertex(45, 85);
  vertex(-45, 85);
  endShape(CLOSE);

  fill(100, 130, 160);
  ellipse(0, 15, 115, 32);

  fill(170, 190, 210);
  ellipse(0, 7, 75, 25);

  fill(0, 255, 130);

  for (let i = -2; i <= 2; i++) {
    circle(i * 19, 18, 7);
  }

  fill(100, 220, 210, 180);
  arc(0, 3, 55, 45, PI, TWO_PI);

  fill(80, 230, 100);
  ellipse(0, -7, 30, 35);

  fill(5, 10, 20);
  ellipse(-7, -9, 9, 15);
  ellipse(7, -9, 9, 15);

  fill(255);
  circle(-9, -12, 3);
  circle(5, -12, 3);

  stroke(80, 230, 100);
  strokeWeight(3);

  line(0, -24, 0, -36);

  noStroke();
  fill(255, 100, 100);
  circle(0, -38, 7);

  pop();
}

// ======================================
// ビル
// ======================================

function drawCity() {
  let stage = getBackgroundStage();
  let bg = getCurrentBackground();

  if (stage >= 4) return;

  noStroke();

  for (let i = 0; i < 18; i++) {
    let x = i * 65;
    let h = 100 + (i * 37 % 120);

    fill(
      bg.building[0],
      bg.building[1],
      bg.building[2]
    );

    rect(x, 300 - h, 55, h);

    fill(
      bg.window[0],
      bg.window[1],
      bg.window[2],
      180
    );

    for (let wy = 310 - h; wy < 300; wy += 20) {
      for (let wx = x + 8; wx < x + 50; wx += 15) {
        rect(wx, wy, 5, 8);
      }
    }
  }
}

// ======================================
// 道路
// ======================================

function roadY(z) {
  return 320 + z * 400;
}

function roadWidth(z) {
  return 100 + z * 850;
}

function roadCenter() {
  return width / 2;
}

function roadX(lane, z) {
  return roadCenter() + lane * roadWidth(z) * 0.55;
}

function drawRoad() {
  let bg = getCurrentBackground();

  noStroke();
  fill(18, 20, 30);

  beginShape();
  vertex(430, 320);
  vertex(570, 320);
  vertex(1000, 650);
  vertex(0, 650);
  endShape(CLOSE);

  stroke(
    bg.road[0],
    bg.road[1],
    bg.road[2]
  );

  strokeWeight(4);

  line(430, 320, 0, 650);
  line(570, 320, 1000, 650);

  if (gameState === "playing") {
    roadOffset += speed * 0.02;
  }

  if (getBackgroundStage() === 3) {
    stroke(0, 255, 220);
  } else if (getBackgroundStage() >= 4) {
    stroke(150, 100, 255);
  } else {
    stroke(180, 220, 255);
  }

  strokeWeight(3);

  for (let i = 0; i < 2; i++) {
    let laneX = 430 + i * 140;

    for (let j = 0; j < 12; j++) {
      let z = (j / 12 + roadOffset) % 1;

      let y = roadY(z);

      let x = map(
        z,
        0,
        1,
        laneX,
        500 + (laneX - 500) * 3.5
      );

      let h = map(z, 0, 1, 5, 35);

      line(x, y, x, y + h);
    }
  }
}

// ======================================
// ゲーム更新
// ======================================

function updateGame() {

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    playerX -= 0.025;
  }

  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    playerX += 0.025;
  }

  playerX = constrain(playerX, -0.8, 0.8);

  // 自動加速
  speed += 0.002;

  // 上キーでさらに加速
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
    speed += 0.035;
  }

  speed = constrain(speed, 2, 12);

  distance += speed * 0.1;
  score += floor(speed / 3);

  // 敵の出現間隔
  spawnInterval = map(score, 0, 5000, 85, 48);
  spawnInterval = constrain(spawnInterval, 48, 85);

  spawnTimer++;

  if (spawnTimer >= spawnInterval) {
    spawnTraffic();
    spawnTimer = 0;
  }

  let playerXPosition =
    roadCenter() + playerX * 350;

  let playerHitbox = getCarHitbox(
    playerXPosition,
    555,
    1.1
  );

  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];

    // 敵の車を速くする
    let enemySpeed =
      0.009
      + speed * 0.001
      + min(score * 0.0000004, 0.004);

    enemy.z += enemySpeed;

    let enemyX = roadX(enemy.lane, enemy.z);
    let enemyY = roadY(enemy.z);
    let enemySize = map(enemy.z, 0, 1, 0.2, 1.2);

    let enemyHitbox = getCarHitbox(
      enemyX,
      enemyY,
      enemySize
    );

    if (checkCollision(playerHitbox, enemyHitbox)) {
      gameState = "nameEntry";
      createNameEntryUI();
      break;
    }

    if (enemy.z > 1.2) {
      enemies.splice(i, 1);
      score += 100;
    }
  }
}

// ======================================
// 当たり判定
// ======================================

function getCarHitbox(x, y, s) {
  return {
    left: x - 27 * s,
    right: x + 27 * s,
    top: y - 55 * s,
    bottom: y + 8 * s
  };
}

function checkCollision(a, b) {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

// ======================================
// 敵の車
// ======================================

function spawnTraffic() {

  // 75%の確率で1台、25%の確率で2台
  let carCount = random() < 0.25 ? 2 : 1;

  // 前回最後に出たレーンを避ける
  let laneIndices = [0, 1, 2].filter(
    index => index !== previousLane
  );

  // レーンの順番をランダムにする
  for (let i = laneIndices.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));

    [laneIndices[i], laneIndices[j]] =
      [laneIndices[j], laneIndices[i]];
  }

  // 車を出現させる
  for (let i = 0; i < carCount; i++) {

    let laneIndex = laneIndices[i];
    let carColor = random(CAR_COLORS);

    enemies.push({
      lane: LANES[laneIndex],
      z: 0,
      color: color(
        carColor[0],
        carColor[1],
        carColor[2]
      )
    });

    previousLane = laneIndex;
  }
}

function drawEnemies() {
  for (let enemy of enemies) {
    let x = roadX(enemy.lane, enemy.z);
    let y = roadY(enemy.z);

    let size = map(enemy.z, 0, 1, 0.2, 1.2);

    drawCar(x, y, size, enemy.color);
  }
}

// ======================================
// プレイヤーの車
// ======================================

function drawPlayerCar() {
  let x = roadCenter() + playerX * 350;

  drawCar(
    x,
    555,
    1.1,
    color(20, 180, 255),
    true
  );
}

// ======================================
// スポーツカー
// ======================================

function drawCar(x, y, s, carColor, isPlayer = false) {
  push();

  translate(x, y);
  scale(s);

  rectMode(CENTER);
  noStroke();

  fill(0, 0, 0, 100);
  ellipse(0, 17, 100, 30);

  if (isPlayer) {
    fill(0, 180, 255, 45);
    ellipse(0, 12, 105, 25);
  }

  // タイヤ
  fill(5, 7, 12);
  rect(-39, -7, 16, 49, 5);
  rect(39, -7, 16, 49, 5);

  fill(55, 60, 70);
  rect(-39, -7, 5, 30, 2);
  rect(39, -7, 5, 30, 2);

  // 車体
  fill(5, 8, 18);

  beginShape();
  vertex(-43, 15);
  vertex(-42, -25);
  vertex(-35, -49);
  vertex(-24, -66);
  vertex(-12, -72);
  vertex(12, -72);
  vertex(24, -66);
  vertex(35, -49);
  vertex(42, -25);
  vertex(43, 15);
  endShape(CLOSE);

  fill(carColor);

  beginShape();
  vertex(-40, 11);
  vertex(-39, -25);
  vertex(-32, -48);
  vertex(-22, -63);
  vertex(-11, -69);
  vertex(11, -69);
  vertex(22, -63);
  vertex(32, -48);
  vertex(39, -25);
  vertex(40, 11);
  endShape(CLOSE);

  // フェンダー
  fill(lerpColor(carColor, color(0), 0.2));

  beginShape();
  vertex(-39, -25);
  vertex(-33, -42);
  vertex(-20, -48);
  vertex(-20, -25);
  vertex(-39, -13);
  endShape(CLOSE);

  beginShape();
  vertex(39, -25);
  vertex(33, -42);
  vertex(20, -48);
  vertex(20, -25);
  vertex(39, -13);
  endShape(CLOSE);

  // リアガラス
  fill(12, 22, 38);

  beginShape();
  vertex(-24, -46);
  vertex(-16, -64);
  vertex(16, -64);
  vertex(24, -46);
  endShape(CLOSE);

  stroke(100, 180, 220, 100);
  strokeWeight(2);

  line(-12, -59, 12, -59);
  line(-18, -49, 18, -49);

  noStroke();

  // トランク
  fill(lerpColor(carColor, color(255), 0.15));
  rect(0, -34, 51, 5, 2);

  // スポイラー
  fill(15, 18, 25);
  rect(-17, -65, 4, 12);
  rect(17, -65, 4, 12);

  fill(8, 12, 20);
  rect(0, -70, 74, 7, 2);

  stroke(100, 130, 160);
  strokeWeight(1);

  line(-32, -72, 32, -72);

  noStroke();

  // テールランプ
  fill(40, 5, 12);
  rect(-27, -23, 22, 10, 3);
  rect(27, -23, 22, 10, 3);

  fill(255, 20, 45);
  rect(-27, -23, 17, 5, 2);
  rect(27, -23, 17, 5, 2);

  fill(255, 20, 40, 70);
  ellipse(-27, -23, 30, 17);
  ellipse(27, -23, 30, 17);

  // バンパー
  fill(20, 25, 35);
  rect(0, -5, 67, 15, 4);

  // ディフューザー
  fill(5, 8, 15);
  quad(-26, 7, 26, 7, 20, 20, -20, 20);

  stroke(80, 100, 120);
  strokeWeight(2);

  line(-12, 9, -12, 19);
  line(0, 9, 0, 19);
  line(12, 9, 12, 19);

  noStroke();

  // マフラー
  fill(5);
  ellipse(-25, 13, 12, 9);
  ellipse(25, 13, 12, 9);

  fill(130, 145, 160);
  ellipse(-25, 13, 7, 5);
  ellipse(25, 13, 7, 5);

  // ナンバープレート
  fill(220, 225, 230);
  rect(0, 1, 27, 9, 2);

  fill(20);
  textAlign(CENTER, CENTER);
  textSize(5);
  text("RACING", 0, 1);

  // 反射
  stroke(255, 255, 255, 90);
  strokeWeight(1);

  line(-6, -29, -8, 5);
  line(6, -29, 8, 5);

  pop();
}

// ======================================
// パーティクル
// ======================================

function drawParticles() {
  for (let p of particles) {
    fill(0, 200, 255, p.alpha);

    circle(p.x, p.y, p.size);

    p.alpha -= 5;
    p.y += 2;
  }

  particles = particles.filter(p => p.alpha > 0);
}

// ======================================
// HUD
// ======================================

function drawHUD() {
  noStroke();
  fill(255);

  textAlign(LEFT);
  textSize(22);

  text("SCORE  " + score, 30, 40);
  text("DISTANCE  " + floor(distance) + " m", 30, 70);

  textAlign(RIGHT);
  text("SPEED", 950, 40);

  textSize(42);
  fill(0, 220, 255);

  text(floor(speed * 20) + " KM/H", 950, 85);

  textAlign(LEFT);
  textSize(16);
  fill(255);

  let bg = getCurrentBackground();

  text(
    "STAGE " + (getBackgroundStage() + 1) +
    " : " + bg.name,
    30,
    105
  );

  if (getAlienCount() > 0) {
    fill(0, 255, 150);

    text(
      "ALIENS : " + getAlienCount(),
      30,
      135
    );
  }
}

// ======================================
// TOP 10ランキング表示
// ======================================

function drawRanking(x, y) {
  push();

  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  // 背景パネル
  fill(0, 0, 0, 205);
  stroke(0, 220, 255);
  strokeWeight(2);

  rect(x, y + 115, 330, 250, 12);

  noStroke();

  fill(0, 220, 255);
  textSize(25);
  textStyle(BOLD);

  text("TOP 10 RANKING", x, y + 12);

  textStyle(NORMAL);

  for (let i = 0; i < 10; i++) {
    let rowY = y + 42 + i * 20;

    if (i === 0) {
      fill(255, 215, 0);
    } else if (i === 1) {
      fill(210, 220, 230);
    } else if (i === 2) {
      fill(220, 150, 90);
    } else {
      fill(255);
    }

    textSize(14);

    if (ranking[i]) {
      text(
        (i + 1) + "   " +
        ranking[i].name +
        "   " +
        ranking[i].score,
        x,
        rowY
      );
    } else {
      fill(120);

      text(
        (i + 1) + "   ---",
        x,
        rowY
      );
    }
  }

  pop();
}

// ======================================
// タイトル画面
// ======================================

function drawTitle() {
  rectMode(CORNER);

  fill(0, 0, 0, 170);
  rect(0, 0, width, height);

  textAlign(CENTER);

  fill(0, 220, 255);
  textSize(65);
  textStyle(BOLD);

  text("NEON HIGHWAY", width / 2, 140);

  fill(255);
  textSize(22);

  text("NIGHT CITY RACING", width / 2, 185);

  textSize(18);
  text("PRESS ENTER TO START", width / 2, 550);

  textSize(15);
  text("← → MOVE     ↑ ACCELERATE", width / 2, 585);

  textStyle(NORMAL);
}

// ======================================
// 名前入力中の画面
// ======================================

function drawNameEntry() {
  rectMode(CORNER);

  noStroke();
  fill(0, 0, 0, 190);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  fill(0, 220, 255);
  textStyle(BOLD);
  textSize(38);

  text("NEW RECORD?", width / 2, 210);

  fill(255);
  textStyle(NORMAL);
  textSize(22);

  text("SCORE : " + score, width / 2, 260);
}

// ======================================
// ゲームオーバー
// ======================================

function drawGameOver() {
  rectMode(CORNER);

  fill(0, 0, 0, 190);
  rect(0, 0, width, height);

  textAlign(CENTER);

  fill(255, 40, 70);
  textSize(55);

  text("GAME OVER", width / 2, 100);

  fill(255);
  textSize(25);

  text("SCORE : " + score, width / 2, 145);

  let rank = getPlayerRank();

  textSize(18);

  if (rank > 0) {
    fill(255, 215, 0);

    text(
      "YOUR RANK : " + rank,
      width / 2,
      180
    );
  }

  fill(255);
  textSize(17);

  text("PRESS ENTER TO RETRY", width / 2, 625);
}

// ======================================
// ゲーム開始・リスタート
// ======================================

function startGame() {
  gameState = "playing";

  playerX = 0;
  speed = 2;
  score = 0;
  distance = 0;

  enemies = [];
  particles = [];

  roadOffset = 0;
  spawnTimer = 0;
  spawnInterval = 85;
  previousLane = -1;

  gameOverSaved = false;
  lastRank = 0;

  removeNameEntryUI();
}

// ======================================
// キー操作
// ======================================

function keyPressed() {
  if (keyCode === ENTER) {
    if (
      gameState === "title" ||
      gameState === "gameover"
    ) {
      startGame();
    }
  }
}