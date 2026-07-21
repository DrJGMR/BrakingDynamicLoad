/*
  Simulación interactiva:
  Frenado y carga dinámica

  Caso inicial:
  masa = 42 kg
  velocidad inicial = 2.4 m/s
  distancia de frenado = 0.30 m
  capacidad estática del bracket = 220 N

  Resultados iniciales:
  desaceleración = -9.6 m/s²
  fuerza de frenado = 403.2 N
  relación demanda/capacidad = 1.83
*/

let massSlider;
let speedSlider;
let distanceSlider;
let capacitySlider;

let startButton;
let resetButton;

let simulationRunning = false;
let simulationFinished = false;

let simulationStartTime = 0;
let simulationTime = 0;

let cartPosition = 0;
let cartVelocity = 0;

const COLORS = {
  backgroundTop: [7, 17, 31],
  backgroundBottom: [12, 33, 54],

  panel: [16, 35, 57],
  panelLight: [22, 47, 75],

  cyan: [0, 207, 255],
  blue: [46, 117, 255],
  orange: [255, 147, 55],
  green: [42, 219, 153],
  red: [255, 89, 105],
  yellow: [255, 208, 82],

  white: [242, 247, 255],
  textSecondary: [163, 185, 209],
  grid: [50, 76, 103],
  dark: [5, 12, 22]
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  textFont("Arial");
  rectMode(CORNER);
  strokeCap(ROUND);

  createControls();
  resetSimulation();
}

function draw() {
  drawGradientBackground();
  drawHeader();

  const margin = 32;
  const top = 100;
  const availableWidth = width - 2 * margin;

  const leftWidth = availableWidth * 0.64;
  const rightWidth = availableWidth - leftWidth - 20;

  drawSimulationPanel(
    margin,
    top,
    leftWidth,
    height - top - 28
  );

  drawControlPanel(
    margin + leftWidth + 20,
    top,
    rightWidth,
    height - top - 28
  );

  updateSimulation();
}

function createControls() {
  massSlider = new ModernSlider(
    "Masa del carro",
    10,
    100,
    42,
    1,
    "kg"
  );

  speedSlider = new ModernSlider(
    "Velocidad inicial",
    0.5,
    5.0,
    2.4,
    0.1,
    "m/s"
  );

  distanceSlider = new ModernSlider(
    "Distancia de frenado",
    0.10,
    1.50,
    0.30,
    0.05,
    "m"
  );

  capacitySlider = new ModernSlider(
    "Capacidad estática del bracket",
    100,
    800,
    220,
    10,
    "N"
  );

  startButton = new ModernButton(
    "INICIAR FRENADO",
    COLORS.cyan
  );

  resetButton = new ModernButton(
    "REINICIAR",
    COLORS.orange
  );
}

function drawGradientBackground() {
  for (let y = 0; y < height; y++) {
    const interpolation = map(y, 0, height, 0, 1);

    const currentColor = lerpColor(
      color(...COLORS.backgroundTop),
      color(...COLORS.backgroundBottom),
      interpolation
    );

    stroke(currentColor);
    line(0, y, width, y);
  }

  noStroke();

  fill(0, 207, 255, 8);
  ellipse(width * 0.18, height * 0.15, 500, 500);

  fill(46, 117, 255, 10);
  ellipse(width * 0.82, height * 0.80, 650, 650);
}

function drawHeader() {
  fill(...COLORS.white);
  textSize(27);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);

  text(
    "Frenado y carga dinámica",
    32,
    38
  );

  fill(...COLORS.textSecondary);
  textSize(14);
  textStyle(NORMAL);

  text(
    "Analiza cómo la distancia de frenado modifica la desaceleración y la carga sobre el bracket",
    32,
    70
  );

  const acceleration = calculateAcceleration();
  const brakingForce = calculateBrakingForce();
  const overloadRatio = calculateOverloadRatio();

  drawHeaderChip(
    width - 520,
    26,
    145,
    44,
    "Desaceleración",
    formatNumber(acceleration) + " m/s²",
    COLORS.blue
  );

  drawHeaderChip(
    width - 365,
    26,
    145,
    44,
    "F frenado",
    formatNumber(brakingForce) + " N",
    COLORS.orange
  );

  drawHeaderChip(
    width - 210,
    26,
    178,
    44,
    "Demanda / capacidad",
    formatNumber(overloadRatio) + "×",
    overloadRatio > 1 ? COLORS.red : COLORS.green
  );
}

