<?php
require '../db.php';

// Helper escape HTML
function e($str) { return htmlspecialchars((string)$str, ENT_QUOTES, 'UTF-8'); }

$status   = null;   // "success" | "error"
$message  = null;
$newId    = null;
$nameIn   = null;
$idKaryawanIn = null;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $nameIn       = trim($_POST['name'] ?? '');
  $idKaryawanIn = strtoupper(trim($_POST['id_karyawan'] ?? '')); // optional: uppercase

  if ($nameIn === '' || $idKaryawanIn === '') {
    $status  = 'error';
    $message = 'Nama dan ID Karyawan wajib diisi.';
  } else {
    // Cek duplikat berdasarkan ID Karyawan
    $check = $conn->prepare("SELECT 1 FROM peserta_cabang WHERE id_karyawan = ? LIMIT 1");
    $check->bind_param("s", $idKaryawanIn);
    $check->execute();
    $res = $check->get_result();

    if ($res && $res->num_rows > 0) {
      $status  = 'error';
      $message = 'ID Karyawan sudah terdaftar. Silakan gunakan ID lain atau hubungi panitia.';
    } else {
      // Simpan
      $stmt = $conn->prepare("INSERT INTO peserta_cabang (id_karyawan, name) VALUES (?, ?)");
      $stmt->bind_param("ss", $idKaryawanIn, $nameIn);
      if ($stmt->execute()) {
        $status  = 'success';
        $message = 'Registrasi berhasil! Selamat bergabung 🎉';
        $newId   = $idKaryawanIn; // untuk ditampilkan jika perlu
      } else {
        $status  = 'error';
        $message = 'Terjadi kesalahan pada server. Coba beberapa saat lagi.';
      }
      $stmt->close();
    }
    $check->close();
  }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Registrasi Doorprize HUT 50 Cabang</title>
  <style>
    :root{ --bg1:#0f172a; --bg2:#1e293b; --card:#0b1224aa; --stroke:#334155; --text:#e2e8f0; --muted:#94a3b8; --primary:#38bdf8; --primary-2:#22d3ee; --success:#22c55e; --error:#ef4444; --shadow:0 10px 30px rgba(0,0,0,.35); --radius:18px; }
    *{box-sizing:border-box}
    body{
      margin:0; min-height:100svh; color:var(--text); font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Ubuntu,Arial,sans-serif;
      background:
        radial-gradient(1200px 800px at 10% -10%, #0ea5e98c 0%, transparent 60%),
        radial-gradient(1000px 700px at 110% 10%, #22d3ee59 0%, transparent 55%),
        linear-gradient(160deg,var(--bg1),var(--bg2));
      display:flex; align-items:center; justify-content:center; padding:24px;
      background-image:url('./../spinwheel4.png'); background-size:cover; background-position:center;
    }
    .card{ width:100%; max-width:520px; background:var(--card); border:1px solid var(--stroke); border-radius:var(--radius); box-shadow:var(--shadow); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); overflow:hidden; }
    .header{ padding:22px 22px 10px; border-bottom:1px solid var(--stroke); }
    .title{ margin:0; font-size:22px; letter-spacing:.3px; }
    .body{ padding:22px; }
    .field{ position:relative; margin-bottom:18px; }
    .input{ width:100%; padding:16px 16px 14px 48px; border:1px solid var(--stroke); border-radius:14px; background:#0b1224cc; color:var(--text); outline:none; transition:.2s border-color,.2s box-shadow; font-size:16px; }
    .input:focus{ border-color:var(--primary); box-shadow:0 0 0 4px #38bdf81a; }
    .label{ position:absolute; left:48px; top:14px; color:var(--muted); pointer-events:none; transition:.15s ease; background:transparent; padding:0 6px; }
    .input::placeholder{ color:transparent; }
    .input:focus + .label, .input:not(:placeholder-shown) + .label{ top:-8px; font-size:12px; color:var(--primary); background:linear-gradient(to right,transparent,#0b1224cc 30%,#0b1224cc 70%,transparent); }
    .icon{ position:absolute; left:14px; top:50%; translate:0 -50%; opacity:.8; pointer-events:none; width:22px; height:22px; }
    .btn{ width:100%; border:0; cursor:pointer; border-radius:14px; padding:14px 18px; font-weight:600; font-size:16px; background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:#0b1224; transition:.08s transform,.2s box-shadow,.2s filter; box-shadow:0 10px 20px rgba(56,189,248,.25); }
    .btn:hover{ filter:saturate(1.08) brightness(1.05); }
    .btn:active{ transform:translateY(1px); }
    .meta{ color:var(--muted); font-size:12px; margin-top:10px; }
    .alert{ border:1px solid; border-radius:14px; padding:14px; margin-bottom:16px; display:flex; gap:10px; align-items:flex-start; }
    .alert.success{ border-color:#22c55e33; background:#052e1a66; }
    .alert.error{ border-color:#ef444433; background:#3b0a0a66; }
    .alert b{ display:block; margin-bottom:4px; }
    .confetti{ height:8px; width:100%; border-radius:8px; background:linear-gradient(90deg,#22c55e,#f59e0b 16%,#38bdf8 33%,#e11d48 50%,#a78bfa 66%,#22d3ee 83%,#22c55e); margin-bottom:10px; opacity:.95; }
    @media (prefers-reduced-motion:no-preference){ .confetti{ animation:slide 3s linear infinite; background-size:200% 100%; } @keyframes slide{0%{background-position:0 0}100%{background-position:200% 0}} }
  </style>
</head>
<body>
  <main class="card" role="main">
    <div class="header">
      <h1 class="title">Registrasi Doorprize HUT 50 Cabang</h1>
    </div>

    <div class="body">
      <?php if ($status === 'success'): ?>
        <div class="confetti" aria-hidden="true"></div>
        <div class="alert success" role="status" aria-live="polite">
          <div>
            <b>Berhasil!</b>
            <div><?= e($message) ?></div>
          </div>
        </div>
      <?php elseif ($status === 'error'): ?>
        <div class="alert error" role="alert" aria-live="assertive">
          <div>
            <b>Gagal</b>
            <div><?= e($message) ?></div>
          </div>
        </div>
      <?php endif; ?>

      <form method="POST" id="regForm" novalidate>
        <div class="field">
          <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 12c2.761 0 5-2.462 5-5.5S14.761 1 12 1 7 3.462 7 6.5 9.239 12 12 12Zm0 2c-4.418 0-8 2.91-8 6.5 0 .828.895 1.5 2 1.5h12c1.105 0 2-.672 2-1.5 0-3.59-3.582-6.5-8-6.5Z" fill="currentColor" opacity=".7"/>
          </svg>
          <input
            class="input"
            id="name"
            name="name"
            type="text"
            placeholder=" "
            required minlength="2" maxlength="60"
            value="<?= e($nameIn ?? '') ?>"
            autocomplete="off" inputmode="text"
          />
          <label class="label" for="name">Nama</label>
        </div>

        <div class="field">
          <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 5h18v4H3V5Zm0 6h18v8H3v-8Z" fill="currentColor" opacity=".7"/>
          </svg>
          <input
            class="input"
            id="id_karyawan"
            name="id_karyawan"
            type="text"
            placeholder=" "
            required minlength="2" maxlength="60"
            value="<?= e($idKaryawanIn ?? '') ?>"
            autocomplete="off" inputmode="text"
            pattern="[A-Za-z0-9\-_.]+"
            title="Gunakan huruf/angka/tanda - _ ."
          />
          <label class="label" for="id_karyawan">ID Karyawan</label>
        </div>

        <button class="btn" id="submitBtn" type="submit">Daftar</button>
        <div class="meta">Dengan mendaftar, Anda menyetujui nama Anda ditampilkan di daftar peserta acara.</div>
      </form>
    </div>
  </main>

  <script>
    const form = document.getElementById('regForm');
    const submitBtn = document.getElementById('submitBtn');
    if (form) {
      form.addEventListener('submit', () => {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';
      });
    }
  </script>
</body>
</html>
