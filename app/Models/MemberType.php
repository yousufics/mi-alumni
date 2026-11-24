<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberType extends Model
{
    protected $fillable = ['name', 'fee', 'description', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['fee' => 'integer', 'is_active' => 'boolean'];
    }
}
