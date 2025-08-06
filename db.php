<?php
$host = 'localhost';        // Ganti jika bukan localhost
$user = 'root';             // Username database Anda
$pass = '';                 // Password database Anda
$db   = 'hut50spinv2';        // Nama database

$conn = new mysqli($host, $user, $pass, $db);

// Cek koneksi
if ($conn->connect_error) {
  die("Koneksi ke database gagal: " . $conn->connect_error);
}
?>
