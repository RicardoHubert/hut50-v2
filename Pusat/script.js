document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spinBtn");
  const resultEl = document.getElementById("result");

  let participants = [];
  let startAngle = 0;
  let arc = 0;
  let spinAngle = 0;
  let spinTimeout = null;
  let isSpinning = false;
  let centerWinner = null; // tampilkan ID pemenang di tengah

  const cfg = { 
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,
    radius: 280,
    textRadius: 210,
    rotationOffsetDeg: 0,
  };

  const sectorColors = ["#FFB84C","#FFDEB4","#FDF7C3","#A8DF8E","#7ED7C1","#6EBF8B","#FFC94A","#FF5F00"];

  fetch("peserta_spin.php")
    .then(res => res.json())
    .then(data => {
      participants = data;
      if (!participants.length) { resultEl.textContent = "Tidak ada peserta."; return; }
      arc = Math.PI * 2 / participants.length;
      drawWheel();
    });

  const toRad = d => (d * Math.PI) / 180;

  // Teks miring sesuai radial (garis sektor)
  function drawNameRadial(text, cx, cy, r, angle) {
    let fs = (participants.length <= 10) ? 18 : (participants.length <= 20) ? 16 : 14;
    ctx.font = `bold ${fs}px Arial`;
    const maxW = r * 0.9;
    const w = ctx.measureText(text).width;
    if (w > maxW) {
      fs = Math.max(10, Math.floor(fs * (maxW / w)));
      ctx.font = `bold ${fs}px Arial`;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.fillText(text, r, 0);   // tulis di sepanjang jari-jari
    ctx.restore();
  }

  // Kartu pemenang di tengah (bulat), menampilkan UNIQUE ID
  function drawCenterCard(winner) {
    if (!winner) return;

    const cx = cfg.centerX, cy = cfg.centerY;
    const r = 115; // radius kartu bulat

    ctx.save();
    // lingkaran putih semi-transparan
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fill();
    // garis tepi tipis
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.stroke();

    // teks UNIQUE ID
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#222";

    let fontSize = 22;
    const maxTextWidth = r * 1.8; // lebar aman di dalam lingkaran
    ctx.font = `700 ${fontSize}px Arial`;

    let textWidth = ctx.measureText(winner.unique_id).width;
    if (textWidth > maxTextWidth) {
      fontSize = Math.max(12, Math.floor(fontSize * (maxTextWidth / textWidth)));
      ctx.font = `700 ${fontSize}px Arial`;
    }
    ctx.fillText(winner.unique_id, cx, cy + 2);

    ctx.restore();
  }

  function drawWheel() {
    const { centerX, centerY, radius, textRadius, rotationOffsetDeg } = cfg;
    const baseRotation = toRad(rotationOffsetDeg);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(baseRotation + startAngle);
    ctx.translate(-centerX, -centerY);

    // sektor
    for (let i = 0; i < participants.length; i++) {
      const angle = i * arc;
      ctx.fillStyle = sectorColors[i % sectorColors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
    }

    // tulis UNIQUE ID miring mengikuti garis sektor
    for (let i = 0; i < participants.length; i++) {
      const centerAng = i * arc + arc / 2;
      drawNameRadial(participants[i].unique_id, centerX, centerY, textRadius, centerAng);
    }

    ctx.restore();

    // pointer (atas)
    ctx.fillStyle = "#000";
    const pointerSize = 12;
    ctx.beginPath();
    ctx.moveTo(cfg.centerX, 0);
    ctx.lineTo(cfg.centerX - pointerSize, 24);
    ctx.lineTo(cfg.centerX + pointerSize, 24);
    ctx.fill();

    // kartu tengah jika ada pemenang
    drawCenterCard(centerWinner);
  }

  function fireworks() {
    if (typeof confetti !== "function") return;
    const duration = 1500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function showWinnerModal(winner) {
    const html = `
      <div style="text-align:center; line-height:1.6">
        <div style="font-size:14px;color:#666">Unique ID</div>
        <div style="font-size:28px;font-weight:700;margin:4px 0 10px">${winner.unique_id}</div>
      </div>
    `;

    Swal.fire({
      title: "🎉 Selamat Kepada Pemenang!",
      html,
      icon: "success",
      confirmButtonText: "Tutup",
      showCloseButton: true,
      allowOutsideClick: false,
      didOpen: () => {
        fireworks();
        const btn = document.getElementById("copyBtn");
        if (btn) {
          btn.addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(winner.unique_id);
              btn.textContent = "Tersalin ✓";
            } catch {
              btn.textContent = "Gagal salin";
            }
            setTimeout(() => (btn.textContent = "Copy ID"), 1200);
          });
        }
        if (navigator.vibrate) navigator.vibrate(120);
      },
    });
  }

  function rotateWheel() {
    spinAngle *= 0.97;

    if (spinAngle < 0.1) {
      clearTimeout(spinTimeout);
      const totalAngle = startAngle + toRad(cfg.rotationOffsetDeg);
      const degrees = (totalAngle * 180 / Math.PI + 90) % 360;
      let idx = Math.floor((360 - degrees) / 360 * participants.length) % participants.length;
      if (idx < 0) idx += participants.length;

      const winner = participants[idx];

      // tampilkan di bawah tombol
      resultEl.innerHTML = `🎉 Pemenang: <strong>${winner.unique_id}</strong>`;

      // simpan ke server (tandai menang)
      fetch("submit_pemenang.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `unique_id=${encodeURIComponent(winner.unique_id)}`
      });

      // tampilkan di tengah kanvas + modal cantik
      centerWinner = winner;
      drawWheel();
      showWinnerModal(winner);

      isSpinning = false;
      return;
    }

    startAngle += (spinAngle * Math.PI) / 180;
    drawWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
  }

  spinBtn.addEventListener("click", () => {
    if (!isSpinning && participants.length > 0) {
      isSpinning = true;
      centerWinner = null; // kosongkan saat mulai spin
      drawWheel();
      spinAngle = Math.random() * 30 + 20;
      rotateWheel();
    }
  });
});
