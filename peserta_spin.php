<?php
require 'db.php';

$res = $conn->query("SELECT name, unique_id FROM peserta WHERE status = 'belum_menang'");
$peserta = [];

while ($row = $res->fetch_assoc()) {
  $peserta[] = [
    'name' => $row['name'],
    'unique_id' => $row['unique_id']
  ];
}

header('Content-Type: application/json');
echo json_encode($peserta);
