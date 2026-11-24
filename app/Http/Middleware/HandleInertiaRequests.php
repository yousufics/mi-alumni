<?php

namespace App\Http\Middleware;

use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\MembershipRequest;
use App\Support\Content;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $isAdminArea = $request->is('admin*') && $request->user() && (bool) $request->user()->is_admin;

        return [
            ...parent::share($request),
            // যোগাযোগের তথ্য অ্যাডমিন থেকে বদলানো যায়
            'site' => fn () => array_merge(config('alumni.site'), Content::get('contact')),
            'nav' => config('alumni.nav'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
            'auth' => [
                'user' => fn () => $request->user()
                    ? ['name' => $request->user()->name, 'email' => $request->user()->email]
                    : null,
            ],
            'adminCounts' => fn () => $isAdminArea
                ? [
                    'pending' => MembershipRequest::where('status', 'pending')->count(),
                    'unread' => ContactMessage::whereNull('read_at')->count(),
                    'donations' => Donation::where('status', 'pending')->count(),
                ]
                : null,
        ];
    }
}
