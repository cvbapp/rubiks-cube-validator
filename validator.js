
const video = document.getElementById('video');
const faceLabel = document.getElementById('faceLabel');
const facePreview = document.getElementById('facePreview');
const faceDebug = document.getElementById('faceDebug');
const result = document.getElementById('validationResult');

const faceNames = ['Yellow Face', 'White Face', 'Red Face', 'Orange Face', 'Blue Face', 'Green Face'];
const capturedImages = [];

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

function resetCapture() {
  capturedImages.length = 0;
  facePreview.innerHTML = '';
  faceDebug.innerHTML = '';
  result.innerText = '';
  faceLabel.innerText = "Next: " + faceNames[0];
}

function captureFace() {
  if (capturedImages.length >= 6) {
    alert("All 6 faces already captured!");
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const colors = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = (col + 0.5) * canvas.width / 3;
      const y = (row + 0.5) * canvas.height / 3;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      colors.push(classifyColor(pixel[0], pixel[1], pixel[2]));
    }
  }

  capturedImages.push(colors);

  const img = new Image();
  img.src = canvas.toDataURL();
  facePreview.appendChild(img);

  showDebugColors();

  if (capturedImages.length < 6) {
    faceLabel.innerText = "Next: " + faceNames[capturedImages.length];
  } else {
    faceLabel.innerText = "All faces captured.";
  }
}

function showDebugColors() {
  faceDebug.innerHTML = '';
  capturedImages.forEach((face, i) => {
    faceDebug.innerHTML += `<div style='width:100%;margin-top:10px'><strong>${faceNames[i]}</strong></div>`;
    face.forEach(color => {
      faceDebug.innerHTML += `<div style="background:${color};color:#000">${color}</div>`;
    });
  });
}

function validateCube() {
  if (capturedImages.length < 6) {
    alert("Please capture all 6 faces first.");
    return;
  }

  const flatColors = capturedImages.flat();
  const colorCounts = {};
  flatColors.forEach(c => colorCounts[c] = (colorCounts[c] || 0) + 1);

  const valid = Object.values(colorCounts).every(count => count === 9) && Object.keys(colorCounts).length === 6;

  result.innerText = valid
    ? "✅ Cube appears valid and solvable!"
    : "❌ Invalid cube: uneven color distribution or face mismatch.";
}

function classifyColor(r, g, b) {
  const colors = {
    white: [255, 255, 255],
    yellow: [255, 255, 0],
    red: [220, 20, 60],
    orange: [255, 165, 0],
    green: [0, 128, 0],
    blue: [0, 0, 255]
  };

  let closest = "white";
  let minDist = 1e9;
  for (const [name, ref] of Object.entries(colors)) {
    const dist = Math.sqrt((r - ref[0])**2 + (g - ref[1])**2 + (b - ref[2])**2);
    if (dist < minDist) {
      minDist = dist;
      closest = name;
    }
  }
  return closest;
}
