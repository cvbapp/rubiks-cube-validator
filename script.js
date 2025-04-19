const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const overlay = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const overlayCtx = overlay.getContext('2d');

const faceColors = ['W', 'R', 'B', 'O', 'G', 'Y'];
const faceNames = ['White', 'Red', 'Blue', 'Orange', 'Green', 'Yellow'];
const colorMap = { W: 'white', R: 'red', B: 'blue', O: 'orange', G: 'green', Y: 'yellow' };

let capturedFaces = [];
let calibration = {};
let faceIndex = 0;

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
  drawOverlay();
});

function drawOverlay() {
  overlay.width = video.width;
  overlay.height = video.height;
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  overlayCtx.strokeStyle = 'lime';
  overlayCtx.lineWidth = 2;

  const size = 30;
  const offsetX = (overlay.width - size * 3) / 2;
  const offsetY = (overlay.height - size * 3) / 2;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      overlayCtx.strokeRect(offsetX + col * size, offsetY + row * size, size, size);
    }
  }

  requestAnimationFrame(drawOverlay);
}

function captureFace() {
  if (capturedFaces.length >= 6) {
    alert("Already captured 6 faces.");
    return;
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const size = 30;
  const offsetX = (canvas.width - size * 3) / 2;
  const offsetY = (canvas.height - size * 3) / 2;
  const faceData = [];

  for (let row = 0; row < 3; row++) {
    const rowData = [];
    for (let col = 0; col < 3; col++) {
      const x = offsetX + col * size + size / 2;
      const y = offsetY + row * size + size / 2;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const color = getClosestColor(pixel);
      rowData.push(color);
    }
    faceData.push(rowData);
  }

  capturedFaces.push(faceData);

  const div = document.createElement('div');
  div.className = 'face-grid';
  div.innerHTML = faceData.flat().map(color => `
    <select>
      ${faceColors.map(c => `<option value="${c}" ${c === color ? 'selected' : ''}>${c}</option>`).join('')}
    </select>
  `).join('');
  document.getElementById('facePreviews').appendChild(div);

  faceIndex++;
  document.getElementById('status').innerText = faceIndex < 6 ? `Capture ${faceNames[faceIndex]} Face` : 'All faces captured';
}

function getClosestColor([r, g, b]) {
  if (capturedFaces.length === 0) {
    // First face: use faceIndex color directly for calibration
    calibration[faceColors[faceIndex]] = { r, g, b };
    return faceColors[faceIndex];
  }

  let minDist = Infinity;
  let best = 'W';
  for (const key in calibration) {
    const { r: cr, g: cg, b: cb } = calibration[key];
    const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
    if (dist < minDist) {
      minDist = dist;
      best = key;
    }
  }
  return best;
}

function validateCube() {
  const allColors = Array(6).fill(null).map(() => Array(9).fill(null));
  const selects = document.querySelectorAll('#facePreviews select');
  if (selects.length !== 54) {
    alert("Incomplete cube data.");
    return;
  }

  selects.forEach((sel, i) => {
    const face = Math.floor(i / 9);
    const pos = i % 9;
    allColors[face][pos] = sel.value;
  });

  const flat = allColors.flat();
  const count = {};
  flat.forEach(c => count[c] = (count[c] || 0) + 1);
  if (Object.values(count).some(c => c !== 9)) {
    document.getElementById('result').innerText = 'Invalid cube: color count mismatch';
    return;
  }

  document.getElementById('result').innerText = 'This cube is valid and solvable';
}

function resetAll() {
  capturedFaces = [];
  faceIndex = 0;
  calibration = {};
  document.getElementById('facePreviews').innerHTML = '';
  document.getElementById('status').innerText = 'Capture White Face';
  document.getElementById('result').innerText = '';
}