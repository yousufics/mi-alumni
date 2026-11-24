<?php

namespace App\Http\Controllers;

use App\Models\CommitteeMember;
use App\Models\Event;
use App\Models\MembershipRequest;
use App\Models\Post;
use App\Support\Content;
use App\Support\Positions;
use App\Support\Uploads;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    private function eventList(): array
    {
        return Event::where('is_published', true)
            ->orderBy('sort_order')->orderBy('id')
            ->get()
            ->map(fn (Event $e) => [
                'title' => $e->title,
                'date' => $e->date_label,
                'place' => $e->place ?: 'স্থান ঘোষণা করা হবে',
                'text' => (string) $e->description,
            ])
            ->all();
    }

    public function home(): Response
    {
        return Inertia::render('Home', [
            'pillars' => Content::get('pillars')['items'],
            'about' => Content::get('about')['intro'],
            'posts' => Post::where('is_published', true)
                ->orderByDesc('published_at')->orderByDesc('id')->limit(3)->get()
                ->map(fn (Post $p) => $p->card())->all(),
            'events' => $this->eventList(),
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('About', [
            'about' => [
                ...Content::get('about'),
                'activities' => Content::get('activities')['items'],
            ],
            'pillars' => Content::get('pillars')['items'],
        ]);
    }

    public function events(): Response
    {
        return Inertia::render('Events', ['events' => $this->eventList()]);
    }

    public function donate(): Response
    {
        return Inertia::render('Donate', [
            'donation' => Content::get('donation'),
            'payment' => \App\Support\Payment::data(),
        ]);
    }

    /* ---------- কমিটি পেজের ৪ ট্যাব ---------- */

    /** ১. বর্তমান কমিটি */
    public function committees(): Response
    {
        $members = CommitteeMember::where('is_current', true)->get();

        return Inertia::render('Committees', [
            'tab' => 'current',
            'title' => 'বর্তমান কমিটি',
            'session' => (string) ($members->first(fn ($m) => $m->session && ! Positions::isAdvisory($m->position))?->session ?? ''),
            'sections' => Positions::sections($members, Positions::COMMITTEE_SECTIONS),
        ]);
    }

    /** ২. উপদেষ্টা ও দাতা সদস্য */
    public function advisors(): Response
    {
        $members = CommitteeMember::where('is_current', true)->get();

        return Inertia::render('Committees', [
            'tab' => 'advisors',
            'title' => 'উপদেষ্টা ও দাতা সদস্য',
            'sections' => Positions::sections($members, Positions::ADVISORY_SECTIONS),
        ]);
    }

    /** ৩. সাধারণ সদস্য (অনুমোদিত আবেদনকারী), ব্যাচ অনুযায়ী ফিল্টার */
    public function generalMembers(Request $request): Response
    {
        $batch = trim((string) $request->query('batch', ''));

        $base = MembershipRequest::where('status', 'approved')->where('is_public', true);

        $batches = (clone $base)
            ->selectRaw('batch, count(*) as total')
            ->groupBy('batch')
            ->orderByDesc('batch')
            ->get()
            ->map(fn ($b) => ['batch' => $b->batch, 'total' => (int) $b->total])
            ->all();

        $list = $base
            ->with('type')
            ->when($batch !== '', fn ($q) => $q->where('batch', $batch))
            ->orderByDesc('batch')->orderBy('name')
            ->paginate(24)->withQueryString()
            ->through(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'batch' => $r->batch,
                // ফোন/ইমেইল কখনোই পাবলিকে যায় না
                'position' => $r->position ?: $r->profession,
                'type' => $r->type?->name,
                'photo' => $r->photo_url,
            ]);

        return Inertia::render('Committees', [
            'tab' => 'members',
            'title' => 'সাধারণ সদস্য',
            'list' => $list,
            'batches' => $batches,
            'batch' => $batch,
            'total' => array_sum(array_column($batches, 'total')),
        ]);
    }

    /** ৪. সাবেক কমিটি — মেয়াদ অনুযায়ী */
    public function former(Request $request): Response
    {
        $terms = CommitteeMember::where('is_current', false)
            ->whereNotNull('session')
            ->selectRaw('session, count(*) as total, max(id) as latest')
            ->groupBy('session')
            ->orderByDesc('latest')
            ->get()
            ->map(fn ($t) => ['session' => $t->session, 'total' => (int) $t->total])
            ->all();

        $names = array_column($terms, 'session');
        $selected = in_array($request->query('session'), $names, true) ? $request->query('session') : ($names[0] ?? '');

        $members = $selected === ''
            ? collect()
            : CommitteeMember::where('is_current', false)->where('session', $selected)->get();

        return Inertia::render('Committees', [
            'tab' => 'former',
            'title' => 'সাবেক কমিটি',
            'session' => $selected,
            'terms' => $terms,
            'sections' => Positions::sections($members, Positions::COMMITTEE_SECTIONS),
        ]);
    }
}
