<?php

namespace App\Models;

use App\Support\Uploads;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipRequest extends Model
{
    public const STATUSES = ['pending', 'approved', 'rejected'];

    public const PAYMENT = ['unpaid', 'paid'];

    protected $fillable = [
        'name', 'email', 'phone', 'batch', 'profession', 'address', 'message',
        'member_type_id', 'fee_amount', 'payment_status', 'payment_method', 'trx_id', 'paid_at', 'payment_note', 'photo',
        'status', 'reviewed_at', 'admin_note', 'position', 'is_public',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'paid_at' => 'datetime',
            'is_public' => 'boolean',
            'fee_amount' => 'integer',
        ];
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(MemberType::class, 'member_type_id');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return Uploads::url($this->photo);
    }
}
