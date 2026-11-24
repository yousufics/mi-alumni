<?php

namespace App\Support;

/**
 * পেমেন্ট তথ্য (ব্যাংক, QR, বিকাশ/নগদ) — সদস্যপদ ও অনুদান দুই পেজেই একই তথ্য দেখায়।
 */
class Payment
{
    public static function data(): array
    {
        $p = Content::get('payment');

        $options = collect($p['methods'] ?? [])->pluck('name')->filter()->values()->all();
        if (! empty($p['account_number'])) {
            $options[] = 'ব্যাংক ট্রান্সফার';
        }
        if (! empty($p['qr'])) {
            $options[] = 'QR কোড স্ক্যান';
        }
        $options[] = 'অন্যান্য';

        return [
            'bank_name' => $p['bank_name'] ?? '',
            'account_name' => $p['account_name'] ?? '',
            'account_number' => $p['account_number'] ?? '',
            'branch' => $p['branch'] ?? '',
            'routing' => $p['routing'] ?? '',
            'qr_url' => Uploads::url($p['qr'] ?? null),
            'qr_note' => $p['qr_note'] ?? '',
            'instruction' => $p['instruction'] ?? '',
            'methods' => array_values($p['methods'] ?? []),
            'options' => array_values(array_unique($options)),
        ];
    }

    public static function options(): array
    {
        return self::data()['options'];
    }
}
