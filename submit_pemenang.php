<?php
require 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['unique_id'])) {
  $id = $conn->real_escape_string($_POST['unique_id']);
  $conn->query("UPDATE peserta SET status = 'menang' WHERE unique_id = '$id' AND status = 'belum_menang'");
}
