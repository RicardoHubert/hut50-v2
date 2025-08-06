<?php require 'db.php'; ?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Spinwheel Peserta</title>
  <link rel="stylesheet" href="style.css">
  <style>
    canvas { display: block; margin: 20px auto; }
    #spinBtn { padding: 10px 30px; font-size: 18px; }
    #result { margin-top: 20px; font-weight: bold; text-align: center; }
    table { margin: 30px auto; border-collapse: collapse; }
    th, td { padding: 8px 16px; border: 1px solid #ccc; }
  </style>
</head>
<body>

<h2 style="text-align:center;">🎯 Spinwheel Peserta</h2>

<canvas id="wheel" width="500" height="500"></canvas>
<div style="text-align: center;">
  <button id="spinBtn">SPIN</button>
  <p id="result"></p>
</div>

<h3 style="text-align:center;">📋 Daftar Pemenang</h3>
<table>
  <tr>
    <th>No</th>
    <th>Nama</th>
    <th>ID Unik</th>
    <th>Waktu</th>
  </tr>
  <?php
    $res = $conn->query("SELECT * FROM peserta WHERE status = 'menang' ORDER BY created_at DESC");
    $i = 1;
    while ($row = $res->fetch_assoc()) {
      echo "<tr>
              <td>{$i}</td>
              <td>{$row['name']}</td>
              <td>{$row['unique_id']}</td>
              <td>{$row['created_at']}</td>
            </tr>";
      $i++;
    }
  ?>
</table>

<script src="script.js"></script>
</body>
</html>
