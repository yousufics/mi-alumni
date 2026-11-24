<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    public const STATUSES = ['pending', 'confirmed', 'rejected'];

    protected $fillable = [
        'name', 'phone', 'email', 'amount', 'payment_method', 'trx_id', 'message', 'status', 'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'confirmed_at' => 'datetime',
        ];
    }
}