function drawHeaderChip(
  x,
  y,
  w,
  h,
  title,
  value,
  accent
) {
  noStroke();

  fill(16, 35, 57, 230);
  rect(x, y, w, h, 12);

  fill(...accent);
  rect(x, y, 5, h, 12, 0, 0, 12);

  fill(...COLORS.textSecondary);
  textSize(10);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  text(
    title.toUpperCase(),
    x + 14,
    y + 7
  );

  fill(...COLORS.white);
  textSize(15);
  textAlign(LEFT, BOTTOM);

  text(
    value,
    x + 14,
    y + h - 7
  );
}

function drawSimulationPanel(x, y, w, h) {
  drawPanel(x, y, w, h);

  fill(...COLORS.white);
  textSize(18);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  text(
    "Visualización del frenado",
    x + 24,
    y + 22
  );

  fill(...COLORS.textSecondary);
  textSize(12);
  textStyle(NORMAL);

  text(
    "El carro desacelera uniformemente hasta detenerse antes de la estación.",
    x + 24,
    y + 48
  );

  const trackX = x + 50;
  const trackY = y + 185;
  const trackWidth = w - 100;

  drawTrack(
    trackX,
    trackY,
    trackWidth
  );

  drawTransportCart(
    trackX,
    trackY,
    trackWidth
  );

  drawForceDiagram(
    x + 28,
    y + 285,
    w * 0.45,
    190
  );

  drawDistanceForceGraph(
    x + w * 0.51,
    y + 285,
    w * 0.46,
    190
  );

  drawEquationSummary(
    x + 28,
    y + h - 125,
    w - 56,
    95
  );
}

function drawPanel(x, y, w, h) {
  noStroke();

  fill(0, 0, 0, 30);
  rect(x + 6, y + 8, w, h, 18);

  fill(15, 33, 54, 242);
  rect(x, y, w, h, 18);

  stroke(50, 76, 103, 140);
  strokeWeight(1);
  noFill();
  rect(x, y, w, h, 18);

  noStroke();
}

function drawTrack(x, y, w) {
  stroke(...COLORS.grid);
  strokeWeight(5);
  line(x, y, x + w, y);

  stroke(79, 107, 134);
  strokeWeight(2);
  line(x, y + 18, x + w, y + 18);

  for (let i = 0; i <= 10; i++) {
    const tickX = x + (w / 10) * i;

    stroke(61, 88, 115);
    strokeWeight(1);

    line(
      tickX,
      y + 23,
      tickX,
      y + 31
    );
  }

  const stationX = x + w - 35;

  stroke(...COLORS.red);
  strokeWeight(4);
  line(
    stationX,
    y - 85,
    stationX,
    y + 20
  );

  noStroke();
  fill(...COLORS.red);

  rect(
    stationX - 30,
    y - 112,
    60,
    28,
    7
  );

  fill(...COLORS.white);
  textSize(10);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  text(
    "ESTACIÓN",
    stationX,
    y - 98
  );

  fill(...COLORS.textSecondary);
  textSize(11);
  textStyle(NORMAL);

  textAlign(LEFT, TOP);
  text(
    "INICIO DEL FRENADO",
    x,
    y + 38
  );

  textAlign(RIGHT, TOP);
  text(
    "LÍMITE DE DETENCIÓN",
    x + w,
    y + 38
  );

  drawStoppingDistanceDimension(
    x + 15,
    y + 82,
    w - 70
  );
}

function drawStoppingDistanceDimension(x, y, w) {
  stroke(...COLORS.cyan);
  strokeWeight(1.5);

  line(x, y, x + w, y);
  line(x, y - 6, x, y + 6);
  line(x + w, y - 6, x + w, y + 6);

  noStroke();
  fill(...COLORS.cyan);

  triangle(
    x,
    y,
    x + 9,
    y - 5,
    x + 9,
    y + 5
  );

  triangle(
    x + w,
    y,
    x + w - 9,
    y - 5,
    x + w - 9,
    y + 5
  );

  fill(...COLORS.white);
  textSize(12);
  textStyle(BOLD);
  textAlign(CENTER, BOTTOM);

  text(
    "Distancia máxima = " +
      formatNumber(distanceSlider.value) +
      " m",
    x + w / 2,
    y - 8
  );
}

