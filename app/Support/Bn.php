<?php

namespace App\Support;

use Carbon\CarbonInterface;

class Bn
{
    private const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

    public static function digits(string|int $value): string
    {
        return strtr((string) $value, ['0' => '০', '1' => '১', '2' => '২', '3' => '৩', '4' => '৪', '5' => '৫', '6' => '৬', '7' => '৭', '8' => '৮', '9' => '৯']);
    }

    public static function date(?CarbonInterface $date): string
    {
        if (! $date) {
            return '';
        }

        return self::digits($date->day).' '.self::MONTHS[$date->month - 1].' '.self::digits($date->year);
    }
}
