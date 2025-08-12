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
  let centerWinner = null; // teks pemenang di tengah

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
    ctx.fillText(text, r, 0);
    ctx.restore();
  }

  // Kartu pemenang di tengah kanvas
  function drawCenterCard(winner) {
    if (!winner) return;
    const cx = cfg.centerX, cy = cfg.centerY;
    const r = 115;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Nama
    ctx.fillStyle = "#222";
    let nameSize = 24;
    ctx.font = `700 ${nameSize}px Arial`;
    const nameMaxW = r * 1.8;
    const nameW = ctx.measureText(winner.name).width;
    if (nameW > nameMaxW) {
      nameSize = Math.max(12, Math.floor(nameSize * nameMaxW / nameW));
      ctx.font = `700 ${nameSize}px Arial`;
    }
    ctx.fillText(winner.name, cx, cy - 10);

    // ID
    ctx.fillStyle = "#555";
    let idSize = 18;
    ctx.font = `700 ${idSize}px monospace`;
    const idMaxW = nameMaxW;
    const idW = ctx.measureText(winner.id_karyawan).width;
    if (idW > idMaxW) {
      idSize = Math.max(12, Math.floor(idSize * idMaxW / idW));
      ctx.font = `700 ${idSize}px monospace`;
    }
    ctx.fillText(winner.id_karyawan, cx, cy + 18);

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

    for (let i = 0; i < participants.length; i++) {
      const angle = i * arc;
      ctx.fillStyle = sectorColors[i % sectorColors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
    }

    for (let i = 0; i < participants.length; i++) {
      const centerAng = i * arc + arc / 2;
      drawNameRadial(participants[i].name, centerX, centerY, textRadius, centerAng);
    }

    ctx.restore();

    // pointer
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
    <div style="font-size:32px;font-weight:700;margin-bottom:6px;">
      ${winner.name}
    </div>
    <div style="display:flex;align-items:center;justify-content:center;gap:8px">
      <code id="winnerId" style="font-size:24px;padding:4px 8px;background:#f5f5f5;border-radius:6px;">
        ${winner.id_karyawan}
      </code>
    </div>
  </div>
`;

    Swal.fire({
      title: "🎉 Selamat Kepada Pemenang! ",
      html,
      icon: "success",
      confirmButtonText: "Tutup",
      showCloseButton: true,
      allowOutsideClick: false,
      didOpen: () => {
        fireworks();
        const btn = document.getElementById("copyBtn");
        const idEl = document.getElementById("winnerId");
        if (btn && idEl) {
          btn.addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(idEl.textContent);
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

      resultEl.innerHTML = `🎉 Pemenang: <strong>${winner.name}</strong><br>ID: <code>${winner.id_karyawan}</code>`;

      fetch("submit_pemenang.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_karyawan=${encodeURIComponent(winner.id_karyawan)}`
      });

      centerWinner = winner;    // tampil di tengah
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