function drawTransportCart(trackX, trackY, trackWidth) {
  const stoppingDistance = distanceSlider.value;

  const normalizedPosition =
    stoppingDistance > 0
      ? constrain(
          cartPosition / stoppingDistance,
          0,
          1
        )
      : 0;

  const cartX =
    trackX +
    normalizedPosition *
      (trackWidth - 200);

  const cartY = trackY - 53;

  noStroke();

  fill(0, 0, 0, 45);
  rect(
    cartX + 7,
    cartY + 8,
    160,
    48,
    12
  );

  fill(...COLORS.blue);
  rect(
    cartX,
    cartY,
    160,
    48,
    12
  );

  fill(83, 153, 255);
  rect(
    cartX + 10,
    cartY + 8,
    140,
    8,
    5
  );

  fill(...COLORS.white);
  textAlign(CENTER, CENTER);
  textSize(12);
  textStyle(BOLD);

  text(
    "CARRO DE TRANSPORTE",
    cartX + 80,
    cartY + 29
  );

  drawWheel(
    cartX + 35,
    cartY + 52
  );

  drawWheel(
    cartX + 125,
    cartY + 52
  );

  drawMassLoad(
    cartX + 57,
    cartY - 43
  );

  if (simulationRunning || simulationFinished) {
    drawVelocityArrow(
      cartX + 168,
      cartY + 23,
      cartVelocity
    );
  }

  fill(...COLORS.textSecondary);
  textSize(12);
  textStyle(NORMAL);
  textAlign(CENTER, TOP);

  text(
    "x = " +
      nf(cartPosition, 1, 3) +
      " m",
    cartX + 80,
    cartY + 70
  );
}

function drawWheel(x, y) {
  noStroke();

  fill(...COLORS.dark);
  circle(x, y, 19);

  fill(...COLORS.cyan);
  circle(x, y, 8);
}

function drawMassLoad(x, y) {
  noStroke();

  fill(0, 0, 0, 40);
  rect(
    x + 5,
    y + 6,
    48,
    43,
    8
  );

  fill(...COLORS.orange);
  rect(
    x,
    y,
    48,
    43,
    8
  );

  fill(255, 184, 93);
  rect(
    x + 7,
    y + 7,
    34,
    8,
    4
  );

  fill(...COLORS.dark);
  textSize(12);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  text(
    formatNumber(massSlider.value) +
      " kg",
    x + 24,
    y + 28
  );
}

function drawVelocityArrow(x, y, velocity) {
  const arrowLength = map(
    velocity,
    0,
    max(speedSlider.value, 0.1),
    0,
    95
  );

  stroke(...COLORS.cyan);
  strokeWeight(4);

  line(
    x,
    y,
    x + arrowLength,
    y
  );

  fill(...COLORS.cyan);
  noStroke();

  triangle(
    x + arrowLength,
    y,
    x + arrowLength - 10,
    y - 6,
    x + arrowLength - 10,
    y + 6
  );

  fill(...COLORS.white);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, BOTTOM);

  text(
    "v = " +
      nf(velocity, 1, 2) +
      " m/s",
    x,
    y - 8
  );
}

function drawForceDiagram(x, y, w, h) {
  drawInnerCard(x, y, w, h);

  fill(...COLORS.white);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  text(
    "Carga dinámica sobre el bracket",
    x + 16,
    y + 14
  );

  const centerX = x + w * 0.48;
  const centerY = y + h * 0.56;

  noStroke();

  fill(...COLORS.panel);
  rect(
    centerX - 52,
    centerY - 25,
    104,
    50,
    10
  );

  stroke(...COLORS.blue);
  strokeWeight(4);

  line(
    centerX - 52,
    centerY - 34,
    centerX - 52,
    centerY + 34
  );

  noStroke();

  fill(...COLORS.white);
  textSize(11);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  text(
    "BRACKET",
    centerX,
    centerY
  );

  drawHorizontalForceArrow(
    centerX + 58,
    centerY,
    82,
    COLORS.red,
    "F frenado"
  );

  fill(...COLORS.textSecondary);
  textSize(11);
  textStyle(NORMAL);
  textAlign(CENTER, TOP);

  text(
    "Capacidad estática = " +
      formatNumber(capacitySlider.value) +
      " N",
    centerX,
    y + h - 49
  );

  const ratio = calculateOverloadRatio();

  fill(
    ...(ratio > 1
      ? COLORS.red
      : COLORS.green)
  );

  textStyle(BOLD);

  text(
    ratio > 1
      ? "RIESGO DE SOBRECARGA"
      : "DENTRO DE CAPACIDAD",
    centerX,
    y + h - 28
  );
}

