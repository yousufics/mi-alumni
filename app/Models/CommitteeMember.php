<?php

namespace App\Models;

use App\Support\Uploads;
use Illuminate\Database\Eloquent\Model;

class CommitteeMember extends Model
{
    protected $fillable = [
        'position', 'session', 'role', 'name', 'batch', 'photo', 'is_current', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_current' => 'boolean'];
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return Uploads::url($this->photo);
    }
}
