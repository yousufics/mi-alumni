<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommitteeMember;
use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\Event;
use App\Models\MembershipRequest;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending' => MembershipRequest::where('status', 'pending')->count(),
                'approved' => MembershipRequest::where('status', 'approved')->count(),
                'total' => MembershipRequest::count(),
                'unpaid' => MembershipRequest::where('status', 'approved')->where('payment_status', 'unpaid')->whereNotNull('fee_amount')->where('fee_amount', '>', 0)->count(),
                'collected' => (int) MembershipRequest::where('status', 'approved')->where('payment_status', 'paid')->sum('fee_amount'),
                'donations_pending' => Donation::where('status', 'pending')->count(),
                'donations_total' => (int) Donation::where('status', 'confirmed')->sum('amount'),
                'unread' => ContactMessage::whereNull('read_at')->count(),
                'events' => Event::where('is_published', true)->count(),
                'committee' => CommitteeMember::where('is_current', true)->count(),
            ],
            'latest' => MembershipRequest::where('status', 'pending')
                ->latest()->limit(5)->get()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'batch' => $r->batch,
                    'phone' => $r->phone,
                    'at' => $r->created_at->format('d/m/Y h:i A'),
                ]),
        ]);
    }
}