function drawHorizontalForceArrow(
  x,
  y,
  arrowLength,
  arrowColor,
  label
) {
  stroke(...arrowColor);
  strokeWeight(4);

  line(
    x,
    y,
    x + arrowLength,
    y
  );

  noStroke();
  fill(...arrowColor);

  triangle(
    x + arrowLength,
    y,
    x + arrowLength - 10,
    y - 6,
    x + arrowLength - 10,
    y + 6
  );

  fill(...COLORS.white);
  textSize(10);
  textStyle(BOLD);
  textAlign(CENTER, BOTTOM);

  text(
    label +
      " = " +
      formatNumber(calculateBrakingForce()) +
      " N",
    x + arrowLength / 2,
    y - 10
  );
}

function drawDistanceForceGraph(x, y, w, h) {
  drawInnerCard(x, y, w, h);

  fill(...COLORS.white);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  text(
    "Fuerza de frenado vs. distancia",
    x + 16,
    y + 14
  );

  const graphX = x + 48;
  const graphY = y + 47;
  const graphW = w - 70;
  const graphH = h - 80;

  const minimumDistance = 0.10;
  const maximumDistance = 1.50;

  const maximumForce =
    massSlider.value *
    speedSlider.value *
    speedSlider.value /
    (2 * minimumDistance);

  stroke(...COLORS.grid);
  strokeWeight(1);

  for (let i = 0; i <= 4; i++) {
    const horizontalY =
      graphY + (graphH / 4) * i;

    line(
      graphX,
      horizontalY,
      graphX + graphW,
      horizontalY
    );
  }

  line(
    graphX,
    graphY,
    graphX,
    graphY + graphH
  );

  line(
    graphX,
    graphY + graphH,
    graphX + graphW,
    graphY + graphH
  );

  noFill();
  stroke(...COLORS.cyan);
  strokeWeight(3);

  beginShape();

  for (let i = 0; i <= 120; i++) {
    const distanceValue = map(
      i,
      0,
      120,
      minimumDistance,
      maximumDistance
    );

    const forceValue =
      massSlider.value *
      speedSlider.value *
      speedSlider.value /
      (2 * distanceValue);

    const pointX = map(
      distanceValue,
      minimumDistance,
      maximumDistance,
      graphX,
      graphX + graphW
    );

    const pointY = map(
      forceValue,
      0,
      maximumForce,
      graphY + graphH,
      graphY
    );

    vertex(pointX, pointY);
  }

  endShape();

  const currentForce =
    calculateBrakingForce();

  const markerX = map(
    distanceSlider.value,
    minimumDistance,
    maximumDistance,
    graphX,
    graphX + graphW
  );

  const markerY = map(
    currentForce,
    0,
    maximumForce,
    graphY + graphH,
    graphY
  );

  noStroke();
  fill(...COLORS.orange);
  circle(markerX, markerY, 13);

  fill(...COLORS.white);
  textSize(10);
  textStyle(BOLD);
  textAlign(CENTER, BOTTOM);

  text(
    formatNumber(currentForce) +
      " N",
    markerX,
    markerY - 10
  );

  const capacityY = map(
    capacitySlider.value,
    0,
    maximumForce,
    graphY + graphH,
    graphY
  );

  if (
    capacityY >= graphY &&
    capacityY <= graphY + graphH
  ) {
    stroke(...COLORS.yellow);
    strokeWeight(2);

    line(
      graphX,
      capacityY,
      graphX + graphW,
      capacityY
    );

    noStroke();
    fill(...COLORS.yellow);
    textSize(9);
    textStyle(BOLD);
    textAlign(RIGHT, BOTTOM);

    text(
      "Capacidad",
      graphX + graphW,
      capacityY - 4
    );
  }

  fill(...COLORS.textSecondary);
  textSize(10);
  textStyle(NORMAL);

  textAlign(LEFT, TOP);
  text(
    "0.10 m",
    graphX,
    graphY + graphH + 8
  );

  textAlign(RIGHT, TOP);
  text(
    "1.50 m",
    graphX + graphW,
    graphY + graphH + 8
  );

  push();

  translate(
    graphX - 30,
    graphY + graphH / 2
  );

  rotate(-HALF_PI);
  textAlign(CENTER, CENTER);

  text(
    "Fuerza",
    0,
    0
  );

  pop();
}

