<?php

namespace Database\Seeders;

use App\Models\CommitteeMember;
use App\Models\Event;
use App\Models\Post;
use App\Support\Positions;
use Illuminate\Database\Seeder;

/**
 * config/alumni.php-র নমুনা কমিটি, ইভেন্ট ও নিবন্ধ ডাটাবেসে তোলে (টেবিল ফাঁকা থাকলে)।
 * চালান: php artisan db:seed --class=SiteContentSeeder
 */
class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        if (CommitteeMember::count() === 0) {
            $session = config('alumni.committees.session');
            foreach (config('alumni.committees.members') as $i => $m) {
                CommitteeMember::create([
                    'position' => Positions::fromRole($m['role']),
                    'session' => $session,
                    'role' => $m['role'],
                    'name' => $m['name'],
                    'batch' => $m['batch'] ?? null,
                    'is_current' => true,
                    'sort_order' => $i + 1,
                ]);
            }
        }

        if (Event::count() === 0) {
            foreach (config('alumni.events') as $i => $e) {
                Event::create([
                    'title' => $e['title'],
                    'date_label' => $e['date'],
                    'place' => $e['place'] ?? null,
                    'description' => $e['text'] ?? null,
                    'is_published' => true,
                    'sort_order' => $i + 1,
                ]);
            }
        }

        if (Post::count() === 0) {
            foreach (array_reverse(config('alumni.posts')) as $p) {
                Post::create([
                    'title' => $p['title'],
                    'tag' => $p['tag'] ?? null,
                    'excerpt' => $p['excerpt'] ?? null,
                    'body' => $p['excerpt'] ?? '',
                    'published_at' => now()->toDateString(),
                    'is_published' => true,
                ]);
            }
        }
    }
}
