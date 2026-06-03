<?php
$filename = $_GET['file'] ?? '';
if (empty($filename)) {
    http_response_code(400);
    exit('No file specified');
}

// YOUR CONFIRMED PATH from debug output
$imagePath = '/home/u811860405/domains/perthborewater.com.au/Storage/' . basename($filename);

if (!file_exists($imagePath)) {
    http_response_code(404);
    exit('File not found: ' . htmlspecialchars($imagePath));
}

$mime = mime_content_type($imagePath);
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($imagePath));
readfile($imagePath);
exit;
?>