function drawInnerCard(x, y, w, h) {
  noStroke();

  fill(...COLORS.panelLight);
  rect(x, y, w, h, 14);

  stroke(56, 82, 110, 120);
  noFill();
  rect(x, y, w, h, 14);

  noStroke();
}

function drawEquationSummary(x, y, w, h) {
  drawInnerCard(x, y, w, h);

  const acceleration = calculateAcceleration();
  const brakingForce = calculateBrakingForce();
  const ratio = calculateOverloadRatio();

  fill(...COLORS.textSecondary);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  text(
    "DESARROLLO DEL MODELO",
    x + 16,
    y + 12
  );

  fill(...COLORS.white);
  textSize(13);
  textStyle(NORMAL);

  text(
    "a = (0² − v₀²)/(2Δx) = −" +
      formatNumber(abs(acceleration)) +
      " m/s²",
    x + 16,
    y + 37
  );

  text(
    "F = m|a| = " +
      formatNumber(massSlider.value) +
      "·" +
      formatNumber(abs(acceleration)) +
      " = " +
      formatNumber(brakingForce) +
      " N",
    x + w * 0.36,
    y + 37
  );

  text(
    "Demanda / capacidad = " +
      formatNumber(brakingForce) +
      " / " +
      formatNumber(capacitySlider.value) +
      " = " +
      formatNumber(ratio),
    x + 16,
    y + 66
  );

  fill(
    ...(ratio > 1
      ? COLORS.red
      : COLORS.green)
  );

  textStyle(BOLD);

  text(
    ratio > 1
      ? "La carga dinámica excede la capacidad estática."
      : "La carga calculada no excede la capacidad indicada.",
    x + w * 0.51,
    y + 66
  );
}

function drawControlPanel(x, y, w, h) {
  drawPanel(x, y, w, h);

  fill(...COLORS.white);
  textSize(18);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  text(
    "Parámetros interactivos",
    x + 22,
    y + 22
  );

  fill(...COLORS.textSecondary);
  textSize(12);
  textStyle(NORMAL);

  text(
    "Modifica los valores y observa la severidad del frenado.",
    x + 22,
    y + 48
  );

  let controlY = y + 88;
  const sliderWidth = w - 44;

  massSlider.setBounds(
    x + 22,
    controlY,
    sliderWidth
  );
  massSlider.display();

  controlY += 82;

  speedSlider.setBounds(
    x + 22,
    controlY,
    sliderWidth
  );
  speedSlider.display();

  controlY += 82;

  distanceSlider.setBounds(
    x + 22,
    controlY,
    sliderWidth
  );
  distanceSlider.display();

  controlY += 82;

  capacitySlider.setBounds(
    x + 22,
    controlY,
    sliderWidth
  );
  capacitySlider.display();

  const buttonY = controlY + 92;

  startButton.setBounds(
    x + 22,
    buttonY,
    w - 44,
    44
  );

  resetButton.setBounds(
    x + 22,
    buttonY + 56,
    w - 44,
    40
  );

  startButton.display();
  resetButton.display();

  drawInsightCard(
    x + 22,
    buttonY + 112,
    w - 44,
    h - (buttonY - y) - 134
  );
}

