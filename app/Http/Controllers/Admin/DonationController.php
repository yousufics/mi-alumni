<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DonationController extends Controller
{
    public function index(Request $request): Response
    {
        $status = in_array($request->query('status'), Donation::STATUSES, true) ? $request->query('status') : 'pending';
        $search = trim((string) $request->query('q', ''));

        $query = Donation::where('status', $status)
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($w) use ($search) {
                    $w->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('trx_id', 'like', "%{$search}%");
                });
            })
            ->latest();

        return Inertia::render('Admin/Donations', [
            'status' => $status,
            'q' => $search,
            'counts' => [
                'pending' => Donation::where('status', 'pending')->count(),
                'confirmed' => Donation::where('status', 'confirmed')->count(),
                'rejected' => Donation::where('status', 'rejected')->count(),
            ],
            'total' => (int) Donation::where('status', 'confirmed')->sum('amount'),
            'donations' => $query->paginate(20)->withQueryString()->through(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'phone' => $d->phone,
                'email' => $d->email,
                'amount' => $d->amount,
                'payment_method' => $d->payment_method,
                'trx_id' => $d->trx_id,
                'message' => $d->message,
                'status' => $d->status,
                'at' => $d->created_at->format('d/m/Y h:i A'),
            ]),
        ]);
    }

    public function update(Request $request, Donation $donation): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'in:'.implode(',', Donation::STATUSES)]]);

        $donation->update([
            'status' => $data['status'],
            'confirmed_at' => $data['status'] === 'confirmed' ? ($donation->confirmed_at ?? now()) : null,
        ]);

        return back()->with('success', 'অনুদানের অবস্থা বদলানো হয়েছে।');
    }

    public function destroy(Donation $donation): RedirectResponse
    {
        $donation->delete();

        return back()->with('success', 'অনুদানের রেকর্ড মুছে ফেলা হয়েছে।');
    }

    public function export(): StreamedResponse
    {
        $label = ['pending' => 'যাচাই বাকি', 'confirmed' => 'নিশ্চিত', 'rejected' => 'বাতিল'];

        return response()->streamDownload(function () use ($label) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['তারিখ', 'নাম', 'মোবাইল', 'ইমেইল', 'পরিমাণ', 'মাধ্যম', 'trxID', 'অবস্থা', 'বার্তা'], ',', '"', '\\');

            Donation::orderByDesc('id')->each(function ($d) use ($out, $label) {
                fputcsv($out, [
                    $d->created_at->format('d/m/Y'), $d->name, $d->phone, $d->email, $d->amount,
                    $d->payment_method, $d->trx_id, $label[$d->status] ?? $d->status, $d->message,
                ], ',', '"', '\\');
            });

            fclose($out);
        }, 'donations.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
