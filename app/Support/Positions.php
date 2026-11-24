<?php

namespace App\Support;

use Illuminate\Support\Collection;

/**
 * কমিটি/উপদেষ্টা/দাতা সদস্যের পজিশন তালিকা।
 * group: committee = শুধু কমিটি, advisory = উপদেষ্টা ও দাতা পেজ, both = দুই পেজেই (প্রধান উপদেষ্টা)।
 */
class Positions
{
    public const ALL = [
        'chief_advisor' => ['label' => 'প্রধান উপদেষ্টা', 'group' => 'both', 'appears' => 'বর্তমান কমিটি ও উপদেষ্টা পেজের শুরুতে'],
        'president' => ['label' => 'সভাপতি', 'group' => 'committee', 'appears' => 'কমিটি পেজে "সভাপতি ও সাধারণ সম্পাদক" অংশে'],
        'general_secretary' => ['label' => 'সাধারণ সম্পাদক', 'group' => 'committee', 'appears' => 'কমিটি পেজে "সভাপতি ও সাধারণ সম্পাদক" অংশে'],
        'vice_president' => ['label' => 'সহ-সভাপতি', 'group' => 'committee', 'appears' => 'কমিটি পেজে "সহ-সভাপতিবৃন্দ" অংশে'],
        'joint_secretary' => ['label' => 'সহ-সাধারণ সম্পাদক', 'group' => 'committee', 'appears' => 'কমিটি পেজে "সহ-সাধারণ সম্পাদকবৃন্দ" অংশে'],
        'member' => ['label' => 'কমিটির সাধারণ সদস্য', 'group' => 'committee', 'appears' => 'কমিটি পেজের শেষে "সাধারণ সদস্যবৃন্দ" অংশে'],
        'advisor' => ['label' => 'উপদেষ্টা', 'group' => 'advisory', 'appears' => 'উপদেষ্টা ও দাতা সদস্য পেজে "উপদেষ্টাবৃন্দ" অংশে'],
        'donor' => ['label' => 'দাতা সদস্য', 'group' => 'advisory', 'appears' => 'উপদেষ্টা ও দাতা সদস্য পেজের শেষে "দাতা সদস্যবৃন্দ" অংশে'],
    ];

    /** [অংশের শিরোনাম, [পজিশন...]] — কমিটি পেজের ক্রম */
    public const COMMITTEE_SECTIONS = [
        ['প্রধান উপদেষ্টা', ['chief_advisor']],
        ['সভাপতি ও সাধারণ সম্পাদক', ['president', 'general_secretary']],
        ['সহ-সভাপতিবৃন্দ', ['vice_president']],
        ['সহ-সাধারণ সম্পাদকবৃন্দ', ['joint_secretary']],
        ['সাধারণ সদস্যবৃন্দ', ['member']],
    ];

    public const ADVISORY_SECTIONS = [
        ['প্রধান উপদেষ্টা', ['chief_advisor']],
        ['উপদেষ্টাবৃন্দ', ['advisor']],
        ['দাতা সদস্যবৃন্দ', ['donor']],
    ];

    public static function keys(): array
    {
        return array_keys(self::ALL);
    }

    public static function label(string $key): string
    {
        return self::ALL[$key]['label'] ?? $key;
    }

    /** উপদেষ্টা/দাতা: মেয়াদ ও বর্তমান/সাবেক লাগে না */
    public static function isAdvisory(?string $key): bool
    {
        return (self::ALL[$key]['group'] ?? null) === 'advisory';
    }

    /** অ্যাডমিন ফরমের জন্য */
    public static function options(): array
    {
        $out = [];
        foreach (self::ALL as $key => $p) {
            $out[] = ['key' => $key, 'label' => $p['label'], 'group' => $p['group'], 'appears' => $p['appears']];
        }

        return $out;
    }

    /** পুরোনো role লেখা থেকে পজিশন অনুমান (সিডার ও মাইগ্রেশনের জন্য) */
    public static function fromRole(string $role): string
    {
        return [
            'প্রধান উপদেষ্টা' => 'chief_advisor',
            'সভাপতি' => 'president',
            'সাধারণ সম্পাদক' => 'general_secretary',
            'সহ-সভাপতি' => 'vice_president',
            'যুগ্ম সাধারণ সম্পাদক' => 'joint_secretary',
            'সহ-সাধারণ সম্পাদক' => 'joint_secretary',
        ][$role] ?? 'member';
    }

    /**
     * সদস্যদের অংশ অনুযায়ী সাজায়। ফাঁকা অংশ বাদ যায়।
     *
     * @param  Collection<int, \App\Models\CommitteeMember>  $members
     */
    public static function sections(Collection $members, array $layout): array
    {
        $sections = [];

        foreach ($layout as [$title, $keys]) {
            $items = $members
                ->filter(fn ($m) => in_array($m->position, $keys, true))
                ->sortBy(fn ($m) => [array_search($m->position, $keys, true), $m->sort_order, $m->id])
                ->values();

            if ($items->isEmpty()) {
                continue;
            }

            $sections[] = [
                'title' => $title,
                'featured' => $keys === ['chief_advisor'],
                'members' => $items->map(fn ($m) => [
                    'id' => $m->id,
                    'title' => $m->role ?: self::label($m->position),
                    'name' => $m->name,
                    'batch' => (string) $m->batch,
                    'photo' => $m->photo_url,
                ])->all(),
            ];
        }

        return $sections;
    }
}
