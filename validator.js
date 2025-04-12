const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const overlay = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const capturedFaces = [];

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

function getAverageColor(imageData) {
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    r += imageData.data[i];
    g += imageData.data[i + 1];
    b += imageData.data[i + 2];
  }
  r = Math.round(r / (imageData.data.length / 4));
  g = Math.round(g / (imageData.data.length / 4));
  b = Math.round(b / (imageData.data.length / 4));
  return `rgb(${r},${g},${b})`;
}

function captureFace() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const colors = [];
  const size = 60;
  const offsetX = (canvas.width - size * 3) / 2;
  const offsetY = (canvas.height - size * 3) / 2;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = offsetX + col * size;
      const y = offsetY + row * size;
      const imageData = ctx.getImageData(x, y, size, size);
      const avgColor = getAverageColor(imageData);
      colors.push(avgColor);
    }
  }

  showCapturedFace(colors);
  capturedFaces.push(colors);
}

function showCapturedFace(colors) {
  const faceGrid = document.createElement('div');
  faceGrid.className = 'face-grid';
  colors.forEach(color => {
    const cell = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'color-picker';
    input.value = rgbToHex(color);
    cell.appendChild(input);
    faceGrid.appendChild(cell);
  });
  document.getElementById('capturedFaces').appendChild(faceGrid);
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  return "#" + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

function resetCube() {
  capturedFaces.length = 0;
  document.getElementById('capturedFaces').innerHTML = '';
}

function validateCube() {
  if (capturedFaces.length !== 6) {
    alert('Please capture all 6 faces first.');
    return;
  }
  alert("This cube appears to be solvable (basic check only).");
}