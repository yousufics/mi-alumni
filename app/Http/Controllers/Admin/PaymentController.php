<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\Content;
use App\Support\Payment;
use App\Support\Uploads;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        $p = Payment::data();

        return Inertia::render('Admin/Payments', [
            'payment' => $p,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'bank_name' => ['nullable', 'string', 'max:120'],
            'account_name' => ['nullable', 'string', 'max:150'],
            'account_number' => ['nullable', 'string', 'max:60'],
            'branch' => ['nullable', 'string', 'max:120'],
            'routing' => ['nullable', 'string', 'max:30'],
            'qr_note' => ['nullable', 'string', 'max:200'],
            'instruction' => ['nullable', 'string', 'max:1500'],
            'methods' => ['nullable', 'array', 'max:10'],
            'methods.*.name' => ['required', 'string', 'max:100'],
            'methods.*.detail' => ['required', 'string', 'max:200'],
            'qr_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_qr' => ['boolean'],
        ], [
            'required' => 'ঘরটি ফাঁকা রাখা যাবে না।',
            'max' => 'লেখা অনেক বড় হয়ে গেছে।',
            'qr_image.image' => 'QR ছবি হিসেবে সঠিক ফাইল দিন।',
            'qr_image.mimes' => 'QR ছবি jpg, png বা webp হতে হবে।',
            'qr_image.max' => 'QR ছবি ২ MB-এর বেশি হতে পারবে না।',
        ]);

        $current = Content::get('payment');
        $qr = $current['qr'] ?? '';

        if ($request->hasFile('qr_image')) {
            Uploads::delete($qr);
            $qr = Uploads::store($request->file('qr_image'), 'payment');
        } elseif (! empty($data['remove_qr'])) {
            Uploads::delete($qr);
            $qr = '';
        }

        Setting::updateOrCreate(['key' => 'payment'], ['value' => [
            'bank_name' => $data['bank_name'] ?? '',
            'account_name' => $data['account_name'] ?? '',
            'account_number' => $data['account_number'] ?? '',
            'branch' => $data['branch'] ?? '',
            'routing' => $data['routing'] ?? '',
            'qr' => $qr,
            'qr_note' => $data['qr_note'] ?? '',
            'instruction' => $data['instruction'] ?? '',
            'methods' => array_values($data['methods'] ?? []),
        ]]);

        return back()->with('success', 'পেমেন্ট তথ্য সংরক্ষিত হয়েছে।');
    }
}