function drawInsightCard(x, y, w, h) {
  if (h < 80) return;

  noStroke();

  const overload =
    calculateOverloadRatio() > 1;

  fill(
    overload
      ? 255
      : 0,
    overload
      ? 89
      : 207,
    overload
      ? 105
      : 255,
    17
  );

  rect(x, y, w, h, 14);

  stroke(
    ...(overload
      ? COLORS.red
      : COLORS.cyan)
  );

  strokeWeight(1);
  noFill();
  rect(x, y, w, h, 14);

  noStroke();

  fill(
    ...(overload
      ? COLORS.red
      : COLORS.cyan)
  );

  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  text(
    "INTERPRETACIÓN",
    x + 14,
    y + 14
  );

  fill(...COLORS.white);
  textSize(12);
  textStyle(NORMAL);

  const force = calculateBrakingForce();
  const capacity = capacitySlider.value;
  const excess = force - capacity;
  const percentage =
    (excess / capacity) * 100;

  let message;

  if (force > capacity) {
    message =
      "La fuerza dinámica calculada excede la capacidad del bracket en " +
      formatNumber(excess) +
      " N, equivalente a " +
      formatNumber(percentage) +
      "%. Se recomienda aumentar la distancia o el tiempo de frenado, incorporar amortiguamiento o rediseñar el bracket.";
  } else {
    message =
      "La carga dinámica se mantiene por debajo de la capacidad indicada. Aun así, deben considerarse fatiga, impactos repetidos, incertidumbre y un factor de seguridad apropiado.";
  }

  text(
    message,
    x + 14,
    y + 38,
    w - 28,
    h - 48
  );
}

function calculateAcceleration() {
  const initialSpeed =
    speedSlider.value;

  const stoppingDistance =
    distanceSlider.value;

  return -(
    initialSpeed *
    initialSpeed
  ) /
  (
    2 *
    stoppingDistance
  );
}

function calculateBrakingForce() {
  return (
    massSlider.value *
    abs(calculateAcceleration())
  );
}

function calculateOverloadRatio() {
  return (
    calculateBrakingForce() /
    capacitySlider.value
  );
}

function calculateStoppingTime() {
  return (
    speedSlider.value /
    abs(calculateAcceleration())
  );
}

function updateSimulation() {
  if (!simulationRunning) return;

  simulationTime =
    (millis() - simulationStartTime) /
    1000;

  const stoppingTime =
    calculateStoppingTime();

  const acceleration =
    calculateAcceleration();

  if (simulationTime <= stoppingTime) {
    cartVelocity =
      speedSlider.value +
      acceleration *
      simulationTime;

    cartVelocity =
      max(cartVelocity, 0);

    cartPosition =
      speedSlider.value *
      simulationTime +
      0.5 *
      acceleration *
      simulationTime *
      simulationTime;

    cartPosition =
      constrain(
        cartPosition,
        0,
        distanceSlider.value
      );
  } else {
    simulationTime =
      stoppingTime;

    cartVelocity = 0;
    cartPosition =
      distanceSlider.value;

    simulationRunning = false;
    simulationFinished = true;
  }
}

function startSimulation() {
  resetSimulation();

  simulationRunning = true;
  simulationFinished = false;
  simulationStartTime = millis();
}

function resetSimulation() {
  simulationRunning = false;
  simulationFinished = false;

  simulationTime = 0;
  cartPosition = 0;
  cartVelocity =
    speedSlider
      ? speedSlider.value
      : 0;
}

function mousePressed() {
  massSlider.pressed();
  speedSlider.pressed();
  distanceSlider.pressed();
  capacitySlider.pressed();

  if (startButton.isHovered()) {
    startSimulation();
  }

  if (resetButton.isHovered()) {
    resetSimulation();
  }
}

function mouseDragged() {
  massSlider.dragged();
  speedSlider.dragged();
  distanceSlider.dragged();
  capacitySlider.dragged();

  if (
    massSlider.dragging ||
    speedSlider.dragging ||
    distanceSlider.dragging ||
    capacitySlider.dragging
  ) {
    resetSimulation();
  }
}

function mouseReleased() {
  massSlider.released();
  speedSlider.released();
  distanceSlider.released();
  capacitySlider.released();
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );
}

function formatNumber(value) {
  if (abs(value) >= 100) {
    return nf(value, 1, 0);
  }

  if (abs(value) >= 10) {
    return nf(value, 1, 1);
  }

  return nf(value, 1, 2);
}

