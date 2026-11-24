<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * ছবি রাখা হয় public/uploads/ ফোল্ডারে, তাই Windows-এ storage:link (symlink) লাগে না।
 */
class Uploads
{
    public static function store(UploadedFile $file, string $dir): string
    {
        $name = Str::uuid().'.'.($file->extension() ?: 'jpg');
        $file->move(public_path("uploads/{$dir}"), $name);

        return "uploads/{$dir}/{$name}";
    }

    public static function delete(?string $path): void
    {
        if ($path && str_starts_with($path, 'uploads/') && ! str_contains($path, '..')) {
            File::delete(public_path($path));
        }
    }

    public static function url(?string $path): ?string
    {
        return $path ? '/'.$path : null;
    }
}
