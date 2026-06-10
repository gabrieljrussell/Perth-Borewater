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

// Set cache headers (1 year long-term caching)
$cacheTTL = 31536000; // 1 year
header('Cache-Control: public, max-age=' . $cacheTTL . ', immutable');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $cacheTTL) . ' GMT');
header_remove('Pragma');

$mime = mime_content_type($imagePath);
$width = isset($_GET['w']) ? intval($_GET['w']) : 0;
$quality = isset($_GET['q']) ? intval($_GET['q']) : 80;

// Enable browser formatting negotiation (WebP fallback)
$supportsWebP = false;
if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'image/webp') !== false) {
    $supportsWebP = true;
}

// If width is specified or we want to convert to webp, and GD is available
if (extension_loaded('gd') && (($width > 0) || $supportsWebP)) {
    // Determine image type
    $imageInfo = getimagesize($imagePath);
    if ($imageInfo !== false) {
        $origWidth = $imageInfo[0];
        $origHeight = $imageInfo[1];
        $type = $imageInfo[2];

        $srcImg = null;
        switch ($type) {
            case IMAGETYPE_JPEG:
                $srcImg = imagecreatefromjpeg($imagePath);
                break;
            case IMAGETYPE_PNG:
                $srcImg = imagecreatefrompng($imagePath);
                break;
            case IMAGETYPE_WEBP:
                $srcImg = imagecreatefromwebp($imagePath);
                break;
        }

        if ($srcImg !== null) {
            // Calculate dimensions
            $newWidth = $origWidth;
            $newHeight = $origHeight;

            if ($width > 0 && $width < $origWidth) {
                $newWidth = $width;
                $newHeight = intval(($origHeight / $origWidth) * $width);
            }

            // Perform resize
            $dstImg = imagecreatetruecolor($newWidth, $newHeight);
            
            // Preserve transparency for PNGs or WebPs
            if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_WEBP) {
                imagealphablending($dstImg, false);
                imagesavealpha($dstImg, true);
                $transparent = imagecolorallocatealpha($dstImg, 255, 255, 255, 127);
                imagefilledrectangle($dstImg, 0, 0, $newWidth, $newHeight, $transparent);
            }

            imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

            // Output WEBP if supported, else fallback to standard formats
            if ($supportsWebP) {
                header('Content-Type: image/webp');
                imagewebp($dstImg, null, $quality);
            } else {
                header('Content-Type: ' . $mime);
                switch ($type) {
                    case IMAGETYPE_JPEG:
                        imagejpeg($dstImg, null, $quality);
                        break;
                    case IMAGETYPE_PNG:
                        imagepng($dstImg, null, intval((100 - $quality) / 10)); // Compression 0-9
                        break;
                    case IMAGETYPE_WEBP:
                        imagewebp($dstImg, null, $quality);
                        break;
                }
            }

            imagedestroy($srcImg);
            imagedestroy($dstImg);
            exit;
        }
    }
}

// Fallback to direct output
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($imagePath));
readfile($imagePath);
exit;
?>
