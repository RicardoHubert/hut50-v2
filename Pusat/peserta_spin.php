<?php
require '../db.php';

$res = $conn->query("SELECT unique_id FROM peserta_pusat WHERE status = 'belum_menang'");
$peserta = [];

while ($row = $res->fetch_assoc()) {
  $peserta[] = [
    'unique_id' => $row['unique_id']
  ];
}

header('Content-Type: application/json');
echo json_encode($peserta);
