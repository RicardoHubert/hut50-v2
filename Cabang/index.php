<?php require '../db.php'; ?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Spinwheel Peserta Cabang</title>
  <link rel="stylesheet" href="../style.css">
  <style>
    body {
      display: flex; 
      flex-direction: column; 
      align-items: center;
      font-family: Arial, sans-serif;
      background-image: url('../spinwheel4.png');
      background-size: cover; /* Menyesuaikan ukuran layar */
      background-position: center; /* Posisikan di tengah */
      /* background-repeat: no-repeat; Hindari pengulangan */
    }
    .stage {
      position: relative; 
      width: 700px; 
      height: 700px; 
      margin: 16px auto;
    }
    #bgImage, #wheel {
      position: absolute;
      width: 700px;
      height: 700px;
      display: block;
    }
    #bgImage { 
      user-select: none; 
      pointer-events: none; 
      left: -300px; 
    }
    #spinBtn {
      padding: 10px 30px; 
      font-size: 18px; 
      margin-top: 10px; 
      cursor: pointer;
    }
    #result { 
      margin-top: 14px; 
      font-weight: bold; 
      text-align: center; 
    }
    table { 
      margin: 24px auto; 
      border-collapse: collapse; 
      width: 700px; 
    }
    th, td { 
      padding: 8px 12px; 
      border: 1px solid #ccc; 
    }
  </style>

  <!-- SweetAlert2 & Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
</head>
<body>

<h2>🎉 SPINWHEEL HUT RAKSA 50 TAHUN CABANG 🎉</h2>

<div class="stage">
  <!-- <img id="bgImage" src="spinwheel3.png" alt="Spinwheel" width="700" height="700" /> -->
  <canvas id="wheel" width="700" height="700"></canvas>
</div>

<button id="spinBtn">SPIN</button>
<p id="result"></p>

<h3>📋 Daftar Pemenang</h3>
<table>
  <tr>
    <th>No</th>
    <th>Nama</th>
    <th>ID Unik</th>
    <th>Waktu</th>
  </tr>
  <?php
    $res = $conn->query("SELECT * FROM peserta_cabang WHERE status = 'menang' ORDER BY created_at DESC");
    $i = 1;
    while ($row = $res->fetch_assoc()) {
      echo "<tr>
              <td>{$i}</td>
              <td>{$row['name']}</td>
              <td>{$row['id_karyawan']}</td>
              <td>{$row['created_at']}</td>
            </tr>";
      $i++;
    }
  ?>
</table>

<script src="../script.js"></script>
</body>
</html>
