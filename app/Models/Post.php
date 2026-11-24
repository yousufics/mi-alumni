<?php

namespace App\Models;

use App\Support\Bn;
use App\Support\Uploads;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    protected $fillable = ['title', 'tag', 'excerpt', 'body', 'image', 'published_at', 'is_published'];

    protected function casts(): array
    {
        return ['published_at' => 'date', 'is_published' => 'boolean'];
    }

    public function getImageUrlAttribute(): ?string
    {
        return Uploads::url($this->image);
    }

    /** তালিকা/কার্ডের জন্য সংক্ষিপ্ত রূপ */
    public function card(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'tag' => $this->tag,
            'excerpt' => $this->excerpt ?: Str::limit(strip_tags((string) $this->body), 150),
            'date' => Bn::date($this->published_at ?? $this->created_at),
            'image' => $this->image_url,
        ];
    }
}
