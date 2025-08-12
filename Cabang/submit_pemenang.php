<?php
require '../db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id_karyawan'])) {
  $id = $conn->real_escape_string($_POST['id_karyawan']);
  $conn->query("UPDATE peserta_cabang SET status = 'menang' WHERE id_karyawan = '$id' AND status = 'belum_menang'");
}
