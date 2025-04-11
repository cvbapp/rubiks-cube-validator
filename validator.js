const video = document.getElementById("video");
const overlay = document.getElementById("overlayCanvas");
const ctx = overlay.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    drawOverlay();
  })
  .catch(err => {
    alert("Camera access denied: " + err);
  });

function drawOverlay() {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;

  const w = overlay.width / 3;
  const h = overlay.height / 3;

  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * w, 0);
    ctx.lineTo(i * w, overlay.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * h);
    ctx.lineTo(overlay.width, i * h);
    ctx.stroke();
  }
}

video.onloadedmetadata = () => {
  drawOverlay();
};

function captureFace() {
  alert("Capture logic placeholder");  // Replace with real capture logic
}

function validateCube() {
  alert("Validation logic placeholder");
}

function resetCapture() {
  alert("Reset logic placeholder");
}
