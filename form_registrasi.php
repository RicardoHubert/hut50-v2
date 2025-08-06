<?php
require 'db.php';

function generateUniqueID() {
  return 'RKS-' . strtoupper(bin2hex(random_bytes(3)));
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $name = trim($_POST['name'] ?? '');
  if ($name !== '') {
    $check = $conn->prepare("SELECT * FROM peserta WHERE name = ?");
    $check->bind_param("s", $name);
    $check->execute();
    if ($check->get_result()->num_rows == 0) {
      $id = generateUniqueID();
      $stmt = $conn->prepare("INSERT INTO peserta (unique_id, name) VALUES (?, ?)");
      $stmt->bind_param("ss", $id, $name);
      $stmt->execute();
      echo "<h2>Registrasi Berhasil 🎉</h2><p>Nama: <strong>$name</strong><br>ID Unik: <code>$id</code></p>";
    } else {
      echo "<p>Nama sudah terdaftar.</p>";
    }
  }
}
?>

<form method="POST">
  <label>Nama:</label>
  <input type="text" name="name" required>
  <button type="submit">Daftar</button>
</form>