/* =========================================================
   CLASE SLIDER
   ========================================================= */

class ModernSlider {
  constructor(
    label,
    minimum,
    maximum,
    initialValue,
    step,
    unit
  ) {
    this.label = label;
    this.minimum = minimum;
    this.maximum = maximum;
    this.value = initialValue;
    this.step = step;
    this.unit = unit;

    this.x = 0;
    this.y = 0;
    this.w = 200;

    this.dragging = false;
  }

  setBounds(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
  }

  display() {
    fill(...COLORS.textSecondary);
    textSize(11);
    textStyle(BOLD);
    textAlign(LEFT, TOP);

    text(
      this.label.toUpperCase(),
      this.x,
      this.y
    );

    fill(...COLORS.white);
    textSize(15);
    textAlign(RIGHT, TOP);

    text(
      formatNumber(this.value) +
        " " +
        this.unit,
      this.x + this.w,
      this.y - 2
    );

    const trackY =
      this.y + 38;

    stroke(57, 82, 109);
    strokeWeight(7);

    line(
      this.x,
      trackY,
      this.x + this.w,
      trackY
    );

    const handleX = map(
      this.value,
      this.minimum,
      this.maximum,
      this.x,
      this.x + this.w
    );

    stroke(...COLORS.cyan);
    strokeWeight(7);

    line(
      this.x,
      trackY,
      handleX,
      trackY
    );

    noStroke();

    fill(...COLORS.white);
    circle(
      handleX,
      trackY,
      18
    );

    fill(...COLORS.cyan);
    circle(
      handleX,
      trackY,
      10
    );

    fill(...COLORS.textSecondary);
    textSize(9);
    textStyle(NORMAL);

    textAlign(LEFT, TOP);

    text(
      formatNumber(this.minimum),
      this.x,
      trackY + 13
    );

    textAlign(RIGHT, TOP);

    text(
      formatNumber(this.maximum),
      this.x + this.w,
      trackY + 13
    );
  }

  pressed() {
    const handleX = map(
      this.value,
      this.minimum,
      this.maximum,
      this.x,
      this.x + this.w
    );

    const trackY =
      this.y + 38;

    if (
      dist(
        mouseX,
        mouseY,
        handleX,
        trackY
      ) < 18 ||
      (
        mouseX >= this.x &&
        mouseX <= this.x + this.w &&
        abs(mouseY - trackY) < 15
      )
    ) {
      this.dragging = true;
      this.updateValue(mouseX);
    }
  }

  dragged() {
    if (this.dragging) {
      this.updateValue(mouseX);
    }
  }

  released() {
    this.dragging = false;
  }

  updateValue(mousePositionX) {
    const constrainedX = constrain(
      mousePositionX,
      this.x,
      this.x + this.w
    );

    let rawValue = map(
      constrainedX,
      this.x,
      this.x + this.w,
      this.minimum,
      this.maximum
    );

    rawValue =
      round(rawValue / this.step) *
      this.step;

    this.value = constrain(
      rawValue,
      this.minimum,
      this.maximum
    );
  }
}

/* =========================================================
   CLASE BOTÓN
   ========================================================= */

class ModernButton {
  constructor(label, buttonColor) {
    this.label = label;
    this.buttonColor = buttonColor;

    this.x = 0;
    this.y = 0;
    this.w = 100;
    this.h = 40;
  }

  setBounds(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  isHovered() {
    return (
      mouseX >= this.x &&
      mouseX <= this.x + this.w &&
      mouseY >= this.y &&
      mouseY <= this.y + this.h
    );
  }

  display() {
    const hover =
      this.isHovered();

    noStroke();

    if (hover) {
      fill(
        min(
          this.buttonColor[0] + 22,
          255
        ),
        min(
          this.buttonColor[1] + 22,
          255
        ),
        min(
          this.buttonColor[2] + 22,
          255
        )
      );
    } else {
      fill(...this.buttonColor);
    }

    rect(
      this.x,
      this.y,
      this.w,
      this.h,
      11
    );

    fill(...COLORS.dark);
    textSize(12);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    text(
      this.label,
      this.x + this.w / 2,
      this.y + this.h / 2
    );
  }
}
