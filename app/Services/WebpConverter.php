<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Throwable;

class WebpConverter
{
    /**
     * Convert an uploaded image file to WebP format and save to storage disk.
     *
     * @param UploadedFile $file The uploaded file instance
     * @param string $directory Storage directory (e.g. 'avatars', 'questions', 'settings', 'courses')
     * @param string $disk Storage disk name (default: 'public')
     * @param int $quality WebP quality compression percentage (1-100, default: 80)
     * @return string Stored relative file path
     */
    public static function convertAndStore(UploadedFile $file, string $directory, string $disk = 'public', int $quality = 80): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        // Keep SVG and ICO formats in their original state (vector / icon format)
        if (in_array($extension, ['svg', 'ico'], true)) {
            return $file->store($directory, $disk);
        }

        $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $cleanFilename = preg_replace('/[^A-Za-z0-9_\-]/', '', str_replace(' ', '_', $filename));
        $webpFilename = time() . '_' . ($cleanFilename ?: 'image') . '_' . bin2hex(random_bytes(4)) . '.webp';
        $fullPath = rtrim($directory, '/') . '/' . $webpFilename;

        try {
            $rawContent = file_get_contents($file->getRealPath());
            if ($rawContent === false) {
                return $file->store($directory, $disk);
            }

            $img = @imagecreatefromstring($rawContent);
            if ($img === false) {
                return $file->store($directory, $disk);
            }

            // Preserve alpha channel transparency for PNG/WebP images
            imagepalettetotruecolor($img);
            imagealphablending($img, true);
            imagesavealpha($img, true);

            ob_start();
            $success = imagewebp($img, null, $quality);
            $webpData = ob_get_clean();
            imagedestroy($img);

            if (! $success || empty($webpData)) {
                return $file->store($directory, $disk);
            }

            Storage::disk($disk)->put($fullPath, $webpData);

            return $fullPath;
        } catch (Throwable $e) {
            // Graceful fallback to standard storage if conversion fails
            return $file->store($directory, $disk);
        }
    }
}
