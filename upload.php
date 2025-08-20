<?php
// Simple upload handler (XAMPP)
$destDir = __DIR__ . '/uploads/';
if (!is_dir($destDir)) mkdir($destDir, 0777, true);

if (!isset($_FILES['photo'])) { exit('Tidak ada file yang diunggah.'); }
$f = $_FILES['photo'];
if ($f['error'] !== UPLOAD_ERR_OK) { exit('Gagal upload (ERR '.$f['error'].')'); }

$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
$allowed = ['jpg','jpeg','png'];
if (!in_array($ext, $allowed)) { exit('Format harus JPG/PNG.'); }
if ($f['size'] > 3 * 1024 * 1024) { exit('Ukuran maksimal 3MB.'); }

$base = preg_replace('/[^a-z0-9\-_.]/i', '_', pathinfo($f['name'], PATHINFO_FILENAME));
$save = $base . '_' . time() . '.' . $ext;
$to = $destDir . $save;

if (!move_uploaded_file($f['tmp_name'], $to)) { exit('Gagal menyimpan file.'); }

$publicPath = '/undangan/uploads/' . $save;
$guest = isset($_POST['guest_name']) ? trim($_POST['guest_name']) : '';
$qName = $guest ? urlencode($guest) : 'Tamu+Undangan';
$url = sprintf('http://%s/undangan/?to=%s&photo=%s',
  $_SERVER['HTTP_HOST'], $qName, urlencode($publicPath));

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html><body style="font-family:system-ui;padding:20px">
  <h2>Upload Berhasil ✅</h2>
  <p><b>Path File:</b> <code><?php echo htmlspecialchars($publicPath); ?></code></p>
  <p><b>Contoh URL Undangan:</b><br>
     <a href="<?php echo htmlspecialchars($url); ?>" target="_blank">
       <?php echo htmlspecialchars($url); ?>
     </a>
  </p>
  <p><a href="admin.html">Kembali ke Admin</a></p>
</body></html>
