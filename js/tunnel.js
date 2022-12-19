const tunnelParts = 100;
const tunnelDepth = 25;
const partDelta = 1.2;
const framesPerLevel = 10;
const tunnelFrameTime = 50;
const tunnelCanvas = document.getElementById("tunnelCanvas");
const tunnelCtx = tunnelCanvas.getContext("2d", {alpha: false});
const part1 = document.getElementById("part1");
const fadeScrollMultiplier = 3;
const fadeMultiplier = 0.25;

let tunnelFrame = 0;
let horDelta = -0.5;
let verDelta = -0.5;
let fade = 1;
let render = true;
let cHeight;
let cWidth;
let maxVerDelta;
let maxHorDelta;
let lastRender = -tunnelFrameTime - 1;
let scale = window.devicePixelRatio;
let prevWidth;

// Handle canvas resize and initial canvas setup
function resizeCanvas() {
  if(prevWidth !== window.innerWidth) {
    prevWidth = window.innerWidth;
    part1.style.height = `${window.innerHeight}px`;
    tunnelCanvas.style.width = `${part1.offsetWidth}px`;
    tunnelCanvas.style.height = `${part1.offsetHeight}px`;
    console.log(scale);
    tunnelCanvas.width = part1.offsetWidth * scale;
    tunnelCanvas.height = part1.offsetHeight * scale;
    tunnelCtx.resetTransform();
    tunnelCtx.translate(tunnelCanvas.width / 2, tunnelCanvas.height / 2);
    tunnelCtx.scale(scale, scale);
    tunnelCtx.lineWidth = 1;
    cHeight = tunnelCanvas.height / scale;
    cWidth = tunnelCanvas.width / scale;
    maxVerDelta = cHeight / 2;
    maxHorDelta = cWidth / 2;
    drawOneFrame();
  }
}

window.addEventListener("resize", resizeCanvas, false);
resizeCanvas();

// Handle mouse and touch movement
window.addEventListener("mousemove", e => {
  const rect = tunnelCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);
  horDelta = (x / cWidth) * 2 - 1;
  verDelta = (y / cHeight) * 2 - 1;
});

window.addEventListener("touchstart", e => {
  const rect = tunnelCanvas.getBoundingClientRect();
  const x = (e.touches[0].clientX - rect.left);
  const y = (e.touches[0].clientY - rect.top);
  horDelta = (x / cWidth) * 2 - 1;
  verDelta = (y / cHeight) * 2 - 1;
});

// Handle scroll
document.addEventListener("scroll", function (e) {
  const y = -window.scrollY * fadeScrollMultiplier + cHeight;
  fade = Math.max(0, y / cHeight);
  render = fade > 0;
  let alpha = fade * 256;
  let color = `rgb(${alpha},${alpha},${alpha})`;
  document.getElementById("scroll").style.borderColor = color;
  document.getElementById("scroll_dot").style.backgroundColor = color;
  document.getElementById("part1_scroll").style.color = color;
});

// Functions for drawing the tunnel
function clearCanvas() {
  tunnelCtx.save();

  // Use the identity matrix while clearing the canvas
  tunnelCtx.setTransform(1, 0, 0, 1, 0, 0);
  tunnelCtx.clearRect(0, 0, tunnelCanvas.width, tunnelCanvas.height);

  // Restore the transform
  tunnelCtx.restore();
}

function angularToCartesian(r, j) {
  const x1 = r * Math.cos(2 * Math.PI * j / tunnelParts);
  const y1 = r * Math.sin(2 * Math.PI * j / tunnelParts);
  return [x1, y1];
}

function drawTunnel(time) {
  if (time - lastRender > tunnelFrameTime) {
    lastRender = Math.floor(time / tunnelFrameTime) * tunnelFrameTime;
    tunnelFrame++;
    if (render) {
      drawOneFrame();
    }
  }
  if (!render) {
    clearCanvas();
  }
  window.requestAnimationFrame(drawTunnel);
}

function drawOneFrame() {
  let inner = [];
  let current = [];
  let radius = (Math.sqrt((cHeight + maxHorDelta) ** 2 + (cWidth + maxVerDelta) ** 2) / 2) * (partDelta ** ((tunnelFrame % framesPerLevel) / framesPerLevel));

  for (let i = tunnelDepth - 1; i >= 0; i--) {
    for (let j = 0; j < tunnelParts; j++) {
      const r = radius / (partDelta ** i);
      let coords = angularToCartesian(r, j);
      const edgeRad = i - (tunnelFrame % framesPerLevel) / framesPerLevel;
      coords[0] += maxHorDelta * Math.sin(2 * Math.PI * edgeRad / tunnelParts * horDelta);
      coords[1] += maxVerDelta * Math.sin(2 * Math.PI * edgeRad / tunnelParts * verDelta);
      current.push(coords);
    }
    if (i < tunnelDepth - 1) {
      tunnelCtx.beginPath();
      for (let j = 0; j < inner.length; j++) {
        const jn = (j + 1) % inner.length;
        tunnelCtx.moveTo(inner[j][0], inner[j][1]);
        tunnelCtx.lineTo(current[j][0], current[j][1]);
        tunnelCtx.lineTo(current[jn][0], current[jn][1]);
        tunnelCtx.lineTo(inner[jn][0], inner[jn][1]);
        tunnelCtx.closePath();
      }
      tunnelCtx.fillStyle = "black";
      tunnelCtx.fill();
      let alpha = fade * ((tunnelDepth - i) / tunnelDepth) * fadeMultiplier * 256;
      tunnelCtx.strokeStyle = `rgb(${alpha},${alpha},${alpha})`;
      tunnelCtx.stroke();
    } else {
      tunnelCtx.beginPath();
      tunnelCtx.moveTo(current[0][0], current[0][1]);
      current.forEach(coord => {
        tunnelCtx.lineTo(coord[0], coord[1]);
      });
      tunnelCtx.fillStyle = "black";
      tunnelCtx.fill();
    }
    inner = current;
    current = [];
  }
}

drawTunnel(0);
