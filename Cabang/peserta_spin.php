<?php
require '../db.php';

$res = $conn->query("SELECT name, id_karyawan FROM peserta_cabang WHERE status = 'belum_menang'");
$peserta = [];

while ($row = $res->fetch_assoc()) {
  $peserta[] = [
    'name' => $row['name'],
    'id_karyawan' => $row['id_karyawan']
  ];
}

header('Content-Type: application/json');
echo json_encode($peserta);
