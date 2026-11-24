<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Arr;

/**
 * সাইটের সম্পাদনাযোগ্য লেখা। অ্যাডমিন থেকে বদলালে ডাটাবেসের মান,
 * না বদলালে config/alumni.php-র ডিফল্ট ব্যবহার হয়।
 */
class Content
{
    public const GROUPS = ['pillars', 'about', 'activities', 'donation', 'contact', 'membership'];

    public static function defaults(): array
    {
        return [
            'pillars' => ['items' => config('alumni.pillars')],
            'about' => Arr::only(config('alumni.about'), ['intro', 'mission', 'vision']),
            'activities' => ['items' => config('alumni.about.activities')],
            'donation' => [
                'intro' => config('alumni.donation.intro'),
                'thanks' => 'আপনার এই মহৎ উদ্যোগের জন্য আন্তরিক অভিনন্দন ও কৃতজ্ঞতা। আপনার সহযোগিতাই আমাদের শক্তি।',
            ],
            // সদস্যপদ ও অনুদান পেজের পেমেন্ট তথ্য (অ্যাডমিন > পেমেন্ট তথ্য)
            'payment' => [
                'bank_name' => '',
                'account_name' => '',
                'account_number' => '',
                'branch' => '',
                'routing' => '',
                'qr' => '',
                'qr_note' => 'QR কোড স্ক্যান করে পেমেন্ট করুন',
                'instruction' => '',
                'methods' => [
                    ['name' => 'বিকাশ (পার্সোনাল)', 'detail' => '01XXX-XXXXXX'],
                    ['name' => 'নগদ (পার্সোনাল)', 'detail' => '01XXX-XXXXXX'],
                ],
            ],
            'contact' => Arr::only(config('alumni.site'), ['phone', 'email', 'whatsapp', 'address', 'facebook', 'youtube']),
            'membership' => [
                'intro' => 'অ্যালামনাই সদস্যপদের আবেদন ফরম পূরণ করুন। আবেদন অনুমোদনের পর মেম্বারশীপ ফি পরিশোধ করতে হবে।',
                'payment_note' => 'ফি পরিশোধ করে কমিটির সঙ্গে যোগাযোগ করুন। পেমেন্ট নিশ্চিত হলে আপনার মেম্বারশীপ ফি স্ট্যাটাস "পরিশোধিত" করা হবে।',
            ],
        ];
    }

    public static function get(string $group): array
    {
        $base = self::defaults()[$group] ?? [];
        $stored = Setting::where('key', $group)->first()?->value;

        return is_array($stored) ? array_replace($base, $stored) : $base;
    }

    public static function all(): array
    {
        $out = [];
        foreach (self::GROUPS as $g) {
            $out[$g] = self::get($g);
        }

        return $out;
    }
}
