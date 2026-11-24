<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberType;
use App\Models\MembershipRequest;
use App\Support\Uploads;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RequestController extends Controller
{
    public function index(Request $request): Response
    {
        $status = in_array($request->query('status'), MembershipRequest::STATUSES, true)
            ? $request->query('status')
            : 'pending';

        $search = trim((string) $request->query('q', ''));
        $payment = in_array($request->query('payment'), MembershipRequest::PAYMENT, true) ? $request->query('payment') : '';

        $query = MembershipRequest::with('type')->where('status', $status)
            ->when($payment !== '', fn ($q) => $q->where('payment_status', $payment))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($w) use ($search) {
                    $w->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('batch', 'like', "%{$search}%");
                });
            })
            ->latest();

        return Inertia::render('Admin/Requests', [
            'status' => $status,
            'q' => $search,
            'payment' => $payment,
            'types' => MemberType::orderBy('sort_order')->orderBy('id')->get(['id', 'name', 'fee']),
            'counts' => [
                'pending' => MembershipRequest::where('status', 'pending')->count(),
                'approved' => MembershipRequest::where('status', 'approved')->count(),
                'rejected' => MembershipRequest::where('status', 'rejected')->count(),
            ],
            'requests' => $query->paginate(15)->withQueryString()->through(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'email' => $r->email,
                'phone' => $r->phone,
                'batch' => $r->batch,
                'profession' => $r->profession,
                'position' => $r->position,
                'is_public' => $r->is_public,
                'member_type_id' => $r->member_type_id,
                'type_name' => $r->type?->name,
                'fee_amount' => $r->fee_amount,
                'payment_status' => $r->payment_status,
                'payment_note' => $r->payment_note,
                'payment_method' => $r->payment_method,
                'trx_id' => $r->trx_id,
                'paid_at' => optional($r->paid_at)->format('d/m/Y'),
                'photo' => $r->photo_url,
                'address' => $r->address,
                'message' => $r->message,
                'status' => $r->status,
                'at' => $r->created_at->format('d/m/Y h:i A'),
            ]),
        ]);
    }

    public function update(Request $request, MembershipRequest $membershipRequest): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:'.implode(',', MembershipRequest::STATUSES)],
        ]);

        $membershipRequest->update([
            'status' => $data['status'],
            'reviewed_at' => $data['status'] === 'pending' ? null : now(),
        ]);

        $label = ['pending' => 'অপেক্ষমাণ তালিকায় ফেরত পাঠানো হয়েছে', 'approved' => 'অনুমোদন করা হয়েছে', 'rejected' => 'বাতিল করা হয়েছে'];

        return back()->with('success', "{$membershipRequest->name}-এর আবেদন {$label[$data['status']]}।");
    }

    /** সদস্যের ছবি, টাইপ, ফি ও পেমেন্ট স্ট্যাটাস, পজিশন ও পাবলিক দৃশ্যমানতা */
    public function display(Request $request, MembershipRequest $membershipRequest): RedirectResponse
    {
        $data = $request->validate([
            'position' => ['nullable', 'string', 'max:150'],
            'is_public' => ['boolean'],
            'member_type_id' => ['nullable', Rule::exists('member_types', 'id')],
            'fee_amount' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'payment_status' => ['nullable', Rule::in(MembershipRequest::PAYMENT)],
            'payment_note' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_photo' => ['boolean'],
        ], [
            'photo.image' => 'ছবি হিসেবে সঠিক ফাইল দিন।',
            'photo.mimes' => 'ছবি jpg, png বা webp হতে হবে।',
            'photo.max' => 'ছবি ২ MB-এর বেশি হতে পারবে না।',
            'integer' => 'ফি সংখ্যায় লিখুন।',
        ]);

        $update = [
            'position' => $data['position'] ?? null,
            'is_public' => $data['is_public'] ?? false,
            'payment_note' => $data['payment_note'] ?? null,
        ];

        // টাইপ বদলালে এবং ফি আলাদা করে না দিলে নতুন টাইপের ফি বসে
        if ($request->exists('member_type_id')) {
            $typeId = $data['member_type_id'] ?? null;
            $update['member_type_id'] = $typeId;

            if (($data['fee_amount'] ?? null) === null && $typeId && (int) $typeId !== (int) $membershipRequest->member_type_id) {
                $update['fee_amount'] = MemberType::find($typeId)->fee;
            }
        }

        if (($data['fee_amount'] ?? null) !== null) {
            $update['fee_amount'] = $data['fee_amount'];
        }

        if (! empty($data['payment_status'])) {
            $update['payment_status'] = $data['payment_status'];
            $update['paid_at'] = $data['payment_status'] === 'paid'
                ? ($membershipRequest->paid_at ?? now())
                : null;
        }

        if ($request->hasFile('photo')) {
            $update['photo'] = Uploads::store($request->file('photo'), 'members');
            Uploads::delete($membershipRequest->photo);
        } elseif (! empty($data['remove_photo'])) {
            Uploads::delete($membershipRequest->photo);
            $update['photo'] = null;
        }

        $membershipRequest->update($update);

        return back()->with('success', 'সদস্যের তথ্য সংরক্ষিত হয়েছে।');
    }

    public function destroy(MembershipRequest $membershipRequest): RedirectResponse
    {
        Uploads::delete($membershipRequest->photo);
        $membershipRequest->delete();

        return back()->with('success', 'আবেদনটি মুছে ফেলা হয়েছে।');
    }

    /** অনুমোদিত সদস্যদের CSV (Excel-এ বাংলা ঠিক দেখাতে BOM সহ) */
    public function export(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['নাম', 'ব্যাচ', 'মেম্বার টাইপ', 'ফি', 'ফি স্ট্যাটাস', 'পেমেন্ট মাধ্যম', 'trxID', 'মোবাইল', 'ইমেইল', 'পেশা', 'ঠিকানা', 'অনুমোদনের তারিখ'], ',', '"', '\\');

            MembershipRequest::with('type')->where('status', 'approved')
                ->orderBy('batch')->orderBy('name')
                ->each(function ($r) use ($out) {
                    fputcsv($out, [
                        $r->name, $r->batch, $r->type?->name, $r->fee_amount, $r->payment_status === 'paid' ? 'পরিশোধিত' : 'বাকি', $r->payment_method, $r->trx_id, $r->phone, $r->email, $r->profession, $r->address,
                        optional($r->reviewed_at)->format('d/m/Y'),
                    ], ',', '"', '\\');
                });

            fclose($out);
        }, 'approved-members.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
