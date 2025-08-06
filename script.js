const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultEl = document.getElementById("result");

let participants = []; // [{ name, unique_id }]
let startAngle = 0;
let arc = 0;
let spinAngle = 0;
let spinTimeout = null;
let isSpinning = false;

// Warna acak per sektor
const sectorColors = [
  "#FFB84C", "#FFDEB4", "#FDF7C3", "#A8DF8E", "#7ED7C1", "#6EBF8B", "#FFC94A", "#FF5F00"
];

fetch("peserta_spin.php")
  .then(res => res.json())
  .then(data => {
    participants = data;
    if (participants.length === 0) {
      resultEl.textContent = "Tidak ada peserta.";
      return;
    }
    arc = Math.PI * 2 / participants.length;
    drawWheel();
  });

function drawWheel() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(startAngle);
  ctx.translate(-centerX, -centerY);

  // Gambar sektor warna
  for (let i = 0; i < participants.length; i++) {
    const angle = i * arc;
    ctx.fillStyle = sectorColors[i % sectorColors.length];

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
  }

  // Gambar nama peserta di posisi horizontal
  for (let i = 0; i < participants.length; i++) {
    const angle = i * arc + arc / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = participants.length <= 10 ? "bold 16px Arial" :
               participants.length <= 20 ? "bold 14px Arial" :
               "bold 12px Arial";

    ctx.rotate(-angle); // Rotasi balik biar teks tetap horizontal
    ctx.fillText(participants[i].name, Math.cos(angle) * 130, Math.sin(angle) * 130);
    ctx.restore();
  }

  ctx.restore();

  // Pointer tetap di atas
  ctx.fillStyle = "#000";
  const pointerSize = 10;
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX - pointerSize, 20);
  ctx.lineTo(centerX + pointerSize, 20);
  ctx.fill();
}


function rotateWheel() {
  spinAngle *= 0.97;

  if (spinAngle < 0.1) {
    clearTimeout(spinTimeout);
    const degrees = (startAngle * 180 / Math.PI + 90) % 360;
    const index = Math.floor((360 - degrees) / 360 * participants.length) % participants.length;
    const winner = participants[index];

    resultEl.innerHTML = `🎉 Pemenang: <strong>${winner.name}</strong><br>ID: <code>${winner.unique_id}</code>`;

    fetch("submit_pemenang.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `unique_id=${encodeURIComponent(winner.unique_id)}`
    });

    isSpinning = false;
    setTimeout(() => location.reload(), 3000);
    return;
  }

  startAngle += (spinAngle * Math.PI) / 180;
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

spinBtn.addEventListener("click", () => {
  if (!isSpinning && participants.length > 0) {
    isSpinning = true;
    spinAngle = Math.random() * 30 + 20;
    rotateWheel();
  }
});
